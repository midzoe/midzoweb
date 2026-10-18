import React from 'react';
import { Link } from 'react-router-dom';
import { formatEuros, offerLabel, paymentPlan, PricingData, quoteSelection, tierCovers } from './pricingEngine';
import { CONSULTATION_OFFER, PriceChoice } from './priceChoice';

// Étape « Prix et package » des parcours Study et Tourisme : détail à la carte, offres
// (la moins chère est conseillée), option consultation, mode de paiement et total.

interface Props {
  pricing: PricingData | null;
  pricingError?: boolean;
  codes: string[];
  choice: PriceChoice;
  onChange: (choice: PriceChoice) => void;
  /** Palier demandé depuis /packages (?package=slug) : signalé s'il ne couvre pas la sélection. */
  requestedSlug?: string | null;
}

const PricingStep: React.FC<Props> = ({ pricing, pricingError, codes, choice, onChange, requestedSlug }) => {
  if (pricingError) return <p className="text-sm text-red-600">Les tarifs n'ont pas pu être chargés. Réessayez dans un instant.</p>;
  if (!pricing) return <p className="text-sm text-gray-500">Chargement des tarifs…</p>;

  const quote = quoteSelection(codes, pricing);
  const consultation = pricing.packages.find(p => p.family === 'consultation');
  const requested = requestedSlug ? pricing.packages.find(p => p.slug === requestedSlug) : null;

  if (!quote.services.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Choisissez au moins un service pour voir le prix et le package conseillé.</p>
        {requested && <p className="text-sm text-blue-800 bg-blue-50 rounded-lg p-3">Package demandé : <strong>{requested.name}</strong> ({requested.service_label}). Choisissez vos services : nous vérifierons qu'il les couvre.</p>}
      </div>
    );
  }

  const offers = quote.offers.slice(0, 5);
  const isConsultation = choice.offerId === CONSULTATION_OFFER;
  const selected = isConsultation ? null : offers.find(o => o.id === choice.offerId) ?? quote.recommended;
  const basePrice = isConsultation ? consultation?.price_from_cents ?? 0 : selected?.priceCents ?? 0;
  const currency = pricing.currency;
  const requestedCovers = requested && quote.offers.some(o => o.lines.some(l => l.slug === requested.slug));

  return (
    <div className="space-y-5">
      {/* Détail à la carte */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {quote.services.map(s => (
              <tr key={s.code} className="border-b border-gray-100">
                <td className="px-3 py-1.5 text-gray-400 w-12">{s.code}</td>
                <td className="px-3 py-1.5 text-gray-700">{s.name}</td>
                <td className="px-3 py-1.5 text-right text-gray-900 whitespace-nowrap">{formatEuros(s.price_cents, currency)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-3 py-2" colSpan={2}>Valeur à la carte ({quote.services.length} service{quote.services.length > 1 ? 's' : ''})</td>
              <td className="px-3 py-2 text-right" data-testid="price-value">{formatEuros(quote.valueCents, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {requested && !requestedCovers && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3" data-testid="requested-package-note">
          Le package <strong>{requested.name}</strong> ({requested.service_label}
          {requested.value_cap_cents ? `, jusqu'à ${formatEuros(requested.value_cap_cents, currency)} de services` : ''})
          {tierCovers(requested, quote.services.filter(s => s.family === requested.family).length, quote.services.filter(s => s.family === requested.family).reduce((n, s) => n + s.price_cents, 0))
            ? ' couvre bien votre sélection, mais la payer à la carte revient moins cher.'
            : ' ne couvre pas votre sélection.'}
          {' '}Voici les options adaptées.
        </p>
      )}

      {/* Offres */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Votre offre</p>
        <div className="space-y-2" role="group" aria-label="Offre">
          {offers.map(o => {
            const active = !isConsultation && selected?.id === o.id;
            const isRecommended = quote.recommended?.id === o.id;
            return (
              <button key={o.id} type="button" aria-pressed={active}
                onClick={() => onChange({ ...choice, offerId: o.id })}
                className={`w-full flex flex-wrap items-center justify-between gap-2 text-left px-4 py-3 rounded-xl border-2 transition-colors ${active ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                <span>
                  <span className="font-semibold text-gray-900">{offerLabel(o)}</span>
                  {isRecommended && <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary text-white">Conseillé</span>}
                </span>
                <span className="text-right">
                  <span className="font-bold text-gray-900">{formatEuros(o.priceCents, currency)}</span>
                  {o.savingsCents > 0 && <span className="block text-xs text-emerald-700">économie {formatEuros(o.savingsCents, currency)}</span>}
                </span>
              </button>
            );
          })}
          {consultation && (
            <button type="button" aria-pressed={isConsultation}
              onClick={() => onChange({ ...choice, offerId: isConsultation ? null : CONSULTATION_OFFER, installments: 1 })}
              className={`w-full flex flex-wrap items-center justify-between gap-2 text-left px-4 py-3 rounded-xl border-2 border-dashed transition-colors ${isConsultation ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}>
              <span>
                <span className="font-semibold text-gray-900">{consultation.name}</span>
                <span className="block text-xs text-gray-500">Pas sûr ? Un expert analyse votre projet ; {consultation.features?.[1] ?? '5 % de remise sur le package choisi ensuite'}.</span>
              </span>
              <span className="font-bold text-gray-900">{formatEuros(consultation.price_from_cents, currency)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Paiement */}
      {!isConsultation && pricing.payment_options.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Mode de paiement</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Paiement">
            {pricing.payment_options.map(opt => {
              const plan = paymentPlan(basePrice, opt);
              const active = choice.installments === opt.installments;
              return (
                <button key={opt.installments} type="button" aria-pressed={active}
                  onClick={() => onChange({ ...choice, installments: opt.installments })}
                  className={`text-left px-3 py-2 rounded-xl border-2 transition-colors ${active ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                  <span className="block text-sm font-semibold text-gray-900">
                    {opt.installments === 1 ? 'En 1 fois' : `En ${opt.installments} fois`}
                    {opt.discount_pct > 0 && <span className="ml-1 text-emerald-700">−{opt.discount_pct} %</span>}
                  </span>
                  <span className="block text-xs text-gray-600">
                    {opt.installments === 1 ? formatEuros(plan.totalCents, currency) : `${opt.installments} × ${formatEuros(plan.perInstallmentCents, currency)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-gray-900 text-white px-4 py-3">
        <span className="text-sm">Total estimé</span>
        <span className="text-lg font-bold" data-testid="price-total">
          {isConsultation
            ? formatEuros(basePrice, currency)
            : (() => {
              const opt = pricing.payment_options.find(o => o.installments === choice.installments) ?? { installments: 1, discount_pct: 0 };
              const plan = paymentPlan(basePrice, opt);
              return plan.installments > 1
                ? `${plan.installments} × ${formatEuros(plan.perInstallmentCents, currency)} (${formatEuros(plan.totalCents, currency)})`
                : formatEuros(plan.totalCents, currency);
            })()}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Montants calculés sur la grille tarifaire MIDZOE. Après votre demande, un conseiller confirme l'offre et vous transmet
        les modalités de paiement. <Link to="/packages" className="underline">Voir la grille complète</Link>.
      </p>
    </div>
  );
};

export default PricingStep;
