import { component$, HTMLCrossOriginAttribute } from '@builder.io/qwik';
import { DocumentHead, DocumentHeadValue, QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { RouterHead } from '~/components/Head';
import { useQwikSpeak } from 'qwik-speak';

import './global.css';
import { config } from '~/speak-config';
import { translationFn } from '~/speak-functions';
import { QwikPartytown } from '~/components/Partytown';

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  /**
   * Init Qwik Speak
   */
  useQwikSpeak({ config, translationFn });

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <QwikPartytown forward={['dataLayer.push']} />
        <script
          async
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=AW-11483620641"
        />
        <RouterHead />
      </head>
      <body class="text-lum-text">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});

export const defaultDescription = 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.48/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.';

export function generateHead({
  title = 'Birdflop - Minecraft Hosting & Resources',
  description = defaultDescription,
  image = '/branding/icon.png',
  ads = false,
  head = {},
}: {
  title?: string;
  description?: string;
  image?: string;
  ads?: boolean;
  head?: Partial<DocumentHeadValue>;
}): DocumentHead {
  return {
    ...head,
    title,
    meta: [
      {
        name: 'description',
        content: description,
      },
      {
        name: 'og:description',
        content: description,
      },
      {
        name: 'og:image',
        content: image,
      },
      ...(head.meta ?? []),
    ],
    scripts: [
      ...(ads
        ? [
          {
            props: {
              async: true,
              type: 'text/javascript',
              src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
              crossOrigin: 'anonymous' as HTMLCrossOriginAttribute,
            },
          },
        ]
        : []),
      ...(head.scripts ?? []),
    ],
  };
}