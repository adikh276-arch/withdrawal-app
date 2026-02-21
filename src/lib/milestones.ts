export interface Milestone {
  id: number;
  durationMs: number;
  label: string;
  description: string;
  emoji: string;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

export const milestones: Milestone[] = [
  { id: 1, durationMs: 20 * MIN, label: '20 minutes', description: 'Heart rate and blood pressure normalizing', emoji: '💓' },
  { id: 2, durationMs: 8 * HOUR, label: '8 hours', description: 'Blood oxygen returns to normal', emoji: '🫁' },
  { id: 3, durationMs: 24 * HOUR, label: '24 hours', description: 'Carbon monoxide eliminated', emoji: '✨' },
  { id: 4, durationMs: 48 * HOUR, label: '48 hours', description: 'Nerve endings regenerate', emoji: '⚡' },
  { id: 5, durationMs: 72 * HOUR, label: '72 hours', description: 'Nicotine fully cleared. Withdrawal peaks here', emoji: '🏔️' },
  { id: 6, durationMs: 7 * DAY, label: '1 week', description: 'Breathing becomes easier', emoji: '🌬️' },
  { id: 7, durationMs: 14 * DAY, label: '2 weeks', description: 'Circulation improving', emoji: '🔄' },
  { id: 8, durationMs: 30 * DAY, label: '1 month', description: 'Cough and fatigue reduce significantly', emoji: '💪' },
  { id: 9, durationMs: 90 * DAY, label: '3 months', description: 'Lung function increases 10%', emoji: '📈' },
  { id: 10, durationMs: 1 * YEAR, label: '1 year', description: 'Heart disease risk halved', emoji: '❤️' },
  { id: 11, durationMs: 5 * YEAR, label: '5 years', description: 'Stroke risk equals non-smoker', emoji: '🧠' },
  { id: 12, durationMs: 10 * YEAR, label: '10 years', description: 'Lung cancer risk halved', emoji: '🎉' },
  { id: 13, durationMs: 15 * YEAR, label: '15 years', description: 'Heart disease risk equals never-smoker', emoji: '🏆' },
];

export type MilestoneStatus = 'reached' | 'current' | 'upcoming';

export function getMilestoneStatus(quitDate: Date, milestone: Milestone): MilestoneStatus {
  const elapsed = Date.now() - quitDate.getTime();
  if (elapsed >= milestone.durationMs) return 'reached';
  const idx = milestones.indexOf(milestone);
  const prevReached = idx === 0 || elapsed >= milestones[idx - 1].durationMs;
  return prevReached ? 'current' : 'upcoming';
}

export function getTimeUntil(quitDate: Date, milestone: Milestone): string {
  const remaining = milestone.durationMs - (Date.now() - quitDate.getTime());
  if (remaining <= 0) return '';
  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  const minutes = Math.floor((remaining % HOUR) / MIN);
  if (days > 365) {
    const y = Math.floor(days / 365);
    const m = Math.floor((days % 365) / 30);
    return m > 0 ? `In ${y}y ${m}mo` : `In ${y} years`;
  }
  if (days > 30) {
    const m = Math.floor(days / 30);
    return `In ~${m} months`;
  }
  if (days > 0) return `In ${days}d ${hours}h`;
  if (hours > 0) return `In ${hours}h ${minutes}m`;
  return `In ${minutes}m`;
}

export function getDateAchieved(quitDate: Date, milestone: Milestone): Date {
  return new Date(quitDate.getTime() + milestone.durationMs);
}

export function getNewlyReachedMilestones(quitDate: Date, shownIds: number[]): Milestone[] {
  const elapsed = Date.now() - quitDate.getTime();
  return milestones.filter(m => elapsed >= m.durationMs && !shownIds.includes(m.id));
}

export function formatLifeRegained(dayCount: number, cigarettesPerDay = 10): string {
  const totalMinutes = dayCount * cigarettesPerDay * 11;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 24) {
    const d = Math.floor(hours / 24);
    const h = hours % 24;
    return `${d}d ${h}hr ${mins}min`;
  }
  return `${hours}hr ${mins}min`;
}
