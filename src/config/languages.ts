
import type { SupportedLanguage } from '@/types';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl', placeholder: 'اكتب سؤالك هنا...' },
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr', placeholder: 'Type your question here...' }
];

export const DEFAULT_LANGUAGE_CODE = 'en';

export const getLanguageConfig = (code?: string): SupportedLanguage => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES.find(lang => lang.code === DEFAULT_LANGUAGE_CODE)!;
};
