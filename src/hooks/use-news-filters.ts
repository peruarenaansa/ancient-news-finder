import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { NewsLang, NewsRegion } from '@/lib/news-types';

export interface NewsFilters {
  query: string;
  region: NewsRegion | 'all';
  lang: NewsLang | 'all';
  showSavedOnly: boolean;
  showRead: boolean;
}

const DEFAULTS: NewsFilters = {
  query: '',
  region: 'all',
  lang: 'all',
  showSavedOnly: false,
  showRead: false,
};

/**
 * Iragazkien egoera URL-eko search params-ekin sinkronizatzen du.
 * Horrek partekatze eta atzera/aurrera nabigazioa ahalbidetzen ditu.
 */
export function useNewsFilters() {
  const [params, setParams] = useSearchParams();

  const filters: NewsFilters = useMemo(
    () => ({
      query: params.get('q') ?? DEFAULTS.query,
      region: (params.get('region') as NewsFilters['region']) || DEFAULTS.region,
      lang: (params.get('lang') as NewsFilters['lang']) || DEFAULTS.lang,
      showSavedOnly: params.get('saved') === '1',
      showRead: params.get('read') === '1',
    }),
    [params],
  );

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
          if ('showSavedOnly' in patch) apply('saved', '1', !patch.showSavedOnly);
          if ('showRead' in patch) apply('read', '1', !patch.showRead);
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
    filters.showSavedOnly ||
    filters.showRead;

  return { filters, update, reset, isFiltered };
}
