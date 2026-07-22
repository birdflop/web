import { describe, it, expect, vi } from 'vite-plus/test';
import { deepTrack } from '../track';

vi.mock('@qwik.dev/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@qwik.dev/core');
  return {
    ...actual,
    unwrapStore: (o: Record<string, unknown> | null | undefined) => {
      // For testing deepTrack recursion:
      // If we mark an object with __isStore: true, treat it as wrapped
      if (o && typeof o === 'object' && '_isStore' in o && o._isStore) {
        return (o as { target?: unknown }).target;
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
    const child = { _isStore: true, target: childTarget };
    const parent = {
      nested: child,
    };

    deepTrack(track, parent);
    // Should call track on parent, and then on the child store
    expect(track).toHaveBeenCalledWith(parent);
    expect(track).toHaveBeenCalledWith(child);
  });
});
