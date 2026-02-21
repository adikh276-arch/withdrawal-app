import { useEffect } from 'react';
import { Confetti } from './Confetti';
import type { Milestone } from '@/lib/milestones';

interface Props {
  milestone: Milestone;
  onClose: () => void;
}

export function UnlockCelebration({ milestone, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <Confetti />

      {/* Checkmark */}
      <div className="animate-scale-up mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-14 h-14 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" className="animate-check-draw" style={{ strokeDasharray: 100, strokeDashoffset: 0 }} />
          </svg>
        </div>
      </div>

      {/* Milestone info */}
      <div className="text-center px-8 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
        <p className="text-3xl mb-2">{milestone.emoji}</p>
        <h2 className="text-2xl font-bold text-celebration mb-2">{milestone.label}</h2>
        <p className="text-lg text-foreground/80 leading-relaxed max-w-xs mx-auto">
          {milestone.description}
        </p>
      </div>

      <p className="absolute bottom-12 text-sm text-muted-foreground animate-pulse">
        Tap to continue
      </p>
    </div>
  );
}
