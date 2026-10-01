import { AdapterUser as AdapterUserFromAuth } from '@auth/qwik/adapters';
import { User as UserFromAuth } from '@auth/qwik';
import { rgbPreset } from './util/rgb/presets';
import { PublicPreset } from '../drizzle/schema';
import type { PluginsStoreType } from './util/plugins/types';

declare module '@auth/qwik' {
  interface User extends UserFromAuth {
    privatePresets?: rgbPreset[];
    savedPresets?: PublicPreset[];
    plugins?: PluginsStoreType;
  }
}

declare module '@auth/qwik/adapters' {
  interface AdapterUser extends AdapterUserFromAuth {
    privatePresets?: rgbPreset[];
    plugins?: PluginsStoreType;
  }
}

declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        payload?: Record<string, string | number>
      ) => void;
      identify?: (
        uniqueId: string,
        data?: Record<string, string | number>
      ) => void;
    };
  }
}
