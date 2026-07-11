/**
 * WHAT IS THIS FILE?
 *
 * SSR renderer function, used by Qwik Router.
 *
 * Note that this is the only place the Qwik renderer is called.
 * On the client, containers resume and do not call render.
 */
import { createRenderer } from '@qwik.dev/router';
import Root from './root';
import { isDev } from '@qwik.dev/core/build';
import type { RenderOptions } from '@qwik.dev/core/server';
import { config } from '~/speak-config';

/**
 * Determine the base URL to use for loading the chunks in the browser.
 * The value set through Qwik 'locale()' in 'plugin.ts' is saved by Qwik in 'serverData.locale' directly.
 * Make sure the locale is among the 'supportedLocales'
 */
export function extractBase({ serverData }: RenderOptions): string {
  if (
    !isDev &&
    serverData?.locale &&
    config.supportedLocales.find((locale) => locale.lang === serverData?.locale)
  ) {
    return '/build/' + serverData.locale;
  } else {
    return '/build';
  }
}

export default createRenderer((opts) => {
  return {
    jsx: <Root />,
    options: {
      base: extractBase(opts),
      ...opts,
      // Use container attributes to set attributes on the html tag.
      containerAttributes: {
        lang: opts.serverData?.locale || config.defaultLocale.lang,
        ...opts.containerAttributes,
      },
      serverData: {
        ...opts.serverData,
        // These are the default values for the document head and are overridden by the `head` exports
        // documentHead: {
        //   title: "My App",
        // },
      },
    },
  };
});
