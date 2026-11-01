import { useEffect, useState } from 'react';
import i18n from 'i18next';
import { SOURCE_LANG, toSiteLang, type SiteLang } from './languages';

/**
 * Contenu du catalogue dans la langue du site. Les routes publiques reçoivent `?locale=` et
 * renvoient leurs textes déjà traduits (DeepL, mémoire de traduction du backend) : voir
 * `apiService.request`. Ce module garde deux choses côté site :
 *  - `useContentLabels` : libellés traduits à l'affichage seulement, quand la page raisonne sur
 *    la donnée d'origine (intitulés des programmes, où le parcours Study cherche des mots-clés) ;
 *  - `contentState` : changer de langue recharge la page si du contenu a été affiché.
 */
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://midzobackend.vercel.app/api';

export const siteLang = (): SiteLang => toSiteLang(i18n.resolvedLanguage || i18n.language);

/** Vrai dès qu'une page a chargé du contenu : changer de langue doit alors le recharger. */
export const contentState = { loaded: false };

// Même règle que le backend : un texte visiblement français n'a pas de version « fr » à chercher.
const looksFrench = (text: string) =>
  /[éèêàçùœ]/i.test(text) || (text.toLowerCase().match(/\b(le|la|les|des|du|de|et|pour|avec|une|un|est|en|au|aux|sur|dans|par)\b/g)?.length ?? 0) >= 2;

// Traductions déjà demandées, par langue : texte → traduction (null = pas de traduction).
const cache: Record<string, Map<string, string | null>> = {};

/** Traductions des textes donnés (texte source → traduction) ; les inconnus sont absents. */
export async function translateTexts(texts: string[], lang: SiteLang = siteLang()): Promise<Map<string, string>> {
  const known = (cache[lang] ??= new Map());
  const wanted = [...new Set(texts.map(t => t.trim()).filter(Boolean))].filter(t => !(lang === SOURCE_LANG && looksFrench(t)));
  const missing = wanted.filter(t => !known.has(t));
  if (missing.length) {
    const res = await fetch(`${API_BASE_URL}/translations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, texts: missing }),
    });
    if (!res.ok) throw new Error(`translations ${res.status}`);
    const body = await res.json();
    const found: Record<string, string> = body?.translations ?? {};
    missing.forEach(t => known.set(t, found[t] ?? null));
  }
  const out = new Map<string, string>();
  wanted.forEach(t => {
    const tr = known.get(t);
    if (tr) out.set(t, tr);
  });
  return out;
}

/**
 * Libellés traduits pour un affichage seulement, quand la donnée doit rester d'origine pour la
 * logique de la page (ex. intitulés des programmes, où le parcours Study cherche des mots-clés).
 */
export function useContentLabels(texts: string[]): (text: string) => string {
  const [map, setMap] = useState<Map<string, string>>(new Map());
  const key = texts.join('|');
  useEffect(() => {
    let alive = true;
    translateTexts(texts).then(m => { if (alive) setMap(m); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (text: string) => map.get(text.trim()) ?? text;
}
