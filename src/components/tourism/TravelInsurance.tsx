import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Insurance {
  provider: string;
  country: string;
  coverageTypes: string[];
  benefits: string[];
  monthlyPremium: string;
  coverage: string;
}

const mockInsurances: Insurance[] = [
  {
    provider: "Global Travel Care",
    country: "United Kingdom",
    coverageTypes: ["Medical", "Trip Cancellation", "Baggage"],
    benefits: ["24/7 Support", "Direct Billing", "Mobile App"],
    monthlyPremium: "£30",
    coverage: "Up to £2,000,000"
  },
  {
    provider: "Euro Travel Shield",
    country: "Germany",
    coverageTypes: ["Medical", "Personal Liability", "Emergency"],
    benefits: ["Multilingual Support", "Hospital Network", "Emergency Evacuation"],
    monthlyPremium: "€35",
    coverage: "Up to €3,000,000"
  },
  {
    provider: "Travel Secure Plus",
    country: "France",
    coverageTypes: ["Medical", "Trip Delay", "Personal Property"],
    benefits: ["Dental Coverage", "Lost Passport Help", "Flight Insurance"],
    monthlyPremium: "€40",
    coverage: "Up to €2,500,000"
  }
];

const TravelInsurance: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");
  
  const allCountries = regions.flatMap(region => region.countries).sort();
  const coverageTypes = ["Medical", "Trip Cancellation", "Baggage", "Personal Liability", "Emergency"];

  const filteredInsurances = mockInsurances.filter(insurance => {
    if (country && insurance.country !== country) return false;
    if (coverageType && !insurance.coverageTypes.includes(coverageType)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Travel Insurance</h1>

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

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsurances.length > 0 ? (
            filteredInsurances.map((insurance, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{insurance.provider}</h3>
                  <p className="text-gray-600 mb-4">{insurance.country}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coverage Types:</span>{" "}
                      {insurance.coverageTypes.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Benefits:</span>{" "}
                      {insurance.benefits.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Monthly Premium:</span>{" "}
                      {insurance.monthlyPremium}
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
      </div>
    </div>
  );
};

export default TravelInsurance;