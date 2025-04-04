import { component$ } from '@builder.io/qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import type { rgbDefaults } from '~/routes/resources/rgb';

export default component$(({ store, hidden }: {
  store: typeof rgbDefaults;
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[500px] opacity-100 pointer-events-auto': !hidden,
    }} id="formatoptions">
      {(store.format.char != undefined && !store.format.bold && !store.format.italic && !store.format.underline && !store.format.strikethrough) && <>
        <label for="format-char">
          {t('color.format.character@@Format Character')}
        </label>
        <input class="lum-input" id="format-char" value={store.format.char} placeholder="&" onInput$={(e, el) => { store.format.char = el.value; }}/>
      </>}
      {!store.format.char &&
        <>
          <label for="format-bold">
            {t('color.format.bold@@Bold')}
          </label>
          <input class="lum-input" id="format-bold" value={store.format.bold} placeholder="<bold>$t</bold>" onInput$={(e, el) => { store.format.bold = el.value; }}/>
          <label for="format-italic">
            {t('color.format.italic@@Italic')}
          </label>
          <input class="lum-input" id="format-italic" value={store.format.italic} placeholder="<italic>$t</italic>" onInput$={(e, el) => { store.format.italic = el.value; }}/>
          <label for="format-underline">
            {t('color.format.underline@@Underline')}
          </label>
          <input class="lum-input" id="format-underline" value={store.format.underline} placeholder="<underline>$t</underline>" onInput$={(e, el) => { store.format.underline = el.value; }}/>
          <label for="format-strikethrough">
            {t('color.format.strikethrough@@Strikethrough')}
          </label>
          <input class="lum-input" id="format-strikethrough" value={store.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(e, el) => { store.format.strikethrough = el.value; }}/>
          <div class="py-3 font-mono">
            <p>{t('color.placeholders@@Placeholders:')}</p>
            <p>$t = Output Text</p>
          </div>
        </>
      }
    </div>
  );
});