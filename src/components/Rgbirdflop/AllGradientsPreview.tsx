import { GRADIENT_TYPES, GradientType } from '@birdflop/rgbirdflop';

export function renderAllGradientsPreview(
  renderPreview: (gradientType: GradientType) => any,
  activeGradientType: GradientType,
) {
  return GRADIENT_TYPES.map((gradientType) => {
    const isActive = gradientType === activeGradientType;
    return (
      <span
        key={gradientType}
        class="flex items-center gap-2"
        q:slot="input"
      >
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
          {renderPreview(gradientType)}
        </span>
      </span>
    );
  });
};
