import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

/** Shapes historiques du catalogue statique (ex-src/data/countryDetails.ts) : conservées telles quelles. */
export interface QuickFact {
  title: string;
  value: string;
}

export interface NamedItem {
  name: string;
  description: string;
  image: string;
}

export interface CountryTranslation {
  motto: string;
  quickFacts: { title: string; value: string }[];
  history: string;
  traditions: { name: string; description: string }[];
  cuisine: { name: string; description: string }[];
  modernLife: string;
  trends: string[];
  places: { name: string; description: string }[];
}

export interface CountryDetail {
  heroImage: string;
  motto: string;
  quickFacts: QuickFact[];
  history: string;
  culturalImage: string;
  traditions: NamedItem[];
  cuisine: NamedItem[];
  modernLife: string;
  trends: string[];
  modernImage: string;
  places: NamedItem[];
  fr?: CountryTranslation;
  de?: CountryTranslation;
}

// Cache par pays : une fiche n'est chargée qu'une fois.
const cache = new Map<string, CountryDetail | null>();
const inflight = new Map<string, Promise<CountryDetail | null>>();

const LANGS = ['fr', 'de'] as const;

/**
 * Reconstruit la shape du fichier statique depuis la réponse backend.
 * Les blocs `fr`/`de` sont recomposés dans le MÊME ordre que les tableaux principaux :
 * CountryDetail.tsx lit les traductions par index (tr.traditions[i]).
 */
export function buildCountryDetail(raw: any): CountryDetail {
  const named = (rows: any[]): NamedItem[] =>
    (rows ?? []).map((r) => ({ name: r.name ?? '', description: r.description ?? '', image: r.image ?? '' }));

  const detail: CountryDetail = {
    heroImage: raw.heroImage ?? '',
    motto: raw.motto ?? '',
    quickFacts: (raw.quickFacts ?? []).map((f: any) => ({ title: f.title ?? '', value: f.value ?? '' })),
    history: raw.history ?? '',
    culturalImage: raw.culturalImage ?? '',
    traditions: named(raw.traditions),
    cuisine: named(raw.cuisine),
    modernLife: raw.modernLife ?? '',
    trends: (raw.trends ?? []).map((t: any) => t.trendText ?? ''),
    modernImage: raw.modernImage ?? '',
    places: named(raw.places),
  };

  for (const lang of LANGS) {
    const country = raw.translations?.[lang];
    const pick = (rows: any[], fields: string[]) =>
      (rows ?? []).map((r: any) => {
        const tr = r.translations?.[lang] ?? {};
        const out: any = {};
        for (const field of fields) out[field] = tr[field] ?? r[field] ?? '';
        return out;
      });

    // Une fiche est traduite si le pays OU l'un de ses items porte une traduction.
    const hasTranslation =
      country ||
      [raw.quickFacts, raw.traditions, raw.cuisine, raw.places, raw.trends].some((rows: any[]) =>
        (rows ?? []).some((r: any) => r.translations?.[lang])
      );
    if (!hasTranslation) continue;

    detail[lang] = {
      motto: country?.motto ?? detail.motto,
      history: country?.history ?? detail.history,
      modernLife: country?.modernLife ?? detail.modernLife,
      quickFacts: pick(raw.quickFacts, ['title', 'value']),
      traditions: pick(raw.traditions, ['name', 'description']),
      cuisine: pick(raw.cuisine, ['name', 'description']),
      places: pick(raw.places, ['name', 'description']),
      trends: (raw.trends ?? []).map((t: any) => t.translations?.[lang]?.trendText ?? t.trendText ?? ''),
    };
  }

  return detail;
}

async function loadCountryDetail(name: string): Promise<CountryDetail | null> {
  if (cache.has(name)) return cache.get(name)!;
  if (!inflight.has(name)) {
    const promise = apiService
      .getCountryDetails(name)
      .then((res: any) => {
        const detail = buildCountryDetail(res?.country ?? res);
        cache.set(name, detail);
        return detail;
      })
      .catch((err: any) => {
        // 404 = pays inconnu ou fiche non validée → « pays introuvable », pas une erreur technique.
        if (err?.status === 404) {
          cache.set(name, null);
          return null;
        }
        inflight.delete(name); // permet un nouvel essai après échec
        throw err;
      });
    inflight.set(name, promise);
  }
  return inflight.get(name)!;
}

/**
 * Fiche pays servie par le backend (seules les fiches validées le sont).
 * Remplace les imports de `src/data/countryDetails`.
 */
export function useCountryDetail(name: string | undefined) {
  const key = name ?? '';
  const cached = cache.has(key) ? cache.get(key)! : undefined;
  const [details, setDetails] = useState<CountryDetail | null>(cached ?? null);
  const [loading, setLoading] = useState(!cache.has(key) && key !== '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!key) {
      setDetails(null);
      setLoading(false);
      return;
    }
    if (cache.has(key)) {
      setDetails(cache.get(key)!);
      setLoading(false);
      setError(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);
    loadCountryDetail(key)
      .then((d) => {
        if (mounted) {
          setDetails(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message ?? 'Failed to load country details');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [key]);

  // notFound : le pays n'a pas de fiche publiée (distinct d'une panne réseau).
  return { details, loading, error, notFound: !loading && !error && details === null };
}

export default useCountryDetail;
