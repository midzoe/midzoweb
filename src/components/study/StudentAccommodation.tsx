import React, { useState, useEffect } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { apiService } from '../../services/api';

// Story 5.9 : logements étudiants servis en direct depuis le backend (Accommodation),
// filtrables pays/ville/type. Remplace les anciens mocks.
interface Accommodation {
  id: number;
  name: string;
  country: string;
  city: string;
  type: string;
  pricePerMonth: number;
  currency: string;
  contact?: string;
  description?: string;
  images?: string[];
}

// Types alignés sur le backend (src/models/Accommodation.ts VALID_TYPES).
const TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'shared', label: 'Shared Apartment' },
  { value: 'residence', label: 'Student Residence' },
  { value: 'homestay', label: 'Homestay' },
];

const StudentAccommodation: React.FC = () => {
  const { countries: allCountries } = useCountries();
  const [country, setCountry] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [type, setType] = useState<string>('');

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.getAccommodations({
        ...(country && { country }),
        ...(city && { city }),
        ...(type && { type }),
      });
      setAccommodations(res.accommodations ?? res.data ?? []);
    } catch (err) {
      console.error('Error loading accommodations:', err);
      setError('Failed to load accommodations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, city, type]);

  // Villes dérivées des résultats courants (facette réelle simple, pas de mock).
  const cities = Array.from(new Set(accommodations.map(a => a.city))).sort();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Student Accommodation</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={country}
                onChange={e => { setCountry(e.target.value); setCity(''); }}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading accommodations...</p>
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
            {accommodations.length > 0 ? (
              accommodations.map(acc => {
                const typeLabel = TYPES.find(t => t.value === acc.type)?.label ?? acc.type;
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
                      <p className="text-gray-600 mb-4">{acc.city}, {acc.country}</p>
                      {acc.description && <p className="text-gray-600 mb-4">{acc.description}</p>}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {typeLabel}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Price:</span>{' '}
                          {acc.pricePerMonth} {acc.currency}/month
                        </p>
                        {acc.contact && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Contact:</span> {acc.contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">
                  No accommodations found matching your criteria. Please adjust your filters or check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAccommodation;
