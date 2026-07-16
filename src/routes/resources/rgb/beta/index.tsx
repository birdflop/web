import {
  component$,
  useContextProvider,
  useSignal,
  useStore,
} from '@qwik.dev/core';
import { Link, routeLoader$ } from '@qwik.dev/router';
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
import ArrowLeft from 'lucide-icons-qwik/icons/ArrowLeft';
import TestTube2 from 'lucide-icons-qwik/icons/TestTube2';
import { inlineTranslate } from 'qwik-speak';
import RGBirdflop from '~/components/rgbirdflop/RGBirdflop';
import SegmentInspector from '~/components/rgbirdflop/advanced/SegmentInspector';
import SegmentColorEditor from '~/components/rgbirdflop/advanced/SegmentColorEditor';
import RgbAdvancedPreview from '~/components/rgbirdflop/advanced/RgbAdvancedPreview';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies<Partial<typeof rgbDefaults>>(
    cookie,
    'rgb',
    url.searchParams
  );
});

export const useSegmentsCookies = routeLoader$(({ cookie, url }) => {
  return getCookies<{ segments: SegmentType[] }>(
    cookie,
    'rgbsegments',
    url.searchParams
  );
});
export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true }
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const { cookies: segmentsCookies, errors: segmentsErrors } =
    useSegmentsCookies().value;
  const initialSegments = segmentsCookies.segments;
  const rgbSegments = useSignal<SegmentType[]>(
    normalizeSegments(
      initialSegments && initialSegments.length ? initialSegments : []
    )
  );
  useContextProvider(rgbSegmentsContext, rgbSegments);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

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
              'nav.resources.hexGradient.advanced.description@@Type your text, highlight any part of it, then give that part its own color and formatting. Mix as many gradients, solid colors, and styles as you like.'
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

      <RgbAdvancedPreview q:slot="input" showSelection />

      <SegmentInspector q:slot="input-extra" />

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
