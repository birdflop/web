import {
  component$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
} from '@builder.io/qwik';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import {
  previewStyleContext,
  Selection,
  selectionContext,
} from '~/components/rgbirdflop/Input';
import {
  rgbStoreContext,
  showAllGradientsContext,
} from '~/components/rgbirdflop/RGBirdflop';
import {
  SegmentType,
  normalizeSegments,
  rgbSegmentsContext,
} from '~/components/rgbirdflop/advanced/rgbSegments';
import { generateAdvancedOutput } from '~/components/rgbirdflop/advanced/output';
import { defaultDescription, generateHead } from '~/root';
import { ArrowLeft, TestTube2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import RGBirdflop from '~/components/rgbirdflop/RGBirdflop';
import Options from '~/components/rgbirdflop/Options';
import SegmentInspector from '~/components/rgbirdflop/advanced/SegmentInspector';
import { renderAdvancedPreview } from '~/components/rgbirdflop/advanced/preview';
import { renderAllGradientsPreview } from '~/components/rgbirdflop/AllGradientsPreview';
import SegmentColorEditor from '~/components/rgbirdflop/advanced/SegmentColorEditor';
import { openItemsContext } from '~/routes/layout-profile';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams);
});

export const useSegmentsCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgbsegments', url.searchParams);
});
export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true },
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const { cookies: segmentsCookies, errors: segmentsErrors } =
    useSegmentsCookies().value;
  const initialSegments = segmentsCookies.segments;
  const rgbSegments = useSignal<SegmentType[]>(
    normalizeSegments(
      initialSegments && initialSegments.length ? initialSegments : [],
    ),
  );
  useContextProvider(rgbSegmentsContext, rgbSegments);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);
  const openItems = useContext(openItemsContext);

  return (
    <RGBirdflop
      advanced
      output={generateAdvancedOutput(rgbSegments.value, rgbStore)}
      errors={[...rgbErrors, ...segmentsErrors]}
    >
      <div class="flex items-start gap-2" q:slot="header">
        <div class="flex flex-1 flex-col gap-1">
          <h1
            class="my-2 flex items-center gap-3 text-2xl font-extrabold"
            q:slot="header"
          >
            <TestTube2 size={32} />
            {t('nav.resources.hexGradient.advanced.title@@RGBirdflop Advanced')}
            <span class="lum-grad-bg-blue/50 rounded-lum-1 self-center px-2 py-1 text-xs">
              {t('nav.experimental@@experimental')}
            </span>
          </h1>
          <p class="text-lum-text-secondary mb-2" q:slot="header">
            {t(
              'nav.resources.hexGradient.advanced.description@@Type your text, highlight any part of it, then give that part its own color and formatting. Mix as many gradients, solid colors, and styles as you like.',
            )}
          </p>
        </div>
        <Link
          href="/resources/rgb"
          class="lum-btn lum-grad-bg-blue/30 hover:lum-bg-blue/40 rounded-lum w-fit gap-2 p-2 text-sm whitespace-normal"
        >
          <ArrowLeft size={18} />
          {t('rgb.advanced.backToClassic@@Classic editor')}
        </Link>
      </div>

      {showAllGradients.value
        ? renderAllGradientsPreview(
          (gradientType) =>
            renderAdvancedPreview(rgbSegments.value, {
              ...rgbStore,
              gradientType,
            }),
          rgbStore.gradientType,
        )
        : renderAdvancedPreview(rgbSegments.value, rgbStore)}

      <SegmentInspector q:slot="input-extra" />

      <Options q:slot="options" hidden={!openItems.value.includes('options')} />

      <SegmentColorEditor q:slot="column1" />
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Advanced - Per-Character Minecraft Gradient Editor',
  description:
    'Advanced Minecraft RGB gradient editor: apply multiple gradients, solid colors, and per-character formatting to one piece of text. ' +
    defaultDescription,
});
