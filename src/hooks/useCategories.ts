import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: string[];
}

export interface ServiceDetail {
  /** Libellé de secours : `displayName` de la base, sinon la clé de catalogue. */
  name: string;
  description: string;
  image: string;
  learnMoreLink: string;
  translationKey: string;
  isExternal?: boolean;
  /** Étapes du parcours, saisies en admin. Vide = section masquée. */
  steps: string[];
}

export interface ServiceDetailsByCategory {
  [categoryId: string]: { [serviceName: string]: ServiceDetail };
}

interface CategoriesData {
  categories: Category[];
  serviceDetails: ServiceDetailsByCategory;
}

const EMPTY: CategoriesData = { categories: [], serviceDetails: {} };

type TLike = (key: string, options?: Record<string, unknown>) => unknown;

/**
 * Texte du catalogue : la BASE fait foi, la traduction n'est qu'un raffinage.
 *
 * Avant, l'écran n'affichait QUE `t(clé)` : un service ajouté en base sans clé
 * i18n s'affichait en clé brute, et modifier un libellé en base ne changeait
 * rien à l'écran. Ici la valeur de la base sert de `defaultValue`, donc :
 *   - clé traduite présente  -> la traduction s'affiche ;
 *   - clé absente ou vide    -> le libellé saisi en admin s'affiche.
 */
export function catalogText(t: TLike, key: string | undefined, fallback: string): string {
  if (!key) return fallback;
  const value = t(key, { defaultValue: fallback });
  return typeof value === 'string' ? value : fallback;
}

/** Idem pour une liste (étapes d'un parcours) : i18n prioritaire, base en repli. */
export function catalogList(t: TLike, key: string | undefined, fallback: string[]): string[] {
  if (!key) return fallback;
  const value = t(key, { returnObjects: true, defaultValue: fallback });
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
    ? (value as string[])
    : fallback;
}

// Cache module : les fetchs backend n'ont lieu qu'une seule fois, partagés par tous les composants.
let cache: CategoriesData | null = null;
let inflight: Promise<CategoriesData> | null = null;

function buildData(rawCategories: any[], rawServices: any[]): CategoriesData {
  // Les services arrivent déjà triés par `order` : on préserve cet ordre, car il
  // pilote l'affichage ET la séquence d'étapes du TripWizard.
  const servicesByCategory = new Map<string, any[]>();
  for (const s of rawServices) {
    if (!s?.name || !s?.categoryId) continue;
    // `isActive === false` masque le service. Un backend antérieur à ce champ
    // renvoie `undefined` : on l'interprète comme actif, pas comme masqué.
    if (s.isActive === false) continue;
    if (!servicesByCategory.has(s.categoryId)) servicesByCategory.set(s.categoryId, []);
    servicesByCategory.get(s.categoryId)!.push(s);
  }

  const categories: Category[] = rawCategories
    .filter((c) => c?.id)
    .map((c) => ({
      id: c.id,
      name: c.name ?? '',
      description: c.description ?? '',
      icon: c.icon ?? '',
      services: (servicesByCategory.get(c.id) ?? []).map((s) => s.name),
    }));

  const serviceDetails: ServiceDetailsByCategory = {};
  for (const [categoryId, services] of servicesByCategory) {
    serviceDetails[categoryId] = {};
    for (const s of services) {
      // `name` est la clé de catalogue ; `displayName` porte le libellé affiché.
      serviceDetails[categoryId][s.name] = {
        name: s.displayName ?? s.name,
        description: s.description ?? '',
        image: s.image ?? '',
        learnMoreLink: s.learnMoreLink ?? '',
        translationKey: s.translationKey ?? '',
        steps: Array.isArray(s.steps) ? s.steps.map((x: any) => String(x)) : [],
        ...(s.isExternal ? { isExternal: true } : {}),
      };
    }
  }

  return { categories, serviceDetails };
}

async function loadCategories(): Promise<CategoriesData> {
  if (cache) return cache;
  if (!inflight) {
    inflight = Promise.all([apiService.getCategories(), apiService.getAllServices()])
      .then(([catRes, svcRes]: [any, any]) => {
        const rawCategories = (catRes?.categories ?? catRes?.data ?? []) as any[];
        const rawServices = (svcRes?.services ?? svcRes?.data ?? []) as any[];
        cache = buildData(rawCategories, rawServices);
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
 * Hook centralisé du catalogue catégories/services, servi par le backend avec cache partagé.
 * Remplace les imports de `src/data/categories` et `src/data/services`.
 */
export function useCategories() {
  const [data, setData] = useState<CategoriesData>(cache ?? EMPTY);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) {
      setData(cache);
      setLoading(false);
      return;
    }
    let mounted = true;
    loadCategories()
      .then((d) => {
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message ?? 'Failed to load categories');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { categories: data.categories, serviceDetails: data.serviceDetails, loading, error };
}

export default useCategories;
