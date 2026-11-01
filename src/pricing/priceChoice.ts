import { formatEuros, offerLabel, paymentPlan, PricingData, quoteSelection } from './pricingEngine';
import { allowedInstallments, INSTALLMENTS } from './paymentRules';

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
  /** Consultation : créneau réservé (ISO UTC). */
  consultationSlot?: string | null;
}

export interface PriceChoice {
  offerId: string | null;
  installments: number;
  /** Consultation : créneau choisi (ISO UTC), envoyé au paiement. */
  consultationSlot?: string | null;
  snapshot?: PriceSnapshot | null;
}

export const CONSULTATION_OFFER = 'consultation';

export function emptyPriceChoice(): PriceChoice {
  return { offerId: null, installments: 1, consultationSlot: null, snapshot: null };
}

export function normalizePriceChoice(raw: any): PriceChoice {
  return {
    offerId: typeof raw?.offerId === 'string' ? raw.offerId : null,
    // Les anciens choix en 6 ou 12 fois (avant le 31/10/2026) repassent en une fois.
    installments: INSTALLMENTS.includes(raw?.installments) ? raw.installments : 1,
    consultationSlot: typeof raw?.consultationSlot === 'string' ? raw.consultationSlot : null,
    snapshot: raw?.snapshot && typeof raw.snapshot.totalCents === 'number' ? raw.snapshot : null,
  };
}

export interface PaymentContext {
  /** Pays de résidence : en Afrique (ou inconnu), paiement en une fois seulement. */
  residence?: string | null;
  /** false = la remise de premier achat a déjà servi. */
  firstPurchase?: boolean | null;
}

/** Option de paiement réellement applicable : échéances autorisées, remise au premier achat. */
export function effectiveOption(data: PricingData, installments: number, ctx: PaymentContext = {}) {
  const n = allowedInstallments(ctx.residence).includes(installments) ? installments : 1;
  const option = data.payment_options.find(o => o.installments === n) ?? { installments: 1, discount_pct: 0 };
  return ctx.firstPurchase === false ? { ...option, discount_pct: 0 } : option;
}

/** Montants de l'offre choisie (ou conseillée) pour une sélection de services. */
export function computeSnapshot(codes: string[], data: PricingData, choice: PriceChoice, travelers = 1, ctx: PaymentContext = {}): PriceSnapshot | null {
  const option = effectiveOption(data, choice.installments, ctx);

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
      consultationSlot: choice.consultationSlot ?? null,
    };
  }

  const quote = quoteSelection(codes, data, { travelers });
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

type Translate = (key: string, opts?: Record<string, unknown>) => string;

/**
 * « Study FULL — 1 290 € · paiement unique 1 161 € (−10 %) ». Le prix du package choisi
 * seulement : la valeur à la carte figure déjà dans le détail du prix.
 * Sans `t` (message envoyé au conseiller), le libellé reste en français.
 */
export function snapshotLabel(s: PriceSnapshot, t?: Translate): string {
  // Le libellé est enregistré en français : ses parties génériques suivent la langue du site.
  const label = t
    ? s.offerLabel
      .replace('Études à la carte', t('pricing.alacarte_study'))
      .replace('Tourisme à la carte', t('pricing.alacarte_tourism'))
      .replace('Consultation personnalisée', t('pricing.consultation_name'))
    : s.offerLabel;
  const base = `${label} — ${formatEuros(s.priceCents, s.currency)}`;
  const discount = s.discountPct > 0 ? ` (−${s.discountPct} %)` : '';
  const pay = s.installments > 1
    ? ` · ${s.installments} × ${formatEuros(s.perInstallmentCents, s.currency)}${discount}`
    : s.discountPct > 0
      ? ` · ${t ? t('pricing.single_payment') : 'paiement unique'} ${formatEuros(s.totalCents, s.currency)}${discount}`
      : '';
  return `${base}${pay}`;
}
