import { Search, Heart, Bookmark, Inbox, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  LANG_LABELS,
  REGION_LABELS,
  type NewsLang,
  type NewsRegion,
} from '@/lib/news-types';
import type { NewsView } from '@/hooks/use-news-filters';

interface Props {
  query: string;
  region: NewsRegion | 'all';
  lang: NewsLang | 'all';
  view: NewsView;
  unreadCount: number;
  readCount: number;
  bookmarkCount: number;
  likedCount: number;
  regionCounts: Map<NewsRegion, number>;
  availableLangs: { code: NewsLang; count: number }[];
  onChangeQuery: (value: string) => void;
  onChangeRegion: (value: NewsRegion | 'all') => void;
  onChangeLang: (value: NewsLang | 'all') => void;
  onChangeView: (view: NewsView) => void;
}

const VIEW_DEFS: { id: NewsView; label: string; icon: typeof Inbox }[] = [
  { id: 'unread', label: 'Irakurri gabeak', icon: Inbox },
  { id: 'read', label: 'Irakurriak', icon: CheckCheck },
  { id: 'bookmark', label: 'Gordetakoak', icon: Bookmark },
  { id: 'liked', label: 'Gustukoak', icon: Heart },
];

export function NewsFilters({
  query,
  region,
  lang,
  view,
  unreadCount,
  readCount,
  bookmarkCount,
  likedCount,
  regionCounts,
  availableLangs,
  onChangeQuery,
  onChangeRegion,
  onChangeLang,
  onChangeView,
}: Props) {
  const counts: Record<NewsView, number> = {
    unread: unreadCount,
    read: readCount,
    bookmark: bookmarkCount,
    liked: likedCount,
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container max-w-5xl py-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Label htmlFor="news-search" className="sr-only">
              Bilatu albisteak
            </Label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="news-search"
              type="search"
              value={query}
              onChange={(e) => onChangeQuery(e.target.value)}
              placeholder="Bilatu albisteak..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={region} onValueChange={(v) => onChangeRegion(v as NewsRegion | 'all')}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Eskualdea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Eskualde guztiak</SelectItem>
                {(Object.keys(REGION_LABELS) as NewsRegion[]).map((r) => {
                  const count = regionCounts.get(r) ?? 0;
                  return (
                    <SelectItem key={r} value={r} disabled={count === 0}>
                      {REGION_LABELS[r]} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={lang} onValueChange={(v) => onChangeLang(v as NewsLang | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Hizkuntza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hizkuntza guztiak</SelectItem>
                {availableLangs.map(({ code, count }) => (
                  <SelectItem key={code} value={code}>
                    {LANG_LABELS[code]} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Albiste-zerrendak"
          className="flex flex-wrap gap-1.5"
        >
          {VIEW_DEFS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            const count = counts[id];
            return (
              <Button
                key={id}
                role="tab"
                aria-selected={active}
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChangeView(id)}
                className={cn(
                  'gap-1.5',
                  !active && 'hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    active && (id === 'liked' || id === 'bookmark') && 'fill-current',
                  )}
                />
                {label}
                <Badge
                  variant={active ? 'secondary' : 'outline'}
                  className="ml-0.5 font-normal"
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
