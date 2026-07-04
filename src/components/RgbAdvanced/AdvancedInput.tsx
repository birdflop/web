import { $, component$, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { Eye } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, { lightBackgrounds } from '~/components/Elements/Background';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import { applyTextDiff, combinedText, segmentIndexAtChar } from './model';
import { generateAdvancedOutput } from './output';
import { renderAdvancedPreview } from './preview';
import { ADVANCED_INPUT_ID } from './dom';
import { rgbSegmentsContext } from '~/routes/resources/rgb/beta/index';
import { previewStyleContext, selectionContext } from '~/components/Rgbirdflop/Input';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';

const ImgPwaIcon8x8 = '/branding/pwa-icon-8x8.png';
const ImgItem = '/banner/dyes/cyan_dye.png';
const ImgMcPing5 = '/minecraft/ping_5.png';
const ImgChestGui = '/minecraft/chest.png';

// The editable overlay: a transparent textarea over the styled preview spans.
const InputField = component$(({ class: className, inputClass, readOnly }: {
  class?: string;
  inputClass?: string;
  readOnly?: boolean;
}) => {
  const rgbSegments = useContext(rgbSegmentsContext);
  const selection = useContext(selectionContext);
  const rgbStore = useContext(rgbStoreContext);

  const syncSelection = $((el: HTMLTextAreaElement) => {
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? start;
    selection.value = {
      start,
      end,
      segmentIndex: segmentIndexAtChar(rgbSegments.value, Math.max(0, Math.min(start, end > start ? start : start - 1))),
    };
  });

  return (
    <div class={{
      'relative focus-within:border-lum-accent break-all caret-white': true,
      [`${className}`]: className,
      [`${rgbStore.colorFormat.class}`]: rgbStore.colorFormat.class,
    }}>
      <p class={{
        'pointer-events-none whitespace-pre-wrap': true,
        [`${inputClass}`]: inputClass,
      }}>
        <Slot />
      </p>
      {!readOnly &&
        <textarea class={{
          'absolute inset-0 whitespace-pre-wrap text-transparent rounded-lum outline-0 selection:bg-blue/50 selection:text-lum-text/80': true,
          [`${inputClass}`]: inputClass,
        }}
        value={combinedText(rgbSegments.value)} spellcheck={false} id={ADVANCED_INPUT_ID}
        onInput$={(e, el) => {
          if (e.isComposing) return;
          const caret = el.selectionStart ?? el.value.length;
          rgbSegments.value = applyTextDiff(rgbSegments.value, el.value);
          requestAnimationFrame(() => {
            try { el.setSelectionRange(caret, caret); } catch { /* noop */ }
          });
          selection.value = {
            start: caret,
            end: caret,
            segmentIndex: segmentIndexAtChar(rgbSegments.value, Math.max(0, caret - 1)),
          };
        }}
        onSelect$={(e, el) => syncSelection(el)}
        onKeyUp$={(e, el) => syncSelection(el)}
        onMouseUp$={(e, el) => syncSelection(el)}
        />
      }
    </div>
  );
});

const DefaultInput = component$(({ readOnly }: { readOnly?: boolean }) => {
  return <InputField readOnly={readOnly}
    class="w-full lum-input p-0 text-3xl md:text-4xl xl:text-5xl font-mc"
    inputClass="lum-btn-p-2">
    <Slot />
  </InputField>;
});

const MCPreviewTabSection = component$(({ readOnly }: { readOnly?: boolean }) => {
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

const MCPreviewChatSection = component$(({ readOnly, playerName = 'RGBirdflop' }: {
  readOnly?: boolean;
  playerName?: string;
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

const MCPreviewGUISection = component$(({ readOnly }: { readOnly?: boolean }) => {
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

const MCPreviewInput = component$(({ readOnly, chatInput, playerName = 'RGBirdflop' }: {
  readOnly?: boolean;
  chatInput?: string;
  playerName?: string;
}) => {
  const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const previewStyle = useContext(previewStyleContext);

  return <div class="relative rounded-lum break-all font-mc"
    style={{ textShadow: '2px 2px 0 #373737' }}>
    <Background class="overflow-hidden rounded-lum" id="bg" alt="background" />

    <p class="text-white! absolute bottom-1 left-1 w-[calc(100%-0.5rem)] bg-black/50 h-8 px-1 py-0.5 text-2xl whitespace-nowrap overflow-auto">
      {chatInput}
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

export default component$(({ readOnly }: { readOnly?: boolean }) => {
  const t = inlineTranslate();
  const rgbSegments = useContext(rgbSegmentsContext);
  const rgbStore = useContext(rgbStoreContext);
  const previewStyle = useContext(previewStyleContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const input = document.getElementById(ADVANCED_INPUT_ID) as HTMLTextAreaElement | null;
    if (!input) return;
    input.focus();
    const len = combinedText(rgbSegments.value).length;
    input.setSelectionRange(len, len);
  });

  const preview = renderAdvancedPreview(rgbSegments.value, rgbStore);

  return (
    <label for={ADVANCED_INPUT_ID} class="flex flex-col items-start relative">
      {previewStyle.value != 'default' &&
        <MCPreviewInput readOnly={readOnly} chatInput={generateAdvancedOutput(rgbSegments.value, rgbStore)}>
          {preview}
        </MCPreviewInput>
      }
      {previewStyle.value == 'default' &&
        <DefaultInput readOnly={readOnly}>
          {preview}
        </DefaultInput>
      }
      <div class="flex gap-1 absolute top-1 right-1">
        <SelectMenuRaw align="right" id="adv-previewstyle" value={previewStyle.value} onChange$={
          (e, el) => { previewStyle.value = el.value; }
        } values={[
          { name: t('rgb.inputText.preview.default@@Default'), value: 'default' },
          { name: t('rgb.inputText.preview.chat@@Minecraft Chat'), value: 'chat' },
          { name: t('rgb.inputText.preview.tab.header@@Minecraft Tab Header'), value: 'tab-header' },
          { name: t('rgb.inputText.preview.tab.footer@@Minecraft Tab Footer'), value: 'tab-footer' },
          { name: t('rgb.inputText.preview.tab.player@@Minecraft Tab Player'), value: 'tab-player' },
          { name: t('rgb.inputText.preview.gui.chest@@Minecraft GUI Chest'), value: 'gui-chest' },
          { name: t('rgb.inputText.preview.gui.item@@Minecraft GUI Item Name'), value: 'gui-item-name' },
          { name: t('rgb.inputText.preview.gui.lore@@Minecraft GUI Item Lore'), value: 'gui-item-lore' },
        ]} customDropdown class={{ 'p-1 gap-1 lum-grad-bg-lum-card-bg/75 rounded-lum-1': true }}>
          <Eye size={20} class="text-lum-text-secondary" q:slot="dropdown" />
        </SelectMenuRaw>
      </div>
    </label>
  );
});
