import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export interface CountryRegion {
  name: string;
  countries: string[];
}

interface CountriesData {
  countries: string[];
  regions: CountryRegion[];
  /** Pays d'études dans l'ordre curaté du backend (colonne `order`) — pilote l'affichage du Hero. */
  studyCountries: string[];
  /** Emoji de continent par pays, dérivé de la région. */
  continents: Record<string, string>;
}

// Ordre d'affichage stable des régions (indépendant du tri alpha des noms).
const REGION_ORDER = ['Europe', 'Asia', 'North America', 'South America', 'Africa'];

// Emoji par région (repris à l'identique de l'ex-data/countryAvailability.ts).
const REGION_EMOJI: Record<string, string> = {
  Europe: '🇪🇺',
  Asia: '🌏',
  'North America': '🌎',
  'South America': '🌎',
  Africa: '🌍',
};

// Cache module : le fetch backend n'a lieu qu'une seule fois, partagé par tous les composants.
let cache: CountriesData | null = null;
let inflight: Promise<CountriesData> | null = null;

export function buildData(rawCountries: any[]): CountriesData {
  const countries = rawCountries
    .map((c) => c?.name)
    .filter((n): n is string => typeof n === 'string' && n.length > 0)
    .sort();

  const byRegion = new Map<string, string[]>();
  for (const c of rawCountries) {
    if (!c?.name || !c?.region) continue;
    if (!byRegion.has(c.region)) byRegion.set(c.region, []);
    byRegion.get(c.region)!.push(c.name);
  }

  const orderedNames = [
    ...REGION_ORDER.filter((r) => byRegion.has(r)),
    ...[...byRegion.keys()].filter((r) => !REGION_ORDER.includes(r)).sort(),
  ];
  const regions: CountryRegion[] = orderedNames.map((name) => ({
    name,
    countries: byRegion.get(name)!.slice().sort(),
  }));

  const studyCountries = rawCountries
    .filter((c) => c?.studyAvailable && typeof c?.name === 'string')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
    .map((c) => c.name);

  const continents: Record<string, string> = {};
  for (const c of rawCountries) {
    if (!c?.name) continue;
    continents[c.name] = REGION_EMOJI[c.region] ?? '🌍';
  }

  return { countries, regions, studyCountries, continents };
}

async function loadCountries(): Promise<CountriesData> {
  if (cache) return cache;
  if (!inflight) {
    inflight = apiService
      .getCountries()
      .then((res: any) => {
        const raw = (res?.countries ?? res?.data ?? []) as any[];
        cache = buildData(raw);
        return cache;
      })
      .catch((err) => {
        inflight = null; // permet un nouvel essai après échec
        throw err;
      });
  }
  return inflight;
}

/**
 * Hook centralisé des pays/régions, servi par le backend avec cache partagé.
 * Remplace les imports de `src/data/regions`.
 */
export function useCountries() {
  const [data, setData] = useState<CountriesData>(
    cache ?? { countries: [], regions: [], studyCountries: [], continents: {} }
  );
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) {
      setData(cache);
      setLoading(false);
      return;
    }
    let mounted = true;
    loadCountries()
      .then((d) => {
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message ?? 'Failed to load countries');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return {
    countries: data.countries,
    regions: data.regions,
    studyCountries: data.studyCountries,
    /** Emoji du continent d'un pays (repli 🌍 si la région est inconnue). */
    getContinentForCountry: (country: string) => data.continents[country] ?? '🌍',
    loading,
    error,
  };
}

export default useCountries;
