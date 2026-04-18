import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Pasahitzaren SHA-256 hash-a (ez da pasahitza testu lauean kodean gordetzen).
// Egungo pasahitza: "Aztarn4k-2026!Mon" (admin-ari erakutsi zaio; alda dezake hash hau eguneratuz).
const PASSWORD_HASH = '051e77fd0a00b10cd59f2b4fc5abff0cbab2a8cdb0579e95adccd62da03d0195';
const STORAGE_KEY = 'aztarnak:gate-ok';

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function PasswordGate({
  children,
  title = 'Sarbide pribatua',
  description = 'Atal hau pasahitzarekin babestuta dago.',
}: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') setUnlocked(true);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const hash = await sha256(pw);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setErr('Pasahitz okerra.');
    }
    setLoading(false);
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" />
          <h1 className="font-display text-xl font-semibold">{title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Input
          type="password"
          autoFocus
          placeholder="Pasahitza"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={loading || !pw}>
          {loading ? 'Egiaztatzen...' : 'Sartu'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Oharra: babes hau bezeroaren aldekoa da (disuasiorako). Eduki sentikorra ez ezarri.
        </p>
      </form>
    </div>
  );
}
