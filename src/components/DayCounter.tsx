import { useMemo } from 'react';
import { formatLifeRegained } from '@/lib/milestones';
import { Clock, Heart } from 'lucide-react';

interface Props {
  quitDate: Date;
  t: (s: string) => string;
}

export function DayCounter({ quitDate, t }: Props) {
  const { days, hours, minutes } = useMemo(() => {
    const elapsed = Date.now() - quitDate.getTime();
    return {
      days: Math.floor(elapsed / (24 * 60 * 60 * 1000)),
      hours: Math.floor((elapsed % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
      minutes: Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000)),
    };
  }, [quitDate]);

  const lifeRegained = useMemo(() => formatLifeRegained(days), [days]);

  return (
    <div className="text-center pt-6 pb-4 px-4">
      {/* Hero Day Count */}
      <div className="animate-hero-count">
        <span className="text-gradient-hero font-extrabold leading-none" style={{ fontSize: 'clamp(4rem, 18vw, 8rem)' }}>
          {days}
        </span>
      </div>
      <p className="text-muted-foreground text-lg tracking-wide mt-1 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
        {t('tobacco-free days')}
      </p>

      {/* Sub-stats */}
      {days === 0 && (
        <p className="text-muted-foreground text-sm mt-2 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          {hours}h {minutes}m {t('and counting')}
        </p>
      )}

      {/* Life Regained Card */}
      <div className="mt-6 mx-auto max-w-xs glass-card rounded-xl p-4 glow-success animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">{t('Life regained')}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-gradient-success text-2xl font-bold">{lifeRegained}</span>
        </div>
      </div>
    </div>
  );
}
