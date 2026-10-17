import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

// Assurances voyage servies par le backend (InsurancePlan, audience = "travel").
interface Insurance {
  id: number;
  provider: string;
  country: string;
  coverageTypes?: string[];
  benefits?: string[];
  monthlyPremium?: string;
  coverage?: string;
}

const TravelInsurance: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");

  const { countries: allCountries } = useCountries();
  const coverageTypes = ["Medical", "Trip Cancellation", "Baggage", "Personal Liability", "Emergency"];

  const { items: filteredInsurances, loading, error } = useApiList<Insurance>(
    () => apiService.getInsurancePlans({
      audience: 'travel',
      country,
      coverage_type: coverageType,
    }),
    [country, coverageType],
    { errorMessage: 'Unable to load travel insurance plans. Please try again later.' }
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gold-600 mb-8">Travel Insurance</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Coverage Type
              </label>
              <select
                value={coverageType}
                onChange={(e) => setCoverageType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {coverageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            <p className="mt-2 text-slate-600">Loading insurance plans...</p>
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
          {filteredInsurances.length > 0 ? (
            filteredInsurances.map(insurance => (
              <div key={insurance.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gold-600 mb-2">{insurance.provider}</h3>
                  <p className="text-slate-600 mb-4">{insurance.country}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Coverage Types:</span>{" "}
                      {(insurance.coverageTypes ?? []).join(", ")}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Benefits:</span>{" "}
                      {(insurance.benefits ?? []).join(", ")}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Monthly Premium:</span>{" "}
                      {insurance.monthlyPremium}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Coverage Amount:</span>{" "}
                      {insurance.coverage}
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-gold-500 text-white py-2 px-4 rounded-md hover:bg-gold-500/90 transition-colors">
                    Get Quote
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 text-lg">No insurance plans found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TravelInsurance;