import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { buildManualNewsItem } from '@/lib/scrape-url';
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
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [lang, setLang] = useState<NewsLang>('eu');
  const [region, setRegion] = useState<NewsRegion>('basque');

  const reset = () => {
    setUrl('');
    setTitle('');
    setSummary('');
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

  const trimmedTitle = title.trim();
  const canSubmit = isValidUrl && trimmedTitle.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const item = buildManualNewsItem({
      url: url.trim(),
      title: trimmedTitle,
      summary: summary.trim() || undefined,
      lang,
      region,
    });
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
            Sartu artikuluaren URL-a eta titulua. Laburpena hautazkoa da.
            Gustukoen zerrendan gordeko da.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-url">Artikuluaren URL-a</Label>
            <Input
              id="manual-url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-title">
              Titulua <span className="text-destructive">*</span>
            </Label>
            <Input
              id="manual-title"
              type="text"
              placeholder="Artikuluaren titulua"
              value={title}
              maxLength={300}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-summary">Laburpena (hautazkoa)</Label>
            <Textarea
              id="manual-summary"
              placeholder="Artikuluaren laburpen laburra…"
              value={summary}
              maxLength={1000}
              rows={3}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

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
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Gehitu gustukoetara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
