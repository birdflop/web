import {
  $,
  component$,
  createContextId,
  Signal,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';
import { Eye, Terminal, Pencil } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, {
  lightBackgrounds,
} from '~/components/Elements/Background';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
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
  const el = document.getElementById(
    'input',
  ) as HTMLTextAreaElement | null;
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
  'advanced-rgb-selection',
);
export const previewStyleContext = createContextId<Signal<string>>(
  'previewstyle-context',
);
export const rawEditModeContext =
  createContextId<Signal<boolean>>('raw-edit-mode');

const ImgPwaIcon8x8 = '/branding/pwa-icon-8x8.png';
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
    class?: string;
    inputClass?: string;
    readOnly?: boolean;
    advanced?: boolean;
  }) => {
    const rgbStore = useContext(rgbStoreContext);
    const rgbSegments = useContext(rgbSegmentsContext, null);

    const selection = useContext(selectionContext, useSignal<Selection>());
    const rawEdit = useSignal(false);

    const syncSelection = $((el: HTMLTextAreaElement) => {
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? start;
      if (advanced && rgbSegments) {
        selection.value = {
          start,
          end,
          segmentIndex: segmentIndexAtChar(
            rgbSegments.value,
            Math.max(0, Math.min(start, end > start ? start : start - 1)),
          ),
        };
      } else {
        if (start === end) {
          // If there's no selection, unset it
          selection.value = undefined;
          return;
        }
        selection.value = {
          start,
          end,
        };
      }
      console.log('Selection updated:', selection.value);
    });

    return (
      <div
        class={{
          'focus-within:border-lum-accent relative break-all caret-white': true,
          [`${className}`]: className,
          [`${rgbStore.colorFormat.class}`]: rgbStore.colorFormat.class,
        }}
      >
        <p
          class={{
            'pointer-events-none whitespace-pre-wrap': true,
            [`${inputClass}`]: inputClass,
          }}
          style={{ visibility: rawEdit.value ? 'hidden' : 'visible' }}
        >
          <Slot />
        </p>
        {!readOnly && (
          <textarea
            class={{
              'rounded-lum selection:bg-blue/50 selection:text-lum-text-secondary/60 absolute inset-0 whitespace-pre-wrap outline-0': true,
              'resize-none border-none bg-transparent text-transparent outline-none':
                !rawEdit.value,
              'resize-none border-none bg-transparent text-white outline-none':
                rawEdit.value,
              [`${inputClass}`]: inputClass,
            }}
            value={advanced && rgbSegments ? combinedText(rgbSegments.value) : rgbStore.text}
            spellcheck={false}
            id={'input'}
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
                    Math.max(0, caret - 1),
                  ),
                };
              } else {
                rgbStore.text = el.value;
              }
            }}
            onSelect$={(e, el) => syncSelection(el)}
            onKeyUp$={(e, el) => syncSelection(el)}
            onMouseUp$={(e, el) => syncSelection(el)}
          />
        )}
      </div>
    );
  },
);

// The default input field style
const DefaultInput = component$(
  ({ readOnly, advanced }: { readOnly: boolean | undefined; advanced?: boolean }) => {
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
  },
);

// The default input field style
const MCPreviewTabSection = component$(
  ({ readOnly, advanced }: { readOnly: boolean | undefined; advanced?: boolean }) => {
    const previewStyle = useContext(previewStyleContext);

    return (
      <div class="max-h-64 min-h-8 overflow-auto bg-black/50 py-0.5 pl-0.5 text-2xl wrap-break-word">
        {previewStyle.value == 'tab-header' && (
          <InputField readOnly={readOnly} advanced={advanced} inputClass="text-center">
            <Slot />
          </InputField>
        )}
        <div class="mx-auto flex h-6 gap-0.5 overflow-hidden bg-[#aaaaaa]/20 pr-0.5 text-left text-2xl">
          <img
            width={24}
            height={24}
            class="rounded-none!"
            src={ImgPwaIcon8x8}
            alt="RGBirdflop"
            style="image-rendering: pixelated;"
          />
          <p class="-my-0.5 flex-1 text-white!">RGBirdflop</p>
          <img
            width={24}
            height={24}
            class="rounded-none!"
            src={ImgMcPing5}
            alt="RGBirdflop"
            style="image-rendering: pixelated;"
          />
        </div>
        {previewStyle.value == 'tab-player' && (
          <div class="mx-auto flex gap-0.5 overflow-hidden bg-[#aaaaaa]/20 pr-0.5 text-left text-2xl">
            <img
              width={24}
              height={24}
              class="rounded-none!"
              src={ImgPwaIcon8x8}
              alt="RGBirdflop"
              style="image-rendering: pixelated;"
            />
            <InputField readOnly={readOnly} advanced={advanced} class="-my-1 flex-1">
              <Slot />
            </InputField>
            <img
              width={24}
              height={24}
              class="rounded-none!"
              src={ImgMcPing5}
              alt="RGBirdflop"
              style="image-rendering: pixelated;"
            />
          </div>
        )}
        {previewStyle.value == 'tab-footer' && (
          <InputField readOnly={readOnly} advanced={advanced} inputClass="text-center">
            <Slot />
          </InputField>
        )}
      </div>
    );
  },
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
  },
);

// The default input field style
const MCPreviewGUISection = component$(
  ({ readOnly, advanced }: { readOnly: boolean | undefined; advanced?: boolean }) => {
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
  },
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
            <MCPreviewChatSection readOnly={readOnly} playerName={playerName} advanced={advanced}>
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
  },
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

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      const input = document.getElementById('input') as HTMLTextAreaElement;
      if (!input) return;
      input.focus();
      const len = advanced && rgbSegments ? combinedText(rgbSegments.value).length : rgbStore.text.length;
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
                  'rgb.inputText.description@@Type here to generate a gradient!',
                )}
              </p>
            </h5>
          )}
          {!noFormatRow && <Formatting />}
        </div>
        <label for="input" class="relative mt-2 mb-4 flex flex-col items-start">
          {previewStyle.value != 'default' && (
            <MCPreviewInput
              readOnly={readOnly}
              chatInput={advanced && rgbSegments ? generateAdvancedOutput(rgbSegments.value, rgbStore) : chatInput}
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
          <div
            class={{
              'flex items-center gap-1': true,
              'absolute top-1 right-1': true,
            }}
          >
            {!readOnly && (
              <button
                type="button"
                class={{
                  'rounded-lum-1 lum-grad-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg flex items-center justify-center p-1 transition-colors': true,
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
            <Slot name="extra-buttons" />
            <SelectMenuRaw
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
                  name: t(
                    'rgb.inputText.preview.tab.header@@Minecraft Tab Header',
                  ),
                  value: 'tab-header',
                },
                {
                  name: t(
                    'rgb.inputText.preview.tab.footer@@Minecraft Tab Footer',
                  ),
                  value: 'tab-footer',
                },
                {
                  name: t(
                    'rgb.inputText.preview.tab.player@@Minecraft Tab Player',
                  ),
                  value: 'tab-player',
                },
                {
                  name: t(
                    'rgb.inputText.preview.gui.chest@@Minecraft GUI Chest',
                  ),
                  value: 'gui-chest',
                },
                {
                  name: t(
                    'rgb.inputText.preview.gui.item@@Minecraft GUI Item Name',
                  ),
                  value: 'gui-item-name',
                },
                {
                  name: t(
                    'rgb.inputText.preview.gui.lore@@Minecraft GUI Item Lore',
                  ),
                  value: 'gui-item-lore',
                },
              ]}
              customDropdown
              class={{
                'lum-grad-bg-lum-card-bg/75 rounded-lum-1 gap-1 p-1': true,
              }}
            >
              <Eye
                size={20}
                class="text-lum-text-secondary"
                q:slot="dropdown"
              />
            </SelectMenuRaw>
          </div>
        </label>
      </>
    );
  },
);
