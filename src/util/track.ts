import { unwrapStore } from '@qwik.dev/core/internal';

export const deepTrack = (track: any, obj: any) => {
  track(obj);
  for (const o of Object.values(obj)) {
    if (unwrapStore(o) !== o) deepTrack(track, o);
  }
};
