import { component$, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { Terminal } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import darkBackgrounds, { lightBackgrounds } from '~/components/Backgrounds';
import { generateOutput } from '~/util/RGBUtils';
import { rgbStoreContext } from '~/routes/resources/rgb';

export default component$(() => {
  const Backgrounds = [...darkBackgrounds, ...lightBackgrounds];
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  useSpeak({ assets: ['color'] });
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
    <label for="input" class="flex flex-col items-start flex-1 mt-2 mb-3 ">
      <div class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mb-2">
        <Terminal size={26} />
        {t('color.inputText@@Input Text')}
        <span class="text-gray-400 text-sm font-normal">
          {t('color.inputTextSubtitle@@Type here to generate a gradient!')}
        </span>
      </div>
      {rgbStore.previewStyle == 'chat' &&
        <div class={{
          'relative lum-bg-gray-800/50 rounded-lg': true,
          'break-all font-mc': true,
        }}>
          <Background class="overflow-hidden rounded-md" id="bg" alt="background" />
          <div class="absolute bottom-25 w-[75%] bg-black/50 min-h-8 px-2 py-0.5 text-2xl max-h-64 break-words overflow-auto"
            style={{ textShadow: '2px 2px 0 #373737' }}>
            <p>{'<RGBirdflop> Type here!'}</p>
            <p class={{
              'font-mc-bold': rgbStore.bold,
              'font-mc-italic': rgbStore.italic,
              'font-mc-bold-italic': rgbStore.bold && rgbStore.italic,
            }}>
              <Slot />
            </p>
            <textarea class="absolute bottom-0 lum-input pl-0 pr-1.5 py-0 rounded-none lum-pad-md resize-none w-[calc(100%-0.5rem)] h-[calc(100%-2rem)] whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:outline-1 hover:outline-gray-400/50" id="input"
              value={rgbStore.text} spellcheck={false} onInput$={(e, el) => { rgbStore.text = el.value; }}/>
          </div>
          <p class="absolute bottom-1 left-1 w-[calc(100%-0.5rem)] bg-black/50 h-8 px-1 py-0.5 text-2xl whitespace-nowrap overflow-auto"
            style={{ textShadow: '2px 2px 0 #373737' }}>
            {generateOutput(rgbStore.text, rgbStore.colors, rgbStore.format, rgbStore.prefixsuffix, rgbStore.trimspaces, rgbStore.colorlength, rgbStore.bold, rgbStore.italic, rgbStore.underline, rgbStore.strikethrough)}
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
          <p class="lum-bg-gray-800/50 rounded-lg lum-pad-md w-full h-full pointer-events-none whitespace-pre-wrap!">
            <Slot />
          </p>
          <textarea class="absolute top-0 lum-input lum-pad-md resize-none w-full h-full whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:backdrop-brightness-150" id="input"
            value={rgbStore.text} spellcheck={false} onInput$={(e, el) => { rgbStore.text = el.value; }}/>
        </div>
      }
    </label>
  );
});