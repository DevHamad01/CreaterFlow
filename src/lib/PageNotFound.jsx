import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Compass, Home, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-brand-radial" />

      <div className="relative w-full max-w-lg">
        <div className="surface-card p-8 text-center sm:p-10">
          <span
            aria-hidden="true"
            className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
          >
            <Compass className="h-7 w-7" />
          </span>

          <p className="font-display text-6xl font-semibold tracking-tight text-gradient sm:text-7xl">
            404
          </p>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="mx-auto mt-2 max-w-sm leading-relaxed text-muted-foreground">
            {pageName ? (
              <>
                We couldn&apos;t find{" "}
                <span className="font-medium text-foreground">/{pageName}</span>. It may have been
                moved or the link might be outdated.
              </>
            ) : (
              "The page you were looking for doesn't exist."
            )}
          </p>

          {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-left">
              <Info aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              <div>
                <p className="text-sm font-semibold">Admin note</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  This could mean the page hasn't been implemented yet. Ask for it in the chat.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">
                <Home aria-hidden="true" className="h-4 w-4" />
                Go home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">Browse creators</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
