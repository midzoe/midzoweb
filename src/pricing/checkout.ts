import { apiService } from '../services/api';
import i18n from '../i18n/config';
import { visitorTimeZone } from './ConsultationSlotPicker';

/**
 * Ouvre le paiement Stripe d'une offre de la grille. Le serveur recalcule le prix à partir
 * des services, de l'offre et du nombre d'échéances : aucun montant ne part du navigateur.
 * Renvoie un message d'erreur lisible, ou redirige vers Stripe (pas de retour).
 */
export const TERMS_VERSION = '2026-10-31';

const t = (key: string) => i18n.t(`study:pricing.${key}`);

export async function goToCheckout(params: {
  codes: string[]; offerId?: string | null; installments: number; tripId?: number; travelers?: number;
  residence?: string | null; consultationSlot?: string | null; acceptTerms: boolean;
}): Promise<string | null> {
  if (!params.acceptTerms) return t('err_terms');
  if (params.offerId === 'consultation' && !params.consultationSlot) return t('err_slot_missing');
  try {
    const res = await apiService.createPaymentCheckout({
      codes: params.codes,
      offer_id: params.offerId ?? undefined,
      installments: params.installments,
      trip_id: params.tripId,
      travelers: params.travelers,
      residence: params.residence || undefined,
      consultation_slot: params.consultationSlot || undefined,
      client_timezone: params.consultationSlot ? visitorTimeZone() ?? undefined : undefined,
      accept_terms: true,
      terms_version: TERMS_VERSION,
    });
    if (res?.checkout_url) {
      window.location.assign(res.checkout_url);
      return null;
    }
    return t('err_generic');
  } catch (err: any) {
    if (err?.status === 401) return t('err_session');
    if (err?.status === 503) return t('err_disabled');
    if (err?.status === 409) return t('err_slot_taken');
    if (err?.status === 422 && /installments/.test(err?.message ?? '')) return t('err_installments');
    if (err?.status === 422) return t('err_offer');
    return t('err_generic');
  }
}

/** Retour de connexion : la page reprend le paiement là où le visiteur l'avait laissé. */
export const RESUME_PAY_PARAM = 'pay';

export function loginToPayHref(path: string): string {
  const sep = path.includes('?') ? '&' : '?';
  return `/login?redirect=${encodeURIComponent(`${path}${sep}${RESUME_PAY_PARAM}=1`)}`;
}
