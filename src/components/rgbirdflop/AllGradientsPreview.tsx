import { GRADIENT_TYPES, rgbDefaults } from '@birdflop/rgbirdflop';
import { component$, useContext } from '@qwik.dev/core';
import { rgbStoreContext } from './RGBirdflop';
import RgbPreview, { type RgbPreviewProps } from './RgbPreview';

export default component$<RgbPreviewProps>((props) => {
  const rgbStore = useContext(rgbStoreContext, props.rgbStore || rgbDefaults);

  return GRADIENT_TYPES.map((gradientType) => {
    const isActive = rgbStore.gradientType === gradientType;
    return (
      <span key={gradientType} class="flex items-center gap-2">
        <span
          class={{
            'lum-btn-p-1 rounded-lum min-w-15 text-center text-[10px]': true,
            'text-lum-text lum-grad-bg-lum-input-bg': isActive,
            'text-gray-400': !isActive,
          }}
        >
          {gradientType}
        </span>
        <span class="flex-1">
          <RgbPreview {...props} />
        </span>
      </span>
    );
  });
});
