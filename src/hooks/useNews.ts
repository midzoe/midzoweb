import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

/** Shape historique du catalogue statique (ex-src/data/news.ts) : conservée telle quelle. */
export interface NewsItem {
  id: number;
  title: string;
  titleFr: string;
  titleDe: string;
  description: string;
  descriptionFr: string;
  descriptionDe: string;
  category: string;
  image: string;
  date: string;
  link?: string;
}

// Cache module : le fetch backend n'a lieu qu'une seule fois, partagé par tous les composants.
let cache: NewsItem[] | null = null;
let inflight: Promise<NewsItem[]> | null = null;

/**
 * Le backend renvoie du snake_case ; l'allemand n'a pas de colonne dédiée et vit
 * dans `translations.de`. Les repli sur l'anglais évitent une carte vide si une
 * traduction manque.
 */
export function buildNews(rawItems: any[]): NewsItem[] {
  return rawItems.map((n) => ({
    id: n.id,
    title: n.title ?? '',
    titleFr: n.title_fr ?? n.title ?? '',
    titleDe: n.translations?.de?.title ?? n.title ?? '',
    description: n.description ?? '',
    descriptionFr: n.description_fr ?? n.description ?? '',
    descriptionDe: n.translations?.de?.description ?? n.description ?? '',
    category: n.category ?? '',
    image: n.image ?? '',
    date: typeof n.published_at === 'string' ? n.published_at.slice(0, 10) : '',
    link: n.link ?? undefined,
  }));
}

async function loadNews(): Promise<NewsItem[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = apiService
      .getNews()
      .then((res: any) => {
        const raw = (res?.items ?? res?.data ?? []) as any[];
        cache = buildNews(raw);
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
 * Actualités publiées, servies par le backend avec cache partagé.
 * Remplace les imports de `src/data/news`.
 */
export function useNews() {
  const [news, setNews] = useState<NewsItem[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) {
      setNews(cache);
      setLoading(false);
      return;
    }
    let mounted = true;
    loadNews()
      .then((items) => {
        if (mounted) {
          setNews(items);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message ?? 'Failed to load news');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { news, loading, error };
}

export default useNews;
