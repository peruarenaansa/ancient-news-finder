import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { NewsLang, NewsRegion } from '@/lib/news-types';

export type NewsView = 'unread' | 'read' | 'bookmark' | 'liked';

export interface NewsFilters {
  query: string;
  region: NewsRegion | 'all';
  lang: NewsLang | 'all';
  view: NewsView;
}

const DEFAULTS: NewsFilters = {
  query: '',
  region: 'all',
  lang: 'all',
  view: 'unread',
};

const VALID_VIEWS: NewsView[] = ['unread', 'read', 'bookmark', 'liked'];

/**
 * Iragazkien egoera URL-eko search params-ekin sinkronizatzen du.
 */
export function useNewsFilters() {
  const [params, setParams] = useSearchParams();

  const filters: NewsFilters = useMemo(() => {
    const rawView = params.get('view') as NewsView | null;
    const view = rawView && VALID_VIEWS.includes(rawView) ? rawView : DEFAULTS.view;
    return {
      query: params.get('q') ?? DEFAULTS.query,
      region: (params.get('region') as NewsFilters['region']) || DEFAULTS.region,
      lang: (params.get('lang') as NewsFilters['lang']) || DEFAULTS.lang,
      view,
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<NewsFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const apply = (key: string, value: string, isDefault: boolean) => {
            if (isDefault) next.delete(key);
            else next.set(key, value);
          };
          if ('query' in patch) apply('q', patch.query!, !patch.query);
          if ('region' in patch) apply('region', patch.region!, patch.region === 'all');
          if ('lang' in patch) apply('lang', patch.lang!, patch.lang === 'all');
          if ('view' in patch) apply('view', patch.view!, patch.view === DEFAULTS.view);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true });
  }, [setParams]);

  const isFiltered =
    filters.query !== '' ||
    filters.region !== 'all' ||
    filters.lang !== 'all' ||
    filters.view !== DEFAULTS.view;

  return { filters, update, reset, isFiltered };
}
