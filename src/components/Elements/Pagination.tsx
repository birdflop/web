import { component$, type QRL } from '@qwik.dev/core';
import ChevronLeft from 'lucide-icons-qwik/icons/ChevronLeft';
import ChevronRight from 'lucide-icons-qwik/icons/ChevronRight';
import { SelectMenu } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';

export interface PaginationProps {
  page: number;
  perPage?: number;
  totalPages: number;
  totalCount: number;
  rowsLength: number;
  updateURL: QRL<(params: Record<string, string | number | boolean>) => void>;
  itemLabel?: string;
  showPerPage?: boolean;
  perPageOptions?: number[];
}

export default component$<PaginationProps>(
  ({
    page,
    perPage,
    totalPages,
    totalCount,
    rowsLength,
    updateURL,
    itemLabel,
    showPerPage = true,
    perPageOptions = [10, 20, 50, 100],
  }) => {
    const t = inlineTranslate();
    const labelText = itemLabel ?? t('pagination.items@@items');

    return (
      <div class="relative my-2 flex flex-col items-center justify-between gap-2 p-1 sm:flex-row">
        <p class="text-lum-text-secondary lum-btn-p-1 text-center text-xs sm:text-left">
          {`${t('pagination.totalPrefix@@Total')} ${labelText}: ${rowsLength}/${totalCount}`}
          {totalPages > 1 &&
            ` - ${t('pagination.pageInfo@@Page ')}${page} ${t('pagination.of@@of')} ${totalPages}`}
        </p>
        <div class="flex flex-1 items-center justify-center gap-2">
          <button
            class="lum-btn rounded-lum-1 p-1"
            disabled={page <= 1}
            title={t('pagination.previous@@Previous')}
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
            disabled={page >= totalPages}
            onClick$={() => {
              void updateURL({ page: Math.min(totalPages, page + 1) });
            }}
            title={t('pagination.next@@Next')}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {showPerPage && perPage !== undefined && (
          <div class="flex items-center justify-center gap-2 sm:justify-end">
            <p class="text-lum-text-secondary text-xs whitespace-nowrap">
              {t('pagination.perPage@@Per page:')}
            </p>
            <SelectMenu
              class="lum-btn-p-1 rounded-lum-1 lum-bg-transparent"
              value={perPage}
              onChange$={(e, el) => {
                const newPerPage = parseInt(el.value, 10);
                void updateURL({ perPage: newPerPage, page: 1 });
              }}
              title={t('pagination.perPageTitle@@Items per page')}
              values={perPageOptions.map((opt) => ({
                name: String(opt),
                value: String(opt),
              }))}
            />
          </div>
        )}
      </div>
    );
  }
);
