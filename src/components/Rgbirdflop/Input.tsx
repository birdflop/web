import { component$, createContextId, Signal, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { Eye, Grid2X2, Terminal } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, { lightBackgrounds } from '~/components/Elements/Background';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { showAllGradientsContext } from '~/routes/layout';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import Formatting from './Formatting';
import { generateOutput } from '@birdflop/rgbirdflop';
export const previewStyleContext = createContextId<Signal<string>>('previewstyle-context');

const ImgPwaIcon8x8 = '/branding/pwa-icon-8x8.png';
const ImgMcPing5 = '/minecraft/ping_5.png';

// The main input field component where you type your text
const InputField = component$(({ class: className, inputClass, readOnly }: {
  class?: string;
  inputClass?: string;
  readOnly?: boolean;
}) => {
  const rgbStore = useContext(rgbStoreContext);
  return (
    <div class={{
      'relative focus-within:border-lum-accent break-all caret-white': true,
      [`${className}`]: className,
      'font-mc-bold': rgbStore.bold,
      'font-mc-italic': rgbStore.italic,
      'font-mc-bold-italic': rgbStore.bold && rgbStore.italic,
      [`${rgbStore.format.class}`]: rgbStore.format.class,
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
        value={rgbStore.text} spellcheck={false} id="input"
        onInput$={(e, el) => { rgbStore.text = el.value; }}/>
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
    { previewStyle.value == 'tab-header' &&
      <InputField readOnly={readOnly} inputClass="text-center">
        <Slot />
      </InputField>
    }
    <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left h-6 flex gap-0.5 pr-0.5 mx-auto">
      <img width={24} height={24} class="rounded-none!" src={ImgPwaIcon8x8} alt="RGBirdflop" style="image-rendering: pixelated;" />
      <p class="text-white! -my-0.5 flex-1">RGBirdflop</p>
      <img width={24} height={24} class="rounded-none!" src={ImgMcPing5} alt="RGBirdflop" style="image-rendering: pixelated;" />
    </div>
    { previewStyle.value == 'tab-player' &&
      <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left flex gap-0.5 pr-0.5 mx-auto">
        <img width={24} height={24} class="rounded-none!" src={ImgPwaIcon8x8} alt="RGBirdflop" style="image-rendering: pixelated;" />
        <InputField readOnly={readOnly} class="flex-1 -my-1">
          <Slot />
        </InputField>
        <img width={24} height={24} class="rounded-none!" src={ImgMcPing5} alt="RGBirdflop" style="image-rendering: pixelated;" />
      </div>
    }
    { previewStyle.value == 'tab-footer' &&
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
const MCPreviewGUISection = component$(({ readOnly }: {
  readOnly: boolean | undefined,
}) => {
  return <div class="absolute inset-0 bg-black/70 backdrop-blur-xs flex justify-center items-center p-4">

    <div class="w-2/5 relative">
      <img src="/minecraft/chest.png" alt="Minecraft Chest GUI" class="w-full rounded-none!" style="image-rendering: pixelated;"/>
      <div class="absolute inset-0">
        <InputField readOnly={readOnly} inputClass="*:text-shadow-none!" class="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] text-xs sm:text-sm md:text-base lg:text-2xl">
          <Slot />
        </InputField>
        <p class="absolute top-[calc(72/168*100%)] left-[calc(8/176*100%)] text-xs sm:text-sm md:text-base lg:text-2xl text-[#404040]! text-shadow-none">
          Inventory
        </p>
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

  return <div class={{
    'relative lum-bg-lum-input-bg/50 rounded-lum': true,
    'break-all font-mc': true,
  }}
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
  const showAllGradients = useContext(showAllGradientsContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const input = document.getElementById('input') as HTMLTextAreaElement;
    if (!input) return;
    input.focus();
    input.setSelectionRange(rgbStore.text.length, rgbStore.text.length);
  });

  return <>
    {!readOnly && !noLabel &&
      <h5 class="mt-0! mb-2! flex md:text-lg xl:text-xl font-semibold gap-3 items-center">
        <Terminal size={26} />
        {t('rgb.inputText.title@@Input Text')}
        <p class="text-lum-text-secondary text-sm font-normal">
          {t('rgb.inputText.description@@Type here to generate a gradient!')}
        </p>
      </h5>
    }
    {!noFormatRow &&
      <Formatting/>
    }
    <label for="input" class="flex flex-col items-start flex-1 mt-2 mb-4 relative">
      {previewStyle.value != 'default' && <MCPreviewInput readOnly={readOnly}
        chatInput={chatInput}
        playerName={playerName}>
        <Slot />
      </MCPreviewInput>}
      {previewStyle.value == 'default' && <DefaultInput readOnly={readOnly}>
        <Slot />
      </DefaultInput>}
      <div class={{ 'flex gap-1': true,
        'absolute top-1 right-1': true,
      }}>
        {previewStyle.value != 'default' && (
          <button
            class={{
              'p-1 rounded-lum-1 lum-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg transition-colors': true,
              'text-lum-primary': showAllGradients.value,
              'text-lum-text-secondary': !showAllGradients.value,
            }}
            onClick$={() => showAllGradients.value = !showAllGradients.value}
            title={showAllGradients.value ? 'Show only selected gradient' : 'Show all gradients'}
          >
            <Grid2X2 size={20} />
          </button>
        )}
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
        ]} customDropdown class={{ 'p-1 gap-1 lum-bg-lum-card-bg/75 rounded-lum-1': true }}>
          <Eye size={20} class="text-lum-text-secondary" q:slot="dropdown" />
        </SelectMenuRaw>
      </div>
    </label>
  </>;
});