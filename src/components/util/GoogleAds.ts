// src/components/util/GoogleAds.ts
declare let adsbygoogle: any;

export function unloadGoogleAds() {
  if (typeof document !== 'undefined') {
    const ads = document.querySelectorAll('.adsbygoogle');
    ads.forEach(ad => ad.remove());

    if (typeof adsbygoogle !== 'undefined' && adsbygoogle.length) {
      adsbygoogle = [];
    }

    const adsScript = document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    if (adsScript) {
      adsScript.remove();
    }
  }
}
