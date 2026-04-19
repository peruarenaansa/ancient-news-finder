import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { NewsCard } from '@/components/NewsCard';
import type { NewsItem } from '@/lib/news-types';

interface Props {
  items: NewsItem[];
  isLiked: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  isRead: (id: string) => boolean;
  onToggleLike: (item: NewsItem) => void;
  onToggleBookmark: (item: NewsItem) => void;
  onToggleRead: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export function NewsList({
  items,
  isLiked,
  isBookmarked,
  isRead,
  onToggleLike,
  onToggleBookmark,
  onToggleRead,
  onMarkRead,
}: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Neurri finkoa erabiltzen dugu (gutxi gorabeherakoa baino), pilaketa-arazoak
  // ekiditeko: measureElement-en cache zaharrak offset oker uzten zituen item-ak
  // kentzean. Estimazio finkoa = posizio determinista beti.
  const ITEM_HEIGHT_DESKTOP = 180;
  const ITEM_HEIGHT_MOBILE = 240;

  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () =>
      typeof window !== 'undefined' && window.innerWidth < 640
        ? ITEM_HEIGHT_MOBILE
        : ITEM_HEIGHT_DESKTOP,
    overscan: 5,
    getScrollElement: () => parentRef.current,
    observeElementOffset: (instance, cb) => {
      const onScroll = () => {
        if (!parentRef.current) return;
        const rect = parentRef.current.getBoundingClientRect();
        cb(-rect.top, false);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    },
    observeElementRect: (_instance, cb) => {
      const onResize = () => {
        cb({ width: window.innerWidth, height: window.innerHeight });
      };
      onResize();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    },
    scrollToFn: (offset) => {
      if (!parentRef.current) return;
      const rect = parentRef.current.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + rect.top + offset, behavior: 'auto' });
    },
  });

  useEffect(() => {
    virtualizer.measure();
  }, [items.length, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div ref={parentRef} className="relative w-full">
      <ul
        role="list"
        className="relative"
        style={{ height: `${totalSize}px` }}
      >
        {virtualItems.map((vRow) => {
          const item = items[vRow.index];
          if (!item) return null;
          return (
            <li
              key={item.id}
              data-index={vRow.index}
              className="absolute left-0 right-0 pb-3"
              style={{
                top: 0,
                height: `${vRow.size}px`,
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              <NewsCard
                item={item}
                liked={isLiked(item.id)}
                bookmarked={isBookmarked(item.id)}
                read={isRead(item.id)}
                onToggleLike={() => onToggleLike(item)}
                onToggleBookmark={() => onToggleBookmark(item)}
                onToggleRead={() => onToggleRead(item.id)}
                onMarkRead={() => onMarkRead(item.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
