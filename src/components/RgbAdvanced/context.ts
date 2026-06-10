import { createContextId, type Signal } from '@builder.io/qwik';
import type { AdvancedStore } from './model';

export const advancedStoreContext = createContextId<AdvancedStore>('advanced-rgb-store');

/** Preview surface style: 'default' | 'chat' | 'tab-*' | 'gui-*'. */
export const advPreviewStyleContext = createContextId<Signal<string>>('advanced-rgb-previewstyle');

export interface Selection {
  start: number;
  end: number;
  /** Segment index the selection anchor falls in (for the inspector), or null. */
  segmentIndex: number | null;
}

export const selectionContext = createContextId<Signal<Selection>>('advanced-rgb-selection');
