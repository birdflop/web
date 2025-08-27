import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';

import { unloadGoogleAds } from '~/util/GoogleAds';
import { privatePresetsContext } from '~/routes/resources/rgb/presets';
import PresetPreview from '~/components/Rgbirdflop/PresetPreview';
import { CircleUserRound, Plus, Save, X } from 'lucide-icons-qwik';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { renderPreview } from '~/routes/resources/rgb';
import { rgbDefaults } from '~/util/rgb/presets/defaults';
import { Form, Link, server$ } from '@builder.io/qwik-city';
import { NotificationContext } from '~/routes/layout';
import { getDB, PresetPartial, presets, PublicPresetSubmission } from '~/util/db';
import { rgbPreset } from '~/util/rgb/presets';

const publishPreset = server$(async function(submission: PublicPresetSubmission) {
  const session = this.sharedMap.get('session');
  try {
    const db = getDB();
    if (!session || !db || !session.user.id) return { success: false, error: 'No session or database client' };

    await db.insert(presets)
      .values({
        name: submission.name,
        userId: session.user.id,
        author: session.user.name,
        description: submission.description,
        preset: submission.preset,
      });
  } catch (error) {
    console.error('Error publishing preset:', error);
    return { success: false, error };
  }

  return { success: true };
});

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());
  const notifications = useContext(NotificationContext);

  const privatePresets = useContext(privatePresetsContext);
  const modalRef = useSignal<HTMLDialogElement>();
  const selectedPreset = useSignal<string>();

  const privatePresetsParsed: PresetPartial[] = [...privatePresets.value].map((preset) => ({
    name: preset.text ?? 'Saved Preset',
    preset: preset,
    pending: false,
  }));

  return <div class="flex flex-col justify-center">
    <h3 class="flex gap-2 items-center" id="my-presets">
      <CircleUserRound size={30} />
      <span class="flex-1">
        My Private RGBirdflop Presets
      </span>
      <Link href="/resources/rgb" class="lum-btn lum-bg-transparent">
        <Plus size={20} /> Create a new preset
      </Link>
    </h3>

    {privatePresetsParsed.length > 0 &&
      <div class="grid sm:grid-cols-2 gap-2">
        {privatePresetsParsed.map((Preset) =>
          <PresetPreview key={`${Preset.name}-${Preset.author}`} Preset={Preset} publishRefs={{
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
        <h3 class="mt-0!">
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
          const form = e.target as HTMLFormElement;

          const name = (form.querySelector('#publish-preset-name') as HTMLInputElement).value;
          const description = (form.querySelector('#publish-preset-description') as HTMLTextAreaElement).value;
          if (!name || !description) return alert('Please fill out all fields.');

          const presetSelectElem = form.querySelector('#publish-preset-preset');
          if (!presetSelectElem || !(presetSelectElem instanceof HTMLSelectElement)) {
            alert('Preset select element not found.');
            return;
          }
          const includetext = (form.querySelector('#publish-preset-includetext') as HTMLInputElement).checked;
          const preset = JSON.parse(presetSelectElem.value) as rgbPreset;

          if (!includetext) delete preset.text;

          const result = await publishPreset({
            name,
            description,
            preset,
          });

          const id = Math.random().toString(36).substring(2, 15);
          let notification = {
            id,
            title: 'Preset Submitted!',
            description: 'Your preset has been submitted for review. It will be available on the RGBirdflop presets repository soon.',
            bgColor: 'lum-bg-green/50',
          };

          if (!result.success) {
            notification = {
              id,
              title: 'Preset Submission Failed',
              description: `Your preset failed to submit: ${result.error}`,
              bgColor: 'lum-bg-red/50',
            };
          }

          notifications.push(notification);

          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 3000);

          if (result.success) {
            modalRef.value?.close();
            selectedPreset.value = undefined;
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

          <Toggle id="publish-preset-includetext"
            label={'Include preset text'} />
        </Form>
        <hr/>
        <div class="flex gap-2 justify-end">
          <button class="lum-btn" onClick$={() => {
            modalRef.value?.close();
            selectedPreset.value = undefined;
          }}>
            <X size={20} /> Cancel
          </button>
          <button form="publish-preset-form" class="lum-btn lum-bg-green/50 hover:lum-bg-green" id="publish-preset">
            <Save size={20} /> Publish
          </button>
        </div>
      </div>
    </dialog>

  </div>;
});