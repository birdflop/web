import { component$, createContextId, Signal, useContextProvider, useSignal, useStore } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { defaultDescription, generateHead } from '~/root';
import { getCookies } from '~/util/dataUtils';
import {
  advancedDefaults,
  normalizeSegments,
  seedFromClassic,
  type AdvancedStore,
} from '~/components/RgbAdvanced/model';
import AdvancedEditor from '~/components/RgbAdvanced/AdvancedEditor';
import { Selection, selectionContext } from '~/components/Rgbirdflop/Input';

export const useAdvancedCookies = routeLoader$(({ cookie, url }) => {
  const { cookies, errors } = getCookies(cookie, 'rgbadvanced', url.searchParams);
  if (cookies && Array.isArray(cookies.segments) && cookies.segments.length > 0) {
    return { store: cookies, errors, seeded: false };
  }
  // No advanced state yet — seed from the classic 'rgb' editor's current state.
  const classic = getCookies(cookie, 'rgb', url.searchParams);
  return {
    store: seedFromClassic(classic.cookies),
    errors: [...errors, ...classic.errors],
    seeded: true,
  };
});

export const advancedStoreContext = createContextId<AdvancedStore>('advanced-rgb-store');
export const advPreviewStyleContext = createContextId<Signal<string>>('advanced-rgb-previewstyle');
export default component$(() => {
  const data = useAdvancedCookies().value;

  const initial = {
    ...structuredClone(advancedDefaults),
    ...data.store,
  };
  initial.segments = normalizeSegments(
    initial.segments && initial.segments.length ? initial.segments : advancedDefaults.segments,
  );

  const store = useStore<AdvancedStore>(initial, { deep: true });
  useContextProvider(advancedStoreContext, store);

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
