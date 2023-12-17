import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { RouterHead } from './components/Head';
import { useQwikSpeak } from 'qwik-speak';

import './global.css';
import { config } from '~/speak-config';
import { translationFn } from '~/speak-functions';

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
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <RouterHead />
      </head>
      <body class="text-gray-300">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
