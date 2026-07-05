import { $, component$, createContextId, Signal, Slot, useContext, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Eye, Terminal, Pencil } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, { lightBackgrounds } from '~/components/Elements/Background';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import Formatting from '~/components/Rgbirdflop/Formatting';
import { generateOutput } from '@birdflop/rgbirdflop';

export interface Selection {
  start: number;
  end: number;
  segmentIndex?: number;
};

export const selectionContext = createContextId<Signal<Selection | undefined>>('advanced-rgb-selection');
export const previewStyleContext = createContextId<Signal<string>>('previewstyle-context');
export const rawEditModeContext = createContextId<Signal<boolean>>('raw-edit-mode');

const ImgPwaIcon8x8 = '/branding/pwa-icon-8x8.png';
const ImgItem = '/banner/dyes/cyan_dye.png';
const ImgMcPing5 = '/minecraft/ping_5.png';
const ImgChestGui = '/minecraft/chest.png';

// The main input field component where you type your text
const InputField = component$(({ class: className, inputClass, readOnly }: {
  class?: string;
  inputClass?: string;
  readOnly?: boolean;
}) => {
  const rgbStore = useContext(rgbStoreContext);

  const selection = useContext(selectionContext, useSignal<Selection>());
  const rawEdit = useSignal(false);

  const syncSelection = $((el: HTMLTextAreaElement) => {
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? start;
    if (start === end) {
      // If there's no selection, unset it
      selection.value = undefined;
      return;
    }
    selection.value = {
      start,
      end,
    };
    console.log('Selection updated:', selection.value);
  });

  return (
    <div class={{
      'relative focus-within:border-lum-accent break-all caret-white': true,
      [`${className}`]: className,
      [`${rgbStore.colorFormat.class}`]: rgbStore.colorFormat.class,
    }}>
      <p
        class={{
          'pointer-events-none whitespace-pre-wrap': true,
          [`${inputClass}`]: inputClass,
        }}
        style={{ visibility: rawEdit.value ? 'hidden' : 'visible' }}
      >
        <Slot />
      </p>
      {!readOnly &&
        <textarea class={{
          'absolute inset-0 whitespace-pre-wrap rounded-lum outline-0 selection:bg-blue/50 selection:text-lum-text/80': true,
          'text-transparent bg-transparent outline-none border-none resize-none': !rawEdit.value,
          'text-white bg-transparent outline-none border-none resize-none': rawEdit.value,
          [`${inputClass}`]: inputClass,
        }}
        value={rgbStore.text} spellcheck={false} id="input"
        onInput$={(e, el) => { rgbStore.text = el.value; }}
        onSelect$={(e, el) => syncSelection(el)}
        onKeyUp$={(e, el) => syncSelection(el)}
        onMouseUp$={(e, el) => syncSelection(el)} />
      }
    </div>
  );
});

// The default input field style
const DefaultInput = component$(({ readOnly }: { readOnly: boolean | undefined }) => {
  return <InputField readOnly={readOnly}
    class="w-full lum-input p-0 text-3xl md:text-4xl xl:text-5xl font-mc"
    inputClass="lum-btn-p-2">
    <Slot />
  </InputField>;
});

// The default input field style
const MCPreviewTabSection = component$(({ readOnly }: { readOnly: boolean | undefined }) => {
  const previewStyle = useContext(previewStyleContext);

  return <div class="bg-black/50 min-h-8 py-0.5 pl-0.5 text-2xl max-h-64 wrap-break-word overflow-auto">
    {previewStyle.value == 'tab-header' &&
      <InputField readOnly={readOnly} inputClass="text-center">
        <Slot />
      </InputField>
    }
    <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left h-6 flex gap-0.5 pr-0.5 mx-auto">
      <img width={24} height={24} class="rounded-none!" src={ImgPwaIcon8x8} alt="RGBirdflop" style="image-rendering: pixelated;" />
      <p class="text-white! -my-0.5 flex-1">RGBirdflop</p>
      <img width={24} height={24} class="rounded-none!" src={ImgMcPing5} alt="RGBirdflop" style="image-rendering: pixelated;" />
    </div>
    {previewStyle.value == 'tab-player' &&
      <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left flex gap-0.5 pr-0.5 mx-auto">
        <img width={24} height={24} class="rounded-none!" src={ImgPwaIcon8x8} alt="RGBirdflop" style="image-rendering: pixelated;" />
        <InputField readOnly={readOnly} class="flex-1 -my-1">
          <Slot />
        </InputField>
        <img width={24} height={24} class="rounded-none!" src={ImgMcPing5} alt="RGBirdflop" style="image-rendering: pixelated;" />
      </div>
    }
    {previewStyle.value == 'tab-footer' &&
      <InputField readOnly={readOnly} inputClass="text-center">
        <Slot />
      </InputField>
    }
  </div>;
});

// The default input field style
const MCPreviewChatSection = component$(({ readOnly, playerName = 'RGBirdflop' }: {
  readOnly: boolean | undefined,
  playerName?: string,
}) => {
  const t = inlineTranslate();

  return <div class="absolute bottom-25 w-[75%] bg-black/50 min-h-8 px-2 py-0.5 text-2xl wrap-break-word overflow-y-auto"
    style={{ maxHeight: 'calc(100% - 7rem)' }}>
    {!readOnly &&
      <p class="text-white!">
        {`<${playerName}>`} {t('rgb.inputText.preview.typeHere@@Type here!')}
      </p>
    }
    <InputField readOnly={readOnly}>
      {readOnly &&
        <span class="text-white! mr-2">
          {`<${playerName}>`}
        </span>
      }
      <Slot />
    </InputField>
  </div>;
});

// The default input field style
const MCPreviewGUISection = component$(({ readOnly }: { readOnly: boolean | undefined }) => {
  const previewStyle = useContext(previewStyleContext);

  return <div class="absolute inset-0 bg-black/70 backdrop-blur-xs flex justify-center items-center p-4">
    <div class="w-2/5 relative">
      <img src={ImgChestGui} alt="Minecraft Chest GUI" class="w-full rounded-none!" style="image-rendering: pixelated;" width={176} height={168} />
      <div class="absolute inset-0 text-xs sm:text-sm md:text-base lg:text-2xl">
        {previewStyle.value == 'gui-chest' &&
          <InputField readOnly={readOnly} inputClass="*:text-shadow-none!" class="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] w-[calc(160/176*100%)]">
            <Slot />
          </InputField>
        }
        {previewStyle.value != 'gui-chest' &&
          <p class="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] text-[#404040]! text-shadow-none">
            Minecraft GUI Preview
          </p>
        }
        <img src={ImgItem} alt="Minecraft Item Icon" class="absolute top-[calc(18/168*100%)] left-[calc(9/176*100%)] w-[calc(13/168*100%)] h-[calc(13/168*100%)] rounded-none!" style="image-rendering: pixelated;" width={16} height={16} />
        <p class="absolute top-[calc(72/168*100%)] left-[calc(8/176*100%)] text-[#404040]! text-shadow-none">
          RGBirdflop
        </p>
        {previewStyle.value.includes('gui-item') &&
          <div class="absolute top-[calc(28/168*100%)] left-[calc(20/176*100%)] bg-[#100010]/95 lum-btn-p-1">
            {previewStyle.value == 'gui-item-lore' &&
              <p class="text-white!">
                Cyan Dye
              </p>
            }
            <InputField readOnly={readOnly} inputClass="*:text-shadow-none!">
              <Slot />
            </InputField>
            <div class="*:absolute *:bg-[#100010]/95">
              <div class="left-0 top-full w-full h-0.5" />
              <div class="left-0 bottom-full w-full h-0.5" />
              <div class="left-full top-0 h-full w-0.5" />
              <div class="right-full top-0 h-full w-0.5" />
            </div>
            <div class="*:absolute">
              <div class="bg-[#28007f]/50 left-0.5 top-[calc(100%-2px)] w-[calc(100%-4px)] h-0.5" />
              <div class="bg-[#5000ff]/50 left-0.5 bottom-[calc(100%-2px)] w-[calc(100%-4px)] h-0.5" />
              <div class="bg-linear-to-b from-[#5000ff]/50 to-[#28007f]/50 left-[calc(100%-2px)] top-0.5 h-[calc(100%-4px)] w-0.5" />
              <div class="bg-linear-to-b from-[#5000ff]/50 to-[#28007f]/50 right-[calc(100%-2px)] top-0.5 h-[calc(100%-4px)] w-0.5" />
            </div>
          </div>
        }
      </div>
    </div>
  </div>;
});

// The Minecraft preview style for the input field
const MCPreviewInput = component$(({ readOnly, chatInput, playerName = 'RGBirdflop' }: {
  readOnly: boolean | undefined,
  chatInput?: string,
  playerName?: string,
}) => {
  const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const rgbStore = useContext(rgbStoreContext);
  const previewStyle = useContext(previewStyleContext);

  return <div class="relative rounded-lum break-all font-mc"
    style={{ textShadow: '2px 2px 0 #373737' }}>
    <Background class="overflow-hidden rounded-lum" id="bg" alt="background" />

    <p class="text-white! absolute bottom-1 left-1 w-[calc(100%-0.5rem)] bg-black/50 h-8 px-1 py-0.5 text-2xl whitespace-nowrap overflow-auto">
      {chatInput ?? generateOutput(rgbStore)}
    </p>

    <div class={{
      'absolute flex flex-col w-full text-2xl': true,
      'bottom-0 h-full wrap-break-word overflow-auto': previewStyle.value == 'chat' || previewStyle.value.includes('gui'),
      'top-5 justify-center items-center text-center min-h-8 px-2 max-h-64': previewStyle.value.includes('tab'),
    }}>
      {previewStyle.value.includes('tab') &&
        <MCPreviewTabSection readOnly={readOnly}>
          <Slot />
        </MCPreviewTabSection>
      }
      {previewStyle.value == 'chat' &&
        <MCPreviewChatSection readOnly={readOnly} playerName={playerName}>
          <Slot />
        </MCPreviewChatSection>
      }
      {previewStyle.value.includes('gui') &&
        <MCPreviewGUISection readOnly={readOnly}>
          <Slot />
        </MCPreviewGUISection>
      }
    </div>
  </div>;
});

// The main Input component that combines everything
export default component$(({ readOnly, noLabel, noFormatRow, chatInput, playerName }: {
  readOnly?: boolean
  noLabel?: boolean
  noFormatRow?: boolean
  chatInput?: string
  playerName?: string
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const previewStyle = useContext(previewStyleContext);

  const rawEditMode = useSignal(false);
  useContextProvider(rawEditModeContext, rawEditMode);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const input = document.getElementById('input') as HTMLTextAreaElement;
    if (!input) return;
    input.focus();
    input.setSelectionRange(rgbStore.text.length, rgbStore.text.length);
  });

  return <>
    <div class="sm:flex items-center gap-1">
      {!readOnly && !noLabel &&
        <h5 class="my-2! flex flex-1 md:text-lg xl:text-xl font-semibold gap-3 items-center">
          <Terminal />
          {t('rgb.inputText.title@@Input Text')}
          <p class="text-lum-text-secondary text-sm font-normal">
            {t('rgb.inputText.description@@Type here to generate a gradient!')}
          </p>
        </h5>
      }
      {!noFormatRow &&
        <Formatting />
      }
    </div>
    <label for="input" class="flex flex-col items-start mt-2 mb-4 relative">
      {previewStyle.value != 'default' && <MCPreviewInput readOnly={readOnly}
        chatInput={chatInput}
        playerName={playerName}>
        <Slot />
        <Slot name="input" />
      </MCPreviewInput>}
      {previewStyle.value == 'default' && <DefaultInput readOnly={readOnly}>
        <Slot />
        <Slot name="input" />
      </DefaultInput>}
      <div class={{
        'flex gap-1 items-center': true,
        'absolute top-1 right-1': true,
      }}>
        {!readOnly && (
          <button
            type="button"
            class={{
              'p-1 rounded-lum-1 lum-grad-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg transition-colors flex items-center justify-center': true,
              'text-lum-primary-active!': rawEditMode.value,
              'text-lum-text-secondary': !rawEditMode.value,
            }}
            onClick$={() => rawEditMode.value = !rawEditMode.value}
            title={rawEditMode.value ? t('rgb.input.viewFormatted@@View Formatted Preview') : t('rgb.input.rawEdit@@Raw Edit Mode')}
          >
            {rawEditMode.value ? <Eye size={20} /> : <Pencil size={20} />}
          </button>
        )}
        <Slot name="extra-buttons" />
        <SelectMenuRaw align="right" id="previewstyle" value={previewStyle.value} onChange$={
          (e, el) => {
            previewStyle.value = el.value;
          }
        } values={[
          {
            name: t('rgb.inputText.preview.default@@Default'),
            value: 'default',
          },
          {
            name: t('rgb.inputText.preview.chat@@Minecraft Chat'),
            value: 'chat',
          },
          {
            name: t('rgb.inputText.preview.tab.header@@Minecraft Tab Header'),
            value: 'tab-header',
          },
          {
            name: t('rgb.inputText.preview.tab.footer@@Minecraft Tab Footer'),
            value: 'tab-footer',
          },
          {
            name: t('rgb.inputText.preview.tab.player@@Minecraft Tab Player'),
            value: 'tab-player',
          },
          {
            name: t('rgb.inputText.preview.gui.chest@@Minecraft GUI Chest'),
            value: 'gui-chest',
          },
          {
            name: t('rgb.inputText.preview.gui.item@@Minecraft GUI Item Name'),
            value: 'gui-item-name',
          },
          {
            name: t('rgb.inputText.preview.gui.lore@@Minecraft GUI Item Lore'),
            value: 'gui-item-lore',
          },
        ]} customDropdown class={{ 'p-1 gap-1 lum-grad-bg-lum-card-bg/75 rounded-lum-1': true }}>
          <Eye size={20} class="text-lum-text-secondary" q:slot="dropdown" />
        </SelectMenuRaw>
      </div>
    </label>
  </>;
});