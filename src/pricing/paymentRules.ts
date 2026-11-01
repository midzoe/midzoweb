import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AFRICAN_COUNTRIES } from '../data/africanCountries';

/**
 * Règles de paiement (31/10/2026) — mêmes règles que `midzobackend/lib/payment-rules.ts`,
 * qui fait foi au moment du paiement :
 *  - paiement en 1, 2 ou 3 fois ;
 *  - résidents d'Afrique (ou résidence inconnue) : une fois uniquement ;
 *  - la remise de paiement ne vaut que pour le premier achat (hors consultation).
 */
export const INSTALLMENTS = [1, 2, 3];

const AFRICA = new Set([...AFRICAN_COUNTRIES.map(c => c.value), "Côte d'Ivoire", 'Ivory Coast']);

export const isAfrica = (country?: string | null) => !!country && AFRICA.has(country.trim());

export function allowedInstallments(residence?: string | null): number[] {
  return !residence || isAfrica(residence) ? [1] : INSTALLMENTS;
}

export interface PaymentEligibility {
  /** null tant que l'on ne sait pas (visiteur, ou backend pas encore à jour) : remise affichée. */
  firstPurchase: boolean | null;
}

/** Remise de premier achat encore due pour le compte connecté. */
export function usePaymentEligibility(userId?: number | string | null): PaymentEligibility {
  const [firstPurchase, setFirstPurchase] = useState<boolean | null>(null);
  useEffect(() => {
    setFirstPurchase(null);
    if (!userId) return;
    let mounted = true;
    apiService.getPaymentEligibility()
      .then(r => mounted && setFirstPurchase(typeof r?.first_purchase === 'boolean' ? r.first_purchase : null))
      .catch(() => { /* backend non redéployé : on garde l'affichage par défaut */ });
    return () => { mounted = false; };
  }, [userId]);
  return { firstPurchase };
}
