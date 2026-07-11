import { component$, useContext, useSignal } from '@qwik.dev/core';

import { privatePresetsContext } from '~/routes/resources/rgb/presets';
import PresetPreview from '~/components/rgbirdflop/presets/PresetPreview';
import CircleUserRound from 'lucide-icons-qwik/icons/CircleUserRound';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Plus from 'lucide-icons-qwik/icons/Plus';
import Save from 'lucide-icons-qwik/icons/Save';
import X from 'lucide-icons-qwik/icons/X';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { renderPreview } from '~/components/rgbirdflop/preview';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { Form, Link } from '@qwik.dev/router';
import { Notification, NotificationContext } from '~/util/Notification';
import { rgbPreset } from '~/util/rgb/presets';
import { inlineTranslate } from 'qwik-speak';
import { publishPreset } from '~/util/dataUtils';
import { validatePresetSubmission } from '~/util/rgb/presets/presetValidation';
import type { SimilarPreset } from '~/util/rgb/presets/vectorize';

export default component$(() => {
  const notifications = useContext(NotificationContext);
  const t = inlineTranslate();

  const privatePresets = useContext(privatePresetsContext);
  const modalRef = useSignal<HTMLDialogElement>();
  const selectedPreset = useSignal<string>();
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
        class={{
          'text-lum-text m-auto hidden overflow-visible open:flex': true,
          'lum-card lum-grad-bg-lum-card-bg/50 min-w-1/4 drop-shadow-2xl backdrop-blur-xl': true,
          'open:animate-in open:fade-in open:slide-in-from-top-8 open:duration-300': true,
          'animate-out fade-out slide-in-from-top-8 duration-300': true,
        }}
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
            );
            if (
              !presetSelectElem ||
              !(presetSelectElem instanceof HTMLSelectElement)
            ) {
              validationErrors.value = ['Preset select element not found.'];
              isSubmitting.value = false;
              return;
            }

            const includetext = (
              form.querySelector(
                '#publish-preset-includetext'
              ) as HTMLInputElement
            ).checked;
            const preset = JSON.parse(presetSelectElem.value) as rgbPreset;

            if (!includetext) delete preset.text;

            // Client-side validation
            const validation = await validatePresetSubmission(
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

            const result = await publishPreset({
              name,
              description,
              preset,
            });

            isSubmitting.value = false;

            const notification = result.result?.[0]
              ? new Notification()
                  .setTitle('Preset Submitted!')
                  .setDescription(
                    'Your preset has been submitted for review. It may take a few days for it to be reviewed and published.'
                  )
                  .setBgColor('lum-grad-bg-green/50')
                  .setButtons([
                    {
                      text: 'View Preset',
                      href: `/resources/rgb/presets/${result.result?.[0]?.id}`,
                    },
                  ])
              : new Notification()
                  .setTitle('Preset Submission Failed')
                  .setDescription(
                    'Your preset failed to submit. Is there already a preset with the same configuration?'
                  )
                  .setBgColor('lum-grad-bg-yellow/50')
                  .setPersist(true);

            if (!result.success) {
              const errorMsg =
                typeof result.error === 'string'
                  ? result.error
                  : 'Unknown error';
              notification
                .setDescription(`Your preset failed to submit: ${errorMsg}`)
                .setBgColor('lum-grad-bg-red/50')
                .setPersist(true);

              if (result.validationErrors) {
                validationErrors.value = result.validationErrors.map(
                  (e) => `${e.field}: ${e.message}`
                );
              }
              if (result.similarPresets) {
                similarPresets.value = result.similarPresets;
              }
            } else if (result.warnings && result.warnings.length > 0) {
              notification.setDescription(
                notification.description +
                  '\n\nNote: ' +
                  result.warnings.join(' ')
              );
            }

            notifications.push(notification);
            if (result.success) {
              modalRef.value?.close();
              selectedPreset.value = undefined;
              validationErrors.value = [];
              similarPresets.value = [];
            }
          }}
          class="flex flex-col gap-2"
        >
          <div class="grid gap-2 sm:grid-cols-2">
            <div class="flex flex-col gap-1">
              <label for="publish-preset-name">Preset name</label>
              <input
                type="text"
                class="lum-input"
                placeholder="My Preset"
                id="publish-preset-name"
              />
            </div>
            {selectedPreset.value && (
              <SelectMenu
                id="publish-preset-preset"
                class={{ 'w-full': true }}
                values={
                  privatePresets.value.length == 0
                    ? undefined
                    : privatePresets.value.map((preset) => ({
                        name: (
                          <span
                            class={{
                              'font-mc tracking-tight break-all': true,
                              'font-mc-bold': preset.baseFormatting?.bold,
                              'font-mc-italic': preset.baseFormatting?.italic,
                              'font-mc-bold-italic':
                                preset.baseFormatting?.bold &&
                                preset.baseFormatting?.italic,
                              [`${preset.colorFormat?.class}`]:
                                preset.colorFormat?.class,
                            }}
                          >
                            {renderPreview({ ...rgbDefaults, ...preset }, 1)}
                          </span>
                        ),
                        value: JSON.stringify(preset),
                      }))
                }
                value={selectedPreset.value}
              >
                Select a preset to publish
              </SelectMenu>
            )}
          </div>

          <label for="publish-preset-description" class="-mb-1">
            Preset description
          </label>
          <textarea
            class="lum-input"
            placeholder="This is my preset"
            id="publish-preset-description"
          />

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
              selectedPreset.value = undefined;
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
