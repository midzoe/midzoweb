import { useEffect, useSyncExternalStore } from 'react';
import { apiService } from '../services/api';

/**
 * Monnaie d'affichage : les prix restent en euros (montant payé), avec un équivalent indicatif
 * dans la monnaie du visiteur (« 550 € (≈ 360 800 FCFA) »). Choix mémorisé sur l'appareil ;
 * par défaut, monnaie du pays de résidence (profil) ou de la langue du navigateur.
 */
export interface CurrencyOption { code: string; label: string }

export const CURRENCIES: CurrencyOption[] = [
  { code: 'EUR', label: '€ Euro' },
  { code: 'XOF', label: 'FCFA (Afrique de l’Ouest)' },
  { code: 'XAF', label: 'FCFA (Afrique centrale)' },
  { code: 'NGN', label: '₦ Naira' },
  { code: 'GHS', label: '₵ Cedi' },
  { code: 'GNF', label: 'Franc guinéen' },
  { code: 'CDF', label: 'Franc congolais' },
  { code: 'MAD', label: 'Dirham marocain' },
  { code: 'DZD', label: 'Dinar algérien' },
  { code: 'TND', label: 'Dinar tunisien' },
  { code: 'KES', label: 'Shilling kényan' },
  { code: 'RWF', label: 'Franc rwandais' },
  { code: 'USD', label: '$ Dollar US' },
  { code: 'CAD', label: '$ Dollar canadien' },
  { code: 'GBP', label: '£ Livre sterling' },
  { code: 'CHF', label: 'Franc suisse' },
];

/** Pays (noms anglais de la base / ISO2) → monnaie. */
const BY_COUNTRY: Record<string, string> = {
  Benin: 'XOF', 'Burkina Faso': 'XOF', 'Ivory Coast': 'XOF', "Côte d'Ivoire": 'XOF', 'Guinea-Bissau': 'XOF', Mali: 'XOF', Niger: 'XOF', Senegal: 'XOF', Togo: 'XOF',
  Cameroon: 'XAF', 'Central African Republic': 'XAF', Congo: 'XAF', 'Republic of the Congo': 'XAF', Gabon: 'XAF', 'Equatorial Guinea': 'XAF', Chad: 'XAF',
  Nigeria: 'NGN', Ghana: 'GHS', Guinea: 'GNF', 'DR Congo': 'CDF', 'Democratic Republic of the Congo': 'CDF', Morocco: 'MAD', Algeria: 'DZD', Tunisia: 'TND',
  Kenya: 'KES', Rwanda: 'RWF', 'United States': 'USD', Canada: 'CAD', 'United Kingdom': 'GBP', Switzerland: 'CHF',
};
const BY_REGION: Record<string, string> = {
  BJ: 'XOF', BF: 'XOF', CI: 'XOF', GW: 'XOF', ML: 'XOF', NE: 'XOF', SN: 'XOF', TG: 'XOF', CM: 'XAF', CF: 'XAF', CG: 'XAF', GA: 'XAF', GQ: 'XAF', TD: 'XAF',
  NG: 'NGN', GH: 'GHS', GN: 'GNF', CD: 'CDF', MA: 'MAD', DZ: 'DZD', TN: 'TND', KE: 'KES', RW: 'RWF', US: 'USD', CA: 'CAD', GB: 'GBP', CH: 'CHF',
};
const ROUND_TO_100 = new Set(['XOF', 'XAF', 'NGN', 'GNF', 'CDF', 'RWF', 'DZD', 'KES']);
const STORAGE_KEY = 'midzo_currency';

let rates: Record<string, number> = { EUR: 1, XOF: 655.957, XAF: 655.957 };
let current = 'EUR';
let chosen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && CURRENCIES.some(c => c.code === saved)) { current = saved; chosen = true; }
  else {
    const region = (navigator.language.split('-')[1] || '').toUpperCase();
    if (BY_REGION[region]) current = BY_REGION[region];
  }
} catch { /* stockage indisponible */ }

let ratesLoaded = false;
function loadRates() {
  if (ratesLoaded) return;
  ratesLoaded = true;
  apiService.getFxRates?.()
    .then((r: any) => { if (r?.rates) { rates = { ...rates, ...r.rates }; emit(); } })
    .catch(() => { /* XOF/XAF gardent leur parité fixe */ });
}

export function setCurrency(code: string) {
  current = code;
  chosen = true;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* */ }
  emit();
}

/** Monnaie par défaut d'après le profil, tant que le visiteur n'a rien choisi lui-même. */
export function suggestCurrencyFromCountry(country?: string | null) {
  if (chosen || !country) return;
  const code = BY_COUNTRY[country];
  if (code && code !== current) { current = code; emit(); }
}

export function currentCurrency() { return current; }

/** « ≈ 360 800 FCFA » ; vide si l'affichage est en euros ou le taux inconnu. */
export function localEquivalent(cents: number): string {
  if (current === 'EUR' || !rates[current]) return '';
  let amount = (cents / 100) * rates[current];
  amount = ROUND_TO_100.has(current) ? Math.round(amount / 100) * 100 : Math.round(amount);
  const lang = (document.documentElement.lang || 'fr').slice(0, 2);
  let text: string;
  try {
    text = new Intl.NumberFormat(lang, { style: 'currency', currency: current, maximumFractionDigits: 0 }).format(amount);
  } catch {
    text = `${Math.round(amount)} ${current}`;
  }
  if (current === 'XOF' || current === 'XAF') text = text.replace(/F\s?CFA|XOF|XAF/, 'FCFA');
  return `≈ ${text}`;
}

/** Abonnement React : un composant qui affiche des prix se redessine au changement de monnaie. */
export function useCurrency() {
  useEffect(loadRates, []);
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => listeners.delete(cb); },
    () => `${current}:${rates[current] ?? ''}`,
  );
}

/** « 550 € (≈ 360 800 FCFA) » : montant en euros + équivalent indicatif dans la monnaie choisie. */
export function formatMoney(cents: number, currency = 'EUR'): string {
  let eur: string;
  try {
    eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
  } catch {
    eur = `${Math.round(cents / 100)} ${currency}`;
  }
  const local = currency === 'EUR' ? localEquivalent(cents) : '';
  return local ? `${eur} (${local})` : eur;
}
