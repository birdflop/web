import { component$, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { Terminal } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import darkBackgrounds, { lightBackgrounds } from '~/components/Backgrounds';
import { generateOutput } from '~/util/rgb/RGBUtils';
import { rgbStoreContext } from '~/routes/resources/rgb';

const InputField = component$(({ class: className }: {
  class?: string;
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
      }}>
        <Slot />
      </p>
      <div class="absolute bottom-0 h-full flex flex-col">
        <textarea class={{
          'lum-input pl-0 pr-1.5 py-0 rounded-none lum-pad-md resize-none w-full h-full whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:outline-1 hover:outline-gray-400/50': true,
          [`${className}`]: className,
        }} value={rgbStore.text} spellcheck={false}
        onInput$={(e, el) => { rgbStore.text = el.value; }}/>
      </div>
    </div>
  );
});

const InputField = component$(({ class: className }: {
  class?: string;
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
      }}>
        <Slot />
      </p>
      <div class="absolute bottom-0 h-full flex flex-col">
        <textarea class={{
          'lum-input pl-0 pr-1.5 py-0 rounded-none lum-pad-md resize-none w-full h-full whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:outline-1 hover:outline-gray-400/50': true,
          [`${className}`]: className,
        }} value={rgbStore.text} spellcheck={false}
        onInput$={(e, el) => { rgbStore.text = el.value; }}/>
      </div>
    </div>
  );
});

export default component$(({ readOnly }: {
  readOnly?: boolean
}) => {
  const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const input = document.getElementById('input') as HTMLTextAreaElement;
    if (!input) return;
    input.focus();
    input.setSelectionRange(rgbStore.text.length, rgbStore.text.length);
  });

  return (
    <label for="input" class="flex flex-col items-start flex-1 mt-2 mb-3">
      {!readOnly &&
        <p class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mb-2">
          <Terminal size={26} />
          {t('rgb.inputText.title@@Input Text')}
          <span class="text-gray-400 text-sm font-normal">
            {t('rgb.inputText.description@@Type here to generate a gradient!')}
          </span>
        </p>
      }
      {rgbStore.previewStyle == 'chat' &&
        <div class={{
          'relative lum-bg-gray-800/50 rounded-lg': true,
          'break-all font-mc': true,
        }}>
          <Background class="overflow-hidden rounded-lg" id="bg" alt="background" />
          <div class="absolute flex flex-col justify-center items-center text-center top-5 w-full min-h-8 px-2 text-2xl max-h-64 break-words overflow-auto"
            style={{ textShadow: '2px 2px 0 #373737' }}>
            <div class="bg-black/50 min-h-8 py-0.5 pl-0.5 text-2xl max-h-64 break-words overflow-auto"
              style={{ textShadow: '2px 2px 0 #373737' }}>
              <InputField readOnly={readOnly} class="text-center">
                <Slot />
              </InputField>
              <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left h-6 flex gap-0.5 pr-0.5 mx-auto"
                style={{ textShadow: '2px 2px 0 #373737' }}>
                <img class="h-6" src="/branding/pwa-icon-8x8.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
                <p class="-my-0.5 flex-1">RGBirdflop</p>
                <img class="h-6" src="/minecraft/ping_5.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
              </div>
              <div class="bg-[#aaaaaa]/20 text-2xl overflow-hidden text-left h-6 flex gap-0.5 pr-0.5 mx-auto"
                style={{ textShadow: '2px 2px 0 #373737' }}>
                <img class="h-6" src="/branding/pwa-icon-8x8.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
                <InputField class="flex-1">
                  <Slot />
                </InputField>
                <img class="h-6" src="/minecraft/ping_5.png" alt="RGBirdflop" style="image-rendering: pixelated;" />
              </div>
              <InputField readOnly={readOnly} class="text-center">
                <Slot />
              </InputField>
            </div>
          </div>
          <div class="absolute bottom-25 w-[75%] bg-black/50 min-h-8 px-2 text-2xl max-h-64 break-words overflow-auto"
            style={{ textShadow: '2px 2px 0 #373737' }}>
            <p>{t('rgb.inputText.preview.typeHere@@<RGBirdflop> Type here!')}</p>
            <InputField>
              <Slot />
            </p>
            <InputField readOnly={readOnly}
              value={rgbStore.text} spellcheck={false} onInput$={(e, el) => { rgbStore.text = el.value; }}/>
            </InputField>
          </div>
          <p class="absolute bottom-1 left-1 w-[calc(100%-0.5rem)] bg-black/50 h-8 px-1 py-0.5 text-2xl whitespace-nowrap overflow-auto"
            style={{ textShadow: '2px 2px 0 #373737' }}>
            {generateOutput(rgbStore)}
          </p>
        </div>
      }
      {rgbStore.previewStyle == 'default' &&
        <div class={{
          'relative w-full': true,
          'text-3xl md:text-4xl xl:text-5xl break-all font-mc': true,
          'font-mc-bold': rgbStore.bold,
          'font-mc-italic': rgbStore.italic,
          'font-mc-bold-italic': rgbStore.bold && rgbStore.italic,
        }}>
          <p class="lum-bg-gray-800/50 rounded-lg lum-btn-p-2 w-full h-full pointer-events-none whitespace-pre-wrap!">
            <Slot />
          </p>
          <textarea readOnly={readOnly} class="absolute top-0 lum-input lum-btn-p-2 resize-none w-full h-full whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:backdrop-brightness-150" id="input"
            value={rgbStore.text} spellcheck={false} onInput$={(e, el) => { rgbStore.text = el.value; }}/>
        </div>
      }
    </label>
  );
});