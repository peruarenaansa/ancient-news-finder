import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { NewsCard } from '@/components/NewsCard';
import type { NewsItem } from '@/lib/news-types';

interface Props {
  items: NewsItem[];
  isLiked: (id: string) => boolean;
  isRead: (id: string) => boolean;
  onToggleLike: (item: NewsItem) => void;
  onToggleRead: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export function NewsList({ items, isLiked, isRead, onToggleLike, onToggleRead, onMarkRead }: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => 168,
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
    virtualizer.measurementsCache = [];
    virtualizer.measure();
  }, [items, virtualizer]);

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
              ref={virtualizer.measureElement}
              className="absolute left-0 right-0 pb-3"
              style={{
                top: 0,
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              <NewsCard
                item={item}
                liked={isLiked(item.id)}
                read={isRead(item.id)}
                onToggleLike={() => onToggleLike(item)}
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
