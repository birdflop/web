import { component$, createContextId, Signal, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { Eye, Terminal } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, { lightBackgrounds } from '~/components/Backgrounds';
import { generateOutput } from '~/util/rgb/RGBUtils';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { SelectMenuRaw } from '@luminescent/ui-qwik';

const InputField = component$(({ class: className, readOnly }: {
  class?: string;
  readOnly?: boolean;
}) => {
  const rgbStore = useContext(rgbStoreContext);
  return (
    <div class={{
      'relative text-2xl break-words': true,
      [`${className}`]: className,
    }}
    style={{ textShadow: '2px 2px 0 #373737' }}>
      <p class={{
        'font-mc-bold': rgbStore.bold,
        'font-mc-italic': rgbStore.italic,
        'font-mc-bold-italic': rgbStore.bold && rgbStore.italic,
        [`${rgbStore.format.class}`]: rgbStore.format.class,
      }} contentEditable={readOnly ? 'false' : 'true'}>
        <Slot />
      </p>
    </div>
  );
});

export const previewStyleContext = createContextId<Signal<string>>('previewstyle-context');
export default component$(({ readOnly }: {
  readOnly?: boolean
}) => {
  const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const previewStyle = useContext(previewStyleContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const input = document.getElementById('input') as HTMLTextAreaElement;
    if (!input) return;
    input.focus();
    input.setSelectionRange(rgbStore.text.length, rgbStore.text.length);
  });

  return <label for="input" class="flex flex-col items-start flex-1 mt-2 mb-3 relative">
    {!readOnly &&
      <h5 class="!mt-0 !mb-2 flex md:text-lg xl:text-xl font-semibold gap-3 items-center">
        <Terminal size={26} />
        {t('rgb.inputText.title@@Input Text')}
        <p class="text-lum-text-secondary text-sm font-normal">
          {t('rgb.inputText.description@@Type here to generate a gradient!')}
        </p>
      </h5>
    }
    {previewStyle.value != 'default' &&
      <div class={{
        'relative lum-bg-lum-input-bg/50 rounded-lum': true,
        'break-all font-mc': true,
      }}>
        <Background class="overflow-hidden rounded-lum" id="bg" alt="background" />
        <div class={{
          'absolute flex flex-col w-full text-2xl max-h-64': true,
          'bottom-0 h-full break-words overflow-auto': previewStyle.value == 'chat',
          'top-5 justify-center items-center text-center min-h-8 px-2': previewStyle.value.includes('tab'),
        }}
        style={{ textShadow: '2px 2px 0 #373737' }}>
          {previewStyle.value.includes('tab') &&
            <div class="bg-black/50 min-h-8 py-0.5 pl-0.5 text-2xl max-h-64 break-words overflow-auto"
              style={{ textShadow: '2px 2px 0 #373737' }}>
              { previewStyle.value == 'tab-header' &&
                <InputField readOnly={readOnly} class="text-center">
                  <Slot />
                </InputField>
              }
              <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left h-6 flex gap-0.5 pr-0.5 mx-auto"
                style={{ textShadow: '2px 2px 0 #373737' }}>
                <img class="h-6 rounded-none!" src="/branding/pwa-icon-8x8.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
                <p class="text-white! -my-0.5 flex-1">RGBirdflop</p>
                <img class="h-6 rounded-none!" src="/minecraft/ping_5.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
              </div>
              { previewStyle.value == 'tab-player' &&
                <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left h-6 flex gap-0.5 pr-0.5 mx-auto"
                  style={{ textShadow: '2px 2px 0 #373737' }}>
                  <img class="h-6 rounded-none!" src="/branding/pwa-icon-8x8.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
                  <InputField readOnly={readOnly} class="flex-1 -mt-0.5">
                    <Slot />
                  </InputField>
                  <img class="h-6 rounded-none!" src="/minecraft/ping_5.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
                </div>
              }
              { previewStyle.value == 'tab-footer' &&
                <InputField readOnly={readOnly} class="text-center">
                  <Slot />
                </InputField>
              }
            </div>
          }
          {previewStyle.value == 'chat' &&
            <div class="absolute bottom-25 w-[75%] bg-black/50 min-h-8 px-2 text-2xl max-h-64 break-words overflow-auto"
              style={{ textShadow: '2px 2px 0 #373737' }}>
              <p class="text-white!">{t('rgb.inputText.preview.typeHere@@<RGBirdflop> Type here!')}</p>
              <InputField readOnly={readOnly}>
                <Slot />
              </InputField>
            </div>
          }
        </div>
        <p class="text-white! absolute bottom-1 left-1 w-[calc(100%-0.5rem)] bg-black/50 h-8 px-1 py-0.5 text-2xl whitespace-nowrap overflow-auto"
          style={{ textShadow: '2px 2px 0 #373737' }}>
          {generateOutput(rgbStore)}
        </p>
      </div>
    }
    {previewStyle.value == 'default' &&
      <div class={{
        'relative w-full': true,
        'text-3xl md:text-4xl xl:text-5xl break-all font-mc': true,
        'font-mc-bold': rgbStore.bold,
        'font-mc-italic': rgbStore.italic,
        'font-mc-bold-italic': rgbStore.bold && rgbStore.italic,
        [`${rgbStore.format.class}`]: rgbStore.format.class,
      }}>
        <p contentEditable={readOnly ? 'false' : 'true'} class="lum-bg-lum-input-bg/50 rounded-lum lum-btn-p-2 w-full h-full whitespace-pre-wrap!"
          onInput$={(e, el) => {
            rgbStore.text = el.textContent || '';
          }}>
          <Slot />
        </p>
      </div>
    }
    <div class={{
      'absolute top-1 right-1': true,
      'top-10': !readOnly,
    }}>
      <SelectMenuRaw id="previewstyle" value={previewStyle.value} onChange$={
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
      ]} customDropdown class={{ 'p-1 gap-1 lum-bg-lum-card-bg/75 rounded-lum-1': true }}>
        <Eye size={20} class="text-lum-text-secondary" q:slot="dropdown" />
      </SelectMenuRaw>
    </div>
  </label>;
});