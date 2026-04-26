import { useEffect, useState } from 'react';
import type { NewsItem } from '@/lib/news-types';

// Lehengo gakoa mantentzen dugu: lehen 'gordeak/bookmark' zen,
// orain 'gustukoak/like' kontzeptua da. Datu egitura berbera (item snapshot-ak).
const KEY = 'archaeo:saved-items';

/**
 * Gustukoen (Like) kudeaketa: ID-ak ETA item osoaren snapshot-a localStorage-en.
 * Iturria news.json-etik desagertu arren, gustukoa zerrendan agertzen jarraituko da.
 */
export function useLikedItems() {
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

  const isLiked = (id: string) => Object.prototype.hasOwnProperty.call(items, id);

  const add = (item: NewsItem) =>
    setItems((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: item }));

  const remove = (id: string) =>
    setItems((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const likedList = (): NewsItem[] => Object.values(items);
  const size = Object.keys(items).length;

  return { isLiked, add, remove, likedList, size };
}
