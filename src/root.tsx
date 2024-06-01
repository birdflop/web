import { component$, $, useOnDocument } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { RouterHead } from './components/Head';
import { useQwikSpeak } from 'qwik-speak';

import './global.css';
import { config } from '~/speak-config';
import { translationFn } from '~/speak-functions';
import { QwikPartytown } from './components/partytown/partytown';

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

  useOnDocument('load', $(() => {
    let platform = navigator.userAgentData.platform || navigator.platform || 'unknown';
    if (platform.toUpperCase().indexOf('MAC') >= 0) {
      document.querySelectorAll('.scale-for-mac').forEach(function(element) {
        element.classList.add('macos-zoom-fix');
      });
    }
  }));

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <QwikPartytown forward={['dataLayer.push']} />
        <script
          async
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=AW-11483620641"
        />
        <script
          async
          type='text/javascript'
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947"
          crossOrigin='anonymous' />
        <RouterHead />
      </head>
      <body class="text-gray-300">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
