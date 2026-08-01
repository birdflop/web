import { component$, useContext, useSignal } from '@qwik.dev/core';

import { privatePresetsContext } from '~/routes/resources/rgb/presets';
import PresetPreview from '~/components/rgbirdflop/presets/PresetPreview';
import CircleUserRound from 'lucide-icons-qwik/icons/CircleUserRound';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Plus from 'lucide-icons-qwik/icons/Plus';
import Save from 'lucide-icons-qwik/icons/Save';
import X from 'lucide-icons-qwik/icons/X';
import { Label, SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { Form, Link } from '@qwik.dev/router';
import { Notification, NotificationContext } from '~/util/Notification';
import PencilLine from 'lucide-icons-qwik/icons/PencilLine';
import type { SimilarPreset } from '~/util/rgb/presets/vectorize';
import { loadPreset, type rgbPreset } from '~/util/rgb/presets';
import {
  validatePresetSubmission,
  type ValidationResult,
} from '~/util/rgb/presets/presetValidation';
import { publishPreset } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import RgbPreview from '../RgbPreview';
import { getFormattingClasses } from '../preview';

type PublishPresetResponse =
  | {
      success: true;
      result?: Array<{ id: number }>;
      warnings?: string[];
    }
  | {
      success: false;
      error?: unknown;
      validationErrors?: Array<{ field: string; message: string }>;
      similarPresets?: SimilarPreset[];
    };

export default component$(() => {
  const notifications = useContext(NotificationContext);
  const t = inlineTranslate();

  const privatePresets = useContext(privatePresetsContext);
  const modalRef = useSignal<HTMLDialogElement>();
  const selectedPreset = useSignal<rgbPreset | null>(null);
  const isSubmitting = useSignal(false);
  const validationErrors = useSignal<string[]>([]);
  const similarPresets = useSignal<SimilarPreset[]>([]);

  const privatePresetsParsed = [...privatePresets.value].map((preset) => ({
    name: preset.text ?? 'Saved Preset',
    preset: preset,
    pending: false,
  }));

  return (
    <div class="mt-4">
      <h2
        class="mb-2 flex items-center gap-2 text-2xl font-bold"
        id="my-presets"
      >
        <CircleUserRound size={30} />
        <span class="flex-1">
          {t('rgb.presets.myPrivate@@My Private RGBirdflop Presets')}
        </span>
        <Link href="/resources/rgb" class="lum-btn lum-bg-transparent">
          <Plus size={20} /> {t('rgb.presets.createNew@@Create a new preset')}
        </Link>
      </h2>

      {privatePresetsParsed.length > 0 && (
        <div class="grid gap-2 sm:grid-cols-2">
          {privatePresetsParsed.map((Preset, index) => (
            <PresetPreview
              key={`${Preset.name}-${index}`}
              Preset={Preset}
              publishRefs={{
                modalRef,
                selectedPreset,
              }}
            />
          ))}
        </div>
      )}

      {privatePresetsParsed.length === 0 && (
        <p>
          You don't have any presets saved yet. Go to RGBirdflop and save some!
        </p>
      )}

      {/* todo: modal component */}
      <dialog
        ref={modalRef}
        class="text-lum-text lum-card lum-grad-bg-lum-card-bg/50 open:animate-in open:fade-in open:slide-in-from-top-8 animate-out fade-out slide-in-from-top-8 m-auto hidden min-w-1/4 overflow-visible drop-shadow-2xl backdrop-blur-xl duration-300 open:flex open:duration-300"
      >
        <div class="border-lum-border/10 flex flex-col border-b pb-4">
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Palette size={28} />
            Publish a preset
          </h3>
          <p class="text-lum-text-secondary">
            To publish a preset to the RGBirdflop presets repository, please
            fill out the form below.
            <br />
            Your preset will be reviewed by the Birdflop team before being
            published.
          </p>
        </div>
        <Form
          id="publish-preset-form"
          onSubmit$={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;

            validationErrors.value = [];
            isSubmitting.value = true;

            const name = (
              form.querySelector('#publish-preset-name') as HTMLInputElement
            ).value;
            const description = (
              form.querySelector(
                '#publish-preset-description'
              ) as HTMLTextAreaElement
            ).value;

            const presetSelectElem = form.querySelector(
              '#publish-preset-preset'
            ) as HTMLSelectElement | HTMLInputElement | null;

            const presetJsonElem = form.querySelector(
              '#publish-preset-json'
            ) as HTMLInputElement | null;

            let preset: rgbPreset | undefined;
            if (presetJsonElem && presetJsonElem.value.trim()) {
              try {
                preset = loadPreset(presetJsonElem.value);
              } catch (e) {
                validationErrors.value = [
                  `Invalid Preset JSON: ${e instanceof Error ? e.message : String(e)}`,
                ];
                isSubmitting.value = false;
                return;
              }
            } else if (selectedPreset.value) {
              preset = { ...selectedPreset.value };
            } else if (presetSelectElem && presetSelectElem.value) {
              const idx = parseInt(presetSelectElem.value, 10);
              if (!isNaN(idx) && privatePresets.value[idx]) {
                preset = { ...privatePresets.value[idx] };
              }
            }

            if (!preset) {
              validationErrors.value = [
                'Please select a preset or paste custom Preset JSON.',
              ];
              isSubmitting.value = false;
              return;
            }

            const includetext = (
              form.querySelector(
                '#publish-preset-includetext'
              ) as HTMLInputElement
            ).checked;

            if (!includetext) delete preset.text;

            // Client-side validation
            const validation: ValidationResult = await validatePresetSubmission(
              {
                name,
                description,
                preset,
              },
              true
            );

            if (!validation.isValid) {
              validationErrors.value = validation.errors.map(
                (e) => `${e.field}: ${e.message}`
              );
              similarPresets.value = validation.similarPresets || [];
              isSubmitting.value = false;
              return;
            }

            // Show warnings if any
            if (validation.warnings && validation.warnings.length > 0) {
              const continueSubmission = confirm(
                `Warning:\n${validation.warnings.join('\n')}\n\nDo you want to continue?`
              );
              if (!continueSubmission) {
                isSubmitting.value = false;
                return;
              }
            }

            const publishRes = (await publishPreset({
              name,
              description,
              preset,
            })) as PublishPresetResponse;

            isSubmitting.value = false;

            if (publishRes.success) {
              const createdId = publishRes.result?.[0]?.id;
              const notification = new Notification()
                .setTitle('Preset Submitted!')
                .setDescription(
                  'Your preset has been submitted for review. It may take a few days for it to be reviewed and published.'
                )
                .setBgColor('lum-grad-bg-green/50');

              if (createdId) {
                notification.setButtons([
                  {
                    text: 'View Preset',
                    href: `/resources/rgb/presets/${createdId}`,
                  },
                ]);
              }

              if (publishRes.warnings && publishRes.warnings.length > 0) {
                notification.setDescription(
                  `${notification.description}\n\nNote: ${publishRes.warnings.join(' ')}`
                );
              }

              notifications.push(notification.toJSON());
              modalRef.value?.close();
              selectedPreset.value = null;
              validationErrors.value = [];
              similarPresets.value = [];
            } else {
              const errorMsg =
                typeof publishRes.error === 'string'
                  ? publishRes.error
                  : 'Unknown error';
              const notification = new Notification()
                .setTitle('Preset Submission Failed')
                .setDescription(`Your preset failed to submit: ${errorMsg}`)
                .setBgColor('lum-grad-bg-red/50')
                .setPersist(true);

              if (publishRes.validationErrors) {
                validationErrors.value = publishRes.validationErrors.map(
                  (e) => `${e.field}: ${e.message}`
                );
              }
              if (publishRes.similarPresets) {
                similarPresets.value = publishRes.similarPresets;
              }
              notifications.push(notification.toJSON());
            }
          }}
          class="flex flex-col gap-2"
        >
          <div class="grid gap-2 sm:grid-cols-2">
            <Label for="publish-preset-name" label="Preset name">
              <PencilLine size={16} q:slot="before-label" />
              <input
                type="text"
                class="lum-input"
                placeholder="My Preset"
                id="publish-preset-name"
              />
            </Label>
            <Label
              for="publish-preset-preset"
              label="Select a preset to publish"
            >
              <SelectMenu
                id="publish-preset-preset"
                class="w-full"
                values={privatePresets.value.map((preset, i) => ({
                  name: preset.text ?? 'Saved Preset',
                  value: i.toString(),
                  custom: true,
                }))}
                onChange$={(e, el) => {
                  selectedPreset.value =
                    privatePresets.value[parseInt(el.value)];
                }}
                value={
                  selectedPreset.value
                    ? (() => {
                        const targetStr =
                          typeof selectedPreset.value === 'string'
                            ? selectedPreset.value
                            : JSON.stringify(selectedPreset.value);
                        const idx = privatePresets.value.findIndex((p) => {
                          if (p === selectedPreset.value) return true;
                          try {
                            return JSON.stringify(p) === targetStr;
                          } catch {
                            return false;
                          }
                        });
                        return idx !== -1 ? idx.toString() : undefined;
                      })()
                    : undefined
                }
              >
                {privatePresets.value.map((preset, i) => (
                  <span
                    key={i}
                    q:slot={i.toString()}
                    class={{
                      'break-all': true,
                      ...getFormattingClasses(
                        preset.baseFormatting,
                        preset.colorFormat?.class
                      ),
                    }}
                  >
                    <RgbPreview
                      rgbStore={{ ...rgbDefaults, ...preset }}
                      shadowLength={2}
                    />
                  </span>
                ))}
                <span
                  q:slot="dropdown"
                  class={{
                    'break-all': true,
                    ...getFormattingClasses(
                      selectedPreset.value?.baseFormatting,
                      selectedPreset.value?.colorFormat?.class
                    ),
                  }}
                >
                  <RgbPreview
                    rgbStore={{ ...rgbDefaults, ...selectedPreset.value }}
                    shadowLength={2}
                  />
                </span>
              </SelectMenu>
            </Label>
          </div>

          <Label for="publish-preset-description" label="Preset description">
            <PencilLine size={16} q:slot="before-label" />
            <textarea
              class="lum-input"
              placeholder="This is my preset"
              id="publish-preset-description"
            />
          </Label>

          <Toggle id="publish-preset-includetext">
            Include preset input text (You usually do not need to enable this.)
          </Toggle>

          {validationErrors.value.length > 0 && (
            <div class="mt-2 rounded-lg border border-red-500/50 bg-red-500/20 p-3">
              <p class="mb-1 font-semibold text-red-400">Validation Errors:</p>
              <ul class="list-inside list-disc text-sm">
                {validationErrors.value.map((error, i) => (
                  <li key={i} class="text-red-300">
                    {error}
                  </li>
                ))}
              </ul>

              {similarPresets.value.length > 0 && (
                <div class="mt-3 border-t border-red-500/30 pt-3">
                  <p class="mb-2 font-semibold text-red-400">
                    Similar Presets Found ({similarPresets.value.length}):
                  </p>
                  <div class="grid gap-2">
                    {similarPresets.value.map((similar) => (
                      <div key={similar.id} class="relative">
                        <PresetPreview Preset={similar} />
                        <div class="absolute top-2 right-2 rounded bg-red-500/90 px-2 py-1 text-xs font-semibold text-white">
                          Distance: {similar.distance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Form>
        <div class="border-lum-border/10 flex justify-end gap-1 border-t pt-4">
          <button
            class="lum-btn"
            onClick$={() => {
              modalRef.value?.close();
              selectedPreset.value = null;
              validationErrors.value = [];
              similarPresets.value = [];
            }}
          >
            <X size={20} /> Cancel
          </button>
          <button
            form="publish-preset-form"
            class="lum-btn lum-bg-green/50 hover:lum-bg-green disabled:cursor-not-allowed disabled:bg-gray-600"
            id="publish-preset"
            disabled={isSubmitting.value}
          >
            <Save size={20} /> Publish{' '}
            {isSubmitting.value ? 'Validating...' : 'Publish'}
          </button>
        </div>
      </dialog>
    </div>
  );
});
