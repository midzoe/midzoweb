import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { amountOf, bucketOf, FilterSelect, presentBuckets, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Sites touristiques servis par le backend (TouristSite).
interface TouristSite {
  id: number;
  name: string;
  country: string;
  city?: string;
  location: string;
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  features?: string[];
}

const LABEL = 'block text-sm font-medium text-slate-700 mb-2';
const PRICE_EDGES = [10, 25];
/** Entrée gratuite : « Free », « Gratuit » ou 0. */
const priceAmount = (price?: string) => (price && /free|gratuit|kostenlos/i.test(price) ? 0 : amountOf(price));

const TouristSites: React.FC = () => {
  const { t, val, options, countryOptions, money, bucketOptions, colon } = useCatalog();
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: sites, loading, error } = useApiList<TouristSite>(
    () => apiService.getTouristSites({}),
    [],
    { errorMessage: t('common.error') }
  );

  const filteredSites = useMemo(() => sites.filter(s =>
    (!location || s.country === location)
    && (!category || s.category === category)
    && (!priceRange || bucketOf(priceAmount(s.price), PRICE_EDGES, true) === priceRange)
  ), [sites, location, category, priceRange]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gold-600 mb-8">{t('sites.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FilterSelect labelClassName={LABEL} label={t('common.country')} all={t('common.all_countries')} value={location} onChange={setLocation}
              options={countryOptions(sites.map(s => s.country))} />
            <FilterSelect labelClassName={LABEL} label={t('common.category')} all={t('common.all_categories')} value={category} onChange={setCategory}
              options={options(sites.map(s => s.category))} />
            <FilterSelect labelClassName={LABEL} label={t('common.price')} all={t('common.all_prices')} value={priceRange} onChange={setPriceRange}
              options={bucketOptions(presentBuckets(sites.map(s => priceAmount(s.price)), PRICE_EDGES, true), n => money(n))} />
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            <p className="mt-2 text-slate-600">{t('common.loading')}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.length > 0 ? (
            filteredSites.map(site => (
              <div key={site.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gold-600 mb-2">{site.name}</h3>
                  <p className="text-slate-600 mb-4">{site.location}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{colon(t('common.category'))}</span>{" "}
                      {val(site.category)}
                    </p>
                    {site.description && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{colon(t('common.description'))}</span>{" "}
                        {site.description}
                      </p>
                    )}
                    {site.price && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{colon(t('common.price'))}</span>{" "}
                        {priceAmount(site.price) === 0 ? t('common.free') : site.price}
                      </p>
                    )}
                    {(site.features ?? []).length > 0 && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{colon(t('common.features'))}</span>{" "}
                        {(site.features ?? []).join(", ")}
                      </p>
                    )}
                    {site.rating != null && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{colon(t('common.rating'))}</span>{" "}
                        {site.rating}/5 ({t('common.reviews', { count: site.reviews ?? 0 })})
                      </p>
                    )}
                  </div>
                  <ActionButton href={(site as any).link} service={`Site touristique — ${site.name}`} className="mt-4 w-full bg-gold-500 text-white py-2 px-4 rounded-md hover:bg-gold-500/90 transition-colors">
                    {t('sites.tickets')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={sites.length} service="Sites touristiques" className="text-slate-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TouristSites;
