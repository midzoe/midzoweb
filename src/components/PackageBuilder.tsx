import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CategoryNode,
  Selection,
  toggleCategory,
  toggleSubcategory,
  formatAmount,
} from './premium/quoteHelpers';

interface Quote {
  is_custom: boolean;
  package: { id: number; name: string } | null;
  base_price_cents: number;
  subcategories_price_cents: number;
  subtotal_cents: number;
  discount_pct: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
}

interface Upsell {
  package: { id: number; name: string };
  quote: Quote;
  added_categories: string[];
  delta_cents: number; // SIGNÉ (négatif = le full est moins cher)
}

const QUOTE_DEBOUNCE_MS = 300;

const PackageBuilder: React.FC = () => {
  const { t } = useTranslation('premium');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(false);

  const [selection, setSelection] = useState<Selection>({ categories: [], subcategoryIds: [] });

  const [quote, setQuote] = useState<Quote | null>(null);
  const [upsell, setUpsell] = useState<Upsell | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);

  // Adhésion / checkout Stripe (story 3.8).
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Chargement du catalogue.
  useEffect(() => {
    let mounted = true;
    apiService
      .getCategories()
      .then((res: any) => {
        if (!mounted) return;
        const raw = (res?.categories ?? res?.data ?? []) as any[];
        setCategories(
          raw.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description ?? undefined,
            icon: c.icon ?? undefined,
            subcategories: (c.subcategories ?? []).map((s: any) => ({
              id: s.id,
              name: s.name,
              isOther: s.isOther ?? s.is_other ?? false,
            })),
          }))
        );
        setCatLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setCatError(true);
          setCatLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Devis en direct : rappelé (débouncé) à chaque changement de sélection.
  // Le total vient TOUJOURS du backend — jamais estimé côté client.
  const requestIdRef = useRef(0);
  useEffect(() => {
    // Toute nouvelle sélection invalide un éventuel message d'échec de checkout précédent.
    setCheckoutError(null);

    if (selection.categories.length === 0) {
      setQuote(null);
      setUpsell(null);
      setQuoteError(false);
      setQuoteLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setQuoteLoading(true);
    setQuoteError(false);

    const timer = setTimeout(() => {
      // recommend renvoie { quote, upsell } : le prix (comme en 3.7) ET la suggestion, en un appel.
      apiService
        .recommendPackage(selection.categories, selection.subcategoryIds)
        .then((res: any) => {
          // Anti-course : ignorer une réponse périmée si la sélection a déjà rechangé.
          if (requestId !== requestIdRef.current) return;
          setQuote(res?.recommendation?.quote ?? null);
          setUpsell(res?.recommendation?.upsell ?? null);
          setQuoteLoading(false);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setQuoteError(true);
          setQuoteLoading(false);
        });
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [selection]);

  const onToggleCategory = (categoryId: string) =>
    setSelection((prev) => toggleCategory(prev, categoryId, categories));
  const onToggleSubcategory = (subId: number) =>
    setSelection((prev) => toggleSubcategory(prev, subId));

  const isCatSelected = (id: string) => selection.categories.includes(id);
  const isSubSelected = (id: number) => selection.subcategoryIds.includes(id);

  // Accepter l'upsell : ajouter les catégories manquantes du full package (via le même toggle,
  // qui préserve la cohérence sous-catégories). Le recalcul se fait par l'effet sur `selection`.
  const acceptUpsell = () => {
    if (!upsell) return;
    setSelection((prev) =>
      upsell.added_categories.reduce(
        (sel, categoryId) => (sel.categories.includes(categoryId) ? sel : toggleCategory(sel, categoryId, categories)),
        prev
      )
    );
  };

  // Libellé lisible d'une catégorie à partir du catalogue chargé.
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const handleAdhere = async () => {
    if (!quote || quote.total_cents <= 0) return;

    // Le checkout exige une auth (401 sinon) : on redirige AVANT d'appeler.
    if (!user || !apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res: any = await apiService.createPremiumCheckout(selection.categories, selection.subcategoryIds);
      if (res?.checkout_url) {
        // Redirection navigateur vers Stripe. Le passage premium se fera par le webhook (3.4),
        // jamais localement : on ne touche pas à is_premium ici.
        window.location.href = res.checkout_url;
        return;
      }
      setCheckoutError(t('checkout_error'));
    } catch (err: any) {
      // 422 (tarifs à 0) et 503 (Stripe non configuré) = paiement indisponible pour l'instant.
      const status = err?.status;
      setCheckoutError(status === 422 || status === 503 ? t('checkout_unavailable') : t('checkout_error'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sélecteur */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('choose_categories')}</h2>

            {catLoading && (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            )}

            {!catLoading && catError && (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{t('load_error')}</p>
            )}

            {!catLoading && !catError && categories.length === 0 && (
              <p className="text-gray-500">{t('no_categories')}</p>
            )}

            <div className="space-y-4">
              {categories.map((category) => {
                const selected = isCatSelected(category.id);
                return (
                  <div
                    key={category.id}
                    className={`bg-white rounded-lg shadow-sm border-2 transition-colors ${
                      selected ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <label className="flex items-center gap-3 p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleCategory(category.id)}
                        className="h-5 w-5 rounded text-primary focus:ring-primary"
                      />
                      {category.icon && <span className="text-2xl">{category.icon}</span>}
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </label>

                    {selected && category.subcategories.length > 0 && (
                      <div className="px-4 pb-4 pl-12">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                          {t('subcategories')}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.subcategories.map((sub) => (
                            <label key={sub.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSubSelected(sub.id)}
                                onChange={() => onToggleSubcategory(sub.id)}
                                className="h-4 w-4 rounded text-primary focus:ring-primary"
                              />
                              <span className="text-gray-700">{sub.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panneau de prix */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('your_offer')}</h2>

              {selection.categories.length === 0 && (
                <p className="text-gray-500 text-sm">{t('empty_selection')}</p>
              )}

              {selection.categories.length > 0 && quoteLoading && (
                <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  {t('calculating')}
                </div>
              )}

              {selection.categories.length > 0 && !quoteLoading && quoteError && (
                <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  {t('quote_error')}
                </p>
              )}

              {selection.categories.length > 0 && !quoteLoading && !quoteError && quote && (
                <div className="space-y-3">
                  <div className="pb-3 border-b">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {quote.is_custom ? t('custom_package') : quote.package?.name}
                    </span>
                  </div>

                  {/*
                    Sous-total nul = les tarifs du moteur de devis ne sont pas renseignés
                    (packages du moteur à 0 € et/ou PricingConfig à 0). Afficher « 0.00 EUR »
                    comme un vrai prix tromperait le visiteur, et l'adhésion est de toute façon
                    impossible : le checkout exige un montant dû. On dit la vérité et on donne
                    une sortie plutôt que de laisser un devis mort à l'écran.
                  */}
                  {quote.subtotal_cents === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm text-amber-800">{t('pricing_unavailable')}</p>
                      <Link
                        to="/contact"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-amber-300 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                      >
                        {t('pricing_unavailable_cta')}
                      </Link>
                    </div>
                  ) : (
                    <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('base')}</span>
                    <span>{formatAmount(quote.base_price_cents, quote.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('services_line')}</span>
                    <span>{formatAmount(quote.subcategories_price_cents, quote.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>{formatAmount(quote.subtotal_cents, quote.currency)}</span>
                  </div>

                  {quote.discount_cents > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        {t('discount')} (−{quote.discount_pct}%)
                      </span>
                      <span>−{formatAmount(quote.discount_cents, quote.currency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t text-lg font-bold text-gray-900">
                    <span>{t('total')}</span>
                    <span>{formatAmount(quote.total_cents, quote.currency)}</span>
                  </div>

                  {/* Upsell : proposition de monter au full package (delta signé). */}
                  {upsell && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <p className="text-sm font-semibold text-primary">{t('recommended_upgrade')}</p>
                      <p className="mt-1 text-sm text-gray-700">{upsell.package.name}</p>
                      {upsell.added_categories.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {t('added_categories')}: {upsell.added_categories.map(categoryName).join(', ')}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {upsell.delta_cents >= 0
                          ? `${t('delta_more')} +${formatAmount(upsell.delta_cents, quote.currency)}`
                          : `${t('delta_less')} −${formatAmount(-upsell.delta_cents, quote.currency)}`}
                      </p>
                      <button
                        onClick={acceptUpsell}
                        className="mt-3 w-full rounded-lg border border-primary py-2 text-sm font-medium text-primary hover:bg-primary/10"
                      >
                        {t('upgrade_cta')}
                      </button>
                    </div>
                  )}

                  {/* Adhésion : paiement Stripe. Visible uniquement si un montant est dû. */}
                  {quote.total_cents > 0 && (
                    <div className="pt-4">
                      <button
                        onClick={handleAdhere}
                        disabled={checkoutLoading}
                        className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {checkoutLoading ? t('adhere_loading') : t('adhere')}
                      </button>
                      {checkoutError && (
                        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
                          {checkoutError}
                        </p>
                      )}
                    </div>
                  )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBuilder;
