import { Tracker, unwrapStore } from '@qwik.dev/core/internal';

export const deepTrack = (track: Tracker, obj: object) => {
  track(obj);
  for (const o of Object.values(obj)) {
    if (unwrapStore(o) !== o) deepTrack(track, o as object);
  }
};
