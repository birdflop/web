import {
  component$,
  useSignal,
  useVisibleTask$,
  type Signal,
} from '@qwik.dev/core';

interface TurnstileProps {
  // Public site key. When empty, Turnstile is disabled and nothing renders
  // (the server skips verification too).
  sitekey: string;
  // Updated with the solved token; reset to '' on expiry/error.
  token: Signal<string>;
  // Bump to reset the widget for a fresh challenge. Tokens are single-use,
  // so the parent must do this after every submit that consumed one.
  resetKey?: Signal<number>;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'auto' | 'light' | 'dark';
        }
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default component$<TurnstileProps>(({ sitekey, token, resetKey }) => {
  const containerRef = useSignal<HTMLDivElement>();
  const widgetId = useSignal<string>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$((ctx) => {
    if (!sitekey || !containerRef.value) return;

    const render = () => {
      if (!window.turnstile || !containerRef.value) return;
      widgetId.value = window.turnstile.render(containerRef.value, {
        sitekey,
        theme: 'auto',
        callback: (t) => (token.value = t),
        'expired-callback': () => (token.value = ''),
        'error-callback': () => (token.value = ''),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      // Load the script once; reuse it across widgets.
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`
      );
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', render);
    }

    ctx.cleanup(() => {
      if (widgetId.value && window.turnstile)
        window.turnstile.remove(widgetId.value);
      widgetId.value = undefined;
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    // Skip the initial run; only explicit bumps reset the widget.
    if (!track(() => resetKey?.value)) return;
    token.value = '';
    if (widgetId.value && window.turnstile)
      window.turnstile.reset(widgetId.value);
  });

  return <div ref={containerRef} class={sitekey ? 'my-2' : 'hidden'} />;
});
