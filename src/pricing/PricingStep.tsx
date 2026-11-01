import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Offer, paymentPlan, PricedServiceDto, PricingData, quoteSelection, tierCovers } from './pricingEngine';
import { CONSULTATION_OFFER, effectiveOption, PriceChoice } from './priceChoice';
import { allowedInstallments, INSTALLMENTS } from './paymentRules';
import { formatMoney, useCurrency } from './currency';
import ConsultationSlotPicker from './ConsultationSlotPicker';

// Étape « Prix et package » des parcours Study et Tourisme : détail à la carte, offres
// (la moins chère est conseillée), option consultation (avec son créneau), mode de
// paiement (1, 2 ou 3 fois ; une fois depuis l'Afrique) et total.

interface Props {
  pricing: PricingData | null;
  pricingError?: boolean;
  codes: string[];
  choice: PriceChoice;
  onChange: (choice: PriceChoice) => void;
  /** Palier demandé depuis /packages (?package=slug) : signalé s'il ne couvre pas la sélection. */
  requestedSlug?: string | null;
  /** Voyageurs du dossier (services voyage : N inclus, puis majoration par voyageur). */
  travelers?: number;
  /** Pays de résidence du projet : décide des échéances proposées. */
  residence?: string | null;
  /** false = remise de premier achat déjà utilisée par ce compte. */
  firstPurchase?: boolean | null;
}

/** Nom d'un service : la base fait foi en français, la traduction sert en anglais / allemand. */
export function useServiceName() {
  const { t, i18n } = useTranslation('study');
  return (s: Pick<PricedServiceDto, 'code' | 'name'>) =>
    (i18n.language?.startsWith('fr') ? s.name : t(`svc.${s.code}`, { defaultValue: s.name }));
}

const PricingStep: React.FC<Props> = ({ pricing, pricingError, codes, choice, onChange, requestedSlug, travelers = 1, residence, firstPurchase }) => {
  useCurrency();
  const { t } = useTranslation('study');
  const serviceName = useServiceName();
  const allowed = allowedInstallments(residence);

  // Résidence passée en Afrique (ou effacée) : on revient au paiement en une fois.
  useEffect(() => {
    if (!allowed.includes(choice.installments)) onChange({ ...choice, installments: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residence, choice.installments]);

  if (pricingError) return <p className="text-sm text-red-600">{t('pricing.load_error')}</p>;
  if (!pricing) return <p className="text-sm text-gray-500">{t('pricing.loading')}</p>;

  const quote = quoteSelection(codes, pricing, { travelers });
  const consultation = pricing.packages.find(p => p.family === 'consultation');
  const requested = requestedSlug ? pricing.packages.find(p => p.slug === requestedSlug) : null;
  const isConsultation = choice.offerId === CONSULTATION_OFFER;
  const currency = pricing.currency;

  const offerName = (o: Offer) => o.lines
    .map(l => (l.kind === 'alacarte' ? t(l.family === 'study' ? 'pricing.alacarte_study' : 'pricing.alacarte_tourism') : l.label))
    .join(' + ');

  const consultationCard = consultation && (
    <div className={`rounded-xl border-2 border-dashed transition-colors ${isConsultation ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}>
      <button type="button" aria-pressed={isConsultation}
        onClick={() => onChange({ ...choice, offerId: isConsultation ? null : CONSULTATION_OFFER, installments: 1 })}
        className="w-full flex flex-wrap items-center justify-between gap-2 text-left px-4 py-3">
        <span>
          <span className="font-semibold text-gray-900">{t('pricing.consultation_name', { defaultValue: consultation.name })}</span>
          <span className="block text-xs text-gray-500">{t('pricing.consultation_hint')}</span>
        </span>
        <span className="font-bold text-gray-900">{formatMoney(consultation.price_from_cents, currency)}</span>
      </button>
      {isConsultation && (
        <div className="px-4 pb-4">
          <ConsultationSlotPicker value={choice.consultationSlot} onChange={consultationSlot => onChange({ ...choice, consultationSlot })} />
        </div>
      )}
    </div>
  );

  if (!quote.services.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">{t('pricing.pick_service')}</p>
        {requested && <p className="text-sm text-blue-800 bg-blue-50 rounded-lg p-3">{t('pricing.requested_pick', { name: requested.name, label: requested.service_label ?? '' })}</p>}
        {consultationCard}
      </div>
    );
  }

  const offers = quote.offers.slice(0, 5);
  const selected = isConsultation ? null : offers.find(o => o.id === choice.offerId) ?? quote.recommended;
  const basePrice = isConsultation ? consultation?.price_from_cents ?? 0 : selected?.priceCents ?? 0;
  const requestedCovers = requested && quote.offers.some(o => o.lines.some(l => l.slug === requested.slug));
  const ctx = { residence, firstPurchase };
  const options = INSTALLMENTS
    .map(n => pricing.payment_options.find(o => o.installments === n) ?? (n === 1 ? { installments: 1, discount_pct: 0 } : null))
    .filter((o): o is { installments: number; discount_pct: number } => !!o);
  const travelPolicy = pricing.traveler_policy ?? { included: 2, extra_pct: 25 };
  const extraTravelers = Math.max(0, travelers - travelPolicy.included);
  const requestedFamilyServices = requested ? quote.services.filter(s => s.family === requested.family) : [];

  return (
    <div className="space-y-5">
      {/* Détail à la carte */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {quote.services.map(s => (
              <tr key={s.code} className="border-b border-gray-100">
                <td className="px-3 py-1.5 text-gray-400 w-12">{s.code}</td>
                <td className="px-3 py-1.5 text-gray-700">{serviceName(s)}</td>
                <td className="px-3 py-1.5 text-right text-gray-900 whitespace-nowrap">{formatMoney(s.price_cents, currency)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-3 py-2" colSpan={2}>{t('pricing.value', { count: quote.services.length })}</td>
              <td className="px-3 py-2 text-right" data-testid="price-value">{formatMoney(quote.valueCents, currency)}</td>
            </tr>
          </tbody>
        </table>
        {quote.services.some(sv => sv.family === 'tourism') && (
          <p className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100" data-testid="traveler-note">
            {extraTravelers > 0
              ? t('pricing.travelers_extra', { included: travelPolicy.included, travelers, pct: extraTravelers * travelPolicy.extra_pct })
              : t('pricing.travelers_included', { included: travelPolicy.included, pct: travelPolicy.extra_pct })}
          </p>
        )}
      </div>

      {requested && !requestedCovers && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3" data-testid="requested-package-note">
          {tierCovers(requested, requestedFamilyServices.length, requestedFamilyServices.reduce((n, s) => n + s.price_cents, 0))
            ? t('pricing.requested_cheaper', { name: requested.name })
            : t('pricing.requested_not_covering', { name: requested.name })}
        </p>
      )}

      {/* Offres */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t('pricing.your_offer')}</p>
        <div className="space-y-2" role="group" aria-label={t('pricing.your_offer')}>
          {offers.map(o => {
            const active = !isConsultation && selected?.id === o.id;
            const isRecommended = quote.recommended?.id === o.id;
            return (
              <button key={o.id} type="button" aria-pressed={active}
                onClick={() => onChange({ ...choice, offerId: o.id })}
                className={`w-full flex flex-wrap items-center justify-between gap-2 text-left px-4 py-3 rounded-xl border-2 transition-colors ${active ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                <span>
                  <span className="font-semibold text-gray-900">{offerName(o)}</span>
                  {isRecommended && <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary text-white">{t('pricing.recommended')}</span>}
                </span>
                <span className="text-right">
                  <span className="font-bold text-gray-900">{formatMoney(o.priceCents, currency)}</span>
                  {o.savingsCents > 0 && <span className="block text-xs text-emerald-700">{t('pricing.saving', { amount: formatMoney(o.savingsCents, currency) })}</span>}
                </span>
              </button>
            );
          })}
          {consultationCard}
        </div>
      </div>

      {/* Paiement : sur le prix de l'offre retenue */}
      {!isConsultation && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t('pricing.payment_mode')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={t('pricing.payment_mode')}>
            {options.map(opt => {
              const enabled = allowed.includes(opt.installments);
              // Montant de l'option elle-même, même grisée (sans la ramener à une fois).
              const effective = firstPurchase === false ? { ...opt, discount_pct: 0 } : opt;
              const plan = paymentPlan(basePrice, effective);
              const active = choice.installments === opt.installments;
              return (
                <button key={opt.installments} type="button" aria-pressed={active} disabled={!enabled}
                  onClick={() => onChange({ ...choice, installments: opt.installments })}
                  className={`text-left px-3 py-2 rounded-xl border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                  <span className="block text-sm font-semibold text-gray-900">
                    {t('pricing.installments', { count: opt.installments })}
                    {enabled && effective.discount_pct > 0 && <span className="ml-1 text-emerald-700">−{effective.discount_pct} %</span>}
                  </span>
                  <span className="block text-xs text-gray-600">
                    {opt.installments === 1 ? formatMoney(plan.totalCents, currency) : `${opt.installments} × ${formatMoney(plan.perInstallmentCents, currency)}`}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500" data-testid="payment-rules-note">
            {[
              options.some(o => o.discount_pct > 0) && (firstPurchase === false ? t('pricing.discount_used') : t('pricing.discount_first')),
              allowed.length === 1 && (residence ? t('pricing.single_zone') : t('pricing.single_unknown')),
            ].filter(Boolean).join(' ')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-gray-900 text-white px-4 py-3">
        <span className="text-sm">{t('pricing.total')}</span>
        <span className="text-lg font-bold" data-testid="price-total">
          {isConsultation
            ? formatMoney(basePrice, currency)
            : (() => {
              const plan = paymentPlan(basePrice, effectiveOption(pricing, choice.installments, ctx));
              return plan.installments > 1
                ? `${plan.installments} × ${formatMoney(plan.perInstallmentCents, currency)} (${formatMoney(plan.totalCents, currency)})`
                : formatMoney(plan.totalCents, currency);
            })()}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        {t('pricing.footnote')} <Link to="/packages" className="underline">{t('pricing.see_grid')}</Link>.
      </p>
    </div>
  );
};

export default PricingStep;
