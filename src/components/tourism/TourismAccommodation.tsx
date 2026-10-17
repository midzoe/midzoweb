import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

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

const TourismAccommodation: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const { countries: allCountries } = useCountries();
  const types = ["Hotel", "Resort", "Apartment", "Villa", "Guesthouse"];
  const priceRanges = [
    "Under $100/night",
    "$100-$200/night",
    "$200-$400/night",
    "Above $400/night"
  ];

  const { items: filteredAccommodations, loading, error } = useApiList<Accommodation>(
    () => apiService.getTourismAccommodations({
      country: location,
      city,
      type,
      price_range: priceRange,
    }),
    [location, city, type, priceRange],
    { errorMessage: 'Unable to load accommodations. Please try again later.' }
  );

  // Facette « ville » dérivée des résultats courants, comme sur la page logement étudiant.
  const cities = Array.from(new Set(filteredAccommodations.map(acc => acc.city))).sort();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Tourism Accommodation</h1>
        <p className="text-slate-600 mb-8 font-light">Find and book verified accommodations worldwide</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Country
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 bg-white text-slate-700"
              >
                <option value="">All Countries</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 bg-white text-slate-700"
              >
                <option value="">All Cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Accommodation Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 bg-white text-slate-700"
              >
                <option value="">All Types</option>
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 bg-white text-slate-700"
              >
                <option value="">All Ranges</option>
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            <p className="mt-2 text-slate-600">Loading accommodations...</p>
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
                  <p className="text-slate-600 mb-4 font-light">{accommodation.city}, {accommodation.country}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Type:</span>{" "}
                      {accommodation.type}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Price:</span>{" "}
                      {accommodation.priceRange}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Amenities:</span>{" "}
                      {(accommodation.amenities ?? []).join(", ")}
                    </p>
                    {accommodation.rating != null && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Rating:</span>{" "}
                        <span className="text-gold-600">{accommodation.rating}/5.0</span> ({accommodation.reviews} reviews)
                      </p>
                    )}
                  </div>
                  <button className="mt-4 w-full bg-gold-500 hover:bg-gold-600 text-slate-900 py-2 px-4 rounded-lg font-semibold transition-colors duration-200">
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 text-lg font-light">No accommodations found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TourismAccommodation;