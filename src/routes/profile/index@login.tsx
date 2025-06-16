import { component$, Signal, useContext, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';

import { unloadGoogleAds } from '~/util/GoogleAds';
import { privatePresetsContext, savedPresetsContext } from '../resources/rgb/presets';
import { BirdflopSession, useSession } from '../plugin@auth';
import PresetPreview from '~/components/rgb/PresetPreview';
import { presetInfo, presetSubmission } from '~/util/rgb/presets';
import { generateHead } from '~/root';
import { ChevronLeft, Save, X } from 'lucide-icons-qwik';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { renderPreview } from '../resources/rgb';
import { rgbDefaults } from '~/util/rgb/presets/defaults';
import { Form, Link, server$ } from '@builder.io/qwik-city';
import { getPrismaClient } from '~/util/prisma';
import { NotificationContext } from '../layout';

const publishPreset = server$(async function(presetInfo: presetSubmission, session: BirdflopSession) {

  if (!session || !session.user || !session.user.id || !session.user.name) {
    throw new Error('User not authenticated');
  }

  const prisma = getPrismaClient(this.env.get('DATABASE_URL'));

  await prisma?.presets.create({
    data: {
      name: presetInfo.name,
      userId: session.user.id,
      author: session.user.name,
      description: presetInfo.description,
      preset: presetInfo.preset,
    },
  });

  // Simulate a successful submission
  return { success: true };
});

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());
  const notifications = useContext(NotificationContext);

  const session = useSession() as Readonly<Signal<BirdflopSession>>;

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const modalRef = useSignal<HTMLDialogElement>();

  const privatePresetsParsed: presetInfo[] = [...privatePresets.value].map((preset) => ({
    name: preset.text ?? 'Saved Preset',
    preset: preset,
    pending: false,
  }));

  return <div>
    <h3 class="flex gap-2 items-center">
      <Save size={30} />
      <span class="flex-1">
        My Private RGBirdflop Presets
      </span>
      <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
        <ChevronLeft size={20} /> Go to presets
      </Link>
    </h3>

    <div class="grid sm:grid-cols-2 gap-2">
      {privatePresetsParsed.map((presetInfo) =>
        <PresetPreview key={`${presetInfo.name}-${presetInfo.author}`} presetInfo={presetInfo} />,
      )}
      <button class="lum-card text-left lum-bg-green-900/20 hover:lum-bg-green-900 w-full transition duration-1000 hover:duration-75 ease-out" onClick$={() => {
        modalRef.value?.showModal();
      }}>
        <h4 class="my-0!">
          Publish a preset
        </h4>
        <p>
          Click here to publish a saved preset from this list to the RGBirdflop presets repository.
        </p>
      </button>
    </div>

    <dialog ref={modalRef}
      class={{
        'm-auto text-gray-200 hidden open:flex': true,
        'lum-card lum-bg-lum-card-bg/50 drop-shadow-2xl backdrop-blur-xl min-w-1/4': true,
        'backdrop:bg-gray-950/50 backdrop:backdrop-blur-xs': true,
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
          const preset = JSON.parse(presetSelectElem.value);

          if (!includetext) delete preset.text;

          console.log('Publishing preset:', { name, description, preset });

          try {
            await publishPreset({
              name,
              description,
              preset,
            }, session.value);
          } catch (error) {
            console.error('Error publishing preset:', error);
            alert(`An error occurred while publishing the preset. ${error}`);
            return;
          }

          modalRef.value?.close();
        }}
        onSubmitCompleted$={(e) => {
          console.log(e);
          const id = Math.random().toString(36).substring(2, 15);
          notifications.push({
            id,
            title: 'Preset Published!',
            description: 'Your preset has been submitted for review. It will be available on the RGBirdflop presets repository soon.',
            bgColor: 'lum-bg-green-900/50',
          });
          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 2000);
        }}
        class="flex flex-col gap-2">
          <div class="grid sm:grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <label for="publish-preset-name">
                Preset name
              </label>
              <input type="text" class="lum-input" placeholder="My Preset" id="publish-preset-name" />
            </div>
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
              }>
              Select a preset to publish
            </SelectMenu>
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
          }}>
            <X size={20} /> Cancel
          </button>
          <button form="publish-preset-form" class="lum-btn lum-bg-green-900 hover:lum-bg-green-800" id="publish-preset">
            <Save size={20} /> Publish
          </button>
        </div>
      </div>
    </dialog>

  </div>;
});

export const head = generateHead({});