import {
  component$,
  useContextProvider,
  useSignal,
  useStore,
} from '@qwik.dev/core';
import { defaultDescription, generateHead } from '~/root';
import { Link, routeLoader$ } from '@qwik.dev/router';
import { getCookies } from '~/util/dataUtils';
import { generateOutput, rgbDefaults } from '@birdflop/rgbirdflop';
import {
  previewStyleContext,
  Selection,
  selectionContext,
} from '~/components/rgbirdflop/Input';
import Palette from 'lucide-icons-qwik/icons/Palette';
import TestTube2 from 'lucide-icons-qwik/icons/TestTube2';
import { inlineTranslate } from 'qwik-speak';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';
import RGBirdflop, {
  rgbStoreContext,
  showAllGradientsContext,
} from '~/components/rgbirdflop/RGBirdflop';
import AllGradientsPreview from '~/components/rgbirdflop/AllGradientsPreview';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  const cookies = getCookies<Partial<typeof rgbDefaults>>(
    cookie,
    'rgb',
    url.searchParams
  );
  return cookies;
});

export default component$(() => {
  const t = inlineTranslate();
  const useCookiesValue = useRGBCookies().value;
  const { cookies: rgbCookies, errors } = useCookiesValue;

  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true }
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  return (
    <RGBirdflop errors={errors} output={generateOutput(rgbStore)}>
      <div class="flex items-start gap-2" q:slot="header">
        <div class="flex flex-1 flex-col gap-1">
          <h1
            class="my-2 flex items-center gap-3 text-2xl font-extrabold"
            q:slot="header"
          >
            <Palette size={32} />
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </h1>
          <p class="text-lum-text-secondary mb-2" q:slot="header">
            {t(
              'nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.'
            )}
          </p>
        </div>
        <Link
          href="/resources/rgb/beta"
          class="lum-btn lum-grad-bg-blue/30 hover:lum-bg-blue/40 rounded-lum w-fit gap-2 p-2 text-sm whitespace-normal"
        >
          <TestTube2 size={18} class="min-h-4 min-w-4" />
          {t(
            'rgb.advanced.tryAdvanced@@Try the Advanced editor with segment-based gradients'
          )}
        </Link>
      </div>

      {showAllGradients.value ? (
        <AllGradientsPreview
          q:slot="input"
          showSelection
          shadowLength={previewStyle.value == 'default' ? 4 : 2}
        />
      ) : (
        <RgbPreview
          q:slot="input"
          showSelection
          shadowLength={previewStyle.value == 'default' ? 4 : 2}
        />
      )}
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description:
    'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
});
