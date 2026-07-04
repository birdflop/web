import { component$, createContextId, Signal, useContextProvider, useSignal, useStore } from '@builder.io/qwik';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { previewStyleContext, Selection, selectionContext } from '~/components/Rgbirdflop/Input';
import RGBirdflop, { rgbStoreContext, showAllGradientsContext } from '~/components/Rgbirdflop/RGBirdflop';
import {
  SegmentType,
  normalizeSegments,
} from '~/components/RgbAdvanced/model';
import { generateAdvancedOutput } from '~/components/RgbAdvanced/output';
import { defaultDescription, generateHead } from '~/root';
import { ArrowLeft, TestTube2, Type } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import SegmentInspector from '~/components/RgbAdvanced/SegmentInspector';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams);
});

export const useSegmentsCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgbsegments', url.searchParams);
});

export const rgbSegmentsContext = createContextId<Signal<SegmentType[]>>('rgbsegments-context');

export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const { cookies: segmentsCookies, errors: segmentsErrors } = useSegmentsCookies().value;
  const initialSegments = segmentsCookies.segments;
  const rgbSegments = useSignal<SegmentType[]>(
    normalizeSegments(initialSegments && initialSegments.length ? initialSegments : []),
  );
  useContextProvider(rgbSegmentsContext, rgbSegments);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  return <RGBirdflop output={generateAdvancedOutput(rgbSegments.value, rgbStore)} errors={[...rgbErrors, ...segmentsErrors]}>;
    <div class="flex items-start gap-2" q:slot="header">
      <div class="flex flex-col gap-1 flex-1">
        <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2" q:slot="header">
          <TestTube2 size={32} />
          {t('rgb.beta.title@@RGBirdflop Advanced')}
          <span class="lum-grad-bg-blue/50 text-xs py-1 px-2 rounded-lum-1 self-center">
            {t('nav.experimental@@experimental')}
          </span>
        </h1>
        <p class="mb-2 text-lum-text-secondary" q:slot="header">
          {t('rgb.beta.howItWorks@@Type your text, highlight any part of it, then give that part its own color and formatting. Mix as many gradients, solid colors, and styles as you like.')}
        </p>
      </div>
      <Link href="/resources/rgb" q:slot="column3" class="lum-btn lum-grad-bg-blue/30 hover:lum-bg-blue/40 rounded-lum p-2 gap-2 text-sm w-fit whitespace-normal">
        <ArrowLeft size={18} />
        {t('rgb.beta.backToClassic@@Classic editor')}
      </Link>
    </div>

    <div class="mb-4 flex flex-col gap-2" id="column3">
      <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
        <Type />
        {t('rgb.segments.title@@Segments')}
      </div>
      <SegmentInspector />
    </div>
  </RGBirdflop>;
});

export const head = generateHead({
  title: 'RGBirdflop Advanced - Per-Character Minecraft Gradient Editor',
  description:
    'Advanced Minecraft RGB gradient editor: apply multiple gradients, solid colors, and per-character formatting to one piece of text. ' +
    defaultDescription,
});
