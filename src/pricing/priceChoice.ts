import { formatEuros, offerLabel, paymentPlan, PricingData, quoteSelection } from './pricingEngine';

/**
 * Choix tarifaire enregistré avec un projet : l'offre retenue (null = celle que l'on
 * conseille), le nombre d'échéances, et l'instantané des montants au moment de
 * l'enregistrement — le dashboard et la demande l'affichent sans recalculer.
 */
export interface PriceSnapshot {
  offerId: string;
  offerLabel: string;
  valueCents: number;
  priceCents: number;
  savingsCents: number;
  installments: number;
  discountPct: number;
  perInstallmentCents: number;
  totalCents: number;
  currency: string;
  computedAt: string;
}

export interface PriceChoice {
  offerId: string | null;
  installments: number;
  snapshot?: PriceSnapshot | null;
}

export const CONSULTATION_OFFER = 'consultation';

export function emptyPriceChoice(): PriceChoice {
  return { offerId: null, installments: 1, snapshot: null };
}

export function normalizePriceChoice(raw: any): PriceChoice {
  return {
    offerId: typeof raw?.offerId === 'string' ? raw.offerId : null,
    installments: [1, 3, 6, 12].includes(raw?.installments) ? raw.installments : 1,
    snapshot: raw?.snapshot && typeof raw.snapshot.totalCents === 'number' ? raw.snapshot : null,
  };
}

/** Montants de l'offre choisie (ou conseillée) pour une sélection de services. */
export function computeSnapshot(codes: string[], data: PricingData, choice: PriceChoice): PriceSnapshot | null {
  const option = data.payment_options.find(o => o.installments === choice.installments)
    ?? data.payment_options[0] ?? { installments: 1, discount_pct: 0 };

  if (choice.offerId === CONSULTATION_OFFER) {
    const consultation = data.packages.find(p => p.family === 'consultation');
    if (!consultation) return null;
    return {
      offerId: CONSULTATION_OFFER,
      offerLabel: consultation.name,
      valueCents: consultation.price_from_cents,
      priceCents: consultation.price_from_cents,
      savingsCents: 0,
      installments: 1,
      discountPct: 0,
      perInstallmentCents: consultation.price_from_cents,
      totalCents: consultation.price_from_cents,
      currency: data.currency,
      computedAt: new Date().toISOString(),
    };
  }

  const quote = quoteSelection(codes, data);
  const offer = quote.offers.find(o => o.id === choice.offerId) ?? quote.recommended;
  if (!offer) return null;
  const plan = paymentPlan(offer.priceCents, option);
  return {
    offerId: offer.id,
    offerLabel: offerLabel(offer),
    valueCents: offer.valueCents,
    priceCents: offer.priceCents,
    savingsCents: offer.savingsCents,
    installments: plan.installments,
    discountPct: plan.discountPct,
    perInstallmentCents: plan.perInstallmentCents,
    totalCents: plan.totalCents,
    currency: data.currency,
    computedAt: new Date().toISOString(),
  };
}

export function snapshotLabel(s: PriceSnapshot): string {
  const base = `${s.offerLabel} — ${formatEuros(s.priceCents, s.currency)}`;
  const saving = s.savingsCents > 0 ? ` (au lieu de ${formatEuros(s.valueCents, s.currency)})` : '';
  const pay = s.installments > 1
    ? ` · ${s.installments} × ${formatEuros(s.perInstallmentCents, s.currency)} (−${s.discountPct} %)`
    : s.discountPct > 0 ? ` · paiement unique ${formatEuros(s.totalCents, s.currency)} (−${s.discountPct} %)` : '';
  return `${base}${saving}${pay}`;
}
