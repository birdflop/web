#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(REPO_ROOT, 'i18n');
const SPEAK_CONFIG_PATH = path.join(REPO_ROOT, 'src', 'speak-config.ts');
const CACHE_PATH = path.join(REPO_ROOT, 'tmp', 'translation-cache.json');
const BASE_LANG = 'en-US';
const DEFAULT_PROVIDER = 'deepl';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = JsonValue[];

type PathSegment = string | number;

interface StringEntry {
  path: PathSegment[];
  value: string;
}

interface SpeakConfig {
  languages: string[];
  assets: string[];
}

interface SummaryItem {
  asset: string;
  lang: string;
  updated: number;
  skipped: number;
}

interface ParsedArgs {
  assets?: string[];
  langs?: string[];
  dryRun?: boolean;
  force?: boolean;
  provider?: string;
}

type TranslationCache = Record<string, Record<string, string>>;

type TranslationProvider = (
  texts: string[],
  targetLang: string,
  baseLang: string
) => Promise<string[]> | string[];

const deeplLangMap: Record<string, string> = {
  'es-ES': 'ES',
  'ko-KR': 'KO',
  'de-DE': 'DE',
  'nl-NL': 'NL',
  'pl-PL': 'PL',
  'pt-PT': 'PT-PT',
  'ru-RU': 'RU',
  'tr-TR': 'TR',
  'zh-CN': 'ZH',
};

async function parseSupportedFromSpeakConfig(): Promise<SpeakConfig> {
  const fallback: SpeakConfig = {
    languages: [
      'en-US',
      'es-ES',
      'ko-KR',
      'de-DE',
      'nl-NL',
      'pl-PL',
      'pt-PT',
      'ru-RU',
      'tr-TR',
      'zh-CN',
    ],
    assets: ['animtab', 'animtexture', 'flags', 'nav', 'rgb'],
  };

  try {
    const raw = await fs.readFile(SPEAK_CONFIG_PATH, 'utf8');
    const languages = Array.from(
      raw.matchAll(/'([a-z]{2}-[A-Z]{2})'\s*:/g)
    ).map((m: RegExpMatchArray) => m[1]);

    const assetsBlock = raw.match(/assets:\s*\[([^]*?)\]/m);
    const assets = assetsBlock
      ? Array.from(assetsBlock[1].matchAll(/'([\w-]+)'/g)).map(
          (m: RegExpMatchArray) => m[1]
        )
      : [];

    return {
      languages: languages.length ? languages : fallback.languages,
      assets: assets.length ? assets : fallback.assets,
    };
  } catch (error) {
    console.warn(
      '[warn] Failed to read speak-config.ts, falling back to defaults:',
      error
    );
    return fallback;
  }
}

async function readJson<T = Record<string, unknown>>(
  filePath: string
): Promise<T> {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data) as T;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const text = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(filePath, text, 'utf8');
}

function walkStrings(
  node: JsonValue,
  pathParts: PathSegment[] = [],
  out: StringEntry[] = []
): StringEntry[] {
  if (typeof node === 'string') {
    out.push({ path: pathParts, value: node });
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      walkStrings(item, [...pathParts, index], out)
    );
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      walkStrings(value, [...pathParts, key], out);
    }
  }
  return out;
}

function setPath(
  target: Record<string, unknown>,
  pathParts: PathSegment[],
  value: string
): void {
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < pathParts.length; i += 1) {
    const part = pathParts[i];
    const isLast = i === pathParts.length - 1;
    if (isLast) {
      cursor[part] = value;
      return;
    }
    if (cursor[part] === undefined) {
      cursor[part] = typeof pathParts[i + 1] === 'number' ? [] : {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
}

function getPath(
  source: Record<string, unknown>,
  pathParts: PathSegment[]
): string | undefined {
  let current: unknown = source;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function pathKey(pathParts: PathSegment[]): string {
  return pathParts.join('.');
}

async function loadCache(): Promise<TranslationCache> {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8');
    return JSON.parse(raw) as TranslationCache;
  } catch {
    return {};
  }
}

async function saveCache(
  cache: TranslationCache,
  dryRun?: boolean
): Promise<void> {
  if (dryRun) return;
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

async function deeplTranslate(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  const deeplLang = deeplLangMap[targetLang];
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY is required for DeepL translations.');
  }
  if (!deeplLang) {
    throw new Error(`DeepL does not support target language ${targetLang}.`);
  }

  const body = new URLSearchParams();
  texts.forEach((text) => body.append('text', text));
  body.set('source_lang', 'EN');
  body.set('target_lang', deeplLang);

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `DeepL-Auth-Key ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepL request failed (${response.status}): ${detail}`);
  }

  const data = await response.json<{ translations: { text: string }[] }>();
  return data.translations.map((item) => item.text);
}

function noopTranslate(texts: string[]): string[] {
  return texts;
}

const providers: Record<string, TranslationProvider> = {
  deepl: deeplTranslate,
  noop: noopTranslate,
};

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {};
  argv.forEach((part) => {
    const [key, rawValue] = part.split('=');
    const value = rawValue ?? 'true';
    if (key.startsWith('--asset'))
      args.assets = value.split(',').filter(Boolean);
    if (key.startsWith('--lang')) args.langs = value.split(',').filter(Boolean);
    if (key === '--dry-run') args.dryRun = true;
    if (key === '--force') args.force = true;
    if (key.startsWith('--provider')) args.provider = value;
  });
  return args;
}

async function main(): Promise<void> {
  const { languages, assets } = await parseSupportedFromSpeakConfig();
  const args = parseArgs(process.argv.slice(2));
  const targetAssets = args.assets?.length ? args.assets : assets;
  const targetLangs = (args.langs?.length ? args.langs : languages).filter(
    (lang) => lang !== BASE_LANG
  );
  const providerName = args.provider ?? DEFAULT_PROVIDER;
  const translate = providers[providerName];

  if (!translate) {
    throw new Error(
      `Unknown provider '${providerName}'. Use one of: ${Object.keys(providers).join(', ')}.`
    );
  }

  const cache = await loadCache();
  const summary: SummaryItem[] = [];

  for (const asset of targetAssets) {
    const basePath = path.join(I18N_DIR, BASE_LANG, `${asset}.json`);
    const baseExists = await fs
      .stat(basePath)
      .then(() => true)
      .catch(() => false);
    if (!baseExists) {
      console.warn(
        `[warn] Missing base file for asset '${asset}' at ${basePath}, skipping.`
      );
      continue;
    }

    const baseJson = await readJson<JsonObject>(basePath);
    const strings = walkStrings(baseJson);
    cache[asset] = cache[asset] ?? {};

    for (const lang of targetLangs) {
      const targetPath = path.join(I18N_DIR, lang, `${asset}.json`);
      const targetExists = await fs
        .stat(targetPath)
        .then(() => true)
        .catch(() => false);
      const targetJson = targetExists
        ? await readJson<Record<string, unknown>>(targetPath)
        : {};

      const toTranslate: string[] = [];
      const pathsNeedingUpdate: PathSegment[][] = [];

      for (const entry of strings) {
        const key = pathKey(entry.path);
        const previousSource = cache[asset][key];
        const currentValue = getPath(targetJson, entry.path);
        const needsUpdate =
          args.force ||
          currentValue === undefined ||
          previousSource !== entry.value ||
          (currentValue === entry.value && lang !== BASE_LANG);
        cache[asset][key] = entry.value;
        if (needsUpdate) {
          toTranslate.push(entry.value);
          pathsNeedingUpdate.push(entry.path);
        }
      }

      if (!toTranslate.length) {
        summary.push({ asset, lang, updated: 0, skipped: strings.length });
        continue;
      }

      const translated = await translate(toTranslate, lang, BASE_LANG);
      translated.forEach((text, idx) => {
        setPath(targetJson, pathsNeedingUpdate[idx], text);
      });

      summary.push({
        asset,
        lang,
        updated: translated.length,
        skipped: strings.length - translated.length,
      });
      if (!args.dryRun) {
        await writeJson(targetPath, targetJson);
      }
    }
  }

  await saveCache(cache, args.dryRun);

  const rows = summary.map(
    (item) =>
      `${item.asset.padEnd(12)} ${item.lang.padEnd(8)} updated: ${String(item.updated).padStart(3)} | skipped: ${String(item.skipped).padStart(3)}`
  );

  if (rows.length) {
    console.log('[info] Translation sync summary:');
    rows.forEach((row) => console.log(`  ${row}`));
  } else {
    console.log('[info] No translations needed update.');
  }
}

main().catch((error) => {
  console.error('[error] Translation sync failed:', error);
  process.exitCode = 1;
});
