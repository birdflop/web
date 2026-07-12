export const DEBUG_ID_KEY = 'umami-debug-id';

/**
 * Returns a stable anonymous ID for logged-out visitors,
 * generating and persisting one in localStorage on first use.
 */
export function getAnonymousId(): string {
  let id = localStorage.getItem(DEBUG_ID_KEY);
  if (!id) {
    id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(DEBUG_ID_KEY, id);
  }
  return id;
}

let identifiedAs: string | undefined;

/**
 * Identifies the current umami session with a distinct ID:
 * the user's account ID when logged in, otherwise the persisted
 * anonymous ID. Retries until the deferred umami script has loaded.
 */
export function identifyUmami(userId?: string) {
  const distinctId = userId ?? getAnonymousId();
  if (identifiedAs === distinctId) return;

  let attempts = 0;
  const tryIdentify = () => {
    if (window.umami?.identify) {
      window.umami.identify(distinctId);
      identifiedAs = distinctId;
    } else if (attempts++ < 20) {
      setTimeout(tryIdentify, 500);
    }
  };
  tryIdentify();
}
