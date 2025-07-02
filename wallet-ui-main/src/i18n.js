// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

import translationEN from './locales/en/translation.json';
import translationTR from './locales/tr/translation.json';

const resources = {
  en: { translation: translationEN },
  tr: { translation: translationTR },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: () => {
      const browserLang = navigator.language || navigator.userLanguage;
      return browserLang.startsWith('tr') ? 'tr' : 'en';
    },
    detection: {
      order: ['cookie', 'navigator'],
      caches: ['cookie'],
      lookupCookie: 'lang',
      cookieMinutes: 60 * 24 * 30,
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;