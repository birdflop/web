/* eslint-disable qwik/jsx-img */
import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@qwik.dev/core';
import type { QRL, Signal } from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import { SelectMenu } from '@luminescent/ui-qwik';
import Copy from 'lucide-icons-qwik/icons/Copy';
import Eraser from 'lucide-icons-qwik/icons/Eraser';
import ImageUp from 'lucide-icons-qwik/icons/ImageUp';
import MessageSquare from 'lucide-icons-qwik/icons/MessageSquare';
import Trash2 from 'lucide-icons-qwik/icons/Trash2';
import { defaultDescription, generateHead } from '~/root';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  generateMotdOutput,
  MC_COLORS,
  MC_FORMATS,
  parseMotdLine,
  shadowColor,
  type MotdFormat,
} from '~/util/motd';

const OBF_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const Ping5 = '/minecraft/ping_5.png';

const createImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

type LineField = 'line1' | 'line2';

interface MotdLineInputProps {
  field: LineField;
  label: string;
  value: string;
  inputRef: Signal<HTMLTextAreaElement | undefined>;
  onValue$: QRL<(field: LineField, value: string) => void>;
  onCaret$: QRL<(field: LineField, el: HTMLTextAreaElement) => void>;
}

const MotdLineInput = component$<MotdLineInputProps>(
  ({ field, label, value, inputRef, onValue$, onCaret$ }) => (
    <div class="flex flex-col gap-1">
      <label for={field} class="text-lum-text-secondary text-sm">
        {label}
      </label>
      <textarea
        ref={inputRef}
        id={field}
        rows={1}
        spellcheck={false}
        class="lum-input w-full resize-none font-mono"
        value={value}
        onInput$={(e, el) => onValue$(field, el.value)}
        onFocus$={(e, el) => onCaret$(field, el)}
        onClick$={(e, el) => onCaret$(field, el)}
        onKeyUp$={(e, el) => onCaret$(field, el)}
        onSelect$={(e, el) => onCaret$(field, el)}
      />
    </div>
  )
);

// Renders one MOTD line into styled spans matching Minecraft's appearance.
function renderMotdLine(line: string) {
  const runs = parseMotdLine(line);
  if (runs.length === 0) return <span>{' '}</span>;
  return runs.map((run, i) => (
    <span
      key={`run${i}`}
      data-obf={run.style.obfuscated ? run.text : undefined}
      class={{
        'font-mc': !run.style.bold && !run.style.italic,
        'font-mc-bold': run.style.bold && !run.style.italic,
        'font-mc-italic': run.style.italic && !run.style.bold,
        'font-mc-bold-italic': run.style.bold && run.style.italic,
        underline: run.style.underline && !run.style.strikethrough,
        strikethrough: run.style.strikethrough && !run.style.underline,
        'underline-strikethrough':
          run.style.underline && run.style.strikethrough,
        'motd-obf': run.style.obfuscated,
      }}
      style={{
        color: run.style.color,
        textShadow: `2px 2px 0 ${shadowColor(run.style.color)}`,
      }}
    >
      {run.text}
    </span>
  ));
}

export default component$(() => {
  const t = inlineTranslate();
  const notifications = useContext(NotificationContext);

  const copiedTitle = t('motd.copied.title@@Copied to clipboard!');
  const copyFailedTitle = t('motd.copyFailed@@Failed to copy to clipboard!');

  const store = useStore({
    line1: '&6&lEpic Network &7| &eSurvival',
    line2: '&aNow on &b1.21 &7- &dgg.example.com',
    icon: '',
    format: 'properties' as MotdFormat,
    // Preview-only settings (not part of the MOTD itself).
    label: 'A Minecraft Server',
    playersOnline: 42,
    playersMax: 100,
  });

  // Tracks where in which line the formatting toolbar should insert codes.
  const line1Ref = useSignal<HTMLTextAreaElement>();
  const line2Ref = useSignal<HTMLTextAreaElement>();
  const active = useStore({
    field: 'line1' as 'line1' | 'line2',
    start: 0,
    end: 0,
  });

  const trackCaret = $((field: 'line1' | 'line2', el: HTMLTextAreaElement) => {
    active.field = field;
    active.start = el.selectionStart ?? el.value.length;
    active.end = el.selectionEnd ?? el.value.length;
  });

  const insertCode = $((code: string) => {
    const field = active.field;
    const ref = field === 'line1' ? line1Ref.value : line2Ref.value;
    const text = store[field];
    const start = Math.min(active.start, text.length);
    const end = Math.min(active.end, text.length);
    store[field] = text.slice(0, start) + code + text.slice(end);
    const pos = start + code.length;
    active.start = pos;
    active.end = pos;
    requestAnimationFrame(() => {
      if (ref) {
        ref.focus();
        ref.setSelectionRange(pos, pos);
      }
    });
  });

  const handleIcon = $(async (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await createImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Center-crop to a square so the icon isn't distorted, then scale to 64x64.
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, 64, 64);
      store.icon = canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  // Animate obfuscated (&k) text by scrambling characters, like Minecraft does.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$((taskCtx) => {
    const id = setInterval(() => {
      document.querySelectorAll<HTMLElement>('.motd-obf').forEach((el) => {
        const original = el.getAttribute('data-obf') ?? el.textContent ?? '';
        let out = '';
        for (const ch of original) {
          out +=
            ch === ' '
              ? ' '
              : OBF_CHARS[Math.floor(Math.random() * OBF_CHARS.length)];
        }
        el.textContent = out;
      });
    }, 70);
    taskCtx.cleanup(() => clearInterval(id));
  });

  const output = generateMotdOutput(store.line1, store.line2, store.format);

  const copy = $((value: string) => {
    const notification = new Notification()
      .setTitle(copiedTitle)
      .setBgColor('lum-grad-bg-green/50');
    navigator.clipboard.writeText(value).catch((err) => {
      notification
        .setTitle(copyFailedTitle)
        .setDescription(`${err}`)
        .setBgColor('lum-grad-bg-red/50')
        .setPersist(true);
    });
    notifications.push(notification);
  });

  const setLine = $((field: LineField, value: string) => {
    store[field] = value;
  });

  const customColor = useSignal('#54daf4');

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <MessageSquare size={32} />
        {t('motd.title@@MOTD Designer')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-6 border-b pb-4">
        {t(
          "motd.description@@Design your server's message of the day with colors, formatting, and a favicon, then copy it straight into server.properties."
        )}
      </p>

      {/* Live server-list preview */}
      <label class="text-lum-text-secondary mb-2 text-sm">
        {t('motd.preview.label@@Preview')}
      </label>
      <div
        class="rounded-lum mb-6 overflow-hidden p-4"
        style={{
          background: 'linear-gradient(180deg, #2b2b2b 0%, #1a1a1a 100%)',
        }}
      >
        <div
          class="rounded-lum flex items-start gap-3 border border-white/10 p-2"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          {store.icon ? (
            <img
              src={store.icon}
              width={64}
              height={64}
              alt="Server icon"
              class="pixelated h-16 w-16 shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center text-3xl text-gray-500"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              ?
            </div>
          )}
          <div class="min-w-0 flex-1 leading-tight">
            <div class="flex items-center justify-between gap-2">
              <span
                class="font-mc truncate text-white"
                style={{ textShadow: '2px 2px 0 #3f3f3f' }}
              >
                {store.label}
              </span>
              <div class="font-mc flex shrink-0 items-center gap-1">
                <span
                  style={{ color: '#AAAAAA', textShadow: '2px 2px 0 #2a2a2a' }}
                >
                  {store.playersOnline}
                  <span style={{ color: '#555555' }}>/</span>
                  {store.playersMax}
                </span>
                <img
                  src={Ping5}
                  width={20}
                  height={16}
                  alt="ping"
                  class="ml-1"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
            <div class="text-lg whitespace-pre">
              {renderMotdLine(store.line1)}
            </div>
            <div class="text-lg whitespace-pre">
              {renderMotdLine(store.line2)}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row">
        {/* Editor */}
        <div class="flex flex-1 flex-col gap-4">
          {/* Color palette */}
          <div class="flex flex-col gap-2">
            <span class="text-lum-text-secondary text-sm">
              {t('motd.colors@@Colors')}
            </span>
            <div class="flex flex-wrap gap-1">
              {MC_COLORS.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  title={`${c.name} (&${c.code})`}
                  onClick$={() => insertCode(`&${c.code}`)}
                  class="h-8 w-8 rounded-md border border-white/20 transition-transform hover:scale-110"
                  style={{ background: c.hex }}
                />
              ))}
              <label
                class="lum-btn lum-bg-lum-input-bg/50 ml-1 flex h-8 cursor-pointer items-center gap-1 p-1"
                title={t('motd.customColor@@Insert custom hex color')}
              >
                <input
                  type="color"
                  class="h-6 w-6 cursor-pointer border-0 bg-transparent"
                  value={customColor.value}
                  onInput$={(e, el) => {
                    customColor.value = el.value;
                  }}
                />
                <button
                  type="button"
                  class="lum-btn lum-bg-blue/40 hover:lum-bg-blue p-1 text-xs"
                  onClick$={() =>
                    insertCode(`&${customColor.value.toUpperCase()}`)
                  }
                >
                  + Hex
                </button>
              </label>
            </div>
          </div>

          {/* Formatting */}
          <div class="flex flex-col gap-2">
            <span class="text-lum-text-secondary text-sm">
              {t('motd.formatting@@Formatting')}
            </span>
            <div class="flex flex-wrap gap-1">
              {MC_FORMATS.map((f) => (
                <button
                  key={f.code}
                  type="button"
                  onClick$={() => insertCode(`&${f.code}`)}
                  class={{
                    'lum-btn lum-bg-lum-input-bg/50 hover:lum-bg-lum-input-bg px-3 py-1.5 text-sm': true,
                    'font-mc-bold': f.code === 'l',
                    'font-mc-italic': f.code === 'o',
                    underline: f.code === 'n',
                    strikethrough: f.code === 'm',
                  }}
                >
                  {f.code === 'r' ? <Eraser size={16} /> : null}
                  {f.name}{' '}
                  <span class="text-lum-text-secondary">&amp;{f.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line inputs */}
          <MotdLineInput
            field="line1"
            label={t('motd.line1@@First line')}
            value={store.line1}
            inputRef={line1Ref}
            onValue$={setLine}
            onCaret$={trackCaret}
          />
          <MotdLineInput
            field="line2"
            label={t('motd.line2@@Second line')}
            value={store.line2}
            inputRef={line2Ref}
            onValue$={setLine}
            onCaret$={trackCaret}
          />

          {/* Favicon */}
          <div class="flex flex-col gap-2">
            <span class="text-lum-text-secondary text-sm">
              {t('motd.favicon@@Server icon (favicon)')}
            </span>
            <div class="flex items-center gap-3">
              <label class="lum-btn lum-bg-blue/40 hover:lum-bg-blue cursor-pointer">
                <ImageUp size={20} />
                {t('motd.favicon.upload@@Upload image')}
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange$={(e, el) => handleIcon(el.files?.[0])}
                />
              </label>
              {store.icon && (
                <>
                  <a
                    class="lum-btn lum-bg-green/40 hover:lum-bg-green"
                    href={store.icon}
                    download="server-icon.png"
                  >
                    {t('motd.favicon.download@@Download server-icon.png')}
                  </a>
                  <button
                    type="button"
                    class="lum-btn lum-bg-red/40 hover:lum-bg-red"
                    onClick$={() => {
                      store.icon = '';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
            <p class="text-lum-text-secondary text-xs">
              {t(
                "motd.favicon.help@@Any image works — it's cropped to a square and resized to 64×64. Place the downloaded server-icon.png in your server's root folder."
              )}
            </p>
          </div>
        </div>

        {/* Output + preview settings */}
        <div class="flex flex-1 flex-col gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-end gap-2">
              <div class="flex flex-1 flex-col gap-1">
                <label for="format" class="text-lum-text-secondary text-sm">
                  {t('motd.output.format@@Output format')}
                </label>
                <SelectMenu
                  id="format"
                  class={{ 'w-full': true }}
                  value={store.format}
                  onChange$={(e, el) => {
                    store.format = el.value as MotdFormat;
                  }}
                  values={[
                    { name: 'server.properties', value: 'properties' },
                    {
                      name: t('motd.output.section@@Section signs (§)'),
                      value: 'section',
                    },
                    { name: t('motd.output.amp@@Ampersand (&)'), value: 'amp' },
                  ]}
                >
                  {t('motd.output.format@@Output format')}
                </SelectMenu>
              </div>
              <button
                type="button"
                class="lum-btn lum-bg-blue/40 hover:lum-bg-blue h-fit"
                onClick$={() => copy(output)}
              >
                <Copy size={18} /> {t('motd.output.copy@@Copy')}
              </button>
            </div>
            <textarea
              readOnly
              id="output"
              class="lum-input h-32 w-full font-mono break-all whitespace-pre-wrap"
              value={output}
              onClick$={() => copy(output)}
            />
            <p class="text-lum-text-secondary text-xs">
              {store.format === 'properties'
                ? t(
                    'motd.output.help.properties@@Paste this line into your server.properties file (it replaces the existing motd= line).'
                  )
                : store.format === 'section'
                  ? t(
                      'motd.output.help.section@@Section-sign format, accepted by most plugin configs that support legacy colors.'
                    )
                  : t(
                      'motd.output.help.amp@@Ampersand format, for plugins that translate & color codes.'
                    )}
            </p>
          </div>

          <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col gap-3">
            <span class="text-lum-text-secondary text-sm">
              {t(
                'motd.previewSettings@@Preview settings (not part of the MOTD)'
              )}
            </span>
            <div class="flex flex-col gap-1">
              <label for="label" class="text-sm">
                {t('motd.previewSettings.label@@Server label')}
              </label>
              <input
                id="label"
                class="lum-input"
                value={store.label}
                onInput$={(e, el) => {
                  store.label = el.value;
                }}
              />
            </div>
            <div class="flex gap-2">
              <div class="flex flex-1 flex-col gap-1">
                <label for="online" class="text-sm">
                  {t('motd.previewSettings.online@@Players online')}
                </label>
                <input
                  id="online"
                  type="number"
                  min={0}
                  class="lum-input"
                  value={store.playersOnline}
                  onInput$={(e, el) => {
                    store.playersOnline = Math.max(0, Number(el.value) || 0);
                  }}
                />
              </div>
              <div class="flex flex-1 flex-col gap-1">
                <label for="max" class="text-sm">
                  {t('motd.previewSettings.max@@Max players')}
                </label>
                <input
                  id="max"
                  type="number"
                  min={0}
                  class="lum-input"
                  value={store.playersMax}
                  onInput$={(e, el) => {
                    store.playersMax = Math.max(0, Number(el.value) || 0);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-12" />
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft MOTD Designer & server.properties Generator - Birdflop',
  description:
    'Design your Minecraft server MOTD with colors, gradients, formatting and a favicon, then copy it into server.properties. Developed by Birdflop. ' +
    defaultDescription,
});
