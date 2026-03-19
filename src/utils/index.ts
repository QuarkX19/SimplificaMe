// src/i18n/index.ts
// Plataforma ME — Internacionalización
// Auto-detecta idioma del browser. Soporta: es, en
// Agregar idiomas: importar locale y agregarlo a resources

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Locales ES
import esCommon from './locales/es/common.json';
import esAfse   from './locales/es/afse.json';
import esAuron  from './locales/es/auron.json';
import esPlatform from './locales/es/platform.json';

// Locales EN
import enCommon from './locales/en/common.json';
import enAfse   from './locales/en/afse.json';
import enAuron  from './locales/en/auron.json';
import enPlatform from './locales/en/platform.json';

i18n
  .use(LanguageDetector)       // detecta idioma del browser automáticamente
  .use(initReactI18next)       // integración con React
  .init({
    resources: {
      es: {
        common:   esCommon,
        afse:     esAfse,
        auron:    esAuron,
        platform: esPlatform,
      },
      en: {
        common:   enCommon,
        afse:     enAfse,
        auron:    enAuron,
        platform: enPlatform,
      },
    },
    fallbackLng: 'es',         // si no detecta → español
    supportedLngs: ['es', 'en'],
    ns: ['common', 'afse', 'auron', 'platform'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,      // React ya escapa por defecto
    },
    detection: {
      // Orden de detección: querystring → localStorage → browser
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'plataforma_me_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;

// ─── HELPER: cambiar idioma manualmente ──────────────────────────────────────
export const changeLanguage = (lang: 'es' | 'en') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('plataforma_me_lang', lang);
};

// ─── HELPER: idioma actual ────────────────────────────────────────────────────
export const getCurrentLang = (): 'es' | 'en' =>
  (i18n.language?.startsWith('en') ? 'en' : 'es');