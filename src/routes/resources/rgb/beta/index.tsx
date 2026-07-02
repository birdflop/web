import { component$, createContextId, Signal, useContextProvider, useSignal, useStore } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { defaultDescription, generateHead } from '~/root';
import { getCookies } from '~/util/dataUtils';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { Selection, selectionContext } from '~/components/Rgbirdflop/Input';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import {
  seedFromClassic,
  SegmentsStore,
  normalizeSegments,
} from '~/components/RgbAdvanced/model';
import AdvancedEditor from '~/components/RgbAdvanced/AdvancedEditor';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams);
});

export const useAdvancedCookies = routeLoader$(({ cookie, url }) => {
  const { cookies, errors } = getCookies(cookie, 'rgbsegments', url.searchParams);
  if (cookies && Array.isArray(cookies.segments) && cookies.segments.length > 0) {
    return { store: cookies, errors, seeded: false };
  }
  // No advanced state yet — seed from the classic 'rgb' editor's current state.
  const classic = getCookies(cookie, 'rgb', url.searchParams);
  return {
    store: { segments: seedFromClassic(classic.cookies) },
    errors: [...errors, ...classic.errors],
    seeded: true,
  };
});

export const segmentsStoreContext = createContextId<SegmentsStore>('segmentsstore-context');
export const advPreviewStyleContext = createContextId<Signal<string>>('advanced-rgb-previewstyle');

export default component$(() => {
  const rgbCookiesVal = useRGBCookies().value;
  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookiesVal.cookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const advCookiesVal = useAdvancedCookies().value;
  const initialSegments = advCookiesVal.store.segments;
  const segmentsStore = useStore<SegmentsStore>({
    segments: normalizeSegments(initialSegments && initialSegments.length ? initialSegments : []),
  }, { deep: true });
  useContextProvider(segmentsStoreContext, segmentsStore);

  const selection = useSignal<Selection>({ start: 0, end: 0 });
  useContextProvider(selectionContext, selection);

  const previewStyle = useSignal('default');
  useContextProvider(advPreviewStyleContext, previewStyle);

  return <AdvancedEditor />;
});

export const head = generateHead({
  title: 'RGBirdflop Advanced - Per-Character Minecraft Gradient Editor',
  description:
    'Advanced Minecraft RGB gradient editor: apply multiple gradients, solid colors, and per-character formatting to one piece of text. ' +
    defaultDescription,
});
