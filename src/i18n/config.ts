import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import translation resources
import commonEN from './locales/en/common.json';
import navbarEN from './locales/en/navbar.json';
import heroEN from './locales/en/hero.json';
import footerEN from './locales/en/footer.json';
import servicesEN from './locales/en/services.json';
import dashboardEN from './locales/en/dashboard.json';
import formsEN from './locales/en/forms.json';
import countriesEN from './locales/en/countries.json';
import aboutEN from './locales/en/about.json';

import commonFR from './locales/fr/common.json';
import navbarFR from './locales/fr/navbar.json';
import heroFR from './locales/fr/hero.json';
import footerFR from './locales/fr/footer.json';
import servicesFR from './locales/fr/services.json';
import dashboardFR from './locales/fr/dashboard.json';
import formsFR from './locales/fr/forms.json';
import countriesFR from './locales/fr/countries.json';
import aboutFR from './locales/fr/about.json';

import commonDE from './locales/de/common.json';
import navbarDE from './locales/de/navbar.json';
import heroDE from './locales/de/hero.json';
import footerDE from './locales/de/footer.json';
import servicesDE from './locales/de/services.json';
import dashboardDE from './locales/de/dashboard.json';
import formsDE from './locales/de/forms.json';
import countriesDE from './locales/de/countries.json';
import aboutDE from './locales/de/about.json';

import contactEN from './locales/en/contact.json';
import contactFR from './locales/fr/contact.json';
import contactDE from './locales/de/contact.json';

const resources = {
  en: {
    common: commonEN,
    navbar: navbarEN,
    hero: heroEN,
    footer: footerEN,
    services: servicesEN,
    dashboard: dashboardEN,
    forms: formsEN,
    countries: countriesEN,
    about: aboutEN,
    contact: contactEN,
  },
  fr: {
    common: commonFR,
    navbar: navbarFR,
    hero: heroFR,
    footer: footerFR,
    services: servicesFR,
    dashboard: dashboardFR,
    forms: formsFR,
    countries: countriesFR,
    about: aboutFR,
    contact: contactFR,
  },
  de: {
    common: commonDE,
    navbar: navbarDE,
    hero: heroDE,
    footer: footerDE,
    services: servicesDE,
    dashboard: dashboardDE,
    forms: formsDE,
    countries: countriesDE,
    about: aboutDE,
    contact: contactDE,
  },
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navbar', 'hero', 'footer', 'services', 'dashboard', 'forms', 'countries', 'about', 'contact'],

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
