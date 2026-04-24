import { useEffect, useState } from 'react';
import type { NewsFeed, NewsItem } from '@/lib/news-types';

/**
 * news.json-en jatorria.
 *
 * GitHub Raw URL bat ezarriz gero, app argitaratutik zuzenean
 * GitHub-eko azken bertsioa kargatuko da, eta ez dago app-a
 * berriro publikatu beharrik news.json eguneratzen den bakoitzean.
 *
 * Konfiguratzeko: ezarri `VITE_NEWS_JSON_URL` aldagaia `.env`-en, adib.:
 *   VITE_NEWS_JSON_URL=https://raw.githubusercontent.com/USER/REPO/main/public/news.json
 *
 * Hutsik utziz gero, app-aren `/news.json` lokala kargatuko du (build denborakoa).
 */
const REMOTE_NEWS_URL = import.meta.env.VITE_NEWS_JSON_URL as string | undefined;

/**
 * news.json kargatzeko eta legacy gogokoen migrazioa egiteko hook-a.
 */
export function useNewsFeed() {
  const [feed, setFeed] = useState<NewsFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const cacheBuster = `ts=${Date.now()}`;
    const remote = REMOTE_NEWS_URL?.trim();
    const primaryUrl = remote
      ? `${remote}${remote.includes('?') ? '&' : '?'}${cacheBuster}`
      : `/news.json?${cacheBuster}`;
    const fallbackUrl = `/news.json?${cacheBuster}`;

    const fetchJson = async (url: string) => {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error(`Ezin izan da news.json kargatu (${r.status})`);
      return (await r.json()) as NewsFeed;
    };

    fetchJson(primaryUrl)
      .catch((e) => {
        // Remote-ak huts egiten badu (sarea, GitHub down, etab.), erori atzera bertsio lokalera.
        if (remote && primaryUrl !== fallbackUrl) {
          console.warn('Urruneko news.json-ek huts egin du, lokala kargatzen:', e);
          return fetchJson(fallbackUrl);
        }
        throw e;
      })
      .then((data: NewsFeed) => {
        if (!active) return;
        setFeed(data);
        setError(null);

        // Migrazioa: lehengo `archaeo:saved` (ID-en Set) → `archaeo:saved-items` (item osoak).
        try {
          const legacy = localStorage.getItem('archaeo:saved');
          if (legacy) {
            const ids: string[] = JSON.parse(legacy);
            const stored = JSON.parse(localStorage.getItem('archaeo:saved-items') || '{}');
            const map = new Map<string, NewsItem>(Object.entries(stored));
            for (const it of data.items) {
              if (ids.includes(it.id) && !map.has(it.id)) map.set(it.id, it);
            }
            localStorage.setItem('archaeo:saved-items', JSON.stringify(Object.fromEntries(map)));
            localStorage.removeItem('archaeo:saved');
            window.location.reload();
          }
        } catch {
          // ignore
        }
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { feed, loading, error };
}
