import type { rgbPreset } from '.';
import type { PublicPresetSubmission } from '../../db';
import { checkPresetSimilarity, type SimilarPreset } from './vectorize';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
  similarPresets?: SimilarPreset[];
}

/**
 * Validates a preset submission before it's sent to the server
 * @param submission - The preset submission to validate
 * @param checkSimilarity - Whether to check for similar presets (default: true)
 * @returns Validation result with any errors or warnings
 */
export async function validatePresetSubmission(
  submission: PublicPresetSubmission,
  checkSimilarity: boolean = true,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!submission.name || submission.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Preset name is required',
    });
  } else if (submission.name.length < 3) {
    errors.push({
      field: 'name',
      message: 'Preset name must be at least 3 characters',
    });
  } else if (submission.name.length > 50) {
    errors.push({
      field: 'name',
      message: 'Preset name must be 50 characters or less',
    });
  }

  // Validate description
  if (!submission.description || submission.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Preset description is required',
    });
  } else if (submission.description.length < 10) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 10 characters',
    });
  } else if (submission.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be 500 characters or less',
    });
  }

  // Validate preset
  const presetErrors = validatePreset(submission.preset);
  errors.push(...presetErrors);

  // Check for similarity if no errors so far
  let similarPresets: SimilarPreset[] | undefined;
  if (errors.length === 0 && checkSimilarity) {
    try {
      const similarityCheck = await checkPresetSimilarity(submission.preset, 0.38);
      if (similarityCheck.isSimilar && similarityCheck.similarPresets.length > 0) {
        similarPresets = similarityCheck.similarPresets;

        errors.push({
          field: 'preset',
          message: 'This gradient is too similar to existing presets, Please modify it to be more unique.',
        });
      } else if (similarityCheck.closestDistance !== undefined && similarityCheck.closestDistance < 8000) {
        warnings.push(
          'This gradient is somewhat similar to an existing preset. Consider making it more unique.',
        );
      }
    } catch (error) {
      console.warn('Failed to check preset similarity:', error);
      // Don't block submission if similarity check fails
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    similarPresets,
  };
}

/**
 * Validates the preset object itself
 * @param preset - The preset to validate
 * @returns Array of validation errors
 */
export function validatePreset(preset: rgbPreset): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate colors array
  if (!preset.colors || !Array.isArray(preset.colors)) {
    errors.push({
      field: 'preset.colors',
      message: 'Preset must have a colors array',
    });
    return errors; // Can't continue validation without colors
  }

  if (preset.colors.length === 0) {
    errors.push({
      field: 'preset.colors',
      message: 'Preset must have at least one color',
    });
  } else if (preset.colors.length > 20) {
    errors.push({
      field: 'preset.colors',
      message: 'Preset cannot have more than 20 colors',
    });
  }

  // Validate each color
  preset.colors.forEach((color: { hex?: string; pos?: number }, index: number) => {
    if (!color.hex) {
      errors.push({
        field: `preset.colors[${index}]`,
        message: `Color at index ${index} is missing hex value`,
      });
    } else if (!isValidHexColor(color.hex)) {
      errors.push({
        field: `preset.colors[${index}]`,
        message: `Invalid hex color: ${color.hex}`,
      });
    }

    if (color.pos === undefined || color.pos === null) {
      errors.push({
        field: `preset.colors[${index}]`,
        message: `Color at index ${index} is missing position`,
      });
    } else if (color.pos < 0 || color.pos > 100) {
      errors.push({
        field: `preset.colors[${index}]`,
        message: `Color position must be between 0 and 100 (got ${color.pos})`,
      });
    }
  });

  // Check for duplicate positions
  const positions: (number | undefined)[] = preset.colors.map((c: { hex?: string; pos?: number }) => c.pos);
  const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
  if (duplicatePositions.length > 0) {
    errors.push({
      field: 'preset.colors',
      message: `Multiple colors at the same position: ${[...new Set(duplicatePositions)].join(', ')}`,
    });
  }

  // Validate text if present
  if (preset.text !== undefined) {
    if (typeof preset.text !== 'string') {
      errors.push({
        field: 'preset.text',
        message: 'Text must be a string',
      });
    } else if (preset.text.length > 100) {
      errors.push({
        field: 'preset.text',
        message: 'Text must be 100 characters or less',
      });
    }
  }

  // Validate format if present
  if (preset.format) {
    if (!preset.format.color) {
      errors.push({
        field: 'preset.format',
        message: 'Format must have a color property',
      });
    }
  }

  return errors;
}

/**
 * Validates a hex color string
 * @param hex - The hex color to validate
 * @returns True if valid, false otherwise
 */
function isValidHexColor(hex: string): boolean {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Must be 3 or 6 characters
  if (cleanHex.length !== 3 && cleanHex.length !== 6) {
    return false;
  }

  // Must be valid hex characters
  return /^[0-9A-Fa-f]+$/.test(cleanHex);
}
