import {
  component$,
  useContextProvider,
  useSignal,
  useStore,
} from '@qwik.dev/core';
import { defaultDescription, generateHead } from '~/root';
import { routeLoader$ } from '@qwik.dev/router';
import { getCookies } from '~/util/dataUtils';
import { generateOutput, rgbDefaults } from '@birdflop/rgbirdflop';
import {
  previewStyleContext,
  Selection,
  selectionContext,
} from '~/components/rgbirdflop/Input';
import Palette from 'lucide-icons-qwik/icons/Palette';
import { inlineTranslate } from 'qwik-speak';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';
import RGBirdflop, {
  rgbStoreContext,
  showAllGradientsContext,
} from '~/components/rgbirdflop/RGBirdflop';
import AllGradientsPreview from '~/components/rgbirdflop/AllGradientsPreview';

import { eq, like, or } from 'drizzle-orm';
import { getDB, servers } from '~/util/db';
import { loadPreset, type rgbPreset } from '~/util/rgb/presets';
import { slugify } from '~/util/serverlist/validation';

export const useRGBCookies = routeLoader$(async ({ cookie, url }) => {
  const cookies = getCookies<Partial<typeof rgbDefaults>>(
    cookie,
    'rgb',
    url.searchParams
  );

  const serverParam =
    url.searchParams.get('s') || url.searchParams.get('server');
  if (serverParam) {
    try {
      const db = getDB();
      if (db) {
        const cleanParam = serverParam.trim();
        const slugCandidate = slugify(cleanParam);
        const serverRow = await db
          .select({ name: servers.name, rgbPreset: servers.rgbPreset })
          .from(servers)
          .where(
            or(
              eq(servers.slug, cleanParam),
              eq(servers.slug, slugCandidate),
              like(servers.name, cleanParam)
            )
          )
          .get();

        if (serverRow) {
          let serverPreset: rgbPreset | null = null;
          if (serverRow.rgbPreset) {
            serverPreset =
              typeof serverRow.rgbPreset === 'string'
                ? loadPreset(serverRow.rgbPreset)
                : loadPreset(JSON.stringify(serverRow.rgbPreset));
          }

          if (!serverPreset) {
            serverPreset = { text: serverRow.name };
          } else if (!serverPreset.text) {
            serverPreset.text = serverRow.name;
          }

          cookies.cookies = {
            ...serverPreset,
            ...cookies.cookies,
          };
        }
      }
    } catch (err) {
      console.error('Error fetching server preset for RGBirdflop:', err);
    }
  }

  return cookies;
});

export default component$(() => {
  const t = inlineTranslate();
  const useCookiesValue = useRGBCookies().value;
  const { cookies: rgbCookies, errors } = useCookiesValue;

  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true }
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  return (
    <RGBirdflop errors={errors} output={generateOutput(rgbStore)}>
      <h1
        class="my-2 flex items-center gap-3 text-2xl font-extrabold"
        q:slot="header"
      >
        <Palette size={32} />
        {t('nav.resources.hexGradient.title@@RGBirdflop')}
      </h1>
      <p class="text-lum-text-secondary mb-2" q:slot="header">
        {t(
          'nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.'
        )}
      </p>

      {showAllGradients.value ? (
        <AllGradientsPreview
          q:slot="input"
          showSelection
          shadowLength={previewStyle.value == 'default' ? 4 : 2}
        />
      ) : (
        <RgbPreview
          q:slot="input"
          showSelection
          shadowLength={previewStyle.value == 'default' ? 4 : 2}
        />
      )}
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description:
    'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
});
