import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Restaurants servis par le backend (Restaurant).
interface Restaurant {
  id: number;
  name: string;
  country: string;
  city?: string;
  location: string;
  cuisine: string;
  priceRange: string;
  rating?: number;
  reviews?: number;
  features?: string[];
}

const LABEL = 'block text-sm font-medium text-slate-700 mb-2';

const TourismRestaurants: React.FC = () => {
  const { t, val, options, countryOptions, colon } = useCatalog();
  const [location, setLocation] = useState<string>("");
  const [cuisine, setCuisine] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: restaurants, loading, error } = useApiList<Restaurant>(
    () => apiService.getRestaurants({}),
    [],
    { errorMessage: t('common.error') }
  );

  const filteredRestaurants = useMemo(() => restaurants.filter(r =>
    (!location || r.country === location) && (!cuisine || r.cuisine === cuisine) && (!priceRange || r.priceRange === priceRange)
  ), [restaurants, location, cuisine, priceRange]);

  // « € » à « €€€€ » : ordre par longueur, pas alphabétique.
  const priceOptions = Array.from(new Set(restaurants.map(r => r.priceRange).filter(Boolean)))
    .sort((a, b) => a.length - b.length)
    .map(p => ({ value: p, label: p }));

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gold-600 mb-8">{t('restaurants.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FilterSelect labelClassName={LABEL} label={t('common.country')} all={t('common.all_countries')} value={location} onChange={setLocation}
              options={countryOptions(restaurants.map(r => r.country))} />
            <FilterSelect labelClassName={LABEL} label={t('restaurants.cuisine')} all={t('restaurants.all_cuisines')} value={cuisine} onChange={setCuisine}
              options={options(restaurants.map(r => r.cuisine))} />
            <FilterSelect labelClassName={LABEL} label={t('common.price_range')} all={t('common.all_prices')} value={priceRange} onChange={setPriceRange}
              options={priceOptions} />
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
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gold-600 mb-2">{restaurant.name}</h3>
                  <p className="text-slate-600 mb-4">{restaurant.location}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{colon(t('restaurants.cuisine'))}</span>{" "}
                      {val(restaurant.cuisine)}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{colon(t('common.price_range'))}</span>{" "}
                      {restaurant.priceRange}
                    </p>
                    {(restaurant.features ?? []).length > 0 && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{colon(t('common.features'))}</span>{" "}
                        {(restaurant.features ?? []).join(", ")}
                      </p>
                    )}
                    {restaurant.rating != null && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{colon(t('common.rating'))}</span>{" "}
                        {restaurant.rating}/5 ({t('common.reviews', { count: restaurant.reviews ?? 0 })})
                      </p>
                    )}
                  </div>
                  <ActionButton href={(restaurant as any).link} service={`Restaurant — ${restaurant.name}`} className="mt-4 w-full bg-gold-500 text-white py-2 px-4 rounded-md hover:bg-gold-500/90 transition-colors">
                    {t('restaurants.reserve')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={restaurants.length} service="Restaurants" className="text-slate-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TourismRestaurants;
