import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AddArticleDialog } from '@/components/AddArticleDialog';
import type { NewsItem } from '@/lib/news-types';

interface Props {
  generatedAt?: string | null;
  count?: number;
  onAddManual?: (item: NewsItem) => void;
}

export function NewsHeader({ generatedAt, count, onAddManual }: Props) {
  return (
    <header className="border-b bg-gradient-to-b from-sand to-background">
      <div className="container max-w-5xl py-5 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Aztarnak
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Arkeologiari eta historiaurreari buruzko munduko albisteak, iturri
              publikoetatik bilduak. Euskal Herriari, Europari eta Ekialde Hurbilari
              erreparatzen diogu batez ere.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onAddManual && <AddArticleDialog onAdd={onAddManual} />}
            <Link
              to="/iturriak"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Iturrien osasun-monitorea"
              title="Iturrien osasuna"
            >
              <Activity className="h-4 w-4" />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {generatedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            Azken eguneraketa: {generatedAt} · {count ?? 0} albiste berri
          </p>
        )}
      </div>
    </header>
  );
}
