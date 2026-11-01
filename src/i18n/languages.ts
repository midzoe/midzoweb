/**
 * Langues du site : la seule liste à modifier côté site pour en ajouter une — avec un dossier
 * `locales/<code>/` (mêmes fichiers que `locales/fr/`), chargé automatiquement. Côté serveur :
 * midzobackend/lib/languages.ts (traduction du catalogue).
 *
 * Une langue absente d'un dictionnaire de composant retombe sur l'anglais.
 */
export const SITE_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
] as const;

export type SiteLang = (typeof SITE_LANGUAGES)[number]['code'];
export const SITE_LANGS: SiteLang[] = SITE_LANGUAGES.map(l => l.code);
/** Langue de saisie du catalogue en admin. */
export const SOURCE_LANG: SiteLang = 'fr';
export const FALLBACK_LANG: SiteLang = 'en';

/** Code de langue du site à partir d'une valeur i18next (« de-DE » → « de »). */
export const toSiteLang = (value?: string | null): SiteLang => {
  const code = (value || '').slice(0, 2) as SiteLang;
  return SITE_LANGS.includes(code) ? code : SOURCE_LANG;
};
