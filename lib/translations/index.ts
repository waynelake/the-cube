import en from './en.json';
import de from './de.json';
import type { Language } from '@/lib/language-context';

const translations = { en, de };

export function getTranslation(language: Language, key: string): string {
  const lang = language === 'EN' ? 'en' : 'de';
  const keys = key.split('.');

  let value: any = translations[lang as keyof typeof translations];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackK of keys) {
        if (value && typeof value === 'object' && fallbackK in value) {
          value = value[fallbackK];
        } else {
          return key; // Return key if not found in either language
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function t(language: Language, key: string): string {
  return getTranslation(language, key);
}

export { en, de };
