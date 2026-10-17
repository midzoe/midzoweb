import { useEffect, useRef, useState } from 'react';

/**
 * Charge une liste depuis l'API et suit son état (chargement / erreur).
 *
 * Les pages « annuaire » (vols, assurances, banques, sites, restaurants,
 * hébergements, jobs, formations, démarches) refont toutes la même mécanique :
 * appeler un endpoint quand les filtres changent, afficher un spinner, puis la
 * liste ou un message. Ce hook porte cette mécanique une fois pour toutes.
 *
 * `deps` sont les filtres : à chaque changement, la requête est relancée. Une
 * réponse arrivée après le démontage (ou dépassée par une requête plus récente)
 * est ignorée, pour éviter d'écraser un résultat plus frais.
 */
export function useApiList<T>(
  fetcher: () => Promise<any>,
  deps: React.DependencyList,
  options?: { errorMessage?: string }
): { items: T[]; loading: boolean; error: string } {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Numéro de requête : seule la dernière lancée a le droit d'écrire dans l'état.
  const requestId = useRef(0);

  useEffect(() => {
    const current = ++requestId.current;
    let mounted = true;
    setLoading(true);
    setError('');

    fetcher()
      .then((res: any) => {
        if (!mounted || current !== requestId.current) return;
        const list = res?.data ?? res?.items ?? res?.results ?? [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch((err: any) => {
        if (!mounted || current !== requestId.current) return;
        console.error('useApiList failed:', err);
        setItems([]);
        setError(options?.errorMessage ?? 'Unable to load data. Please try again later.');
      })
      .finally(() => {
        if (mounted && current === requestId.current) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // `fetcher` est recréé à chaque rendu : ce sont les filtres (deps) qui pilotent le rechargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { items, loading, error };
}

export default useApiList;
