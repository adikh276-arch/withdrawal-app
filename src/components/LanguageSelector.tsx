import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES, type LangCode } from '@/hooks/useTranslation';
import { Globe } from 'lucide-react';

interface Props {
  language: LangCode;
  onLanguageChange: (lang: LangCode) => void;
}

export function LanguageSelector({ language, onLanguageChange }: Props) {
  return (
    <Select value={language} onValueChange={(v) => onLanguageChange(v as LangCode)}>
      <SelectTrigger className="w-auto gap-2 border-border bg-card text-foreground h-9 px-3 text-sm">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code} className="text-foreground">
            {l.label} ({l.code.toUpperCase()})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
