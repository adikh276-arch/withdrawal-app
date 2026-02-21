import { useMemo } from 'react';
import { milestones, getMilestoneStatus, getTimeUntil, getDateAchieved, type MilestoneStatus } from '@/lib/milestones';
import { Check } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  quitDate: Date;
  t: (s: string) => string;
}

function Dot({ status }: { status: MilestoneStatus }) {
  if (status === 'reached') {
    return (
      <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary shrink-0">
        <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
      </div>
    );
  }
  if (status === 'current') {
    return (
      <div className="relative z-10 w-10 h-10 rounded-full bg-celebration flex items-center justify-center shrink-0 animate-milestone-pulse -ml-1">
        <div className="w-4 h-4 rounded-full bg-celebration-foreground" />
      </div>
    );
  }
  return (
    <div className="relative z-10 w-8 h-8 rounded-full border-2 border-muted-foreground/30 bg-background shrink-0" />
  );
}

export function MilestoneTimeline({ quitDate, t }: Props) {
  const items = useMemo(
    () =>
      milestones.map((m) => ({
        ...m,
        status: getMilestoneStatus(quitDate, m),
        timeUntil: getTimeUntil(quitDate, m),
        dateAchieved: getDateAchieved(quitDate, m),
      })),
    [quitDate]
  );

  return (
    <div className="px-4 pb-8">
      <h2 className="text-lg font-semibold text-foreground mb-6">{t('Your Recovery Journey')}</h2>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-muted" />

        <div className="space-y-1">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="relative flex gap-4 items-start animate-fade-in-up"
              style={{ animationDelay: `${0.05 * i}s`, opacity: 0 }}
            >
              {/* Dot */}
              <div className="flex items-start pt-1">
                <Dot status={item.status} />
              </div>

              {/* Content */}
              <div
                className={`flex-1 rounded-xl p-3 mb-2 transition-colors ${
                  item.status === 'current'
                    ? 'glass-card glow-celebration'
                    : item.status === 'reached'
                    ? 'bg-primary/5'
                    : 'bg-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.emoji}</span>
                      <span
                        className={`text-sm font-semibold ${
                          item.status === 'current'
                            ? 'text-celebration'
                            : item.status === 'reached'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 leading-relaxed ${
                        item.status === 'upcoming' ? 'text-muted-foreground/60' : 'text-foreground/80'
                      }`}
                    >
                      {t(item.description)}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="shrink-0 text-right">
                    {item.status === 'reached' && (
                      <span className="text-xs text-primary/70">
                        {format(item.dateAchieved, 'MMM d')}
                      </span>
                    )}
                    {item.status === 'current' && (
                      <span className="text-xs text-celebration font-medium px-2 py-0.5 rounded-full bg-celebration/10">
                        {t('Next up')}
                      </span>
                    )}
                    {item.status === 'upcoming' && item.timeUntil && (
                      <span className="text-xs text-muted-foreground/50">
                        {item.timeUntil}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
