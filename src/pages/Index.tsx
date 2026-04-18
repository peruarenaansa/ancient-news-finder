import { useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsHeader } from '@/components/NewsHeader';
import { NewsFilters } from '@/components/NewsFilters';
import { NewsCard } from '@/components/NewsCard';
import { useNewsFeed } from '@/hooks/use-news-feed';
import { useNewsFilters } from '@/hooks/use-news-filters';
import { useLocalStorageSet } from '@/hooks/use-local-storage-set';
import { useSavedItems } from '@/hooks/use-saved-items';
import { useState } from 'react';
import type { NewsItem, NewsLang, NewsRegion } from '@/lib/news-types';

const PAGE_SIZE = 25;

const Index = () => {
  const { feed, loading, error } = useNewsFeed();
  const { filters, update, reset, isFiltered } = useNewsFilters();
  const { query, region, lang, showSavedOnly, showRead } = filters;
  const [page, setPage] = useState(1);

  const { isSaved, toggle: toggleSaved, savedList, size: savedSize } = useSavedItems();
  const { set: read, add: markRead, addMany: markManyRead } = useLocalStorageSet('archaeo:read');

  const setFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    update({ [key]: value } as Partial<typeof filters>);
  };

  const baseScope = useMemo(() => {
    if (!feed) return [] as NewsItem[];
    if (showSavedOnly) {
      const stored = savedList();
      const byId = new Map<string, NewsItem>();
      for (const it of stored) byId.set(it.id, it);
      for (const it of feed.items) if (byId.has(it.id)) byId.set(it.id, it);
      return [...byId.values()].filter((it) => isSaved(it.id));
    }
    if (!showRead) {
      return feed.items.filter((it) => !read.has(it.id));
    }
    return feed.items;
  }, [feed, showSavedOnly, showRead, isSaved, savedList, read]);

  const filtered = useMemo(() => {
    const q = normalizeText(query.trim());
    return baseScope.filter((it) => {
      if (region !== 'all' && it.region !== region) return false;
      if (lang !== 'all' && it.lang !== lang) return false;
      if (q) {
        const hay = normalizeText(`${it.title} ${it.summary} ${it.source.name}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [baseScope, query, region, lang]);

  const sorted = useMemo(() => {
    if (region !== 'all' || query || lang !== 'all' || showSavedOnly) {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      if (a.region === 'basque' && b.region !== 'basque') return -1;
      if (b.region === 'basque' && a.region !== 'basque') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [filtered, region, query, lang, showSavedOnly]);


  const hiddenReadCount = useMemo(() => {
    if (!feed || showRead || showSavedOnly) return 0;
    return feed.items.filter((it) => read.has(it.id)).length;
  }, [feed, read, showRead, showSavedOnly]);

  const langCounts = useMemo(() => {
    const counts = new Map<NewsLang, number>();
    for (const it of baseScope) {
      if (region !== 'all' && it.region !== region) continue;
      counts.set(it.lang, (counts.get(it.lang) ?? 0) + 1);
    }
    return counts;
  }, [baseScope, region]);

  const availableLangs = useMemo(
    () =>
      [...langCounts.entries()]
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count),
    [langCounts],
  );

  const regionCounts = useMemo(() => {
    const counts = new Map<NewsRegion, number>();
    for (const it of baseScope) {
      if (lang !== 'all' && it.lang !== lang) continue;
      counts.set(it.region, (counts.get(it.region) ?? 0) + 1);
    }
    return counts;
  }, [baseScope, lang]);

  const generatedDate = feed
    ? new Date(feed.generatedAt).toLocaleString('eu-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const resetFilters = () => {
    reset();
    setPage(1);
  };

  const allVisibleAlreadyRead = sorted.length > 0 && sorted.every((it) => read.has(it.id));

  return (
    <div className="min-h-screen bg-background">
      <NewsHeader generatedAt={generatedDate} count={feed?.count} />

      <NewsFilters
        query={query}
        region={region}
        lang={lang}
        showSavedOnly={showSavedOnly}
        showRead={showRead}
        savedSize={savedSize}
        hiddenReadCount={hiddenReadCount}
        regionCounts={regionCounts}
        availableLangs={availableLangs}
        totalSorted={sorted.length}
        allVisibleAlreadyRead={allVisibleAlreadyRead}
        onChangeQuery={(v) => setFilter('query', v)}
        onChangeRegion={(v) => setFilter('region', v)}
        onChangeLang={(v) => setFilter('lang', v)}
        onToggleSaved={() => setFilter('showSavedOnly', !showSavedOnly)}
        onToggleShowRead={() => setFilter('showRead', !showRead)}
        onMarkAllRead={() => markManyRead(sorted.map((it) => it.id))}
      />

      <main className="container max-w-5xl py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground" role="status">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            Albisteak kargatzen...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
            <p className="font-medium text-destructive">Errorea: {error}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Saiatu berriro geroago. Iturrien jario automatikoak agian eguneratzen ari dira.
            </p>
          </div>
        )}

        {!loading && !error && feed && feed.items.length === 0 && (
          <div className="rounded-lg border border-dashed bg-card p-10 text-center">
            <h2 className="font-display text-xl font-semibold">Oraindik ez dago albisterik</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Iturri-jarioak ez dira oraindik bildu. Saiatu berriro minutu batzuk barru.
            </p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            <div
              className="mb-3 flex items-center justify-between text-xs text-muted-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              <span>
                {sorted.length} albiste {showSavedOnly ? 'gordeta' : 'iragazi ondoren'}
                {!showRead && !showSavedOnly && hiddenReadCount > 0 && (
                  <> · {hiddenReadCount} irakurri ezkutatuta</>
                )}
              </span>
              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <RefreshCw className="mr-1 h-3 w-3" aria-hidden="true" /> Garbitu iragazkiak
                </Button>
              )}
            </div>

            <ul className="space-y-3" role="list">
              {visible.map((item) => (
                <li key={item.id}>
                  <NewsCard
                    item={item}
                    saved={isSaved(item.id)}
                    read={read.has(item.id)}
                    onToggleSave={() => toggleSaved(item)}
                    onMarkRead={() => markRead(item.id)}
                  />
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                  Gehiago kargatu
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && !error && feed && feed.items.length > 0 && visible.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              Ez dago bat datorren albisterik.
              {!showRead && !showSavedOnly && hiddenReadCount > 0 && (
                <> Agian denak irakurrita daude — sakatu "Erakutsi irakurriak".</>
              )}
            </p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={resetFilters}>
              Garbitu iragazkiak
            </Button>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="container max-w-5xl text-center text-xs text-muted-foreground">
          Iturri publikoen RSS jarioetatik bildua · Eskubide guztiak jatorrizko hedabideenak dira
        </div>
      </footer>
    </div>
  );
};

export default Index;
