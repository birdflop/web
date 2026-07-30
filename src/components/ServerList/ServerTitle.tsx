import { component$ } from '@qwik.dev/core';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { loadPreset, type rgbPreset } from '~/util/rgb/presets';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';

interface ServerTitleProps {
  name: string;
  rgbPreset?: rgbPreset | string | null;
  shadowLength?: number;
}

export default component$<ServerTitleProps>(
  ({ name, rgbPreset, shadowLength = 2 }) => {
    let preset: rgbPreset | null = null;
    if (rgbPreset) {
      if (typeof rgbPreset === 'object') {
        preset = rgbPreset;
      } else if (typeof rgbPreset === 'string' && rgbPreset.trim()) {
        try {
          preset = loadPreset(rgbPreset);
        } catch {
          preset = null;
        }
      }
    }

    if (!preset || !preset.colors || preset.colors.length === 0) {
      return <>{name}</>;
    }

    return (
      <span
        class={{
          'font-mc tracking-tight break-all': true,
          'font-mc-bold': preset.baseFormatting?.bold,
          'font-mc-italic': preset.baseFormatting?.italic,
          'font-mc-bold-italic':
            preset.baseFormatting?.bold && preset.baseFormatting?.italic,
          [`${preset.colorFormat?.class}`]: preset.colorFormat?.class,
        }}
      >
        <RgbPreview
          rgbStore={{
            ...rgbDefaults,
            ...preset,
            text: name,
          }}
          shadowLength={shadowLength}
        />
      </span>
    );
  }
);
