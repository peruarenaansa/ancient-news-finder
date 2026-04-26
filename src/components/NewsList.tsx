import { NewsCard } from '@/components/NewsCard';
import type { NewsItem } from '@/lib/news-types';

interface Props {
  items: NewsItem[];
  isLiked: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  onToggleLike: (item: NewsItem) => void;
  onToggleBookmark: (item: NewsItem) => void;
  onDelete: (id: string) => void;
}

export function NewsList({
  items,
  isLiked,
  isBookmarked,
  onToggleLike,
  onToggleBookmark,
  onDelete,
}: Props) {
  return (
    <div className="w-full">
      <ul role="list" className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="block">
            <NewsCard
              item={item}
              liked={isLiked(item.id)}
              bookmarked={isBookmarked(item.id)}
              onToggleLike={() => onToggleLike(item)}
              onToggleBookmark={() => onToggleBookmark(item)}
              onDelete={() => onDelete(item.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
