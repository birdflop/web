#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(REPO_ROOT, 'i18n');
const SPEAK_CONFIG_PATH = path.join(REPO_ROOT, 'src', 'speak-config.ts');
const CACHE_PATH = path.join(REPO_ROOT, 'tmp', 'translation-cache.json');
const BASE_LANG = 'en-US';
const DEFAULT_PROVIDER = 'deepl';

const deeplLangMap = {
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

async function parseSupportedFromSpeakConfig() {
  const fallback = {
    languages: ['en-US', 'es-ES', 'ko-KR', 'de-DE', 'nl-NL', 'pl-PL', 'pt-PT', 'ru-RU', 'tr-TR', 'zh-CN'],
    assets: ['animtab', 'animtexture', 'flags', 'nav', 'rgb'],
  };

  try {
    const raw = await fs.readFile(SPEAK_CONFIG_PATH, 'utf8');
    const languages = Array.from(raw.matchAll(/'([a-z]{2}-[A-Z]{2})'\s*:/g)).map((m) => m[1]);
    const assetsBlock = raw.match(/assets:\s*\[([^]*?)\]/m);
    const assets = assetsBlock ? Array.from(assetsBlock[1].matchAll(/'([\w-]+)'/g)).map((m) => m[1]) : [];
    return {
      languages: languages.length ? languages : fallback.languages,
      assets: assets.length ? assets : fallback.assets,
    };
  } catch (error) {
    console.warn('[warn] Failed to read speak-config.ts, falling back to defaults:', error);
    return fallback;
  }
}

async function readJson(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const text = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(filePath, text, 'utf8');
}

function walkStrings(node, pathParts = [], out = []) {
  if (typeof node === 'string') {
    out.push({ path: pathParts, value: node });
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => walkStrings(item, [...pathParts, index], out));
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      walkStrings(value, [...pathParts, key], out);
    }
  }
  return out;
}

function setPath(target, pathParts, value) {
  let cursor = target;
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
    cursor = cursor[part];
  }
}

function getPath(source, pathParts) {
  return pathParts.reduce((current, part) => (current ? current[part] : undefined), source);
}

function pathKey(pathParts) {
  return pathParts.join('.');
}

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveCache(cache, dryRun) {
  if (dryRun) return;
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

async function deeplTranslate(texts, targetLang) {
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

  const data = await response.json();
  return data.translations.map((item) => item.text);
}

async function noopTranslate(texts) {
  return texts;
}

const providers = {
  deepl: deeplTranslate,
  noop: noopTranslate,
};

function parseArgs(argv) {
  const args = {};
  argv.forEach((part) => {
    const [key, rawValue] = part.split('=');
    const value = rawValue ?? 'true';
    if (key.startsWith('--asset')) args.assets = value.split(',').filter(Boolean);
    if (key.startsWith('--lang')) args.langs = value.split(',').filter(Boolean);
    if (key === '--dry-run') args.dryRun = true;
    if (key === '--force') args.force = true;
    if (key.startsWith('--provider')) args.provider = value;
  });
  return args;
}

async function main() {
  const { languages, assets } = await parseSupportedFromSpeakConfig();
  const args = parseArgs(process.argv.slice(2));
  const targetAssets = args.assets?.length ? args.assets : assets;
  const targetLangs = (args.langs?.length ? args.langs : languages).filter((lang) => lang !== BASE_LANG);
  const providerName = args.provider ?? DEFAULT_PROVIDER;
  const translate = providers[providerName];

  if (!translate) {
    throw new Error(`Unknown provider '${providerName}'. Use one of: ${Object.keys(providers).join(', ')}.`);
  }

  const cache = await loadCache();
  const summary = [];

  for (const asset of targetAssets) {
    const basePath = path.join(I18N_DIR, BASE_LANG, `${asset}.json`);
    const baseExists = await fs.stat(basePath).then(() => true).catch(() => false);
    if (!baseExists) {
      console.warn(`[warn] Missing base file for asset '${asset}' at ${basePath}, skipping.`);
      continue;
    }

    const baseJson = await readJson(basePath);
    const strings = walkStrings(baseJson);
    cache[asset] = cache[asset] ?? {};

    for (const lang of targetLangs) {
      const targetPath = path.join(I18N_DIR, lang, `${asset}.json`);
      const targetExists = await fs.stat(targetPath).then(() => true).catch(() => false);
      const targetJson = targetExists ? await readJson(targetPath) : {};

      const toTranslate = [];
      const pathsNeedingUpdate = [];

      for (const entry of strings) {
        const key = pathKey(entry.path);
        const previousSource = cache[asset][key];
        const currentValue = getPath(targetJson, entry.path);
        const needsUpdate =
          args.force ||
          currentValue === undefined ||
          previousSource !== entry.value ||
          // If the target still matches English, re-translate to avoid English bleed-through
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

      summary.push({ asset, lang, updated: translated.length, skipped: strings.length - translated.length });
      if (!args.dryRun) {
        await writeJson(targetPath, targetJson);
      }
    }
  }

  await saveCache(cache, args.dryRun);

  const rows = summary.map((item) => `${item.asset} -> ${item.lang}: ${item.updated} updated, ${item.skipped} unchanged`);
  console.log('\nTranslation sync complete');
  rows.forEach((row) => console.log(` - ${row}`));
  if (args.dryRun) console.log('\n(dry run: no files were written)');
}

main().catch((error) => {
  console.error('[error] Translation sync failed:', error);
  process.exitCode = 1;
});
