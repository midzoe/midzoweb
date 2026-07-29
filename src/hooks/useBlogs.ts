import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  author: string;
  image: string;
  date: string;
}

/** Le backend renvoie du snake_case ; on normalise une fois, ici. */
export function buildBlogs(rawItems: any[]): BlogPost[] {
  return rawItems.map((b) => ({
    id: b.id,
    title: b.title ?? '',
    // Le slug est optionnel en base : l'id sert de repli d'URL, et la route
    // publique `/blogs/[slug]` accepte justement un id numérique.
    slug: b.slug || String(b.id),
    excerpt: b.excerpt ?? '',
    body: b.body ?? '',
    category: b.category ?? '',
    author: b.author ?? '',
    image: b.image ?? '',
    date: typeof b.published_at === 'string' ? b.published_at.slice(0, 10) : '',
  }));
}

/**
 * Articles de blog publiés (story 1.8).
 *
 * Pas de cache module ici, contrairement à `useNews` : la liste de blog n'est
 * consommée que par sa propre page, un rechargement à la visite est le
 * comportement attendu.
 */
export function useBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiService
      .getBlogs()
      .then((res: any) => {
        if (!mounted) return;
        setPosts(buildBlogs((res?.data ?? res?.items ?? []) as any[]));
      })
      .catch((e: any) => { if (mounted) setError(e?.message ?? 'Failed to load blogs'); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  return { posts, loading, error };
}

export default useBlogs;
