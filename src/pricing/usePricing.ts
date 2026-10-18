import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { PricingData } from './pricingEngine';

// La grille change rarement : une requête par chargement de page suffit, partagée
// entre les composants (parcours, récapitulatif, dashboard).
let cache: Promise<PricingData> | null = null;

function fetchPricing(): Promise<PricingData> {
  if (!cache) {
    cache = apiService.getPricing().then((r: any) => ({
      currency: r?.currency ?? 'EUR',
      services: r?.services ?? [],
      packages: r?.packages ?? [],
      payment_options: r?.payment_options ?? [],
    })).catch(err => {
      cache = null; // une panne ne doit pas figer la page : on réessaiera au prochain montage
      throw err;
    });
  }
  return cache;
}

export function usePricing(): { pricing: PricingData | null; error: boolean } {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetchPricing()
      .then(d => mounted && setPricing(d))
      .catch(() => mounted && setError(true));
    return () => { mounted = false; };
  }, []);
  return { pricing, error };
}
