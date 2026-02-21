import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onSave: (date: string) => void;
  onNotYet: () => void;
  t: (s: string) => string;
}

export function QuitDateModal({ open, onSave, onNotYet, t }: Props) {
  const [date, setDate] = useState('');
  const [showKindMessage, setShowKindMessage] = useState(false);

  if (showKindMessage) {
    return (
      <Dialog open={open}>
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <div className="text-center py-4 space-y-4">
            <div className="text-4xl">💚</div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("That's okay")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("Quitting is a journey, not a single moment. We're here whenever you're ready. You've already taken a brave step by being here.")}
            </p>
            <Button
              onClick={onNotYet}
              variant="outline"
              className="border-border text-foreground hover:bg-accent mt-2"
            >
              {t('Close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="bg-card border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-xl">
            {t('When did you quit smoking?')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            {t("This helps us track your recovery milestones")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={() => date && onSave(date)}
            disabled={!date}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
          >
            {t('Save')}
          </Button>
          <button
            onClick={() => setShowKindMessage(true)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {t("I haven't quit yet")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
