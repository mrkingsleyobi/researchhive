'use client';

import { useEffect } from 'react';
import { Button } from '@researchhive/ui';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Error</h1>
          <p className="text-muted-foreground">
            We encountered an error while loading your dashboard. This could be due to a
            network issue or a temporary problem with our servers.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm font-semibold mb-2">Error Details:</p>
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">
                  Stack trace
                </summary>
                <pre className="text-xs mt-2 overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
