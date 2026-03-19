/**
 * ARQUITECTURA ME — Neuro Code Style
 * src/i18n/index.ts — Configuración i18next
 * ES (default) + EN · Auto-detección browser · preferred_lang desde Supabase
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonES   from './locales/es/common.json';
import afseES     from './locales/es/afse.json';
import auronES    from './locales/es/auron.json';
import platformES from './locales/es/platform.json';

import commonEN   from './locales/en/common.json';
import afseEN     from './locales/en/afse.json';
import auronEN    from './locales/en/auron.json';
import platformEN from './locales/en/platform.json';

export const resources = {
  es: { common: commonES, afse: afseES, auron: auronES, platform: platformES },
  en: { common: commonEN, afse: afseEN, auron: auronEN, platform: platformEN },
} as const;

export type SupportedLang = 'es' | 'en';
export const SUPPORTED_LANGS: SupportedLang[] = ['es', 'en'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', lng: 'es',
    defaultNS:   'common',
    ns:          ['common', 'afse', 'auron', 'platform'],
    interpolation: { escapeValue: false },
    react:         { useSuspense: false },
    // Detección de idioma por navegador
    detection: {
      order:  ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    } as object,
  });

export default i18n;

/** Aplicar preferred_lang del perfil Supabase */
export async function applyPreferredLang(preferred?: string | null) {
  const raw  = preferred ?? navigator.language.slice(0, 2);
  const lang = (SUPPORTED_LANGS.includes(raw as SupportedLang) ? raw : 'es') as SupportedLang;
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
    localStorage.setItem('ame_lang', lang);
  }
}