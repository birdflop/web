// src/components/util/GoogleAds.ts
export function unloadGoogleAds() {
  if (typeof document !== 'undefined') {
    const ads = document.querySelectorAll('.adsbygoogle');
    ads.forEach(ad => ad.remove());
  }
}