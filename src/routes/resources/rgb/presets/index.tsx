import {
  $,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession } from '~/routes/plugin@auth';
import {
  getPresets,
  rgbPreset,
} from '~/util/rgb/presets';
import { SelectMenu, SelectMenuRaw, Toggle } from '@luminescent/ui-qwik';
import PresetPreview from '~/components/Rgbirdflop/PresetPreview';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Search,
  Send,
} from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { NotificationContext } from '~/routes/layout';
import { rgbDefaults } from '~/util/rgb/presets/defaults';
import { rgbStoreContext } from '..';
import { getCookies } from '~/util/dataUtils';

import { getDB, PresetPartial, presets, PublicPreset, savedPresets, users } from '~/util/db';
import { and, count, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import MyPrivatePresets from '~/components/Rgbirdflop/MyPrivatePresets';

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
    searchParams.get('savedPresetIds')?.split(',').filter(Boolean).map((id) => parseInt(id)) || [];
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  try {
    const db = getDB();
    if (!db) throw new Error('No database client');

    presetCount = await db.select({
      count: count(),
    })
      .from(presets)
      .where(and(
        eq(presets.pending, showPending),
        searchTerm ? ilike(presets.name, searchTerm) : undefined,
        showSaved && savedPresetIds.length > 0
          ? inArray(presets.id, savedPresetIds)
          : undefined,
      ))
      .get()
      .then((r) => r?.count ?? 0);

    let orderBy;
    switch (sortBy) {
    case 'name':
      orderBy = presets.name;
      break;
    case 'createdAt':
    default:
      orderBy = presets.createdAt;
      break;
    }

    const presetsFromDB = await db.select({
      presets, user: users,
      saveCount: sql<number>`COUNT(${savedPresets.userId})`.as('saveCount'),
    })
      .from(presets)
      .where(and(
        or(
          eq(presets.pending, showPending),
          session?.user?.id ? eq(presets.userId, session?.user?.id) : undefined,
        ),
        searchTerm ? ilike(presets.name, searchTerm) : undefined,
        showSaved && savedPresetIds.length > 0
          ? inArray(presets.id, savedPresetIds)
          : undefined,
      ))
      .leftJoin(users, eq(users.id, presets.userId))
      .leftJoin(savedPresets, eq(savedPresets.presetId, presets.id))
      .groupBy(presets.id, users.id)
      .orderBy(orderBy)
      .limit(perPage)
      .offset((page - 1) * perPage)
      .then((r) => r ?? []);

    publicPresets = presetsFromDB.map(({ user, presets, saveCount }) => ({
      ...presets, user, saveCount,
    }));

  } catch (err) {
    errors.push(`Error fetching presets: ${err}`);
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
  return getCookies(cookie, 'rgb', url.searchParams) as {
    cookies: Partial<typeof rgbDefaults>;
    errors: string[];
  };
});

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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const errors = [...rgbCookiesErrors, ...presetsErrors];
    if (errors.length > 0) {
      errors.forEach((error) => {
        const id = Math.random().toString(36).substring(2, 15);
        const notification = {
          id,
          title: 'Error fetching presets',
          description: `${error}`,
          bgColor: 'lum-bg-red/50',
        };
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
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error parsing saved presets',
        description: `Error: ${err}`,
        bgColor: 'lum-bg-red/50',
      };
      notifications.push(notification);
      setTimeout(() => {
        notifications.splice(
          notifications.findIndex((n) => n?.id === id),
          1,
        );
      }, 2000);
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
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-[60px] w-full">
        <h1 class="sm:flex items-center my-3!">
          <span class="flex flex-1 gap-4 items-center">
            <Save size={70} />
            {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
          </span>
          <SelectMenuRaw
            id="hidden-select-menu"
            customDropdown
            class={{ 'opacity-0': true }}
          >
            <Toggle
              id="showpendingpresets"
              q:slot="extra-buttons"
              checked={showPending && privatePresets.value.length > 0}
              onChange$={(e, el) =>
                void updateURL({ showPending: el.checked, page: 1 })
              }
            >
              <span class="text-sm whitespace-nowrap">
                {t('rgb.presets.showPending.title@@Show pending presets (VERY DANGEROUS)')}
              </span>
            </Toggle>
          </SelectMenuRaw>
          <a href="#my-presets" class="lum-btn font-normal">
            <Send size={20} /> {t('rgb.presets.publish@@Publish your own preset')}
          </a>
        </h1>
        <p>
          {t(
            'nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.',
          )}
        </p>
        <hr />
        <div
          class={{
            'mb-2': true,
            'opacity-50': savedPresets.value.length === 0,
          }}
        >
          <Toggle
            id="showsavedpresets"
            disabled={savedPresets.value.length === 0}
            checked={showSaved && savedPresets.value.length > 0}
            onChange$={(e, el) =>
              void updateURL({ showSaved: el.checked, page: 1 })
            }
          >
            {t('rgb.presets.showSaved.title@@Show saved presets')}
          </Toggle>
          <p class="text-xs text-lum-text-secondary mt-1">
            {t(
              'rgb.presets.showSaved.description@@Turn this on to show only your saved presets.',
            )}
          </p>
        </div>
        <Toggle
          id="previewwithsettings"
          checked={presetStore.previewWithSettings}
          onChange$={(e, el) => (presetStore.previewWithSettings = el.checked)}
        >
          {t('rgb.presets.withCurrentOptions.title@@Show preview with current options')}
        </Toggle>
        <p class="text-xs text-lum-text-secondary mt-1">
          {t('rgb.presets.withCurrentOptions.description@@Turn this on to show the previews with the current options applied.')}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 px-2 items-start sm:items-center">
          <div class="flex gap-4 items-center flex-1 w-full">
            <Search size={20} class="shrink-0" />
            <input
              class="lum-input w-full my-4"
              id="search-input"
              placeholder="Search for a preset..."
              value={searchTerm}
              onInput$={(e, el) => void debouncedSearch(el.value)}
            />
          </div>
          <div class="flex gap-2 items-center">
            <SelectMenu
              value={`${sortBy}-${sortOrder}`}
              onChange$={(e, el) => {
                const [newSortBy, newSortOrder] = el.value.split('-');
                void updateURL({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
              }}
              title={t('rgb.presets.sortBy.title@@Sort by')}
              values = {[
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
              ]}
            />
          </div>
        </div>
        <div>
          <p class="text-xs text-lum-text-secondary mb-1">
            {t('rgb.presets.totalCount@@Total presets: ') +
              publicPresets.length +
              ' / ' +
              presetCount}
            {totalPages > 1 && (
              <span class="ml-2">
                {t('rgb.presets.pageInfo@@Page ') + page + ' of ' + totalPages}
              </span>
            )}
          </p>
        </div>

        {totalPages > 1 && (
          <div class="flex items-center gap-2 my-4 relative">
            <div class="flex justify-center items-center gap-2 flex-1">
              <button
                class="lum-btn lum-btn-sm"
                disabled={page === 1}
                onClick$={() => {
                  void updateURL({ page: Math.max(1, page - 1) });
                }}
              >
                <ChevronLeft size={16} />
                {t('rgb.presets.pagination.previous@@Previous')}
              </button>

              <div class="flex gap-1">
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
                      class={`lum-btn lum-btn-sm min-w-10 ${
                        pageNum === page
                          ? 'lum-bg-lum-primary text-white'
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
                class="lum-btn lum-btn-sm"
                disabled={page === totalPages}
                onClick$={() => {
                  void updateURL({ page: Math.min(totalPages, page + 1) });
                }}
              >
                {t('rgb.presets.pagination.next@@Next')}
                <ChevronRight size={16} />
              </button>
            </div>

            <div class="flex gap-2 items-center absolute right-0">
              <span class="text-sm text-lum-text-secondary whitespace-nowrap">
                {t('rgb.presets.pagination.perPage@@Per page:')}
              </span>
              <SelectMenu
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
        )}
        <div class="grid sm:grid-cols-2 gap-2">
          {publicPresets.map((publicPreset) => (
            <PresetPreview
              key={`${publicPreset.name}-${publicPreset.author}`}
              Preset={publicPreset}
              defaults={presetStore.previewWithSettings ? rgbStore : undefined}
            />
          ))}
          {publicPresets.length === 0 && (
            <div class="lum-card col-span-2 lum-bg-lum-input-bg/40 hover:lum-bg-lum-input-bg w-full transition duration-1000 hover:duration-75 ease-out">
              <p class="text-center text-lum-text-secondary">
                {t('rgb.presets.noResults@@No results found.')}
                <br />
                {t('rgb.presets.suggestion.one@@Think something is missing?')}
                <br />
                {t('rgb.presets.suggestion.two@@publish your own preset at your profile page!')}
              </p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div class="flex items-center gap-2 my-4 relative">
            <div class="flex justify-center items-center gap-2 flex-1">
              <button
                class="lum-btn lum-btn-sm"
                disabled={page === 1}
                onClick$={() => {
                  void updateURL({ page: Math.max(1, page - 1) });
                }}
              >
                <ChevronLeft size={16} />
                {t('rgb.presets.pagination.previous@@Previous')}
              </button>

              <div class="flex gap-1">
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
                      class={`lum-btn lum-btn-sm min-w-10 ${
                        pageNum === page
                          ? 'lum-bg-lum-primary text-white'
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
                class="lum-btn lum-btn-sm"
                disabled={page === totalPages}
                onClick$={() => {
                  void updateURL({ page: Math.min(totalPages, page + 1) });
                }}
              >
                {t('rgb.presets.pagination.next@@Next')}
                <ChevronRight size={16} />
              </button>
            </div>

            <div class="flex gap-2 items-center absolute right-0">
              <span class="text-sm text-lum-text-secondary whitespace-nowrap">
                {t('rgb.presets.pagination.perPage@@Per page:')}
              </span>
              <SelectMenu
                value={perPage.toString()}
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
        )}
        <MyPrivatePresets />

        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
          gradient creator that generates hex formatted text. RGB Birdflop is a
          public resource developed by Birdflop, a 501(c)(3) nonprofit providing
          affordable and accessible hosting and public resources. If you would
          like to support our mission, please{' '}
          <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">
            click here
          </a>{' '}
          to make a charitable donation, 100% tax-deductible in the US.
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Presets',
  description:
    'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop. ' +
    defaultDescription,
  ads: true,
});