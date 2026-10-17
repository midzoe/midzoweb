import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

// Assurances étudiantes servies par le backend (InsurancePlan, audience = "student").
interface Insurance {
  id: number;
  provider: string;
  country: string;
  coverageTypes?: string[];
  benefits?: string[];
  monthlyPremium?: string;
  coverage?: string;
  image?: string;
  description?: string;
}

const StudentInsurance: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");
  
  const { countries: allCountries } = useCountries();
  const coverageTypes = ["Health", "Accident", "Liability", "Travel", "Personal Property"];

  const { items: filteredInsurances, loading, error } = useApiList<Insurance>(
    () => apiService.getInsurancePlans({
      audience: 'student',
      country,
      coverage_type: coverageType,
    }),
    [country, coverageType],
    { errorMessage: 'Unable to load student insurance plans. Please try again later.' }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Student Insurance</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading insurance plans...</p>
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
                {insurance.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={insurance.image}
                      alt={insurance.provider}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {insurance.monthlyPremium}/month
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{insurance.provider}</h3>
                  <p className="text-gray-600 mb-4">{insurance.country}</p>
                  <p className="text-gray-600 mb-4">{insurance.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coverage Types:</span>{" "}
                      {(insurance.coverageTypes ?? []).join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Benefits:</span>{" "}
                      {(insurance.benefits ?? []).join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coverage Amount:</span>{" "}
                      {insurance.coverage}
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Get Quote
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No insurance plans found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default StudentInsurance;