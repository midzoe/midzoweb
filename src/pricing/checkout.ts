import { apiService } from '../services/api';

/**
 * Ouvre le paiement Stripe d'une offre de la grille. Le serveur recalcule le prix à partir
 * des services, de l'offre et du nombre d'échéances : aucun montant ne part du navigateur.
 * Renvoie un message d'erreur lisible, ou redirige vers Stripe (pas de retour).
 */
export const TERMS_VERSION = '2026-10-19';

export async function goToCheckout(params: { codes: string[]; offerId?: string | null; installments: number; tripId?: number; travelers?: number; acceptTerms: boolean }): Promise<string | null> {
  if (!params.acceptTerms) return 'Acceptez les conditions générales de vente et la politique de remboursement pour payer.';
  try {
    const res = await apiService.createPaymentCheckout({
      codes: params.codes,
      offer_id: params.offerId ?? undefined,
      installments: params.installments,
      trip_id: params.tripId,
      travelers: params.travelers,
      accept_terms: true,
      terms_version: TERMS_VERSION,
    });
    if (res?.checkout_url) {
      window.location.assign(res.checkout_url);
      return null;
    }
    return 'Le paiement n’a pas pu être ouvert. Réessayez dans un instant.';
  } catch (err: any) {
    if (err?.status === 401) return 'Votre session a expiré : reconnectez-vous pour payer.';
    if (err?.status === 503) return 'Le paiement en ligne n’est pas encore activé. Envoyez votre demande : un conseiller vous indiquera comment régler.';
    if (err?.status === 422) return 'Cette offre ne couvre pas votre sélection : choisissez une autre offre.';
    return 'Le paiement n’a pas pu être ouvert. Réessayez dans un instant.';
  }
}
