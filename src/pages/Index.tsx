import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, RefreshCw, Bookmark, CheckCheck, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { NewsCard } from '@/components/NewsCard';
import { useLocalStorageSet } from '@/hooks/use-local-storage-set';
import {
  LANG_LABELS,
  REGION_LABELS,
  type NewsFeed,
  type NewsItem,
  type NewsLang,
  type NewsRegion,
} from '@/lib/news-types';

const PAGE_SIZE = 25;

const Index = () => {
  const [feed, setFeed] = useState<NewsFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<NewsRegion | 'all'>('all');
  const [lang, setLang] = useState<NewsLang | 'all'>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [page, setPage] = useState(1);

  const { set: saved, toggle: toggleSaved } = useLocalStorageSet('archaeo:saved');
  const { set: read, add: markRead, addMany: markManyRead } = useLocalStorageSet('archaeo:read');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/news.json?ts=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error('Ezin izan da news.json kargatu');
        return r.json();
      })
      .then((data: NewsFeed) => {
        if (!active) return;
        setFeed(data);
        setError(null);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!feed) return [] as NewsItem[];
    const q = query.trim().toLowerCase();
    return feed.items.filter((it) => {
      if (showSavedOnly && !saved.has(it.id)) return false;
      if (!showRead && !showSavedOnly && read.has(it.id)) return false;
      if (region !== 'all' && it.region !== region) return false;
      if (lang !== 'all' && it.lang !== lang) return false;
      if (q) {
        const hay = `${it.title} ${it.summary} ${it.source.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [feed, query, region, lang, showSavedOnly, showRead, saved, read]);

  // Euskal Herriko albisteak gainean lehenetsi (iragazkirik gabe denean)
  const sorted = useMemo(() => {
    if (region !== 'all' || query || lang !== 'all' || showSavedOnly) {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      if (a.region === 'basque' && b.region !== 'basque') return -1;
      if (b.region === 'basque' && a.region !== 'basque') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [filtered, region, query, lang, showSavedOnly]);

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  const hiddenReadCount = useMemo(() => {
    if (!feed || showRead || showSavedOnly) return 0;
    return feed.items.filter((it) => read.has(it.id)).length;
  }, [feed, read, showRead, showSavedOnly]);

  const generatedDate = feed
    ? new Date(feed.generatedAt).toLocaleString('eu-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const resetFilters = () => {
    setQuery('');
    setRegion('all');
    setLang('all');
    setShowSavedOnly(false);
    setShowRead(false);
    setPage(1);
  };

  const allVisibleAlreadyRead = sorted.length > 0 && sorted.every((it) => read.has(it.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Goiburua */}
      <header className="border-b bg-gradient-to-b from-sand to-background">
        <div className="container max-w-5xl py-8 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
                Arkeologia · Antzinako historia
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
                Aztarna
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Mundu osoko arkeologia eta antzinako historiako albisteak, Euskal Herria eta
                Europa lehenetsita. Iturri publikoetatik bildua.
              </p>
            </div>
            <ThemeToggle />
          </div>

          {generatedDate && (
            <p className="mt-4 text-xs text-muted-foreground">
              Azken eguneraketa: {generatedDate} · {feed?.count ?? 0} albiste
            </p>
          )}
        </div>
      </header>

      {/* Iragazki-barra */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container max-w-5xl py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Bilatu albisteak..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={region} onValueChange={(v) => { setRegion(v as never); setPage(1); }}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Eskualdea" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Eskualde guztiak</SelectItem>
                  {(Object.keys(REGION_LABELS) as NewsRegion[]).map((r) => (
                    <SelectItem key={r} value={r}>{REGION_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={lang} onValueChange={(v) => { setLang(v as never); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Hizkuntza" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hizkuntza guztiak</SelectItem>
                  {(Object.keys(LANG_LABELS) as NewsLang[]).map((l) => (
                    <SelectItem key={l} value={l}>{LANG_LABELS[l]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showSavedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setShowSavedOnly((s) => !s); setPage(1); }}
              >
                <Bookmark className="mr-1 h-4 w-4" />
                Gogokoak {saved.size > 0 && <Badge variant="secondary" className="ml-2">{saved.size}</Badge>}
              </Button>

              <Button
                variant={showRead ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setShowRead((s) => !s); setPage(1); }}
                disabled={showSavedOnly}
                title={showRead ? 'Ezkutatu irakurritakoak' : 'Erakutsi irakurritakoak ere'}
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
                    disabled={sorted.length === 0 || allVisibleAlreadyRead}
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
                      Une honetan zerrendan ageri diren {sorted.length} albisteak irakurritzat
                      markatuko dira. Aurrerantzean ez dira agertuko, "Erakutsi irakurriak"
                      botoia sakatzen ez baduzu.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Utzi</AlertDialogCancel>
                    <AlertDialogAction onClick={() => markManyRead(sorted.map((it) => it.id))}>
                      Bai, markatu denak
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Edukia */}
      <main className="container max-w-5xl py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Albisteak kargatzen...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="font-medium text-destructive">Errorea: {error}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              GitHub Actions workflow-a oraindik ez da exekutatu agian. Begiratu konfigurazio-pausoak.
            </p>
          </div>
        )}

        {!loading && !error && feed && feed.items.length === 0 && (
          <div className="rounded-lg border border-dashed bg-card p-10 text-center">
            <h2 className="font-display text-xl font-semibold">Oraindik ez dago albisterik</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              GitHub Actions workflow-a aktibatu eta exekutatu behar duzu lehen aldiz.
              Ondoren, orduro automatikoki eguneratuko da.
            </p>
            <ol className="mx-auto mt-4 max-w-md space-y-1 text-left text-sm text-muted-foreground">
              <li>1. Lovable-en <strong>Connectors → GitHub</strong> bidez sortu repo-a</li>
              <li>2. GitHub-en <strong>Settings → Actions → Workflow permissions</strong>: "Read and write"</li>
              <li>3. <strong>Actions</strong> fitxan: "Fetch archaeology news" → "Run workflow"</li>
            </ol>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {sorted.length} albiste {showSavedOnly ? 'gordeta' : 'iragazi ondoren'}
                {!showRead && !showSavedOnly && hiddenReadCount > 0 && (
                  <> · {hiddenReadCount} irakurri ezkutatuta</>
                )}
              </span>
              {(query || region !== 'all' || lang !== 'all' || showSavedOnly || showRead) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <RefreshCw className="mr-1 h-3 w-3" /> Garbitu iragazkiak
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {visible.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  saved={saved.has(item.id)}
                  read={read.has(item.id)}
                  onToggleSave={() => toggleSaved(item.id)}
                  onMarkRead={() => markRead(item.id)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                  Gehiago kargatu
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && !error && feed && feed.items.length > 0 && visible.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              Ez dago bat datorren albisterik.
              {!showRead && !showSavedOnly && hiddenReadCount > 0 && (
                <> Agian denak irakurrita daude — sakatu "Erakutsi irakurriak".</>
              )}
            </p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={resetFilters}>
              Garbitu iragazkiak
            </Button>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="container max-w-5xl text-center text-xs text-muted-foreground">
          Iturri publikoen RSS jarioetatik bildua · Eskubide guztiak jatorrizko hedabideenak dira
        </div>
      </footer>
    </div>
  );
};

export default Index;
