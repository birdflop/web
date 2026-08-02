import {
  $,
  component$,
  useOnDocument,
  useSignal,
  type QRL,
} from '@qwik.dev/core';
import { ButtonContainer, ColorPicker } from '@luminescent/ui-qwik';
import Bold from 'lucide-icons-qwik/icons/Bold';
import Italic from 'lucide-icons-qwik/icons/Italic';
import Underline from 'lucide-icons-qwik/icons/Underline';
import Strikethrough from 'lucide-icons-qwik/icons/Strikethrough';
import Link2 from 'lucide-icons-qwik/icons/Link2';
import Image from 'lucide-icons-qwik/icons/Image';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Type from 'lucide-icons-qwik/icons/Type';
import AlignCenter from 'lucide-icons-qwik/icons/AlignCenter';
import Quote from 'lucide-icons-qwik/icons/Quote';
import Code from 'lucide-icons-qwik/icons/Code';
import List from 'lucide-icons-qwik/icons/List';
import Eye from 'lucide-icons-qwik/icons/Eye';
import EyeOff from 'lucide-icons-qwik/icons/EyeOff';
import Check from 'lucide-icons-qwik/icons/Check';
import { renderBBCode } from '~/util/serverlist/bbcode';

interface BBCodeEditorProps {
  value: string;
  onChange$: QRL<(value: string) => void>;
  id?: string;
  maxLength?: number;
  placeholder?: string;
}

type Menu = 'link' | 'image' | 'color' | 'size' | null;

const SIZE_PRESETS = [
  { label: 'Small', value: 12 },
  { label: 'Normal', value: 16 },
  { label: 'Large', value: 22 },
  { label: 'Huge', value: 28 },
];

export default component$<BBCodeEditorProps>(
  ({ value, onChange$, id, maxLength, placeholder }) => {
    const ref = useSignal<HTMLTextAreaElement>();
    const rootRef = useSignal<HTMLElement>();
    const showPreview = useSignal(false);
    const current = useSignal(value);

    // Which popover is open, and the textarea selection captured when it opened.
    const menu = useSignal<Menu>(null);
    const selStart = useSignal(0);
    const selEnd = useSignal(0);

    // Popover field state
    const color = useSignal('#54daf4');
    const linkUrl = useSignal('https://');
    const imgUrl = useSignal('https://');

    // Close popovers on outside click.
    useOnDocument(
      'pointerdown',
      $((e) => {
        const target = e.target as Node | null;
        if (rootRef.value && target && !rootRef.value.contains(target))
          menu.value = null;
      })
    );

    // Core insert: wrap [start,end) of the textarea with open/close (or a placeholder).
    const insertAt = $(
      async (
        open: string,
        close: string,
        placeholderText: string,
        start: number,
        end: number
      ) => {
        const el = ref.value;
        if (!el) return;
        const text = el.value;
        const selected = text.slice(start, end) || placeholderText;
        const next =
          text.slice(0, start) + open + selected + close + text.slice(end);

        el.value = next;
        current.value = next;
        await onChange$(next);

        const innerStart = start + open.length;
        const innerEnd = innerStart + selected.length;
        el.focus();
        el.setSelectionRange(innerStart, innerEnd);
      }
    );

    // Direct (no-input) tags: operate on the live selection.
    const wrap = $((open: string, close: string, placeholderText = '') => {
      const el = ref.value;
      if (!el) return;
      return insertAt(
        open,
        close,
        placeholderText,
        el.selectionStart,
        el.selectionEnd
      );
    });

    // Open a popover, capturing the current selection first (the buttons use
    // preventdefault:mousedown so the textarea keeps focus + selection).
    const openMenu = $((which: Menu) => {
      const el = ref.value;
      if (el) {
        selStart.value = el.selectionStart;
        selEnd.value = el.selectionEnd;
      }
      menu.value = menu.value === which ? null : which;
    });

    const applyFromMenu = $(
      async (open: string, close: string, placeholderText: string) => {
        await insertAt(
          open,
          close,
          placeholderText,
          selStart.value,
          selEnd.value
        );
        menu.value = null;
      }
    );

    return (
      <div class="flex flex-col gap-1" ref={rootRef}>
        <div class="relative">
          {/* Toolbar */}
          <div class="flex flex-row flex-wrap items-center gap-1">
            <ButtonContainer class="lum-bg-lum-input-bg [&>button]:p-1!">
              <button
                type="button"
                title="Bold"
                preventdefault:mousedown
                onClick$={() => wrap('[b]', '[/b]', 'bold text')}
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                title="Italic"
                preventdefault:mousedown
                onClick$={() => wrap('[i]', '[/i]', 'italic text')}
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                title="Underline"
                preventdefault:mousedown
                onClick$={() => wrap('[u]', '[/u]', 'underlined')}
              >
                <Underline size={16} />
              </button>
              <button
                type="button"
                title="Strikethrough"
                preventdefault:mousedown
                onClick$={() => wrap('[s]', '[/s]', 'struck')}
              >
                <Strikethrough size={16} />
              </button>
            </ButtonContainer>

            <ButtonContainer class="lum-bg-lum-input-bg [&>button]:p-1!">
              <button
                type="button"
                title="Link"
                preventdefault:mousedown
                onClick$={() => openMenu('link')}
              >
                <Link2 size={16} />
              </button>
              <button
                type="button"
                title="Image"
                preventdefault:mousedown
                onClick$={() => openMenu('image')}
              >
                <Image size={16} />
              </button>
              <button
                type="button"
                title="Color"
                preventdefault:mousedown
                onClick$={() => openMenu('color')}
              >
                <Palette size={16} />
              </button>
              <button
                type="button"
                title="Text size"
                preventdefault:mousedown
                onClick$={() => openMenu('size')}
              >
                <Type size={16} />
              </button>
            </ButtonContainer>

            <ButtonContainer class="lum-bg-lum-input-bg [&>button]:p-1!">
              <button
                type="button"
                title="Center"
                preventdefault:mousedown
                onClick$={() => wrap('[center]', '[/center]', 'centered text')}
              >
                <AlignCenter size={16} />
              </button>
              <button
                type="button"
                title="Quote"
                preventdefault:mousedown
                onClick$={() => wrap('[quote]', '[/quote]', 'quoted text')}
              >
                <Quote size={16} />
              </button>
              <button
                type="button"
                title="Code"
                preventdefault:mousedown
                onClick$={() => wrap('[code]', '[/code]', 'code')}
              >
                <Code size={16} />
              </button>
              <button
                type="button"
                title="List"
                preventdefault:mousedown
                onClick$={() => wrap('[list]\n[*] ', '\n[/list]', 'first item')}
              >
                <List size={16} />
              </button>
            </ButtonContainer>

            <ButtonContainer class="lum-bg-lum-input-bg ml-auto [&>button]:p-1!">
              <button
                type="button"
                title={showPreview.value ? 'Edit' : 'Preview'}
                class={{
                  'lum-bg-lum-accent/30': showPreview.value,
                }}
                preventdefault:mousedown
                onClick$={() => {
                  menu.value = null;
                  showPreview.value = !showPreview.value;
                }}
              >
                {showPreview.value ? <EyeOff size={16} /> : <Eye size={16} />}
                <span class="text-xs">
                  {showPreview.value ? 'Edit' : 'Preview'}
                </span>
              </button>
            </ButtonContainer>
          </div>

          {/* Popovers */}
          {menu.value === 'link' && (
            <div class="lum-card lum-bg-lum-card-bg absolute top-full left-0 z-50 mt-1 w-72 gap-2 p-2">
              <span class="text-xs font-semibold">Insert link</span>
              <div class="flex gap-1">
                <input
                  class="lum-input flex-1"
                  value={linkUrl.value}
                  onInput$={(e, el) => (linkUrl.value = el.value)}
                  placeholder="https://example.com"
                />
                <button
                  type="button"
                  class="lum-btn lum-bg-blue hover:lum-bg-blue/80 p-2"
                  onClick$={() =>
                    applyFromMenu(
                      `[url=${linkUrl.value}]`,
                      '[/url]',
                      'link text'
                    )
                  }
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {menu.value === 'image' && (
            <div class="lum-card lum-bg-lum-card-bg absolute top-full left-0 z-50 mt-1 w-72 gap-2 p-2">
              <span class="text-xs font-semibold">Insert image</span>
              <div class="flex gap-1">
                <input
                  class="lum-input flex-1"
                  value={imgUrl.value}
                  onInput$={(e, el) => (imgUrl.value = el.value)}
                  placeholder="https://image.png"
                />
                <button
                  type="button"
                  class="lum-btn lum-bg-blue hover:lum-bg-blue/80 p-2"
                  onClick$={() =>
                    applyFromMenu('[img]', '[/img]', imgUrl.value)
                  }
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {menu.value === 'color' && (
            <div class="lum-card lum-bg-lum-card-bg absolute top-full left-0 z-50 mt-1 gap-2 p-2">
              <span class="text-xs font-semibold">Text color</span>
              <ColorPicker
                value={color.value}
                onInput$={(c) => (color.value = c)}
                horizontal
              />
              <button
                type="button"
                class="lum-btn lum-bg-blue hover:lum-bg-blue/80 self-start"
                onClick$={() =>
                  applyFromMenu(
                    `[color=${color.value}]`,
                    '[/color]',
                    'colored text'
                  )
                }
              >
                <Check size={16} />
                Apply
              </button>
            </div>
          )}

          {menu.value === 'size' && (
            <div class="lum-card lum-bg-lum-card-bg absolute top-full left-0 z-50 mt-1 w-44 gap-1 p-2">
              <span class="text-xs font-semibold">Text size</span>
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/60 rounded-lum-1 justify-start"
                  onClick$={() =>
                    applyFromMenu(
                      `[size=${s.value}]`,
                      '[/size]',
                      `${s.label.toLowerCase()} text`
                    )
                  }
                >
                  <span style={{ fontSize: `${s.value}px` }}>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {showPreview.value ? (
          <div
            class="lum-input [&_a]:text-lum-accent [&_img]:rounded-lum-1 [&_blockquote]:border-lum-border/40 [&_blockquote]:text-lum-text-secondary [&_code]:bg-lum-input-bg/40 min-h-32 text-sm leading-relaxed break-words [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:px-1 [&_img]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={
              renderBBCode(current.value) ||
              '<span class="opacity-50">Nothing to preview yet…</span>'
            }
          />
        ) : (
          <textarea
            ref={ref}
            id={id}
            class="lum-input min-h-32"
            maxLength={maxLength}
            value={value}
            placeholder={placeholder}
            onInput$={(e, el) => {
              current.value = el.value;
              void onChange$(el.value);
            }}
          />
        )}
      </div>
    );
  }
);
