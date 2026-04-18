import { ThemeToggle } from '@/components/ThemeToggle';

interface Props {
  generatedAt?: string | null;
  count?: number;
}

export function NewsHeader({ generatedAt, count }: Props) {
  return (
    <header className="border-b bg-gradient-to-b from-sand to-background">
      <div className="container max-w-5xl py-8 sm:py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
              Arkeologia · Antzinako historia
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Aztarnak
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Mundu osoko arkeologia eta antzinako historiako albisteak, Euskal Herria eta
              Europa lehenetsita. Iturri publikoetatik bildua.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {generatedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            Azken eguneraketa: {generatedAt} · {count ?? 0} albiste
          </p>
        )}
      </div>
    </header>
  );
}
