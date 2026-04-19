import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { NewsCard } from '@/components/NewsCard';
import type { NewsItem } from '@/lib/news-types';

interface Props {
  items: NewsItem[];
  isSaved: (id: string) => boolean;
  isRead: (id: string) => boolean;
  onToggleSave: (item: NewsItem) => void;
  onMarkRead: (id: string) => void;
}

/**
 * Birtualizatutako albiste-zerrenda: ikusgai dauden txartelak soilik errendatzen ditu,
 * 100+ albisteko zerrendetan errendimendua nabarmen hobetuz.
 *
 * `window`-aren scroll-a erabiltzen du, mantenduz lehengo UX-a.
 */
export function NewsList({ items, isSaved, isRead, onToggleSave, onMarkRead }: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    // Albiste bakoitzaren altuera estimatua (px). Benetakoa neurtu egiten da gero.
    estimateSize: () => 168,
    // 5 elementu gehiago errendatu ikusgaiaren gainetik/azpitik scroll leuna izateko.
    overscan: 5,
    getScrollElement: () => parentRef.current,
    // window scroll erabili, ez container-ena, sticky goiburuak ondo lan dezan.
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

  // Iragazkiak edo item-ak aldatzean, cache-a garbitu eta birneurtu.
  // Hau ezinbestekoa da gogokoa kentzean txartelak ez pilatzeko: bestela
  // virtualizer-ak lehengo posizioak (translateY) gogoratzen ditu eta item
  // ezberdinei aplikatzen dizkie.
  useEffect(() => {
    // Neurketen cache osoa garbitu
    // @ts-expect-error - measurementsCache existitzen da baina ez da tipatuta
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
                saved={isSaved(item.id)}
                read={isRead(item.id)}
                onToggleSave={() => onToggleSave(item)}
                onMarkRead={() => onMarkRead(item.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
