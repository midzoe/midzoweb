import React, { useState } from 'react';
import { useCountries } from '../hooks/useCountries';
import { useApiList } from '../hooks/useApiList';
import { apiService } from '../services/api';

// Offres d'assurance servies par le backend (InsurancePlan, audience = "general").
interface InsurancePlan {
  id: number;
  provider: string;
  country: string;
  coverageTypes?: string[];
  benefits?: string[];
  insuranceTypes?: string[];
  monthlyPremium?: string;
  coverage?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  description?: string;
}

const Insurance: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [insuranceType, setInsuranceType] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  
  const { countries: allCountries } = useCountries();
  const insuranceTypes = [
    "Health Insurance",
    "Travel Insurance",
    "Travel Medical Insurance",
    "Life Insurance",
    "Income Protection Insurance",
    "Professional Liability Insurance",
    "Business Insurance",
    "Property Insurance",
    "Home Insurance",
    "Renters Insurance"
  ].sort();

  const coverageTypes = [
    // Health Related
    "Medical",
    "Dental",
    "Vision",
    "Prescription Drugs",
    "Emergency Medical",
    // Life & Income Related
    "Life",
    "Critical Illness",
    "Income Protection",
    "Disability",
    // Property Related
    "Building",
    "Contents",
    "Personal Liability",
    "Natural Disasters",
    // Professional Related
    "Professional Liability",
    "Errors & Omissions",
    "Cyber Liability",
    "Business Property",
    // Travel Related
    "Trip Cancellation",
    "Lost Baggage",
    "Travel Delay",
    "Flight Accident"
  ].sort();

  const priceRanges = [
    "Under €30/month",
    "€30-€50/month",
    "€50-€100/month",
    "Above €100/month"
  ];

  // Pays et garantie sont filtrés côté serveur ; la famille de produit (insuranceTypes)
  // est affinée ici, l'API ne l'expose pas comme critère.
  const { items: plans, loading, error } = useApiList<InsurancePlan>(
    () => apiService.getInsurancePlans({
      audience: 'general',
      country,
      coverage_type: coverageType,
    }),
    [country, coverageType],
    { errorMessage: 'Unable to load insurance plans. Please try again later.' }
  );

  const filteredInsurances = insuranceType
    ? plans.filter(p => (p.insuranceTypes ?? []).includes(insuranceType))
    : plans;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Insurance Plans</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                Insurance Type
              </label>
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {insuranceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                <option value="">All Coverage Types</option>
                {coverageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary">{insurance.provider}</h3>
                    {insurance.rating != null && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-600">
                          {insurance.rating} ({insurance.reviews})
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{insurance.description}</p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(insurance.insuranceTypes ?? []).map((type, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coverage Amount:</span>{" "}
                      {insurance.coverage}
                    </p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Coverage Types:</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {(insurance.coverageTypes ?? []).map((type, idx) => (
                          <li key={idx}>{type}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Key Benefits:</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {(insurance.benefits ?? []).map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
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

export default Insurance;