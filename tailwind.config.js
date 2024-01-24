/** @type {import('tailwindcss').Config} */

function getBlobKeyFrame() {
  const translateXPercentages = [80, 40, 0, -40, -80];
  const translateYPercentages = [0, -25, -50, -75, -100];
  const scaleValues = [0.8, 1, 1.2, 1.4];
  const rotateValues = [0, 90, 180, 270];

  const translateX0Key = Math.floor(Math.random() * translateXPercentages.length);
  const translateX0 = translateXPercentages[translateX0Key];
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

  const rotate0 = rotateValues[Math.floor(Math.random() * rotateValues.length)];
  const rotate1 = rotateValues[Math.floor(Math.random() * rotateValues.length)];
  const rotate2 = rotateValues[Math.floor(Math.random() * rotateValues.length)];
  const rotate3 = rotateValues[Math.floor(Math.random() * rotateValues.length)];

  const keyframe = {
    '0%, 100%': { transform: `translate(${translateX0}%, ${translateY0}%) scale(${scale0}) rotate(${rotate0}deg)` },
    '25%': { transform: `translate(${translateX1}%, ${translateY1}%) scale(${scale1}) rotate(${rotate1}deg)` },
    '50%': { transform: `translate(${translateX2}%, ${translateY2}%) scale(${scale2}) rotate(${rotate2}deg)` },
    '75%': { transform: `translate(${translateX3}%, ${translateY3}%) scale(${scale3}) rotate(${rotate3}deg)` },
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