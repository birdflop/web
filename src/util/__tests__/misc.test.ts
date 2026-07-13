import { describe, it, expect, vi } from 'vitest';
import { deepTrack } from '../track';

vi.mock('@qwik.dev/core', async () => {
  const actual = (await vi.importActual('@qwik.dev/core')) as any;
  return {
    ...actual,
    unwrapStore: (o: any) => {
      // For testing deepTrack recursion:
      // If we mark an object with __isStore: true, treat it as wrapped
      if (o && o.__isStore) {
        return o.target;
      }
      return o;
    },
  };
});

describe('deepTrack', () => {
  it('should call track on the root object', () => {
    const track = vi.fn();
    const obj = { key: 'value' };
    deepTrack(track, obj);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(obj);
  });

  it('should recursively track nested objects marked as stores', () => {
    const track = vi.fn();
    const childTarget = { leaf: 'leafVal' };
    const child = { __isStore: true, target: childTarget };
    const parent = {
      nested: child,
    };

    deepTrack(track, parent);
    // Should call track on parent, and then on the child store
    expect(track).toHaveBeenCalledWith(parent);
    expect(track).toHaveBeenCalledWith(child);
  });
});
