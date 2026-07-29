import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

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

const TouristSites: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const { countries: allCountries } = useCountries();
  const categories = ["Landmarks", "Historical", "Religious Sites", "Museums", "Parks", "Entertainment"];
  const priceRanges = ["Free", "Under €10", "€10-€25", "Above €25"];

  const { items: filteredSites, loading, error } = useApiList<TouristSite>(
    () => apiService.getTouristSites({ country: location, category }),
    [location, category],
    { errorMessage: 'Unable to load tourist sites. Please try again later.' }
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gold-600 mb-8">Tourist Sites</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Locations</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
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
            <p className="mt-2 text-slate-600">Loading tourist sites...</p>
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
                      <span className="font-medium">Category:</span>{" "}
                      {site.category}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Description:</span>{" "}
                      {site.description}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Price:</span>{" "}
                      {site.price}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Features:</span>{" "}
                      {(site.features ?? []).join(", ")}
                    </p>
                    {site.rating != null && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Rating:</span>{" "}
                        {site.rating}/5.0 ({site.reviews} reviews)
                      </p>
                    )}
                  </div>
                  <button className="mt-4 w-full bg-gold-500 text-white py-2 px-4 rounded-md hover:bg-gold-500/90 transition-colors">
                    Book Tickets
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 text-lg">No tourist sites found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TouristSites;