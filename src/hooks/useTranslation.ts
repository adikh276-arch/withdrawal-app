import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '@/lib/config';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

export { LANGUAGES };

type TranslationCache = Record<string, Record<string, string>>;

const cache: TranslationCache = {};
const pendingTexts = new Set<string>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;

async function translateBatch(texts: string[], target: string): Promise<Record<string, string>> {
  if (!config.googleTranslateApiKey) return {};
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${config.googleTranslateApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: texts, target, source: 'en' }),
      }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, string> = {};
    data.data.translations.forEach((t: { translatedText: string }, i: number) => {
      result[texts[i]] = t.translatedText;
    });
    return result;
  } catch {
    return {};
  }
}

export function useTranslation() {
  const [language, setLanguageState] = useState<LangCode>(() => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) return urlLang.toLowerCase() as LangCode;
    return (sessionStorage.getItem('app_language') as LangCode) || 'en';
  });
  const [, forceUpdate] = useState(0);
  const langRef = useRef(language);
  langRef.current = language;

  useEffect(() => {
    sessionStorage.setItem('app_language', language);
    // Try to load cached translations from sessionStorage
    const stored = sessionStorage.getItem(`translations_${language}`);
    if (stored) {
      try {
        cache[language] = { ...cache[language], ...JSON.parse(stored) };
      } catch { /* ignore */ }
    }
  }, [language]);

  const setLanguage = useCallback((lang: LangCode) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (text: string): string => {
      if (langRef.current === 'en' || !text) return text;
      const lang = langRef.current;

      // Check cache
      if (cache[lang]?.[text]) return cache[lang][text];

      // Queue for batch translation
      pendingTexts.add(text);
      if (batchTimer) clearTimeout(batchTimer);
      batchTimer = setTimeout(async () => {
        const texts = Array.from(pendingTexts);
        pendingTexts.clear();
        const translations = await translateBatch(texts, lang);
        if (Object.keys(translations).length > 0) {
          cache[lang] = { ...cache[lang], ...translations };
          sessionStorage.setItem(`translations_${lang}`, JSON.stringify(cache[lang]));
          forceUpdate(n => n + 1);
        }
      }, 100);

      return text; // Return English as fallback
    },
    [language] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { t, language, setLanguage, languages: LANGUAGES };
}
