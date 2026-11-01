import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { FALLBACK_LANG, SITE_LANGS } from './languages';

// Textes de l'interface : chaque fichier `locales/<langue>/<namespace>.json` est chargé tout
// seul — ajouter une langue ou un namespace ne demande plus de toucher à ce fichier.
const files = import.meta.glob('./locales/*/*.json', { eager: true, import: 'default' }) as Record<string, Record<string, unknown>>;
const resources: Record<string, Record<string, Record<string, unknown>>> = {};
for (const [path, content] of Object.entries(files)) {
  const [, lang, ns] = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/) ?? [];
  if (lang && ns) (resources[lang] ??= {})[ns] = content;
}
const namespaces = Object.keys(resources.fr ?? {});

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: SITE_LANGS,
    nonExplicitSupportedLngs: true,
    fallbackLng: FALLBACK_LANG,
    defaultNS: 'common',
    ns: namespaces,

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already handles XSS
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
