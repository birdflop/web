import { component$, useContext, useSignal } from '@builder.io/qwik';

import { privatePresetsContext } from '~/routes/resources/rgb/presets';
import PresetPreview from '~/components/Rgbirdflop/PresetPreview';
import { CircleUserRound, Plus, Save, X } from 'lucide-icons-qwik';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { renderPreview } from '~/components/Rgbirdflop/RGBirdflop';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { Form, Link } from '@builder.io/qwik-city';
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

  return <div class="mt-4">
    <h2 class="mb-2 flex items-center gap-2 font-bold text-2xl" id="my-presets">
      <CircleUserRound size={30} />
      <span class="flex-1">
        {t('rgb.presets.myPrivate@@My Private RGBirdflop Presets')}
      </span>
      <Link href="/resources/rgb" class="lum-btn lum-bg-transparent">
        <Plus size={20} /> {t('rgb.presets.createNew@@Create a new preset')}
      </Link>
    </h2>

    {privatePresetsParsed.length > 0 &&
      <div class="grid sm:grid-cols-2 gap-2">
        {privatePresetsParsed.map((Preset, index) =>
          <PresetPreview key={`${Preset.name}-${index}`} Preset={Preset} publishRefs={{
            modalRef, selectedPreset,
          }} />,
        )}
      </div>
    }

    {privatePresetsParsed.length === 0 &&
      <p>
        You don't have any presets saved yet. Go to RGBirdflop and save some!
      </p>
    }

    <dialog ref={modalRef}
      class={{
        'm-auto hidden open:flex text-lum-text': true,
        'lum-card drop-shadow-2xl backdrop-blur-xl min-w-1/4': true,
        'open:animate-in open:fade-in open:slide-in-from-top-8 open:anim-duration-300': true,
        'animate-out fade-out slide-in-from-top-8 anim-duration-300': true,
      }}>
      <div class="flex flex-col">
        <h3>
          Publish a preset
        </h3>
        <p>
          To publish a preset to the RGBirdflop presets repository, please fill out the form below.
        </p>
        <p>
          Your preset will be reviewed by the Birdflop team before being published.
        </p>

        <hr/>
        <Form id="publish-preset-form" onSubmit$={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;

          validationErrors.value = [];
          isSubmitting.value = true;

          const name = (form.querySelector('#publish-preset-name') as HTMLInputElement).value;
          const description = (form.querySelector('#publish-preset-description') as HTMLTextAreaElement).value;

          const presetSelectElem = form.querySelector('#publish-preset-preset');
          if (!presetSelectElem || !(presetSelectElem instanceof HTMLSelectElement)) {
            validationErrors.value = ['Preset select element not found.'];
            isSubmitting.value = false;
            return;
          }

          const includetext = (form.querySelector('#publish-preset-includetext') as HTMLInputElement).checked;
          const preset = JSON.parse(presetSelectElem.value) as rgbPreset;

          if (!includetext) delete preset.text;

          // Client-side validation
          const validation = await validatePresetSubmission({
            name,
            description,
            preset,
          }, true);

          if (!validation.isValid) {
            validationErrors.value = validation.errors.map(e => `${e.field}: ${e.message}`);
            similarPresets.value = validation.similarPresets || [];
            isSubmitting.value = false;
            return;
          }

          // Show warnings if any
          if (validation.warnings && validation.warnings.length > 0) {
            const continueSubmission = confirm(
              `Warning:\n${validation.warnings.join('\n')}\n\nDo you want to continue?`,
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

          const notification = result.result?.[0] ?
            new Notification()
              .setTitle('Preset Submitted!')
              .setDescription('Your preset has been submitted for review. It may take a few days for it to be reviewed and published.')
              .setBgColor('lum-bg-green/50')
              .setButtons([
                { text: 'View Preset', href: `/resources/rgb/presets/${result.result?.[0]?.id}` },
              ]) :
            new Notification()
              .setTitle('Preset Submission Failed')
              .setDescription('Your preset failed to submit. Is there already a preset with the same configuration?')
              .setBgColor('lum-bg-yellow/50')
              .setPersist(true);

          if (!result.success) {
            const errorMsg = typeof result.error === 'string' ? result.error : 'Unknown error';
            notification.setDescription(`Your preset failed to submit: ${errorMsg}`)
              .setBgColor('lum-bg-red/50')
              .setPersist(true);

            if (result.validationErrors) {
              validationErrors.value = result.validationErrors.map(e => `${e.field}: ${e.message}`);
            }
            if (result.similarPresets) {
              similarPresets.value = result.similarPresets;
            }
          } else if (result.warnings && result.warnings.length > 0) {
            notification.setDescription(
              notification.description + '\n\nNote: ' + result.warnings.join(' '),
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
        class="flex flex-col gap-2">
          <div class="grid sm:grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <label for="publish-preset-name">
                Preset name
              </label>
              <input type="text" class="lum-input" placeholder="My Preset" id="publish-preset-name" />
            </div>
            {selectedPreset.value && (
              <SelectMenu id="publish-preset-preset" class={{ 'w-full': true }}
                values={privatePresets.value.length == 0 ? undefined :
                  privatePresets.value.map((preset) => ({
                    name: <span class={{
                      'break-all font-mc tracking-tight': true,
                      'font-mc-bold': preset.bold,
                      'font-mc-italic': preset.italic,
                      'font-mc-bold-italic': preset.bold && preset.italic,
                      [`${preset.format?.class}`]: preset.format?.class,
                    }}>
                      {renderPreview({ ...rgbDefaults, ...preset }, 1)}
                    </span>,
                    value: JSON.stringify(preset),
                  }))
                } value={selectedPreset.value}>
                Select a preset to publish
              </SelectMenu>
            )}
          </div>

          <label for="publish-preset-description" class="-mb-1">
            Preset description
          </label>
          <textarea class="lum-input" placeholder="This is my preset" id="publish-preset-description" />

          <Toggle id="publish-preset-includetext" >
            Include preset input text (You usually do not need to enable this.)
          </Toggle>

          {validationErrors.value.length > 0 && (
            <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-2">
              <p class="font-semibold text-red-400 mb-1">Validation Errors:</p>
              <ul class="list-disc list-inside text-sm">
                {validationErrors.value.map((error, i) => (
                  <li key={i} class="text-red-300">{error}</li>
                ))}
              </ul>

              {similarPresets.value.length > 0 && (
                <div class="mt-3 pt-3 border-t border-red-500/30">
                  <p class="font-semibold text-red-400 mb-2">Similar Presets Found ({similarPresets.value.length}):</p>
                  <div class="grid gap-2">
                    {similarPresets.value.map((similar) => (
                      <div key={similar.id} class="relative">
                        <PresetPreview Preset={similar} />
                        <div class="absolute top-2 right-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-semibold">
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
        <hr/>
        <div class="flex gap-2 justify-end">
          <button class="lum-btn" onClick$={() => {
            modalRef.value?.close();
            selectedPreset.value = undefined;
            validationErrors.value = [];
            similarPresets.value = [];
          }}>
            <X size={20} /> Cancel
          </button>
          <button
            form="publish-preset-form"
            class="lum-btn lum-bg-green/50 hover:lum-bg-green disabled:bg-gray-600 disabled:cursor-not-allowed"
            id="publish-preset"
            disabled={isSubmitting.value}
          >
            <Save size={20} /> Publish {isSubmitting.value ? 'Validating...' : 'Publish'}
          </button>
        </div>
      </div>
    </dialog>

  </div>;
});