import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Hébergements touristiques servis par le backend (TourismAccommodation, tarif à la nuit).
// Le logement étudiant au mois reste sur son propre modèle (story 5.6).
interface Accommodation {
  id: number;
  name: string;
  country: string;
  city: string;
  type: string;
  priceRange: string;
  amenities?: string[];
  rating?: number;
  reviews?: number;
  description?: string;
}

const LABEL = 'block text-sm font-semibold text-slate-700 mb-2';
const SELECT = 'w-full border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 bg-white text-slate-700';

const TourismAccommodation: React.FC = () => {
  const { t, val, options, countryOptions, country: countryLabel, colon } = useCatalog();
  const [location, setLocation] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe,
  // et la liste des villes suit le pays (pas la ville déjà choisie).
  const { items: accommodations, loading, error } = useApiList<Accommodation>(
    () => apiService.getTourismAccommodations({}),
    [],
    { errorMessage: t('common.error') }
  );

  const inCountry = useMemo(() => accommodations.filter(a => !location || a.country === location), [accommodations, location]);
  // « $150-$300/night » : seule l'unité est traduite, le montant reste celui de la fiche.
  const priceText = (price: string) => price.replace(/\s*\/\s*night/i, ` ${t('common.per_night')}`);
  const filteredAccommodations = inCountry.filter(a =>
    (!city || a.city === city) && (!type || a.type === type) && (!priceRange || a.priceRange === priceRange)
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">{t('tourism_acc.title')}</h1>
        <p className="text-slate-600 mb-8 font-light">{t('tourism_acc.subtitle')}</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterSelect labelClassName={LABEL} selectClassName={SELECT} label={t('common.country')} all={t('common.all_countries')}
              value={location} onChange={v => { setLocation(v); setCity(''); }} options={countryOptions(accommodations.map(a => a.country))} />
            <FilterSelect labelClassName={LABEL} selectClassName={SELECT} label={t('common.city')} all={t('common.all_cities')}
              value={city} onChange={setCity} options={options(inCountry.map(a => a.city))} />
            <FilterSelect labelClassName={LABEL} selectClassName={SELECT} label={t('tourism_acc.acc_type')} all={t('common.all_types')}
              value={type} onChange={setType} options={options(inCountry.map(a => a.type))} />
            <FilterSelect labelClassName={LABEL} selectClassName={SELECT} label={t('common.price_range')} all={t('common.all_prices')}
              value={priceRange} onChange={setPriceRange} options={options(inCountry.map(a => a.priceRange), priceText)} />
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
          {filteredAccommodations.length > 0 ? (
            filteredAccommodations.map(accommodation => (
              <div key={accommodation.id} className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{accommodation.name}</h3>
                  <p className="text-slate-600 mb-4 font-light">{accommodation.city}, {countryLabel(accommodation.country)}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{colon(t('common.type'))}</span>{" "}
                      {val(accommodation.type)}
                    </p>
                    {accommodation.priceRange && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{colon(t('common.price'))}</span>{" "}
                        {priceText(accommodation.priceRange)}
                      </p>
                    )}
                    {(accommodation.amenities ?? []).length > 0 && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{colon(t('tourism_acc.amenities'))}</span>{" "}
                        {(accommodation.amenities ?? []).join(", ")}
                      </p>
                    )}
                    {accommodation.rating != null && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{colon(t('common.rating'))}</span>{" "}
                        <span className="text-gold-600">{accommodation.rating}/5</span> ({t('common.reviews', { count: accommodation.reviews ?? 0 })})
                      </p>
                    )}
                  </div>
                  <ActionButton href={(accommodation as any).link} service={`Hébergement — ${accommodation.name}`} className="mt-4 w-full bg-gold-500 hover:bg-gold-600 text-slate-900 py-2 px-4 rounded-lg font-semibold transition-colors duration-200">
                    {t('tourism_acc.book')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={accommodations.length} service="Hébergement touristique" className="text-slate-500 text-lg font-light" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TourismAccommodation;
