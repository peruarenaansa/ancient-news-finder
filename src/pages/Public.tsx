import { Link } from 'react-router-dom';
import { Newspaper, StickyNote, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getArticles, getNotes } from '@/lib/articles';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('eu-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const Public = () => {
  const articles = getArticles();
  const notes = getNotes();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-b from-sand to-background">
        <div className="container max-w-5xl py-8 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
                Arkeologia · Antzinako historia
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                Aztarnak
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Arkeologiari eta antzinako historiari buruzko albisteak eta oharrak,
                iturri propioetatik landuak.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/iturriak"
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                title="Kanpo-iturrien monitorea (pribatua)"
              >
                <Lock className="h-3 w-3" /> Iturriak
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-8 space-y-12">
        {/* Albiste luzeak */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-semibold">Albiste landuak</h2>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Oraindik ez dago albiste landurik. Sortu lehenengoa{' '}
              <Link to="/admin" className="text-primary underline">CMS-tik</Link>.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  to={`/albistea/${a.slug}`}
                  className="group overflow-hidden rounded-lg border bg-card transition hover:border-primary/40 hover:shadow-sm"
                >
                  {a.image && (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={a.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary">
                      {a.title}
                    </h3>
                    {a.subtitle && (
                      <p className="mt-1 text-sm text-muted-foreground">{a.subtitle}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(a.date)}</span>
                      {a.author && <span>· {a.author}</span>}
                      {a.tags?.slice(0, 2).map((t) => (
                        <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Ohar laburrak */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-semibold">Ohar laburrak</h2>
          </div>

          {notes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Oraindik ez dago ohar laburrik.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <Link
                  key={n.slug}
                  to={`/oharra/${n.slug}`}
                  className="block rounded-lg border bg-card p-4 transition hover:border-primary/40"
                >
                  <h3 className="font-display text-base font-semibold group-hover:text-primary">
                    {n.title}
                  </h3>
                  {n.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.excerpt}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(n.date)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="container max-w-5xl text-center text-xs text-muted-foreground">
          Aztarnak · Arkeologia eta antzinako historia
        </div>
      </footer>
    </div>
  );
};

export default Public;
