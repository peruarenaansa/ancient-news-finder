import { useState } from 'react';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { scrapeUrl, buildManualNewsItem, type ScrapedMeta } from '@/lib/scrape-url';
import {
  LANG_LABELS,
  REGION_LABELS,
  type NewsItem,
  type NewsLang,
  type NewsRegion,
} from '@/lib/news-types';

interface Props {
  onAdd: (item: NewsItem) => void;
}

const LANG_OPTIONS: NewsLang[] = ['eu', 'es', 'en', 'fr', 'it', 'ca', 'gl', 'pt'];
const REGION_OPTIONS: NewsRegion[] = [
  'basque',
  'iberia',
  'europe',
  'near-east',
  'america',
  'asia',
  'world',
];

export function AddArticleDialog({ onAdd }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState<NewsLang>('eu');
  const [region, setRegion] = useState<NewsRegion>('basque');
  const [meta, setMeta] = useState<ScrapedMeta | null>(null);
  const [scraping, setScraping] = useState(false);

  const reset = () => {
    setUrl('');
    setMeta(null);
    setScraping(false);
    setLang('eu');
    setRegion('basque');
  };

  const isValidUrl = (() => {
    try {
      const u = new URL(url.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  })();

  const handleScrape = async () => {
    if (!isValidUrl) return;
    setScraping(true);
    setMeta(null);
    try {
      const m = await scrapeUrl(url.trim());
      setMeta(m);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Errore ezezaguna';
      toast({
        title: 'Ezin izan da artikulua kargatu',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = () => {
    if (!meta || !isValidUrl) return;
    const item = buildManualNewsItem({ url: url.trim(), meta, lang, region });
    onAdd(item);
    toast({
      title: 'Artikulua gehitu da',
      description: 'Gustukoen zerrendan agertzen da orain.',
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Gehitu artikulua eskuz"
          title="Gehitu artikulua eskuz"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gehitu artikulua eskuz</DialogTitle>
          <DialogDescription>
            URL bat sartu eta automatikoki kargatuko ditugu titulua, laburpena eta irudia.
            Defektuz Gustukoen zerrendan gordeko da.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-url">Artikuluaren URL-a</Label>
            <div className="flex gap-2">
              <Input
                id="manual-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setMeta(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidUrl && !scraping) {
                    e.preventDefault();
                    handleScrape();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleScrape}
                disabled={!isValidUrl || scraping}
              >
                {scraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-1 h-4 w-4" /> Kargatu
                  </>
                )}
              </Button>
            </div>
          </div>

          {meta && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex gap-3">
                {meta.image && (
                  <img
                    src={meta.image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-tight">
                    {meta.title}
                  </p>
                  {meta.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {meta.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {meta.sourceName}
                    {meta.publishedAt &&
                      ` · ${new Date(meta.publishedAt).toLocaleDateString('eu-ES')}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="manual-region">Eskualdea</Label>
              <Select
                value={region}
                onValueChange={(v) => setRegion(v as NewsRegion)}
              >
                <SelectTrigger id="manual-region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGION_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {REGION_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-lang">Hizkuntza</Label>
              <Select value={lang} onValueChange={(v) => setLang(v as NewsLang)}>
                <SelectTrigger id="manual-lang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANG_OPTIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LANG_LABELS[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Utzi
          </Button>
          <Button onClick={handleSubmit} disabled={!meta || !isValidUrl}>
            Gehitu gustukoetara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
