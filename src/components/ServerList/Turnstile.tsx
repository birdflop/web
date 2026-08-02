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
    };
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default component$<TurnstileProps>(({ sitekey, token }) => {
  const containerRef = useSignal<HTMLDivElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$((ctx) => {
    if (!sitekey || !containerRef.value) return;

    let widgetId: string | undefined;

    const render = () => {
      if (!window.turnstile || !containerRef.value) return;
      widgetId = window.turnstile.render(containerRef.value, {
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
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    });
  });

  return <div ref={containerRef} class={sitekey ? 'my-2' : 'hidden'} />;
});
