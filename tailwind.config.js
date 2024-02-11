/** @type {import('tailwindcss').Config} */

function getBlobKeyFrame() {
  const translateXPercentages = [0, 18, 35, 52, 70];
  const translateYPercentages = [0, 12, 25, 38, 50];
  const scaleValues = [0.8, 1, 1.2, 1.4];

  const translateX0Key = Math.floor(Math.random() * 70);
  const translateX0 = Math.floor(Math.random() * 70);
  translateXPercentages.splice(translateX0Key, 1);
  const translateX1Key = Math.floor(Math.random() * translateXPercentages.length);
  const translateX1 = translateXPercentages[translateX1Key];
  translateXPercentages.splice(translateX1Key, 1);
  const translateX2Key = Math.floor(Math.random() * translateXPercentages.length);
  const translateX2 = translateXPercentages[translateX2Key];
  translateXPercentages.splice(translateX2Key, 1);
  const translateX3Key = Math.floor(Math.random() * translateXPercentages.length);
  const translateX3 = translateXPercentages[translateX3Key];
  translateXPercentages.splice(translateX3Key, 1);

  const translateY0Key = Math.floor(Math.random() * translateYPercentages.length);
  const translateY0 = translateYPercentages[translateY0Key];
  translateYPercentages.splice(translateY0Key, 1);
  const translateY1Key = Math.floor(Math.random() * translateYPercentages.length);
  const translateY1 = translateYPercentages[translateY1Key];
  translateYPercentages.splice(translateY1Key, 1);
  const translateY2Key = Math.floor(Math.random() * translateYPercentages.length);
  const translateY2 = translateYPercentages[translateY2Key];
  translateYPercentages.splice(translateY2Key, 1);
  const translateY3Key = Math.floor(Math.random() * translateYPercentages.length);
  const translateY3 = translateYPercentages[translateY3Key];
  translateYPercentages.splice(translateY3Key, 1);

  const scale0 = scaleValues[Math.floor(Math.random() * scaleValues.length)];
  const scale1 = scaleValues[Math.floor(Math.random() * scaleValues.length)];
  const scale2 = scaleValues[Math.floor(Math.random() * scaleValues.length)];
  const scale3 = scaleValues[Math.floor(Math.random() * scaleValues.length)];

  const keyframe = {
    '0%, 100%': { transform: `translate(${translateX0}cqw, ${translateY0}cqh) scale(${scale0})` },
    '25%': { transform: `translate(${translateX1}cqw, ${translateY1}cqh) scale(${scale1})` },
    '50%': { transform: `translate(${translateX2}cqw, ${translateY2}cqh) scale(${scale2})` },
    '75%': { transform: `translate(${translateX3}cqw, ${translateY3}cqh) scale(${scale3})` },
  };

  return keyframe;
}

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        blob: 'blob 15s infinite',
        blob1: 'blob1 15s infinite',
        blob2: 'blob2 15s infinite',
        blob3: 'blob3 15s infinite',
        blob4: 'blob4 15s infinite',
        blob5: 'blob5 15s infinite',
        blob6: 'blob6 15s infinite',
        float: 'float 6s infinite',
      },
      keyframes: {
        blob: getBlobKeyFrame(),
        blob1: getBlobKeyFrame(),
        blob2: getBlobKeyFrame(),
        blob3: getBlobKeyFrame(),
        blob4: getBlobKeyFrame(),
        blob5: getBlobKeyFrame(),
        blob6: getBlobKeyFrame(),
      },
    },
  },
};
