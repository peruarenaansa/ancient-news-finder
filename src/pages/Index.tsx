import { useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsHeader } from '@/components/NewsHeader';
import { NewsFilters } from '@/components/NewsFilters';
import { NewsList } from '@/components/NewsList';
import { useNewsFeed } from '@/hooks/use-news-feed';
import { useNewsFilters } from '@/hooks/use-news-filters';
import { useLocalStorageSet } from '@/hooks/use-local-storage-set';
import { useLikedItems } from '@/hooks/use-liked-items';
import { useBookmarkedItems } from '@/hooks/use-bookmarked-items';
import { normalizeText } from '@/lib/normalize-text';
import type { NewsItem, NewsLang, NewsRegion } from '@/lib/news-types';

const Index = () => {
  const { feed, loading, error } = useNewsFeed();
  const { filters, update, reset, isFiltered } = useNewsFilters();
  const { query, region, lang, view } = filters;

  const liked = useLikedItems();
  const bookmarked = useBookmarkedItems();
  const { set: read, add: markRead, toggle: toggleReadRaw } = useLocalStorageSet('archaeo:read');

  // Egoera esklusiboak: bookmark, like, eta "irakurri-soilik" hiruretako bat bakarrik.
  // Bookmark eta Like-k bata bestea kentzen dute, eta biek "irakurrita" markatzen dute.

  const onToggleLike = (item: NewsItem) => {
    if (liked.isLiked(item.id)) {
      liked.remove(item.id);
    } else {
      liked.add(item);
      bookmarked.remove(item.id); // esklusiboa
      markRead(item.id);
    }
  };

  const onToggleBookmark = (item: NewsItem) => {
    if (bookmarked.isBookmarked(item.id)) {
      bookmarked.remove(item.id);
    } else {
      bookmarked.add(item);
      liked.remove(item.id); // esklusiboa
      markRead(item.id);
    }
  };

  const onToggleRead = (id: string) => {
    if (read.has(id)) {
      // Jada irakurrita: kendu marka → irakurri gabera itzuliko da
      toggleReadRaw(id);
    } else {
      // Irakurritzat markatu: gordetakoetatik eta gustukoetatik kendu,
      // eta irakurritakoen zerrendara pasatu (esklusiboki).
      liked.remove(id);
      bookmarked.remove(id);
      markRead(id);
    }
  };

  const setFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    update({ [key]: value } as Partial<typeof filters>);
  };

  // Albiste guztien iturri bateratua: feed berria + bookmark/like-en snapshot-ak
  // (iturritik desagertu arren, mantendu egiten dira).
  const allItems = useMemo(() => {
    const byId = new Map<string, NewsItem>();
    for (const it of bookmarked.list()) byId.set(it.id, it);
    for (const it of liked.likedList()) byId.set(it.id, it);
    if (feed) for (const it of feed.items) byId.set(it.id, it);
    return [...byId.values()];
  }, [feed, liked, bookmarked]);

  // Ikuspegi bakoitzeko zenbatekoak (iragazki-aurrekoak)
  const viewCounts = useMemo(() => {
    let unread = 0,
      readN = 0;
    for (const it of allItems) {
      const isLiked = liked.isLiked(it.id);
      const isBm = bookmarked.isBookmarked(it.id);
      const isRead = read.has(it.id);
      if (!isLiked && !isBm && !isRead) unread++;
      if (isRead && !isLiked && !isBm) readN++;
    }
    return {
      unread,
      read: readN,
      bookmark: bookmarked.size,
      liked: liked.size,
    };
  }, [allItems, liked, bookmarked, read]);

  // Ikuspegi aktiboaren oinarri-zerrenda
  const baseScope = useMemo(() => {
    return allItems.filter((it) => {
      const isLiked = liked.isLiked(it.id);
      const isBm = bookmarked.isBookmarked(it.id);
      const isRead = read.has(it.id);
      switch (view) {
        case 'unread':
          return !isLiked && !isBm && !isRead;
        case 'read':
          return isRead && !isLiked && !isBm;
        case 'bookmark':
          return isBm;
        case 'liked':
          return isLiked;
      }
    });
  }, [allItems, view, liked, bookmarked, read]);

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
    if (region !== 'all' || query || lang !== 'all' || view !== 'unread') {
      return [...filtered].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    }
    return [...filtered].sort((a, b) => {
      if (a.region === 'basque' && b.region !== 'basque') return -1;
      if (b.region === 'basque' && a.region !== 'basque') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [filtered, region, query, lang, view]);

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

  const VIEW_LABELS: Record<typeof view, string> = {
    unread: 'irakurri gabe',
    read: 'irakurrita',
    bookmark: 'bookmark-ean',
    liked: 'gustukoetan',
  };

  return (
    <div className="min-h-screen bg-background">
      <NewsHeader generatedAt={generatedDate} count={feed?.count} />

      <NewsFilters
        query={query}
        region={region}
        lang={lang}
        view={view}
        unreadCount={viewCounts.unread}
        readCount={viewCounts.read}
        bookmarkCount={viewCounts.bookmark}
        likedCount={viewCounts.liked}
        regionCounts={regionCounts}
        availableLangs={availableLangs}
        onChangeQuery={(v) => setFilter('query', v)}
        onChangeRegion={(v) => setFilter('region', v)}
        onChangeLang={(v) => setFilter('lang', v)}
        onChangeView={(v) => setFilter('view', v)}
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

        {!loading && !error && allItems.length === 0 && (
          <div className="rounded-lg border border-dashed bg-card p-10 text-center">
            <h2 className="font-display text-xl font-semibold">Oraindik ez dago albisterik</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Iturri-jarioak ez dira oraindik bildu. Saiatu berriro minutu batzuk barru.
            </p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <>
            <div
              className="mb-3 flex items-center justify-between text-xs text-muted-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              <span>
                {sorted.length} albiste {VIEW_LABELS[view]}
              </span>
              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={() => reset()}>
                  <RefreshCw className="mr-1 h-3 w-3" aria-hidden="true" /> Garbitu iragazkiak
                </Button>
              )}
            </div>

            <NewsList
              items={sorted}
              isLiked={liked.isLiked}
              isBookmarked={bookmarked.isBookmarked}
              isRead={(id) => read.has(id)}
              onToggleLike={onToggleLike}
              onToggleBookmark={onToggleBookmark}
              onToggleRead={onToggleRead}
              onMarkRead={markRead}
            />
          </>
        )}

        {!loading && !error && allItems.length > 0 && sorted.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              Ez dago bat datorren albisterik {VIEW_LABELS[view]}.
            </p>
            {isFiltered && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => reset()}>
                Garbitu iragazkiak
              </Button>
            )}
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
