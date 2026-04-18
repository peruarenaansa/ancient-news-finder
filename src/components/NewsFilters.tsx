import { Search, Bookmark, CheckCheck, Eye, EyeOff } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  LANG_LABELS,
  REGION_LABELS,
  type NewsLang,
  type NewsRegion,
} from '@/lib/news-types';

interface Props {
  query: string;
  region: NewsRegion | 'all';
  lang: NewsLang | 'all';
  showSavedOnly: boolean;
  showRead: boolean;
  savedSize: number;
  hiddenReadCount: number;
  regionCounts: Map<NewsRegion, number>;
  availableLangs: { code: NewsLang; count: number }[];
  totalSorted: number;
  allVisibleAlreadyRead: boolean;
  onChangeQuery: (value: string) => void;
  onChangeRegion: (value: NewsRegion | 'all') => void;
  onChangeLang: (value: NewsLang | 'all') => void;
  onToggleSaved: () => void;
  onToggleShowRead: () => void;
  onMarkAllRead: () => void;
}

export function NewsFilters({
  query,
  region,
  lang,
  showSavedOnly,
  showRead,
  savedSize,
  hiddenReadCount,
  regionCounts,
  availableLangs,
  totalSorted,
  allVisibleAlreadyRead,
  onChangeQuery,
  onChangeRegion,
  onChangeLang,
  onToggleSaved,
  onToggleShowRead,
  onMarkAllRead,
}: Props) {
  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container max-w-5xl py-3">
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
            <div>
              <Label htmlFor="news-region" className="sr-only">
                Iragazi eskualdearen arabera
              </Label>
              <Select value={region} onValueChange={(v) => onChangeRegion(v as NewsRegion | 'all')}>
                <SelectTrigger id="news-region" className="w-[170px]">
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
            </div>

            <div>
              <Label htmlFor="news-lang" className="sr-only">
                Iragazi hizkuntzaren arabera
              </Label>
              <Select value={lang} onValueChange={(v) => onChangeLang(v as NewsLang | 'all')}>
                <SelectTrigger id="news-lang" className="w-[140px]">
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

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSaved}
              aria-pressed={showSavedOnly}
              className={
                showSavedOnly
                  ? 'border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  : 'hover:bg-muted hover:text-foreground'
              }
            >
              <Bookmark className={`mr-1 h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
              Gogokoak {savedSize > 0 && <Badge variant="secondary" className="ml-2">{savedSize}</Badge>}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleShowRead}
              disabled={showSavedOnly}
              aria-pressed={showRead}
              className={
                showRead && !showSavedOnly
                  ? 'border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  : 'hover:bg-muted hover:text-foreground'
              }
              title={
                showSavedOnly
                  ? 'Gogokoetan irakurritakoak ere beti agertzen dira'
                  : showRead
                    ? 'Ezkutatu irakurritakoak'
                    : 'Erakutsi irakurritakoak ere'
              }
            >
              {showRead ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
              {showRead ? 'Ezkutatu irakurriak' : 'Erakutsi irakurriak'}
              {!showRead && hiddenReadCount > 0 && (
                <Badge variant="secondary" className="ml-2">{hiddenReadCount}</Badge>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={totalSorted === 0 || allVisibleAlreadyRead}
                  title="Markatu zerrendako albiste guztiak irakurritzat"
                >
                  <CheckCheck className="mr-1 h-4 w-4" />
                  Denak irakurrita
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Markatu denak irakurritzat?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Une honetan zerrendan ageri diren {totalSorted} albisteak irakurritzat
                    markatuko dira. Aurrerantzean ez dira agertuko, "Erakutsi irakurriak"
                    botoia sakatzen ez baduzu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Utzi</AlertDialogCancel>
                  <AlertDialogAction onClick={onMarkAllRead}>
                    Bai, markatu denak
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
