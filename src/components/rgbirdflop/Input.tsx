import {
  $,
  ClassList,
  component$,
  createContextId,
  Signal,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@qwik.dev/core';
import Eye from 'lucide-icons-qwik/icons/Eye';
import Terminal from 'lucide-icons-qwik/icons/Terminal';
import Pencil from 'lucide-icons-qwik/icons/Pencil';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, {
  lightBackgrounds,
} from '~/components/Elements/Background';
import { MotdPreviewCard } from '~/components/Elements/MotdPreviewCard';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { getClassObject, SelectMenu } from '@luminescent/ui-qwik';
import Formatting from '~/components/rgbirdflop/Formatting';
import { generateOutput } from '@birdflop/rgbirdflop';
import {
  applyTextDiff,
  combinedText,
  segmentIndexAtChar,
  rgbSegmentsContext,
} from '~/components/rgbirdflop/advanced/rgbSegments';
import { generateAdvancedOutput } from '~/components/rgbirdflop/advanced/output';

/** Re-applies the textarea selection after a store mutation (Qwik may reset the caret). */
export const restoreSelection = $((start: number, end: number) => {
  const el = document.getElementById('input') as HTMLTextAreaElement | null;
  if (!el) return;
  requestAnimationFrame(() => {
    try {
      el.focus();
      el.setSelectionRange(start, end);
    } catch {
      /* noop */
    }
  });
});

export interface Selection {
  start: number;
  end: number;
  segmentIndex?: number;
}

export const selectionContext = createContextId<Signal<Selection | undefined>>(
  'advanced-rgb-selection'
);
export const previewStyleContext = createContextId<Signal<string>>(
  'previewstyle-context'
);
export const rawEditModeContext =
  createContextId<Signal<boolean>>('raw-edit-mode');

const ImgIconBg = '/branding/icon-bg-8x8.png';
const ImgItem = '/banner/dyes/cyan_dye.png';
const ImgMcPing5 = '/minecraft/ping_5.png';
const ImgChestGui = '/minecraft/chest.png';

// The main input field component where you type your text
const InputField = component$(
  ({
    class: className,
    inputClass,
    readOnly,
    advanced,
  }: {
    class?: ClassList;
    inputClass?: ClassList;
    readOnly?: boolean;
    advanced?: boolean;
  }) => {
    const rgbStore = useContext(rgbStoreContext);
    const rgbSegments = useContext(rgbSegmentsContext, null);

    const selection = useContext(selectionContext, useSignal<Selection>());
    const rawEdit = useContext(rawEditModeContext);

    const isDragging = useSignal(false);
    const dragStartIndex = useSignal(0);

    const syncSelection = $((el: HTMLTextAreaElement) => {
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? start;
      if (advanced && rgbSegments) {
        selection.value = {
          start,
          end,
          segmentIndex: segmentIndexAtChar(
            rgbSegments.value,
            Math.max(0, Math.min(start, end > start ? start : start - 1))
          ),
        };
      } else {
        selection.value = {
          start,
          end,
        };
      }
      console.log('Selection updated:', selection.value);
    });

    const getIndexFromXY = $(
      (clientX: number, clientY: number, container: HTMLElement) => {
        const spans = container.querySelectorAll<HTMLElement>('.char-span');
        if (spans.length === 0) return 0;

        let maxBottom = -Infinity;
        let minTop = Infinity;
        let minDistY = Infinity;
        const spansWithDist = [];

        for (let i = 0; i < spans.length; i++) {
          const el = spans[i];
          const rect = el.getBoundingClientRect();
          maxBottom = Math.max(maxBottom, rect.bottom);
          minTop = Math.min(minTop, rect.top);
          const distY = Math.max(0, rect.top - clientY, clientY - rect.bottom);
          minDistY = Math.min(minDistY, distY);
          const isNewline =
            el.getAttribute('data-text') === '\n' ||
            el.getAttribute('data-text') === '\r';
          spansWithDist.push({ index: i, rect, distY, isNewline });
        }

        if (clientY > maxBottom + 10) {
          return spans.length;
        }
        if (clientY < minTop - 10) {
          return 0;
        }

        const closestLineSpans = spansWithDist.filter(
          (item) => item.distY <= minDistY + 5
        );

        if (closestLineSpans.length === 0) return spans.length;

        closestLineSpans.sort((a, b) => a.rect.left - b.rect.left);

        for (let i = 0; i < closestLineSpans.length; i++) {
          const item = closestLineSpans[i];
          if (item.isNewline) {
            if (clientX < item.rect.right) {
              return item.index;
            }
          } else {
            const charMiddle = item.rect.left + item.rect.width / 2;
            if (clientX < charMiddle) {
              return item.index;
            }
          }
        }

        const lastItem = closestLineSpans[closestLineSpans.length - 1];
        return lastItem.isNewline ? lastItem.index : lastItem.index + 1;
      }
    );

    const handlePointerDown = $(async (e: PointerEvent, el: HTMLDivElement) => {
      if (rawEdit.value || readOnly) return;
      if (e.button !== 0) return;
      e.preventDefault();
      const targetIndex = await getIndexFromXY(e.clientX, e.clientY, el);
      isDragging.value = true;
      dragStartIndex.value = targetIndex;

      const textarea = el.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(targetIndex, targetIndex);
        if (advanced && rgbSegments) {
          selection.value = {
            start: targetIndex,
            end: targetIndex,
            segmentIndex: segmentIndexAtChar(
              rgbSegments.value,
              Math.max(0, targetIndex - 1)
            ),
          };
        } else {
          selection.value = {
            start: targetIndex,
            end: targetIndex,
          };
        }
      }
    });

    const handlePointerMove = $(async (e: PointerEvent, el: HTMLDivElement) => {
      if (!isDragging.value || rawEdit.value || readOnly) return;
      const targetIndex = await getIndexFromXY(e.clientX, e.clientY, el);
      const textarea = el.querySelector('textarea');
      if (textarea) {
        const start = Math.min(dragStartIndex.value, targetIndex);
        const end = Math.max(dragStartIndex.value, targetIndex);
        textarea.setSelectionRange(start, end);
        if (advanced && rgbSegments) {
          selection.value = {
            start,
            end,
            segmentIndex: segmentIndexAtChar(
              rgbSegments.value,
              Math.max(0, start - 1)
            ),
          };
        } else {
          selection.value = {
            start,
            end,
          };
        }
      }
    });

    const handleDblClick = $(async (e: MouseEvent, el: HTMLDivElement) => {
      if (rawEdit.value || readOnly) return;
      e.preventDefault();
      const targetIndex = await getIndexFromXY(e.clientX, e.clientY, el);
      const text =
        advanced && rgbSegments
          ? combinedText(rgbSegments.value)
          : rgbStore.text;

      let start = targetIndex;
      while (start > 0 && !/\s/.test(text[start - 1])) {
        start--;
      }
      let end = targetIndex;
      while (end < text.length && !/\s/.test(text[end])) {
        end++;
      }

      const textarea = el.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start, end);
        if (advanced && rgbSegments) {
          selection.value = {
            start,
            end,
            segmentIndex: segmentIndexAtChar(
              rgbSegments.value,
              Math.max(0, start - 1)
            ),
          };
        } else {
          selection.value = { start, end };
        }
      }
    });

    const handleScroll = $((e: Event) => {
      const textarea = e.target as HTMLTextAreaElement;
      const container = textarea.closest('.relative');
      if (!container) return;
      const preview = container.querySelector('p') as HTMLElement | null;
      if (preview) {
        preview.scrollLeft = textarea.scrollLeft;
        preview.scrollTop = textarea.scrollTop;
      }
    });

    return (
      <div
        class={{
          'focus-within:border-lum-accent relative cursor-text break-all caret-white': true,
          ...getClassObject(className),
          ...getClassObject(rgbStore.colorFormat.class),
        }}
        onPointerDown$={handlePointerDown}
        onPointerMove$={handlePointerMove}
        onDblClick$={handleDblClick}
        document:onPointerUp$={$(() => {
          isDragging.value = false;
        })}
      >
        <p
          class={{
            'whitespace-pre-wrap select-none': true,
            ...getClassObject(inputClass),
          }}
          style={{ visibility: rawEdit.value ? 'hidden' : 'visible' }}
        >
          <Slot />
        </p>
        {!readOnly && (
          <textarea
            class={{
              'rounded-lum selection:bg-blue/50 selection:text-lum-text-secondary/60 absolute inset-0 whitespace-pre-wrap outline-0': true,
              'pointer-events-none resize-none border-none bg-transparent text-transparent opacity-0 outline-none':
                !rawEdit.value,
              'pointer-events-auto resize-none border-none bg-transparent text-white opacity-100 outline-none':
                rawEdit.value,
              ...getClassObject(inputClass),
            }}
            value={
              advanced && rgbSegments
                ? combinedText(rgbSegments.value)
                : rgbStore.text
            }
            spellcheck={false}
            id={'input'}
            onScroll$={handleScroll}
            onInput$={(e, el) => {
              if (advanced && rgbSegments) {
                if (e.isComposing) return;
                const caret = el.selectionStart ?? el.value.length;
                rgbSegments.value = applyTextDiff(rgbSegments.value, el.value);
                requestAnimationFrame(() => {
                  try {
                    el.setSelectionRange(caret, caret);
                  } catch {
                    /* noop */
                  }
                });
                selection.value = {
                  start: caret,
                  end: caret,
                  segmentIndex: segmentIndexAtChar(
                    rgbSegments.value,
                    Math.max(0, caret - 1)
                  ),
                };
              } else {
                rgbStore.text = el.value;
                const caret = el.selectionStart ?? el.value.length;
                selection.value = {
                  start: caret,
                  end: caret,
                };
              }
            }}
            onSelect$={(e, el) => syncSelection(el)}
            onKeyUp$={(e, el) => syncSelection(el)}
            onKeyDown$={(e, el) => syncSelection(el)}
            onMouseUp$={(e, el) => syncSelection(el)}
          />
        )}
      </div>
    );
  }
);

// The default input field style
const DefaultInput = component$(
  ({
    readOnly,
    advanced,
  }: {
    readOnly: boolean | undefined;
    advanced?: boolean;
  }) => {
    return (
      <InputField
        readOnly={readOnly}
        advanced={advanced}
        class="lum-input font-mc w-full p-0 text-3xl md:text-4xl xl:text-5xl"
        inputClass="lum-btn-p-2"
      >
        <Slot />
      </InputField>
    );
  }
);

// The default input field style
const MCPreviewTabSection = component$(
  ({
    readOnly,
    advanced,
  }: {
    readOnly: boolean | undefined;
    advanced?: boolean;
  }) => {
    const previewStyle = useContext(previewStyleContext);

    return (
      <div class="max-h-64 min-h-8 overflow-auto bg-black/50 py-0.5 pl-0.5 text-2xl wrap-break-word">
        {previewStyle.value == 'tab-header' && (
          <InputField
            readOnly={readOnly}
            advanced={advanced}
            inputClass="text-center"
          >
            <Slot />
          </InputField>
        )}
        <div class="mx-auto flex h-5 gap-0.5 overflow-hidden bg-[#aaaaaa]/20 pr-0.5 text-left text-2xl">
          <img
            width={20}
            height={20}
            class="aspect-square"
            src={ImgIconBg}
            alt="RGBirdflop"
            style={{ imageRendering: 'pixelated' }}
          />
          <p class="-mt-0.5 flex-1 leading-none text-white!">RGBirdflop</p>
          <img
            width={25}
            height={20}
            src={ImgMcPing5}
            alt="RGBirdflop"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        {previewStyle.value == 'tab-player' && (
          <div class="mx-auto flex gap-0.5 overflow-hidden bg-[#aaaaaa]/20 pr-0.5 text-left text-2xl">
            <img
              width={20}
              height={20}
              class="aspect-square"
              src={ImgIconBg}
              alt="RGBirdflop"
              style={{ imageRendering: 'pixelated' }}
            />
            <InputField
              readOnly={readOnly}
              advanced={advanced}
              class="-mb-0.5 flex-1 leading-none"
            >
              <Slot />
            </InputField>
            <img
              width={25}
              height={20}
              src={ImgMcPing5}
              alt="RGBirdflop"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}
        {previewStyle.value == 'tab-footer' && (
          <InputField
            readOnly={readOnly}
            advanced={advanced}
            inputClass="text-center"
          >
            <Slot />
          </InputField>
        )}
      </div>
    );
  }
);

// The default input field style
const MCPreviewChatSection = component$(
  ({
    readOnly,
    playerName = 'RGBirdflop',
    advanced,
  }: {
    readOnly: boolean | undefined;
    playerName?: string;
    advanced?: boolean;
  }) => {
    const t = inlineTranslate();

    return (
      <div
        class="absolute bottom-25 min-h-8 w-[75%] overflow-y-auto bg-black/50 px-2 py-0.5 text-2xl wrap-break-word"
        style={{ maxHeight: 'calc(100% - 7rem)' }}
      >
        {!readOnly && (
          <p class="text-white!">
            {`<${playerName}>`}{' '}
            {t('rgb.inputText.preview.typeHere@@Type here!')}
          </p>
        )}
        <InputField readOnly={readOnly} advanced={advanced}>
          {readOnly && (
            <span class="mr-2 text-white!">{`<${playerName}>`}</span>
          )}
          <Slot />
        </InputField>
      </div>
    );
  }
);

// The default input field style
const MCPreviewGUISection = component$(
  ({
    readOnly,
    advanced,
  }: {
    readOnly: boolean | undefined;
    advanced?: boolean;
  }) => {
    const previewStyle = useContext(previewStyleContext);

    return (
      <div class="absolute inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
        <div class="relative w-2/5">
          <img
            src={ImgChestGui}
            alt="Minecraft Chest GUI"
            class="w-full rounded-none!"
            style="image-rendering: pixelated;"
            width={176}
            height={168}
          />
          <div class="absolute inset-0 text-xs sm:text-sm md:text-base lg:text-2xl">
            {previewStyle.value == 'gui-chest' && (
              <InputField
                readOnly={readOnly}
                advanced={advanced}
                inputClass="*:text-shadow-none!"
                class="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] w-[calc(160/176*100%)]"
              >
                <Slot />
              </InputField>
            )}
            {previewStyle.value != 'gui-chest' && (
              <p class="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] text-[#404040]! text-shadow-none">
                Minecraft GUI Preview
              </p>
            )}
            <img
              src={ImgItem}
              alt="Minecraft Item Icon"
              class="absolute top-[calc(18/168*100%)] left-[calc(9/176*100%)] h-[calc(13/168*100%)] w-[calc(13/168*100%)] rounded-none!"
              style="image-rendering: pixelated;"
              width={16}
              height={16}
            />
            <p class="absolute top-[calc(72/168*100%)] left-[calc(8/176*100%)] text-[#404040]! text-shadow-none">
              RGBirdflop
            </p>
            {previewStyle.value.includes('gui-item') && (
              <div class="lum-btn-p-1 absolute top-[calc(28/168*100%)] left-[calc(20/176*100%)] bg-[#100010]/95">
                {previewStyle.value == 'gui-item-lore' && (
                  <p class="text-white!">Cyan Dye</p>
                )}
                <InputField
                  readOnly={readOnly}
                  advanced={advanced}
                  inputClass="*:text-shadow-none!"
                >
                  <Slot />
                </InputField>
                <div class="*:absolute *:bg-[#100010]/95">
                  <div class="top-full left-0 h-0.5 w-full" />
                  <div class="bottom-full left-0 h-0.5 w-full" />
                  <div class="top-0 left-full h-full w-0.5" />
                  <div class="top-0 right-full h-full w-0.5" />
                </div>
                <div class="*:absolute">
                  <div class="top-[calc(100%-2px)] left-0.5 h-0.5 w-[calc(100%-4px)] bg-[#28007f]/50" />
                  <div class="bottom-[calc(100%-2px)] left-0.5 h-0.5 w-[calc(100%-4px)] bg-[#5000ff]/50" />
                  <div class="top-0.5 left-[calc(100%-2px)] h-[calc(100%-4px)] w-0.5 bg-linear-to-b from-[#5000ff]/50 to-[#28007f]/50" />
                  <div class="top-0.5 right-[calc(100%-2px)] h-[calc(100%-4px)] w-0.5 bg-linear-to-b from-[#5000ff]/50 to-[#28007f]/50" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// The default input field style
const MCPreviewMOTDSection = component$(
  ({
    readOnly,
    advanced,
  }: {
    readOnly: boolean | undefined;
    advanced?: boolean;
  }) => {
    const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
    const Background =
      Backgrounds[Math.floor(Math.random() * Backgrounds.length)];

    return (
      <div class="rounded-lum font-mc relative flex w-full justify-center overflow-hidden p-4">
        <Background
          width={1920}
          height={1080}
          class="rounded-lum absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
          id="bg"
          alt="background"
        />
        <MotdPreviewCard class="relative z-10 w-full max-w-2xl">
          <InputField
            readOnly={readOnly}
            advanced={advanced}
            class="-mb-0.5 flex-1 leading-none"
          >
            <Slot />
          </InputField>
        </MotdPreviewCard>
      </div>
    );
  }
);

// The Minecraft preview style for the input field
const MCPreviewInput = component$(
  ({
    readOnly,
    chatInput,
    playerName = 'RGBirdflop',
    advanced,
  }: {
    readOnly: boolean | undefined;
    chatInput?: string;
    playerName?: string;
    advanced?: boolean;
  }) => {
    const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
    const Background =
      Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
    const rgbStore = useContext(rgbStoreContext);
    const previewStyle = useContext(previewStyleContext);

    return (
      <div
        class="rounded-lum font-mc relative break-all"
        style={{ textShadow: '2px 2px 0 #373737' }}
      >
        <Background
          width={1920}
          height={1080}
          class="rounded-lum overflow-hidden"
          id="bg"
          alt="background"
        />

        <p class="absolute bottom-1 left-1 h-8 w-[calc(100%-0.5rem)] overflow-auto bg-black/50 px-1 py-0.5 text-2xl whitespace-nowrap text-white!">
          {chatInput ?? generateOutput(rgbStore)}
        </p>

        <div
          class={{
            'absolute flex w-full flex-col text-2xl': true,
            'bottom-0 h-full overflow-auto wrap-break-word':
              previewStyle.value == 'chat' ||
              previewStyle.value.includes('gui'),
            'top-5 max-h-64 min-h-8 items-center justify-center px-2 text-center':
              previewStyle.value.includes('tab'),
          }}
        >
          {previewStyle.value.includes('tab') && (
            <MCPreviewTabSection readOnly={readOnly} advanced={advanced}>
              <Slot />
            </MCPreviewTabSection>
          )}
          {previewStyle.value == 'chat' && (
            <MCPreviewChatSection
              readOnly={readOnly}
              playerName={playerName}
              advanced={advanced}
            >
              <Slot />
            </MCPreviewChatSection>
          )}
          {previewStyle.value.includes('gui') && (
            <MCPreviewGUISection readOnly={readOnly} advanced={advanced}>
              <Slot />
            </MCPreviewGUISection>
          )}
        </div>
      </div>
    );
  }
);

// The main Input component that combines everything
export default component$(
  ({
    readOnly,
    noLabel,
    noFormatRow,
    chatInput,
    playerName,
    advanced,
  }: {
    readOnly?: boolean;
    noLabel?: boolean;
    noFormatRow?: boolean;
    chatInput?: string;
    playerName?: string;
    advanced?: boolean;
  }) => {
    const t = inlineTranslate();
    const rgbStore = useContext(rgbStoreContext);
    const previewStyle = useContext(previewStyleContext);
    const rgbSegments = useContext(rgbSegmentsContext, null);

    const rawEditMode = useSignal(false);
    useContextProvider(rawEditModeContext, rawEditMode);

    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      const input = document.getElementById('input') as HTMLTextAreaElement;
      if (!input) return;
      input.focus();
      const len =
        advanced && rgbSegments
          ? combinedText(rgbSegments.value).length
          : rgbStore.text.length;
      input.setSelectionRange(len, len);
    });

    return (
      <>
        <div class="items-center gap-1 sm:flex">
          {!readOnly && !noLabel && (
            <h5 class="my-2! flex flex-1 items-center gap-3 font-semibold md:text-lg xl:text-xl">
              <Terminal />
              {t('rgb.inputText.title@@Input Text')}
              <p class="text-lum-text-secondary text-sm font-normal">
                {t(
                  'rgb.inputText.description@@Type here to generate a gradient!'
                )}
              </p>
            </h5>
          )}
          {!noFormatRow && <Formatting />}
        </div>
        <label for="input" class="relative mt-2 mb-4 flex flex-col items-start">
          {previewStyle.value == 'motd' && (
            <MCPreviewMOTDSection readOnly={readOnly} advanced={advanced}>
              <Slot />
              <Slot name="input" />
            </MCPreviewMOTDSection>
          )}
          {previewStyle.value != 'default' && previewStyle.value != 'motd' && (
            <MCPreviewInput
              readOnly={readOnly}
              chatInput={
                advanced && rgbSegments
                  ? generateAdvancedOutput(rgbSegments.value, rgbStore)
                  : chatInput
              }
              playerName={playerName}
              advanced={advanced}
            >
              <Slot />
              <Slot name="input" />
            </MCPreviewInput>
          )}
          {previewStyle.value == 'default' && (
            <DefaultInput readOnly={readOnly} advanced={advanced}>
              <Slot />
              <Slot name="input" />
            </DefaultInput>
          )}
          <div class="absolute top-1 right-1 flex items-center gap-1">
            {!readOnly && (
              <button
                type="button"
                class={{
                  'lum-btn rounded-lum-1 lum-grad-bg-lum-card-bg/75 p-1': true,
                  'text-lum-primary-active!': rawEditMode.value,
                  'text-lum-text-secondary': !rawEditMode.value,
                }}
                onClick$={() => (rawEditMode.value = !rawEditMode.value)}
                title={
                  rawEditMode.value
                    ? t('rgb.inputText.viewFormatted@@View Formatted Preview')
                    : t('rgb.inputText.rawEdit@@Raw Edit Mode')
                }
              >
                {rawEditMode.value ? <Eye size={20} /> : <Pencil size={20} />}
              </button>
            )}
            <Slot name="extra-content" />
            <SelectMenu
              align="right"
              id="previewstyle"
              value={previewStyle.value}
              onChange$={(e, el) => {
                previewStyle.value = el.value;
              }}
              values={[
                {
                  name: t('rgb.inputText.preview.default@@Default'),
                  value: 'default',
                },
                {
                  name: t('rgb.inputText.preview.chat@@Minecraft Chat'),
                  value: 'chat',
                },
                {
                  name: t('rgb.inputText.preview.motd@@Minecraft Server MOTD'),
                  value: 'motd',
                },
                {
                  name: t(
                    'rgb.inputText.preview.tab.header@@Minecraft Tab Header'
                  ),
                  value: 'tab-header',
                },
                {
                  name: t(
                    'rgb.inputText.preview.tab.footer@@Minecraft Tab Footer'
                  ),
                  value: 'tab-footer',
                },
                {
                  name: t(
                    'rgb.inputText.preview.tab.player@@Minecraft Tab Player'
                  ),
                  value: 'tab-player',
                },
                {
                  name: t(
                    'rgb.inputText.preview.gui.chest@@Minecraft GUI Chest'
                  ),
                  value: 'gui-chest',
                },
                {
                  name: t(
                    'rgb.inputText.preview.gui.item@@Minecraft GUI Item Name'
                  ),
                  value: 'gui-item-name',
                },
                {
                  name: t(
                    'rgb.inputText.preview.gui.lore@@Minecraft GUI Item Lore'
                  ),
                  value: 'gui-item-lore',
                },
              ]}
              customDropdownButton
              class="lum-grad-bg-lum-card-bg/75 rounded-lum-1 gap-1 p-1"
            >
              <Eye
                size={20}
                class="text-lum-text-secondary"
                q:slot="dropdown"
              />
            </SelectMenu>
          </div>
        </label>
      </>
    );
  }
);
