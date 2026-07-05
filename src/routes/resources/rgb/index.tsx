import { component$, useContextProvider, useSignal, useStore } from '@builder.io/qwik';
import { defaultDescription, generateHead } from '~/root';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { generateOutput, GRADIENT_TYPES, rgbDefaults } from '@birdflop/rgbirdflop';
import { previewStyleContext, Selection, selectionContext } from '~/components/Rgbirdflop/Input';
import { Palette, TestTube2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { renderPreview } from '~/components/Rgbirdflop/preview';
import RGBirdflop, { rgbStoreContext, showAllGradientsContext } from '~/components/Rgbirdflop/RGBirdflop';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  const cookies: {
    cookies: Partial<typeof rgbDefaults>
    errors: string[]
  } = getCookies(cookie, 'rgb', url.searchParams);
  return cookies;
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

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  return (
    <RGBirdflop
      errors={errors}
      output={generateOutput(rgbStore)}
    >
      <div class="flex items-start gap-2" q:slot="header">
        <div class="flex flex-col gap-1 flex-1">
          <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2" q:slot="header">
            <Palette size={32} />
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </h1>
          <p class="mb-2 text-lum-text-secondary" q:slot="header">
            {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
          </p>
        </div>
        <Link href="/resources/rgb/beta" class="lum-btn lum-grad-bg-blue/30 hover:lum-bg-blue/40 rounded-lum p-2 gap-2 text-sm w-fit whitespace-normal">
          <TestTube2 size={18} class="min-w-4 min-h-4" />
          {t('rgb.beta.tryAdvanced@@Try the Advanced editor with segment-based gradients')}
        </Link>
      </div>
      {showAllGradients.value
        ? GRADIENT_TYPES.map((gradientType) => {
          const tempStore = {
            ...rgbStore,
            gradientType: gradientType,
          };
          const isActive = gradientType === rgbStore.gradientType;
          return (
            <span key={gradientType} class="flex items-center gap-2" q:slot="input">
              <span
                class={{
                  'lum-grad-bg-lum-input-bg lum-btn-p-1 rounded-lum text-[10px] min-w-15 text-center': true,
                  'text-lum-text': isActive,
                  'text-gray-400': !isActive,
                }}
              >
                {gradientType}
              </span>
              <span class="flex-1">
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
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description:
    'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
});
