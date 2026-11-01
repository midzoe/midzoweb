import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Story 5.9 : logements étudiants servis en direct depuis le backend (Accommodation),
// filtrables pays/ville/type. Remplace les anciens mocks.
interface Accommodation {
  id: number;
  name: string;
  country: string;
  city: string;
  type: string; // studio | shared | residence | homestay (backend VALID_TYPES)
  pricePerMonth: number;
  currency: string;
  contact?: string;
  description?: string;
  images?: string[];
}

const StudentAccommodation: React.FC = () => {
  const { t, val, options, countryOptions, country: countryLabel, colon } = useCatalog();
  const [country, setCountry] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [type, setType] = useState<string>('');

  // Tout le catalogue est chargé une fois (quelques centaines de fiches) : les menus ne
  // proposent que ce qui existe, et la liste des villes suit le pays, pas la ville choisie.
  const { items: accommodations, loading, error } = useApiList<Accommodation>(
    () => apiService.getAccommodations().then((res: any) => ({ data: res.accommodations ?? res.data ?? [] })),
    [],
    { errorMessage: t('common.error') }
  );

  const inCountry = useMemo(() => accommodations.filter(a => !country || a.country === country), [accommodations, country]);
  const filtered = inCountry.filter(a => (!city || a.city === city) && (!type || a.type === type));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('student_acc.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FilterSelect label={t('common.country')} all={t('common.all_countries')} value={country}
              onChange={v => { setCountry(v); setCity(''); }}
              options={countryOptions(accommodations.map(a => a.country))} />
            <FilterSelect label={t('common.city')} all={t('common.all_cities')} value={city} onChange={setCity}
              options={options(inCountry.map(a => a.city))} />
            <FilterSelect label={t('student_acc.acc_type')} all={t('common.all_types')} value={type} onChange={setType}
              options={options(inCountry.map(a => a.type))} />
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
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
            {filtered.length > 0 ? (
              filtered.map(acc => {
                const cover = acc.images && acc.images.length > 0 ? acc.images[0] : null;
                return (
                  <div key={acc.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {cover && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={cover}
                          alt={acc.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-primary mb-2">{acc.name}</h3>
                      <p className="text-gray-600 mb-4">{acc.city}, {countryLabel(acc.country)}</p>
                      {acc.description && <p className="text-gray-600 mb-4">{acc.description}</p>}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{colon(t('common.type'))}</span> {val(acc.type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{colon(t('common.price'))}</span>{' '}
                          {acc.pricePerMonth} {acc.currency} {t('common.per_month')}
                        </p>
                        {acc.contact && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{colon(t('student_acc.contact'))}</span> {acc.contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <CatalogEmpty total={accommodations.length} service="Logement étudiant" className="text-gray-500 text-lg" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAccommodation;
