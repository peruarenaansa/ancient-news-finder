import { ExternalLink, Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LANG_FLAGS,
  LANG_LABELS,
  REGION_LABELS,
  TOPIC_LABELS,
  type NewsItem,
} from '@/lib/news-types';

interface Props {
  item: NewsItem;
  saved: boolean;
  read: boolean;
  onToggleSave: () => void;
  onMarkRead: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) {
    const h = Math.max(1, Math.floor(diff / (60 * 60 * 1000)));
    return `duela ${h} ord.`;
  }
  if (diff < 7 * day) {
    return `duela ${Math.floor(diff / day)} egun`;
  }
  return d.toLocaleDateString('eu-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function NewsCard({ item, saved, read, onToggleSave, onMarkRead }: Props) {
  return (
    <article
      className={cn(
        'group flex gap-4 rounded-lg border bg-card p-4 transition-all',
        'hover:border-primary/40 hover:shadow-sm',
        read && 'opacity-70',
      )}
    >
      {item.image ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onMarkRead}
          className="hidden shrink-0 overflow-hidden rounded-md bg-muted sm:block"
        >
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-28 w-28 object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
            }}
          />
        </a>
      ) : (
        <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-md bg-secondary text-3xl sm:flex">
          📜
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onMarkRead}
            className="font-display text-base font-semibold leading-tight text-foreground hover:text-primary sm:text-lg"
          >
            {item.title}
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-1 h-8 w-8 shrink-0"
            onClick={onToggleSave}
            aria-label={saved ? 'Kendu gogokoetatik' : 'Gehitu gogokoetan'}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        {item.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{item.source.name}</span>
          <span>·</span>
          <span>{formatDate(item.publishedAt)}</span>
          <span>·</span>
          <span title={LANG_LABELS[item.lang]}>{LANG_FLAGS[item.lang]} {item.lang.toUpperCase()}</span>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {REGION_LABELS[item.region]}
            </Badge>
            {item.topics.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="font-normal">
                {TOPIC_LABELS[t] ?? t}
              </Badge>
            ))}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onMarkRead}
            className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
          >
            Irakurri jatorrian <ExternalLink className="h-3 w-3" />
          </a>
          {read && (
            <span className="inline-flex items-center gap-1 text-xs">
              <Check className="h-3 w-3" /> Irakurrita
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
