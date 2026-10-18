/**
 * Moteur de prix MIDZOE — fonctions pures, sans appel réseau.
 *
 * Données : `GET /api/pricing` (prix unitaire des services S1..S11 / T1..T10, paliers
 * Study / Tourism / Mix avec leur couverture, remises selon le nombre d'échéances).
 *
 * Règles :
 *  - Un palier d'une famille couvre une sélection de cette famille si le nombre de services
 *    ne dépasse pas son maximum et si la valeur à la carte ne dépasse pas son plafond
 *    (« jusqu'à 400 € »). Le minimum affiché (« 4 à 6 services ») est indicatif.
 *  - Un palier n'est proposé que s'il coûte moins cher que la même sélection à la carte.
 *  - Un palier Mix exige au moins un service études ET un service tourisme ; il couvre la
 *    valeur cumulée jusqu'à son plafond.
 *  - L'offre conseillée est la moins chère : à la carte, palier(s) par famille, ou Mix.
 *  - La remise de paiement s'applique au montant de l'offre retenue.
 */

export interface PricedServiceDto {
  code: string;
  family: 'study' | 'tourism' | string;
  name: string;
  complexity?: string | null;
  price_cents: number;
  currency?: string;
  order?: number;
}

export interface TierDto {
  id: number;
  slug: string | null;
  name: string;
  family: string | null;
  price_from_cents: number;
  currency?: string;
  service_label?: string | null;
  tagline?: string | null;
  features?: string[];
  min_services?: number | null;
  max_services?: number | null;
  value_cap_cents?: number | null;
  order?: number;
}

export interface PaymentOptionDto { installments: number; discount_pct: number }

export interface PricingData {
  currency: string;
  services: PricedServiceDto[];
  packages: TierDto[];
  payment_options: PaymentOptionDto[];
}

export type OfferKind = 'alacarte' | 'tier' | 'mix';

/** Une ligne d'offre : une famille payée à la carte, un palier, ou un palier Mix. */
export interface OfferLine {
  kind: OfferKind;
  family: 'study' | 'tourism' | 'mix';
  label: string;
  slug?: string;
  valueCents: number;
  priceCents: number;
  serviceCount: number;
}

export interface Offer {
  /** Identifiant stable : « alacarte », un slug de palier, ou « study-plus+tourism-start ». */
  id: string;
  lines: OfferLine[];
  priceCents: number;
  valueCents: number;
  savingsCents: number;
}

export interface Quote {
  services: PricedServiceDto[];
  unknownCodes: string[];
  valueCents: number;
  offers: Offer[];
  recommended: Offer | null;
}

const sum = (list: PricedServiceDto[]) => list.reduce((n, s) => n + s.price_cents, 0);

export function tierCovers(tier: TierDto, count: number, valueCents: number): boolean {
  if (count === 0) return false;
  if (tier.max_services != null && count > tier.max_services) return false;
  if (tier.value_cap_cents != null && valueCents > tier.value_cap_cents) return false;
  return true;
}

function familyLines(family: 'study' | 'tourism', services: PricedServiceDto[], tiers: TierDto[]): OfferLine[] {
  if (!services.length) return [];
  const value = sum(services);
  const lines: OfferLine[] = [{
    kind: 'alacarte', family, label: 'À la carte', valueCents: value, priceCents: value, serviceCount: services.length,
  }];
  tiers
    .filter(t => t.family === family && tierCovers(t, services.length, value) && t.price_from_cents < value)
    .forEach(t => lines.push({
      kind: 'tier', family, label: t.name, slug: t.slug ?? undefined,
      valueCents: value, priceCents: t.price_from_cents, serviceCount: services.length,
    }));
  return lines;
}

function makeOffer(lines: OfferLine[]): Offer {
  const priceCents = lines.reduce((n, l) => n + l.priceCents, 0);
  const valueCents = lines.reduce((n, l) => n + l.valueCents, 0);
  const id = lines.every(l => l.kind === 'alacarte') ? 'alacarte' : lines.map(l => l.slug ?? `${l.family}-alacarte`).join('+');
  return { id, lines, priceCents, valueCents, savingsCents: valueCents - priceCents };
}

/** Devis d'une sélection de services (codes S1..T10). Les codes inconnus sont ignorés et signalés. */
export function quoteSelection(codes: string[], data: PricingData): Quote {
  const byCode = new Map(data.services.map(s => [s.code, s]));
  const unique = [...new Set(codes)];
  const services = unique.map(c => byCode.get(c)).filter((s): s is PricedServiceDto => !!s);
  const unknownCodes = unique.filter(c => !byCode.has(c));
  const study = services.filter(s => s.family === 'study');
  const tourism = services.filter(s => s.family === 'tourism');
  const valueCents = sum(services);
  if (!services.length) return { services, unknownCodes, valueCents, offers: [], recommended: null };

  const studyLines = familyLines('study', study, data.packages);
  const tourismLines = familyLines('tourism', tourism, data.packages);

  // Combinaisons famille par famille (à la carte ou palier, indépendamment).
  const offers: Offer[] = [];
  const studyChoices = studyLines.length ? studyLines : [null];
  const tourismChoices = tourismLines.length ? tourismLines : [null];
  for (const a of studyChoices) {
    for (const b of tourismChoices) {
      const lines = [a, b].filter((l): l is OfferLine => !!l);
      if (lines.length) offers.push(makeOffer(lines));
    }
  }

  // Paliers Mix : un service de chaque famille au minimum, valeur cumulée sous le plafond.
  if (study.length && tourism.length) {
    data.packages
      .filter(t => t.family === 'mix' && (t.value_cap_cents == null || valueCents <= t.value_cap_cents) && t.price_from_cents < valueCents)
      .forEach(t => offers.push(makeOffer([{
        kind: 'mix', family: 'mix', label: t.name, slug: t.slug ?? undefined,
        valueCents, priceCents: t.price_from_cents, serviceCount: services.length,
      }])));
  }

  offers.sort((x, y) => x.priceCents - y.priceCents || x.lines.length - y.lines.length);
  return { services, unknownCodes, valueCents, offers, recommended: offers[0] ?? null };
}

/** Offre correspondant à un palier imposé (ex. venu de /packages), si ce palier couvre la sélection. */
export function offerForTier(quote: Quote, slug: string): Offer | null {
  return quote.offers.find(o => o.lines.some(l => l.slug === slug)) ?? null;
}

export interface PaymentPlan {
  installments: number;
  discountPct: number;
  totalCents: number;
  perInstallmentCents: number;
}

/**
 * Remise selon le nombre d'échéances. Échéance arrondie à l'euro, comme dans la grille
 * (Mix XXL 1 690 € : 1× 1 521 €, 3× 535 €, 6× 276 €, 12× 139 €).
 */
export function paymentPlan(priceCents: number, option: PaymentOptionDto): PaymentPlan {
  const discounted = priceCents * (1 - option.discount_pct / 100);
  const n = Math.max(1, option.installments);
  const per = Math.round(discounted / n / 100) * 100;
  return {
    installments: n,
    discountPct: option.discount_pct,
    perInstallmentCents: per,
    totalCents: n === 1 ? Math.round(discounted / 100) * 100 : per * n,
  };
}

export function formatEuros(cents: number, currency = 'EUR'): string {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
  } catch {
    return `${Math.round(cents / 100)} ${currency}`;
  }
}

export function offerLabel(offer: Offer): string {
  return offer.lines.map(l => (l.kind === 'alacarte' ? `${l.family === 'study' ? 'Études' : 'Tourisme'} à la carte` : l.label)).join(' + ');
}
