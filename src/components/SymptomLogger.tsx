import { useState } from 'react';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { saveSymptomLog } from '@/lib/supabase';
import { toast } from 'sonner';

const PHYSICAL = ['Headache', 'Nausea', 'Sweating', 'Tingling', 'Chest tightness'];
const MENTAL = ['Anxiety', 'Irritability', 'Difficulty concentrating', 'Cravings', 'Restlessness'];
const SLEEP = ['Insomnia', 'Vivid dreams', 'Fatigue', 'Night sweats'];
const COPING = ['Deep breathing', 'Exercise', 'Meditation', 'Distraction', 'Called support'];

interface Props {
  userId: number;
  t: (s: string) => string;
}

function SymptomCategory({
  label,
  items,
  selected,
  onToggle,
  t,
}: {
  label: string;
  items: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
  t: (s: string) => string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{t(label)}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <label
            key={item}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-colors ${
              selected.has(item)
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-secondary text-muted-foreground border border-transparent'
            }`}
          >
            <Checkbox
              checked={selected.has(item)}
              onCheckedChange={() => onToggle(item)}
              className="hidden"
            />
            {t(item)}
          </label>
        ))}
      </div>
    </div>
  );
}

export function SymptomLogger({ userId, t }: Props) {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState([5]);
  const [physical, setPhysical] = useState(new Set<string>());
  const [mental, setMental] = useState(new Set<string>());
  const [sleep, setSleep] = useState(new Set<string>());
  const [coping, setCoping] = useState(new Set<string>());
  const [saving, setSaving] = useState(false);

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void) => (item: string) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setFn(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSymptomLog(
        userId,
        severity[0],
        Array.from(physical),
        Array.from(mental),
        Array.from(sleep),
        Array.from(coping)
      );
      toast.success(t('Symptoms logged'));
      // Reset
      setPhysical(new Set());
      setMental(new Set());
      setSleep(new Set());
      setCoping(new Set());
      setSeverity([5]);
    } catch {
      toast.error(t('Could not save. Try again later.'));
    }
    setSaving(false);
  };

  return (
    <div className="px-4 pb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 rounded-xl glass-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div className="text-left">
            <span className="text-sm font-medium text-foreground">{t('Track symptoms')}</span>
            <span className="text-xs text-muted-foreground block">{t('Optional — tracking is not required')}</span>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl glass-card space-y-5 animate-fade-in-up">
          {/* Severity */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-muted-foreground">{t('Severity')}</h4>
              <span className="text-2xl font-bold text-foreground">{severity[0]}/10</span>
            </div>
            <Slider
              value={severity}
              onValueChange={setSeverity}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>

          <SymptomCategory label="Physical" items={PHYSICAL} selected={physical} onToggle={toggle(physical, setPhysical)} t={t} />
          <SymptomCategory label="Mental" items={MENTAL} selected={mental} onToggle={toggle(mental, setMental)} t={t} />
          <SymptomCategory label="Sleep" items={SLEEP} selected={sleep} onToggle={toggle(sleep, setSleep)} t={t} />
          <SymptomCategory label="Coping Methods" items={COPING} selected={coping} onToggle={toggle(coping, setCoping)} t={t} />

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? t('Saving…') : t('Log Symptoms')}
          </Button>

          {/* Expert booking hint */}
          {severity[0] >= 8 && (
            <p className="text-xs text-center text-celebration">
              {t('Feeling overwhelmed? Consider booking a session with a counselor through your EAP.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
