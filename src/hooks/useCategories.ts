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
  name: string;
  description: string;
  image: string;
  learnMoreLink: string;
  translationKey: string;
  isExternal?: boolean;
}

export interface ServiceDetailsByCategory {
  [categoryId: string]: { [serviceName: string]: ServiceDetail };
}

interface CategoriesData {
  categories: Category[];
  serviceDetails: ServiceDetailsByCategory;
}

const EMPTY: CategoriesData = { categories: [], serviceDetails: {} };

// Cache module : les fetchs backend n'ont lieu qu'une seule fois, partagés par tous les composants.
let cache: CategoriesData | null = null;
let inflight: Promise<CategoriesData> | null = null;

function buildData(rawCategories: any[], rawServices: any[]): CategoriesData {
  // Les services arrivent déjà triés par `order` : on préserve cet ordre, car il
  // pilote l'affichage ET la séquence d'étapes du TripWizard.
  const servicesByCategory = new Map<string, any[]>();
  for (const s of rawServices) {
    if (!s?.name || !s?.categoryId) continue;
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
