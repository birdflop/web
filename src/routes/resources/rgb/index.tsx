import { component$, useContext, useContextProvider, useSignal, useStore } from '@builder.io/qwik';
import { defaultDescription, generateHead } from '~/root';
import RGBirdflop, { renderPreview, rgbStoreContext, showAllGradientsContext } from '~/components/Rgbirdflop/RGBirdflop';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { generateOutput, GRADIENT_TYPES, rgbDefaults } from '@birdflop/rgbirdflop';
import { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { Blend, Palette } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams) as {
    cookies: Partial<typeof rgbDefaults>
    errors: string[]
  };
});

export default component$(() => {
  const t = inlineTranslate();
  const useCookiesValue = useRGBCookies().value;
  const { cookies: rgbCookies, errors } = useCookiesValue;

  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  const openItemsStore = useContext(openItemsContext);

  return (
    <RGBirdflop errors={errors} output={generateOutput(rgbStore)}>
      <h1 class='flex gap-3 text-2xl! items-center my-2!' q:slot='header'>
        <Palette size={32} />
        {t('nav.resources.hexGradient.title@@RGBirdflop')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4" q:slot='header'>
        {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
      </p>
      {showAllGradients.value
        ? GRADIENT_TYPES.map((gradientType) => {
          const tempStore = {
            ...rgbStore,
            gradientType: gradientType,
          };
          const isActive = gradientType === rgbStore.gradientType;
          return (
            <span key={gradientType} class='flex items-center gap-2' q:slot="input">
              <span
                class={{
                  'lum-bg-lum-input-bg lum-btn-p-1 rounded-lum text-[10px] min-w-15 text-center': true,
                  'text-lum-text': isActive,
                  'text-gray-400': !isActive,
                }}
              >
                {gradientType}
              </span>
              <span class='flex-1'>
                {renderPreview(
                  tempStore,
                  previewStyle.value == 'default' ? 4 : 2,
                )}
              </span>
            </span>
          );
        })
        : renderPreview(
          rgbStore,
          previewStyle.value == 'default' ? 4 : 2,
        )}

      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('textshadow')
          ? openItemsStore.items.filter(item => item !== 'textshadow')
          : ['textshadow'];
      }} class={{
        'lum-bg-blue!': openItemsStore.items.includes('textshadow'),
      }} q:slot='mobile-navbar'>
        <Blend />
        {t('rgb.colors.shadow.title@@Text Shadow')}
      </button>
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description:
    'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
});
