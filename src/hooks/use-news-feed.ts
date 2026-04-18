import { useEffect, useState } from 'react';
import type { NewsFeed, NewsItem } from '@/lib/news-types';

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
    fetch(`/news.json?ts=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error('Ezin izan da news.json kargatu');
        return r.json();
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
