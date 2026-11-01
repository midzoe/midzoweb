import React, { useId, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { countryName } from '../../data/africanCountries';

/**
 * Pages annuaire (vols, assurances, banques, logements, sites, restaurants, formations,
 * emplois, démarches) : textes du namespace `catalog`, pays dans la langue du site, et
 * menus construits à partir des fiches chargées — un choix proposé ramène toujours au
 * moins une fiche. La valeur filtrée reste celle de la base ; seul l'affichage est traduit.
 */
export interface Option { value: string; label: string }

const uniq = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.map(v => (v ?? '').trim()).filter(Boolean)));

// « 2-4 weeks », « 15 months », « 8-12 business days », « 5+ years ».
const UNIT_RE = /(\d+(?:[.,]\d+)?)?(\s*)\b(business days?|working days?|weeks?|months?|days?|years?)\b/gi;
const unitKey = (unit: string) => {
  const u = unit.toLowerCase();
  if (u.startsWith('business') || u.startsWith('working')) return 'business_day';
  return u.replace(/s$/, '');
};

/** Premier montant d'un prix saisi en texte (« €3,500 », « £45,000 - £60,000 », « $180 »). */
export function amountOf(price?: string | null): number | null {
  if (!price) return null;
  const m = price.replace(/[\s ]/g, '').match(/\d[\d.,]*/);
  if (!m) return null;
  const raw = /[.,]\d{3}(?!\d)/.test(m[0]) ? m[0].replace(/[.,](?=\d{3}(?!\d))/g, '') : m[0];
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Durée en mois (« 3 months », « 2-4 weeks » → borne haute) ; null si illisible. */
export function monthsOf(text?: string | null): number | null {
  const m = text?.match(/(\d+(?:[.,]\d+)?)(?:\s*-\s*(\d+(?:[.,]\d+)?))?\s*(business days?|working days?|weeks?|months?|days?|years?)/i);
  if (!m) return null;
  const n = Number((m[2] ?? m[1]).replace(',', '.'));
  const key = unitKey(m[3]);
  const perMonth: Record<string, number> = { day: 30, business_day: 21, week: 4.3, month: 1, year: 1 / 12 };
  return n / perMonth[key];
}

/**
 * Tranches : `edges` = bornes (ex. [200, 500, 1000]) ; clé « lt:200 » (jusqu'à 200), « r:200:500 »,
 * « gt:1000 » (plus de 1000), « free » pour 0 quand `withFree`. La borne haute est incluse :
 * « 2-4 weeks » tombe dans « 2 à 4 semaines », « 12 months » dans « 6 à 12 mois ».
 * Seules les tranches qui contiennent une fiche sont proposées.
 */
export function bucketOf(amount: number | null, edges: number[], withFree = false): string | null {
  if (amount == null) return null;
  if (withFree && amount === 0) return 'free';
  if (amount <= edges[0]) return `lt:${edges[0]}`;
  for (let i = 0; i < edges.length - 1; i++) {
    if (amount <= edges[i + 1]) return `r:${edges[i]}:${edges[i + 1]}`;
  }
  return `gt:${edges[edges.length - 1]}`;
}

export function presentBuckets(amounts: (number | null)[], edges: number[], withFree = false): string[] {
  const keys = new Set(amounts.map(a => bucketOf(a, edges, withFree)).filter(Boolean) as string[]);
  const order = [...(withFree ? ['free'] : []), `lt:${edges[0]}`, ...edges.slice(0, -1).map((e, i) => `r:${e}:${edges[i + 1]}`), `gt:${edges[edges.length - 1]}`];
  return order.filter(k => keys.has(k));
}

export function useCatalog() {
  const { t, i18n } = useTranslation('catalog');
  const lang = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

  return useMemo(() => {
    const country = (v: string) => countryName(v, lang, v);
    // Les clés i18next ne supportent ni « . » ni « : » : ces valeurs restent telles quelles.
    const val = (v?: string | null) => (!v ? '' : /[.:]/.test(v) ? v : t(`val.${v}`, { defaultValue: v }));
    const duration = (s?: string | null) =>
      !s ? '' : s.replace(UNIT_RE, (_m, n: string | undefined, space: string, unit: string) =>
        `${n ?? ''}${space}${t(`units.${unitKey(unit)}`, { count: n ? Number(n.replace(',', '.')) : 2 })}`);
    const sortOptions = (opts: Option[]) => opts.sort((a, b) => a.label.localeCompare(b.label, lang));
    const options = (values: (string | null | undefined)[], label: (v: string) => string = val): Option[] =>
      sortOptions(uniq(values).map(v => ({ value: v, label: label(v) })));
    const countryOptions = (values: (string | null | undefined)[]) => options(values, country);
    const money = (amount: number, currency = 'EUR') =>
      new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    /** Libellé d'une tranche ; `fmt` met en forme une borne (montant ou durée). */
    const bucketLabel = (key: string, fmt: (n: number) => string) => {
      if (key === 'free') return t('common.free');
      const [kind, a, b] = key.split(':');
      if (kind === 'lt') return t('common.under', { v: fmt(Number(a)) });
      if (kind === 'gt') return t('common.over', { v: fmt(Number(a)) });
      return t('common.between', { a: fmt(Number(a)), b: fmt(Number(b)) });
    };
    const bucketOptions = (keys: string[], fmt: (n: number) => string): Option[] =>
      keys.map(k => ({ value: k, label: bucketLabel(k, fmt) }));
    // « Bagages : » en français, « Gepäck: » ailleurs.
    const colon = (label: string) => (lang === 'fr' ? `${label} :` : `${label}:`);
    return { t, lang, country, val, duration, options, countryOptions, money, bucketOptions, colon };
  }, [t, lang]);
}

/** Libellé suivi de deux-points : « Délai : » en français, « Bearbeitungszeit: » ailleurs. */
export const withColon = (label: string) =>
  ((i18next.resolvedLanguage || i18next.language || 'fr').startsWith('fr') ? `${label} :` : `${label}:`);

interface FilterSelectProps {
  label: string;
  all: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  labelClassName?: string;
  selectClassName?: string;
}

/** Filtre « tout / une valeur ». Sans option (catalogue vide), le filtre n'est pas affiché. */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  label, all, value, onChange, options,
  labelClassName = 'block text-sm font-medium text-gray-700 mb-2',
  selectClassName = 'w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary',
}) => {
  const id = useId();
  if (options.length === 0 && !value) return null;
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className={selectClassName}>
        <option value="">{all}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};

/**
 * Liste vide : « aucun résultat pour ces filtres » quand le catalogue a des fiches, sinon
 * « pas encore d'offre ici », avec un lien vers un conseiller (sujet pré-rempli).
 */
export const CatalogEmpty: React.FC<{ total: number; service: string; className?: string }> = ({ total, service, className = 'text-gray-500 text-lg' }) => {
  const { t } = useTranslation('catalog');
  if (total > 0) return <p className={className}>{t('common.empty')}</p>;
  return (
    <div>
      <p className={className}>{t('common.none_yet')}</p>
      <Link to={`/contact?service=${encodeURIComponent(service)}`} className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary/90">
        {t('common.ask_advisor')}
      </Link>
    </div>
  );
};
