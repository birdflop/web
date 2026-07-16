/* oxlint-disable qwik/jsx-img */
import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
  useOnDocument,
} from '@qwik.dev/core';
import type { QRL, Signal } from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import {
  ColorPicker,
  Label,
  NumberInput,
  SelectMenu,
} from '@luminescent/ui-qwik';
import Eraser from 'lucide-icons-qwik/icons/Eraser';
import ImageUp from 'lucide-icons-qwik/icons/ImageUp';
import MessageSquare from 'lucide-icons-qwik/icons/MessageSquare';
import Trash2 from 'lucide-icons-qwik/icons/Trash2';
import { getBrightness, hexToRGB } from '@birdflop/rgbirdflop';
import { defaultDescription, generateHead } from '~/root';
import {
  generateMotdOutput,
  MC_COLORS,
  MC_FORMATS,
  parseMotdLine,
  shadowColor,
  type MotdFormat,
} from '~/util/motd';
import Output from '~/components/Elements/Output';

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
    <Label for={field} label={label} class="text-lum-text-secondary text-sm">
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
        onKeyDown$={(e, el) => onCaret$(field, el)}
        onSelect$={(e, el) => onCaret$(field, el)}
      />
    </Label>
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
  // oxlint-disable-next-line qwik/no-use-visible-task
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

  const setLine = $((field: LineField, value: string) => {
    store[field] = value;
  });

  const customColor = useSignal('#54daf4');
  const opened = useSignal(false);

  useOnDocument(
    'click',
    $((e) => {
      if (
        e.target instanceof HTMLElement &&
        !e.target.closest('#motd-custom-color-popup') &&
        !e.target.closest('#motd-custom-color-container')
      ) {
        opened.value = false;
      }
    })
  );

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
      <p class="text-lum-text-secondary mb-2 text-sm">
        {t('motd.preview.label@@Preview')}
      </p>
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
            <p class="text-lum-text-secondary text-sm">
              {t('motd.colors@@Colors')}
            </p>
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
              <div
                class="relative flex items-center gap-1"
                id="motd-custom-color-container"
              >
                <input
                  key="motd-custom-color-input"
                  id="motd-custom-color-input"
                  class={{
                    'text-gray-400 hover:text-gray-400':
                      getBrightness(hexToRGB(customColor.value)) < 126,
                    'text-gray-700 hover:text-gray-700':
                      getBrightness(hexToRGB(customColor.value)) > 126,
                    'lum-input lum-btn-p-1 lum-grad-bg h-8 w-24 rounded-md text-center font-mono text-xs': true,
                  }}
                  style={`--bg-color: ${customColor.value};`}
                  value={customColor.value}
                  onInput$={(e, el) => {
                    let hex = el.value.trim();
                    if (!hex.startsWith('#')) hex = '#' + hex;
                    const hexRegexNoOpacity = /^#?[0-9A-F]{0,6}$/i;
                    if (!hexRegexNoOpacity.test(hex)) {
                      el.value = customColor.value;
                      return;
                    }
                    customColor.value = hex;

                    // set the color picker's value and trigger input to update color picker
                    if (!opened.value) return;
                    const picker = document.getElementById(
                      'motd-custom-color-picker'
                    )!;
                    picker.dataset.value = el.value;
                    picker.dispatchEvent(new Event('input'));
                  }}
                  onFocus$={() => {
                    opened.value = true;

                    const picker = document.getElementById(
                      'motd-custom-color-picker'
                    )!;
                    const popup = document.getElementById(
                      'motd-custom-color-popup'
                    );
                    if (!picker || !popup) return;

                    // set the color picker's value and trigger input to update color picker
                    picker.dataset.value = customColor.value;
                    picker.dispatchEvent(new Event('input'));
                  }}
                />
                <button
                  type="button"
                  class="lum-btn lum-bg-blue/40 hover:lum-bg-blue h-8 p-1 text-xs"
                  onClick$={() =>
                    insertCode(`&${customColor.value.toUpperCase()}`)
                  }
                >
                  + Hex
                </button>

                <div
                  id="motd-custom-color-popup"
                  stoppropagation:mousedown
                  stoppropagation:click
                  class={{
                    flex: opened.value,
                    hidden: !opened.value,
                    'absolute top-10 left-0 z-10 flex-col gap-2 motion-safe:transition-all': true,
                    'animate-in fade-in slide-in-from-top-2': true,
                  }}
                  style={{
                    '--lum-border-radius': '1rem',
                  }}
                >
                  <ColorPicker
                    id="motd-custom-color-picker"
                    value={customColor.value}
                    onInput$={(newColor) => {
                      customColor.value = newColor;
                    }}
                    showInput={false}
                    horizontal
                  />
                </div>
              </div>
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
              <div class="lum-btn lum-bg-blue/40 hover:lum-bg-blue cursor-pointer">
                <ImageUp size={20} />
                {t('motd.favicon.upload@@Upload image')}
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange$={(e, el) => handleIcon(el.files?.[0])}
                />
              </div>
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
          <Output value={output}>
            <SelectMenu
              q:slot="label"
              id="format"
              class="w-full"
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
          </Output>
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

          <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col gap-3">
            <span class="text-lum-text-secondary text-sm">
              {t(
                'motd.previewSettings@@Preview settings (not part of the MOTD)'
              )}
            </span>
            <Label
              for="label"
              label={t('motd.previewSettings.label@@Server label')}
              class="text-lum-text-secondary text-sm"
            >
              <input
                id="label"
                class="lum-input w-full"
                value={store.label}
                onInput$={(e, el) => {
                  store.label = el.value;
                }}
              />
            </Label>
            <div class="flex gap-2">
              <Label
                for="online"
                label={t('motd.previewSettings.online@@Players online')}
                class="text-lum-text-secondary text-sm"
              >
                <NumberInput
                  input
                  id="online"
                  min={0}
                  class="w-full"
                  value={store.playersOnline}
                  onInput$={(e, el) => {
                    store.playersOnline = Math.max(0, Number(el.value) || 0);
                  }}
                />
              </Label>
              <Label
                for="max"
                label={t('motd.previewSettings.max@@Max players')}
                class="text-lum-text-secondary text-sm"
              >
                <NumberInput
                  input
                  id="max"
                  min={0}
                  class="w-full"
                  value={store.playersMax}
                  onInput$={(e, el) => {
                    store.playersMax = Math.max(0, Number(el.value) || 0);
                  }}
                />
              </Label>
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
