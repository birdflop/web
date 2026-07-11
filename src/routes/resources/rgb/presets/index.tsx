import {
  $,
  component$,
  createContextId,
  QRL,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession } from '~/routes/plugin@auth';
import { getPresets, rgbPreset } from '~/util/rgb/presets';
import { SelectMenuRaw, Toggle } from '@luminescent/ui-qwik';
import PresetPreview from '~/components/rgbirdflop/presets/PresetPreview';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Search,
  Send,
  Settings,
} from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { Notification, NotificationContext } from '~/util/Notification';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { getCookies } from '~/util/dataUtils';

import {
  getDB,
  PresetPartial,
  presets,
  PublicPreset,
  savedPresets,
  users,
} from '~/util/db';
import { and, count, desc, eq, like, inArray, or } from 'drizzle-orm';
import MyPrivatePresets from '~/components/rgbirdflop/presets/MyPrivatePresets';
import { useIsAdmin } from '~/routes/layout';
import { donateLink } from '~/components/Elements/Nav';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';

export const usePresets = routeLoader$(async ({ url, sharedMap }) => {
  const session = sharedMap.get('session') as { user: { id: string } } | null;
  let publicPresets: PublicPreset[] = [];
  let presetCount = 0;
  const errors: string[] = [];

  const searchParams = url.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.max(
    1,
    Math.min(100, parseInt(searchParams.get('perPage') || '20', 10)),
  );
  const searchTerm = searchParams.get('search') || '';
  const showPending = searchParams.get('showPending') === 'true';
  const showSaved = searchParams.get('showSaved') === 'true';
  const savedPresetIds =
    searchParams
      .get('savedPresetIds')
      ?.split(',')
      .filter(Boolean)
      .map((id) => parseInt(id)) || [];
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  try {
    const db = getDB();
    if (!db) throw new Error('No database client');

    presetCount = await db
      .select({
        count: count(),
      })
      .from(presets)
      .where(
        and(
          eq(presets.pending, showPending),
          searchTerm ? like(presets.name, `%${searchTerm}%`) : undefined,
          showSaved && savedPresetIds.length > 0
            ? inArray(presets.id, savedPresetIds)
            : undefined,
        ),
      )
      .get()
      .then((r) => r?.count ?? 0);

    let orderBy;
    switch (sortBy) {
    case 'name':
      orderBy = sortOrder === 'desc' ? desc(presets.name) : presets.name;
      break;
    case 'saves':
      orderBy = sortOrder === 'desc' ? desc(presets.saves) : presets.saves;
      break;
    case 'createdAt':
    default:
      orderBy =
          sortOrder === 'desc' ? desc(presets.createdAt) : presets.createdAt;
      break;
    }

    const presetsFromDB = await db
      .select({
        presets,
        user: users,
      })
      .from(presets)
      .where(
        and(
          or(
            eq(presets.pending, showPending),
            session?.user?.id
              ? eq(presets.userId, session?.user?.id)
              : undefined,
          ),
          searchTerm ? like(presets.name, `%${searchTerm}%`) : undefined,
          showSaved && savedPresetIds.length > 0
            ? inArray(presets.id, savedPresetIds)
            : undefined,
        ),
      )
      .leftJoin(users, eq(users.id, presets.userId))
      .leftJoin(savedPresets, eq(savedPresets.presetId, presets.id))
      .groupBy(presets.id, users.id)
      .orderBy(orderBy)
      .limit(perPage)
      .offset((page - 1) * perPage)
      .then((r) => r ?? []);

    publicPresets = presetsFromDB.map(({ user, presets }) => ({
      ...presets,
      user,
    }));
  } catch (err) {
    errors.push(`Error fetching presets: ${err}`);
    console.error('Error fetching presets:', err);
  }
  return {
    publicPresets,
    presetCount,
    errors,
    page,
    perPage,
    searchTerm,
    showPending,
    showSaved,
    sortBy,
    sortOrder,
  };
});

export const useCookies = routeLoader$(({ cookie, url }) => {
  const cookies: {
    cookies: Partial<typeof rgbDefaults>;
    errors: string[];
  } = getCookies(cookie, 'rgb', url.searchParams);
  return cookies;
});

const Pagination = component$(
  ({
    page,
    perPage,
    totalPages,
    updateURL,
    presetCount,
    presetsLength,
  }: {
    page: number;
    perPage: number;
    totalPages: number;
    updateURL: QRL<(params: Record<string, string | number | boolean>) => void>;
    presetCount: number;
    presetsLength: number;
  }) => {
    const t = inlineTranslate();

    return (
      <div class="relative my-2 flex flex-col items-center justify-between gap-2 p-1 sm:flex-row">
        <p class="text-lum-text-secondary lum-btn-p-1 text-center text-xs sm:text-left">
          {`${t('rgb.presets.totalCount@@Total presets: ')}${presetsLength}/${presetCount}`}
          {totalPages > 1 &&
            ` - ${t('rgb.presets.pageInfo@@Page ')}${page} ${t('rgb.presets.pageInfo.of@@of')} ${totalPages}`}
        </p>
        <div class="flex flex-1 items-center justify-center gap-2">
          <button
            class="lum-btn rounded-lum-1 p-1"
            disabled={page === 1}
            title={t('rgb.presets.pagination.previous@@Previous')}
            onClick$={() => {
              void updateURL({ page: Math.max(1, page - 1) });
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div class="lum-card sm:lum-bg-transparent flex-row gap-1 p-1 sm:p-0">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  class={`lum-btn lum-btn-p-1 rounded-lum-1 min-w-8 justify-center ${
                    pageNum === page
                      ? 'lum-grad-bg-lum-accent/20'
                      : 'lum-bg-transparent'
                  }`}
                  onClick$={() => {
                    void updateURL({ page: pageNum });
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            class="lum-btn rounded-lum-1 p-1"
            disabled={page === totalPages}
            onClick$={() => {
              void updateURL({ page: Math.min(totalPages, page + 1) });
            }}
            title={t('rgb.presets.pagination.next@@Next')}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div class="flex items-center justify-center gap-2 sm:justify-end">
          <p class="whitespace-nowrap">
            {t('rgb.presets.pagination.perPage@@Per page:')}
          </p>
          <SelectMenuRaw
            class={{
              'lum-btn-p-1 rounded-lum-1 lum-bg-transparent': true,
            }}
            value={perPage}
            onChange$={(e, el) => {
              const newPerPage = parseInt(el.value, 10);
              void updateURL({ perPage: newPerPage, page: 1 });
            }}
            title="Items per page"
            values={[
              { name: '10', value: '10' },
              { name: '20', value: '20' },
              { name: '50', value: '50' },
              { name: '100', value: '100' },
            ]}
          />
        </div>
      </div>
    );
  },
);

export const privatePresetsContext = createContextId<Signal<rgbPreset[]>>(
  'privatepresets-context',
);
export const savedPresetsContext = createContextId<Signal<any[]>>(
  'savedpresets-context',
);
export default component$(() => {
  const t = inlineTranslate();
  const notifications = useContext(NotificationContext);
  const nav = useNavigate();

  const { cookies: rgbCookies, errors: rgbCookiesErrors } = useCookies().value;

  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true },
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const session = useSession();
  const {
    publicPresets,
    presetCount,
    errors: presetsErrors,
    page,
    perPage,
    searchTerm,
    showPending,
    showSaved,
    sortBy,
    sortOrder,
  } = usePresets().value;

  const isAdmin = useIsAdmin().value;

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const errors = [...rgbCookiesErrors, ...presetsErrors];
    if (errors.length > 0) {
      errors.forEach((error) => {
        const notification = new Notification()
          .setTitle('Error fetching presets')
          .setDescription(`${error}`)
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true);
        notifications.push(notification);
      });
    }
  });

  const presetStore = useStore({
    previewWithSettings: false,
  });

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // If privatePresets is empty, load presets from localStorage
    if (privatePresets.value.length != 0 || savedPresets.value.length != 0)
      return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const notification = new Notification()
        .setTitle('Error loading saved presets')
        .setDescription(`Error: ${err}`)
        .setBgColor('lum-grad-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    }
  });

  const privatePresetsParsed: PresetPartial[] = [];
  privatePresets.value.forEach((preset) => {
    const isunique = publicPresets.every((p) => {
      return JSON.stringify(p.preset) !== JSON.stringify(preset);
    });
    if (isunique) {
      privatePresetsParsed.push({
        name: preset.text ?? 'Saved Preset',
        preset: preset,
        pending: false,
        colorVector: null,
      });
    }
  });

  const totalPages = Math.ceil(presetCount / perPage);

  const updateURL = $((params: Record<string, string | number | boolean>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === false || (value === 1 && key === 'page')) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, String(value));
      }
    });
    if (params.showSaved || showSaved) {
      const savedIds = savedPresets.value.map((p) => p.id).join(',');
      if (savedIds) {
        url.searchParams.set('savedPresetIds', savedIds);
      } else {
        url.searchParams.delete('savedPresetIds');
      }
    } else {
      url.searchParams.delete('savedPresetIds');
    }
    void nav(url.pathname + url.search);
  });

  const searchTimeoutId = useSignal<number | undefined>(undefined);
  const debouncedSearch = $((searchValue: string) => {
    if (searchTimeoutId.value) {
      clearTimeout(searchTimeoutId.value);
    }
    searchTimeoutId.value = setTimeout(() => {
      void updateURL({ search: searchValue, page: 1 });
    }, 300) as unknown as number;
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <span class="flex flex-1 items-center gap-3">
          <Save size={32} />
          {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
        </span>
        <a href="#my-presets" class="lum-btn mr-auto font-normal">
          <Send size={20} /> {t('rgb.presets.publish@@Publish your own preset')}
        </a>
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.',
        )}
      </p>
      <div class="flex flex-col gap-2"></div>

      <div class="sm:lum-card mt-2 sm:flex-row sm:items-center sm:gap-1 sm:p-1">
        <div class="lum-card sm:lum-bg-transparent flex-1 flex-row items-center gap-1 p-1 sm:p-0">
          <Search size={20} class="mx-2" />
          <input
            class="lum-input rounded-lum-1 flex-1"
            id="search-input"
            placeholder="Search for a preset..."
            value={searchTerm}
            onInput$={(e, el) => void debouncedSearch(el.value)}
          />
        </div>
        <div class="flex items-center justify-center gap-1">
          <SelectMenuRaw
            value={`${sortBy}-${sortOrder}`}
            class={{
              'rounded-lum-1 lum-bg-transparent': true,
            }}
            onChange$={(e, el) => {
              const [newSortBy, newSortOrder] = el.value.split('-');
              void updateURL({
                sortBy: newSortBy,
                sortOrder: newSortOrder,
                page: 1,
              });
            }}
            title={t('rgb.presets.sortBy.title@@Sort by')}
            values={[
              {
                name: t('rgb.presets.sortBy.newest@@Newest first'),
                value: 'createdAt-desc',
              },
              {
                name: t('rgb.presets.sortBy.oldest@@Oldest first'),
                value: 'createdAt-asc',
              },
              {
                name: t('rgb.presets.sortBy.nameAZ@@Name A-Z'),
                value: 'name-asc',
              },
              {
                name: t('rgb.presets.sortBy.nameZA@@Name Z-A'),
                value: 'name-desc',
              },
              {
                name: t('rgb.presets.sortBy.mostSaved@@Most saved'),
                value: 'saves-desc',
              },
              {
                name: t('rgb.presets.sortBy.leastSaved@@Least saved'),
                value: 'saves-asc',
              },
            ]}
          />
          <SelectMenuRaw
            align="right"
            id="settings"
            class={{
              'rounded-lum-1 lum-bg-transparent p-3': true,
            }}
            panelClass="lum-grad-bg-lum-card-bg p-2 gap-2"
            customDropdown
          >
            <Settings q:slot="dropdown" size={16} />

            {isAdmin && (
              <Toggle
                id="showpendingpresets"
                q:slot="extra-buttons"
                checked={showPending && privatePresets.value.length > 0}
                onChange$={(e, el) =>
                  void updateURL({ showPending: el.checked, page: 1 })
                }
              >
                Show pending presets
              </Toggle>
            )}

            {savedPresets.value.length > 0 && (
              <div q:slot="extra-buttons">
                <Toggle
                  id="showsavedpresets"
                  disabled={savedPresets.value.length === 0}
                  checked={showSaved && savedPresets.value.length > 0}
                  onChange$={(e, el) =>
                    void updateURL({ showSaved: el.checked, page: 1 })
                  }
                >
                  <span class="whitespace-nowrap">
                    {t('rgb.presets.showSaved.title@@Show saved presets')}
                  </span>
                </Toggle>
                <p class="text-lum-text-secondary mt-1 text-xs">
                  {t(
                    'rgb.presets.showSaved.description@@Turn this on to show only your saved presets.',
                  )}
                </p>
              </div>
            )}
            <div q:slot="extra-buttons">
              <Toggle
                id="previewwithsettings"
                checked={presetStore.previewWithSettings}
                onChange$={(e, el) =>
                  (presetStore.previewWithSettings = el.checked)
                }
              >
                <span class="whitespace-nowrap">
                  {t(
                    'rgb.presets.withCurrentOptions.title@@Show preview with current options',
                  )}
                </span>
              </Toggle>
              <p class="text-lum-text-secondary mt-1 text-xs">
                {t(
                  'rgb.presets.withCurrentOptions.description@@Turn this on to show the previews with the current options applied.',
                )}
              </p>
            </div>
          </SelectMenuRaw>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          perPage={perPage}
          totalPages={totalPages}
          updateURL={updateURL}
          presetCount={presetCount}
          presetsLength={publicPresets.length}
        />
      )}
      <div class="grid gap-2 sm:grid-cols-2">
        {publicPresets.map((publicPreset) => (
          <PresetPreview
            key={`${publicPreset.name}-${publicPreset.author}`}
            Preset={publicPreset}
            defaults={presetStore.previewWithSettings ? rgbStore : undefined}
          />
        ))}
        {publicPresets.length === 0 && (
          <p class="text-lum-text-secondary col-span-full my-6 text-center">
            {t('rgb.presets.noResults@@No results found.')}
            <br />
            {t('rgb.presets.suggestion.one@@Think something is missing?')}
            <br />
            {t(
              'rgb.presets.suggestion.two@@publish your own preset at your profile page!',
            )}
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          page={page}
          perPage={perPage}
          totalPages={totalPages}
          updateURL={updateURL}
          presetCount={presetCount}
          presetsLength={publicPresets.length}
        />
      )}
      <MyPrivatePresets />

      <div class="mt-8 text-sm">
        RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
        gradient creator that generates hex formatted text. RGB Birdflop is a
        public resource developed by Birdflop, a 501(c)(3) nonprofit providing
        affordable and accessible hosting and public resources. If you would
        like to support our mission, please <a href={donateLink}>click here</a>{' '}
        to make a charitable donation, 100% tax-deductible in the US.
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Presets',
  description:
    'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop. ' +
    defaultDescription,
});
