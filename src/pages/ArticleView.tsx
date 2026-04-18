import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getBySlug } from '@/lib/articles';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('eu-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const ArticleView = () => {
  const { slug } = useParams();
  const article = slug ? getBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Ez da aurkitu</h1>
          <Link to="/" className="mt-4 inline-block text-primary underline">Itzuli hasierara</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-3xl py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Aztarnak
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-3xl py-8">
        <article>
          <div className="mb-6">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
              {article.type === 'note' ? 'Oharra' : 'Albiste landua'}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-2 text-lg text-muted-foreground">{article.subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDate(article.date)}</span>
              {article.author && <span>· {article.author}</span>}
              {article.tags?.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
              ))}
            </div>
          </div>

          {article.image && (
            <img
              src={article.image}
              alt=""
              className="mb-6 w-full rounded-lg object-cover"
            />
          )}

          <div className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-display">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>

          {article.source && (
            <div className="mt-8 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Iturria:</p>
              <a
                href={article.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {article.source.name} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default ArticleView;
