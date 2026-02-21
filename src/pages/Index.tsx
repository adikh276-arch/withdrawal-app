import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { QuitDateModal } from '@/components/QuitDateModal';
import { DayCounter } from '@/components/DayCounter';
import { MilestoneTimeline } from '@/components/MilestoneTimeline';
import { UnlockCelebration } from '@/components/UnlockCelebration';
import { SymptomLogger } from '@/components/SymptomLogger';
import { useTranslation } from '@/hooks/useTranslation';
import { loadQuitDate, saveQuitDate, fetchCravingInsight, fetchSleepInsight } from '@/lib/supabase';
import { getNewlyReachedMilestones, type Milestone } from '@/lib/milestones';
import { Cigarette, TrendingDown, Moon } from 'lucide-react';
import { config } from '@/lib/config';

function TrackerApp({ userId }: { userId: number }) {
  const { t, language, setLanguage } = useTranslation();
  const [quitDate, setQuitDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [celebration, setCelebration] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [cravingInsight, setCravingInsight] = useState<string | null>(null);
  const [sleepInsight, setSleepInsight] = useState<string | null>(null);

  // Load quit date
  useEffect(() => {
    async function load() {
      try {
        // Try Supabase first
        const dbDate = await loadQuitDate(userId);
        if (dbDate) {
          setQuitDate(new Date(dbDate));
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }

      // Fallback to localStorage
      const local = localStorage.getItem('eap_quit_date');
      if (local) {
        setQuitDate(new Date(local));
      } else {
        setShowModal(true);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  // Check for newly reached milestones
  useEffect(() => {
    if (!quitDate) return;
    const shownRaw = localStorage.getItem('shown_milestone_ids');
    const shownIds: number[] = shownRaw ? JSON.parse(shownRaw) : [];
    const newlyReached = getNewlyReachedMilestones(quitDate, shownIds);
    if (newlyReached.length > 0) {
      setCelebration(newlyReached[0]);
      const updatedIds = [...shownIds, ...newlyReached.map((m) => m.id)];
      localStorage.setItem('shown_milestone_ids', JSON.stringify(updatedIds));
    }
  }, [quitDate]);

  // Fetch cross-tracker insights
  useEffect(() => {
    if (!config.isConfigured) return;
    fetchCravingInsight(userId).then(setCravingInsight);
    fetchSleepInsight(userId).then(setSleepInsight);
  }, [userId]);

  const handleSaveQuitDate = useCallback(
    async (dateStr: string) => {
      const date = new Date(dateStr);
      setQuitDate(date);
      setShowModal(false);
      localStorage.setItem('eap_quit_date', dateStr);
      try {
        await saveQuitDate(userId, dateStr);
      } catch { /* ignore */ }
    },
    [userId]
  );

  const handleNotYet = useCallback(() => {
    setShowModal(false);
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Cigarette className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground text-sm">{t('Recovery Tracker')}</span>
          </div>
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Quit Date Modal */}
        <QuitDateModal open={showModal} onSave={handleSaveQuitDate} onNotYet={handleNotYet} t={t} />

        {/* Celebration Overlay */}
        {celebration && <UnlockCelebration milestone={celebration} onClose={closeCelebration} />}

        {quitDate ? (
          <>
            {/* Day Counter Hero */}
            <DayCounter quitDate={quitDate} t={t} />

            {/* Cross-tracker Insights */}
            {(cravingInsight || sleepInsight) && (
              <div className="px-4 pb-4 space-y-2">
                {cravingInsight && (
                  <div className="flex items-center gap-3 p-3 rounded-xl glass-card animate-fade-in-up">
                    <TrendingDown className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-sm text-foreground/80">{t(cravingInsight)}</p>
                  </div>
                )}
                {sleepInsight && (
                  <div className="flex items-center gap-3 p-3 rounded-xl glass-card animate-fade-in-up">
                    <Moon className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-sm text-foreground/80">{t(sleepInsight)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Milestone Timeline */}
            <MilestoneTimeline quitDate={quitDate} t={t} />

            {/* Symptom Logger */}
            <SymptomLogger userId={userId} t={t} />
          </>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t("You're in the right place")}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {t('When you\'re ready to quit, come back and set your date. We\'ll be here to track your progress.')}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-primary text-sm font-medium hover:underline"
            >
              {t('Set my quit date')}
            </button>
          </div>
        )}

        {/* Dev mode indicator */}
        {config.isPreview && (
          <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto">
            <div className="bg-celebration/10 border border-celebration/20 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-celebration">
                Preview Mode — Configure VITE_SUPABASE_URL to connect your backend
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const Index = () => (
  <AuthGuard>
    {(userId) => <TrackerApp userId={userId} />}
  </AuthGuard>
);

export default Index;
