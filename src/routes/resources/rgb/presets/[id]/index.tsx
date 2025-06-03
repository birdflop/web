import { $, component$, isBrowser, useContext, useContextProvider, useSignal, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession, type BirdflopSession } from '~/routes/plugin@auth';
import { getPresets, publishedPreset } from '~/util/rgb/presets';
import { ChevronLeft, Github, MousePointer2, Palette, Rainbow, Save, Trash } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getPrismaClient } from '~/util/prisma';
import { NotificationContext } from '~/routes/layout';
import Input, { previewStyleContext } from '~/components/rgb/Input';
import { renderPreview, rgbStoreContext } from '../..';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { LogoBirdflop, LogoLuminescent, SelectMenuRaw } from '@luminescent/ui-qwik';
import { setUserData } from '~/util/dataUtils';
import { privatePresetsContext, savedPresetsContext } from '..';

export const usePreset = routeLoader$(async ({ params, env }) => {
  const prisma = getPrismaClient(env.get('DATABASE_URL'));
  if (!prisma) throw new Error('No prisma client');
  if (isNaN(Number(params.id))) throw new Error('No preset ID provided');

  const presetInfo = await prisma.presets.findUnique({
    where: { id: Number(params.id) },
    include: {
      user: true,
      savedBy: true,
    },
    cacheStrategy: {
      ttl: 60 * 60, // Cache for 1 hour
    },
  }) as publishedPreset | null;

  if (!presetInfo) throw new Error('Preset not found');

  return presetInfo;
});

export default component$(() => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const loading = useSignal(false);

  const session = useSession() as Readonly<Signal<BirdflopSession>>;
  const presetInfo = usePreset().value;

  const rgbStore = useStore({
    ...rgbDefaults,
    ...presetInfo.preset,
    text: presetInfo.name,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const existingPreset = savedPresets.value.find((savedPreset) => {
    return savedPreset.id === presetInfo.id;
  })?.preset
  || privatePresets.value.find((savedPreset) => {
    return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
  });

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // If savedPresets is empty, load presets from localStorage
    if (savedPresets.value.length != 0) return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error parsing saved presets',
        description: `Error: ${err}`,
        bgColor: 'lum-bg-red-900/50',
      };
      notifications.push(notification);
      setTimeout(() => {
        notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
      }, 2000);
    }
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Save size={70} /> {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
        </h1>
        <p>
          {t('nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.')}
        </p>
        <hr/>
        <div class="flex">
          <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
            <ChevronLeft size={20} /> Back to Presets
          </Link>
        </div>

        <div class="flex flex-col gap-4 mt-2">
          <Input>
            {renderPreview(rgbStore, previewStyle.value == 'default' ? 4 : 2)}
          </Input>

          <div class="lum-card p-6">
            <h6 class={{
              'flex items-center gap-2 my-0!': true,
              'text-blue-300/80!': !presetInfo.user,
              'text-orange-300/80!': !!presetInfo.user,
            }}>
              { presetInfo.user && <Link href={`/profile/${presetInfo.user.id}`}
                class="lum-btn lum-bg-transparent p-1 -ml-1 cursor-pointer font-semibold text-inherit! text-xl">
                {presetInfo.user.image && presetInfo.user.name && (
                  <img src={presetInfo.user.image} alt={presetInfo.user.name}
                    width={32} height={32} class="w-8 h-8 rounded-full!" />
                )}
                {presetInfo.user.name}
              </Link>
              }
              { presetInfo.author && !presetInfo.user && <>
                {presetInfo.author == 'RGBirdflop' &&
                  <LogoBirdflop size={32} fillGradient={['#f77272', '#fab775', '#ffff6e', '#7dfa7d', '#7a7aff', '#bb77ed', '#ca3eed']} />
                }
                {presetInfo.author == 'SimplyMC' &&
                  <LogoLuminescent size={32} class="text-luminescent-300" />
                }
                {presetInfo.author.includes('GitHub') &&
                  <Github size={32} />
                }
                {presetInfo.author}
              </>}
            </h6>
            <hr class="my-1!"/>
            <p>
              {presetInfo.description}
            </p>
          </div>

          <div class="lum-card p-6">
            <label for="preset" class="-mb-2">
              Preset Contents - Click to copy
            </label>
            <textarea id="preset" readOnly
              class={{
                'lum-input h-32 w-full font-mc whitespace-pre-wrap': true,
              }}
              value={JSON.stringify(presetInfo.preset, null, 2)}
              onClick$={async () => {
                const id = Math.random().toString(36).substring(2, 15);
                const notification = {
                  id,
                  title: await t$('rgb.copied@@Copied to clipboard!'),
                  description: await t$('rgb.output.copied@@The RGB text has been copied to your clipboard successfully.'),
                  bgColor: 'lum-bg-green-900/50',
                };
                navigator.clipboard.writeText(JSON.stringify(presetInfo.preset)).catch(async (err) => {
                  notification.title = await t$('rgb.copyFailed@@Failed to copy to clipboard!');
                  notification.description = err;
                  notification.bgColor = 'lum-bg-red-900/50';
                });
                notifications.push(notification);
                setTimeout(() => {
                  notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
                }, 2000);
              }}
            />
          </div>

          <div class="flex gap-2">
            <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
              class={{ 'hidden sm:flex text-sm gap-1 text-orange-300': true }}>
              <div q:slot="dropdown" class="flex items-center gap-3">
                <MousePointer2 size={20} /> {t('rgb.presets.use@@Use')}
              </div>
              <Link href={`/resources/rgb?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent">
                <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
              </Link>
              <Link href={`/resources/animtab?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent">
                <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
              </Link>
            </SelectMenuRaw>
            <button class="lum-btn text-sm" disabled={loading.value} onClick$={async () => {
              loading.value = true;

              if (existingPreset) {
                privatePresets.value = privatePresets.value.filter((p) => p !== existingPreset);
                if (presetInfo.id) {
                  savedPresets.value = savedPresets.value.filter((p) => p.id !== presetInfo.id);
                  presetInfo.savedBy?.splice(presetInfo.savedBy?.indexOf(session.value?.user), 1);
                  await setUserData({
                    savedPresets: {
                      disconnect: { id: presetInfo.id },
                    },
                  });
                }
              }
              else {
                privatePresets.value = [...privatePresets.value, presetInfo.preset];
                if (presetInfo.id) {
                  savedPresets.value = [...savedPresets.value, presetInfo];
                  presetInfo.savedBy?.push(session.value?.user);
                  await setUserData({
                    savedPresets: {
                      connect: {
                        id: presetInfo.id,
                      },
                    },
                  });
                }
              }

              if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
              loading.value = false;
            }}>
              {!loading.value && presetInfo.savedBy?.length}
              {loading.value && <div class="lum-loading w-5 h-5" />}
              {privatePresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset))
                ? <span class="text-red-300 flex gap-3">
                  <Trash size={20} /> {t$('rgb.presets.remove@@Remove')}
                </span>
                : <span class="text-green-300 flex gap-3">
                  <Save size={20}  /> {t$('rgb.presets.save@@Save')}
                </span>}
            </button>
          </div>
        </div>

        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Presets',
  description: 'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop. ' + defaultDescription,
  ads: true,
});