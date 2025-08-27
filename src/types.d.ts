import { AdapterUser as AdapterUserFromAuth } from '@auth/qwik/adapters';
import {
  User as UserFromAuth,
} from '@auth/qwik';
import { rgbPreset } from './util/rgb/presets';

declare module '@auth/qwik' {
  interface User extends UserFromAuth {
    privatePresets?: rgbPreset[];
    savedPresets?: PublicPreset[];
  }
}

declare module '@auth/qwik/adapters' {
  interface AdapterUser extends AdapterUserFromAuth {
    privatePresets?: rgbPreset[];
  }
}