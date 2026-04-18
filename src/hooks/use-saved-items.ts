import { useEffect, useState } from 'react';
import type { NewsItem } from '@/lib/news-types';

const KEY = 'archaeo:saved-items';

/**
 * Gogokoen kudeaketa: ID-ak ETA item osoaren snapshot-a gordetzen ditu localStorage-en.
 * Horrela, jatorrizko iturria news.json-etik desagertu arren (iturria kendu, ID aldatu...),
 * gogokoa zerrendan agertzen jarraituko da.
 */
export function useSavedItems() {
  const [items, setItems] = useState<Record<string, NewsItem>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Migrazioa: lehen Set<string> bat zen `archaeo:saved` gakoan
      if (Array.isArray(parsed)) return {};
      return parsed as Record<string, NewsItem>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const isSaved = (id: string) => Object.prototype.hasOwnProperty.call(items, id);

  const toggle = (item: NewsItem) =>
    setItems((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });

  const savedList = (): NewsItem[] => Object.values(items);
  const size = Object.keys(items).length;

  return { isSaved, toggle, savedList, size };
}
