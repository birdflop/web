import {
  component$,
  createContextId,
  Signal,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
} from '@builder.io/qwik';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { GRADIENT_TYPES, rgbDefaults } from '@birdflop/rgbirdflop';
import {
  previewStyleContext,
  Selection,
  selectionContext,
} from '~/components/Rgbirdflop/Input';
import {
  rgbStoreContext,
  showAllGradientsContext,
} from '~/components/Rgbirdflop/RGBirdflop';
import { SegmentType, normalizeSegments } from '~/components/RgbAdvanced/model';
import { generateAdvancedOutput } from '~/components/RgbAdvanced/output';
import { defaultDescription, generateHead } from '~/root';
import { ArrowLeft, TestTube2, Type } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import RGBirdflop from '~/components/Rgbirdflop/RGBirdflop';
import Options from '~/components/Rgbirdflop/Options';
import SegmentInspector from '~/components/RgbAdvanced/SegmentInspector';
import { renderAdvancedPreview } from '~/components/RgbAdvanced/preview';
import SegmentColorEditor from '~/components/RgbAdvanced/SegmentColorEditor';
import { openItemsContext } from '~/routes/layout-profile';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams);
});

export const useSegmentsCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgbsegments', url.searchParams);
});

export const rgbSegmentsContext = createContextId<Signal<SegmentType[]>>(
  'rgbsegments-context',
);

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
        ? GRADIENT_TYPES.map((gradientType) => {
          const tempStore = {
            ...rgbStore,
            gradientType: gradientType,
          };
          const isActive = gradientType === rgbStore.gradientType;
          return (
            <span
              key={gradientType}
              class="flex items-center gap-2"
              q:slot="input"
            >
              <span
                class={{
                  'lum-grad-bg-lum-input-bg lum-btn-p-1 rounded-lum min-w-15 text-center text-[10px]': true,
                  'text-lum-text': isActive,
                  'text-gray-400': !isActive,
                }}
              >
                {gradientType}
              </span>
              <span class="flex-1">
                {renderAdvancedPreview(rgbSegments.value, tempStore)}
              </span>
            </span>
          );
        })
        : renderAdvancedPreview(rgbSegments.value, rgbStore)}

      <Options q:slot="options" hidden={!openItems.value.includes('options')} />

      <div class="mb-4 flex flex-col gap-2" q:slot="column1">
        <div class="hidden items-center gap-2 p-2 font-semibold sm:flex">
          <Type />
          {t('rgb.segmentColorEditor.title@@Segment Color Editor')}
        </div>
        <SegmentColorEditor />
      </div>
      <div class="mb-4 flex flex-col gap-2" q:slot="column3">
        <div class="hidden items-center gap-2 p-2 font-semibold sm:flex">
          <Type />
          {t('rgb.segments.title@@Segments')}
        </div>
        <SegmentInspector />
      </div>
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Advanced - Per-Character Minecraft Gradient Editor',
  description:
    'Advanced Minecraft RGB gradient editor: apply multiple gradients, solid colors, and per-character formatting to one piece of text. ' +
    defaultDescription,
});
