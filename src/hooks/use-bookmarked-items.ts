import { useEffect, useState } from 'react';
import type { NewsItem } from '@/lib/news-types';

const KEY = 'archaeo:bookmarked-items';

/**
 * Bookmark (gero irakurtzeko) kudeaketa: item osoaren snapshot-a localStorage-en.
 * Like eta Bookmark esklusiboak dira: ez dute aldi berean koexistitzen.
 */
export function useBookmarkedItems() {
  const [items, setItems] = useState<Record<string, NewsItem>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
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

  const isBookmarked = (id: string) => Object.prototype.hasOwnProperty.call(items, id);

  const add = (item: NewsItem) =>
    setItems((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: item }));

  const remove = (id: string) =>
    setItems((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const toggle = (item: NewsItem) =>
    setItems((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });

  const list = (): NewsItem[] => Object.values(items);
  const size = Object.keys(items).length;

  return { isBookmarked, add, remove, toggle, list, size };
}
