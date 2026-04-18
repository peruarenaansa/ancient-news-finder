import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404: Existitzen ez den bidea:', location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Orria ez da aurkitu</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Itzuli hasierara
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
