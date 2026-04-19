import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNewsFeed } from '@/hooks/use-news-feed';
import { LANG_FLAGS, LANG_LABELS, REGION_LABELS, type NewsSource } from '@/lib/news-types';
import { cn } from '@/lib/utils';

function formatDateTime(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('eu-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

function lastItemDateForSource(sourceId: string, items: { source: { id: string }; publishedAt: string }[]) {
  let latest: number | null = null;
  for (const it of items) {
    if (it.source.id !== sourceId) continue;
    const t = new Date(it.publishedAt).getTime();
    if (!latest || t > latest) latest = t;
  }
  return latest ? new Date(latest).toISOString() : undefined;
}

const KIND_LABELS: Record<string, string> = {
  news: 'Albisteak',
  research: 'Ikerketa',
  openalex: 'OpenAlex',
};

const Sources = () => {
  const { feed, loading, error } = useNewsFeed();

  const sources = feed?.sources ?? [];
  const items = feed?.items ?? [];

  const stats = useMemo(() => {
    const total = sources.length;
    const ok = sources.filter((s) => s.ok).length;
    const failed = sources.filter((s) => s.ok === false).length;
    const totalKept = sources.reduce((acc, s) => acc + (s.kept ?? 0), 0);
    return { total, ok, failed, totalKept };
  }, [sources]);

  const sorted = useMemo(() => {
    return [...sources].sort((a, b) => {
      // Hutsegiteak lehenik, gero kept-ren arabera
      if ((a.ok ?? true) !== (b.ok ?? true)) return (a.ok ? 1 : 0) - (b.ok ? 1 : 0);
      return (b.kept ?? 0) - (a.kept ?? 0);
    });
  }, [sources]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-b from-sand to-background">
        <div className="container max-w-5xl py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                to="/"
                className="mb-3 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-primary hover:underline"
              >
                <ArrowLeft className="h-3 w-3" /> Itzuli albisteetara
              </Link>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Iturrien osasuna
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Iturri bakoitzaren azken bilketaren egoera: zenbat albiste ekarri diren, zein iturrik
                huts egin duen eta noiz egin den azken eguneraketa.
              </p>
            </div>
            <ThemeToggle />
          </div>

          {feed && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-normal">
                Azken eguneraketa: {formatDateTime(feed.generatedAt)}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {stats.ok}/{stats.total} iturri OK
              </Badge>
              {stats.failed > 0 && (
                <Badge variant="destructive" className="font-normal">
                  {stats.failed} hutsegite
                </Badge>
              )}
              <Badge variant="secondary" className="font-normal">
                {stats.totalKept} albiste mantendu
              </Badge>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-5xl py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground" role="status">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            Iturriak kargatzen...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
            <p className="font-medium text-destructive">Errorea: {error}</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <ul className="space-y-2">
            {sorted.map((s) => (
              <SourceRow key={s.id} source={s} lastItemAt={lastItemDateForSource(s.id, items)} />
            ))}
          </ul>
        )}
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="container max-w-5xl text-center text-xs text-muted-foreground">
          Datuok azken bilketaren erregistrotik datoz · GitHub Actions bidez eguneratzen da
        </div>
      </footer>
    </div>
  );
};

function SourceRow({ source, lastItemAt }: { source: NewsSource; lastItemAt?: string }) {
  const ok = source.ok !== false;
  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors sm:flex-row sm:items-center sm:gap-4',
        !ok && 'border-destructive/40 bg-destructive/5',
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-5 w-5 text-primary" aria-label="OK" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" aria-label="Hutsegitea" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-display text-sm font-semibold text-foreground sm:text-base">
            {source.name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {source.id}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {source.lang && (
            <span title={LANG_LABELS[source.lang]}>
              {LANG_FLAGS[source.lang]} {source.lang.toUpperCase()}
            </span>
          )}
          {source.region && <span>· {REGION_LABELS[source.region]}</span>}
          {source.kind && <span>· {KIND_LABELS[source.kind] ?? source.kind}</span>}
          {typeof source.elapsedMs === 'number' && <span>· {source.elapsedMs} ms</span>}
        </div>

        {!ok && source.error && (
          <p className="mt-2 break-words text-xs text-destructive">⚠ {source.error}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center sm:gap-4">
        <Stat label="Ekarri" value={source.fetched ?? 0} />
        <Stat label="Mantendu" value={source.kept ?? 0} highlight={ok && (source.kept ?? 0) > 0} />
        <Stat label="Azkena" value={lastItemAt ? formatDateTime(lastItemAt) : '—'} small />
      </div>
    </li>
  );
}

function Stat({
  label,
  value,
  highlight,
  small,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className="min-w-[64px]">
      <div
        className={cn(
          'font-display font-semibold tabular-nums',
          small ? 'text-[11px] leading-tight text-foreground/80' : 'text-base sm:text-lg',
          highlight && !small && 'text-primary',
        )}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export default Sources;
