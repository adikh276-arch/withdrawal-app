import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: (userId: number) => ReactNode;
}

export function AuthGuard({ children }: Props) {
  const { loading, userId } = useAuth();

  if (loading || !userId) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">
          Verifying your session…
        </p>
      </div>
    );
  }

  return <>{children(userId)}</>;
}
