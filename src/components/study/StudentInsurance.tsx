import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Insurance {
  provider: string;
  country: string;
  coverageTypes: string[];
  benefits: string[];
  monthlyPremium: string;
  coverage: string;
  image: string;
  description: string;
}

const mockInsurances: Insurance[] = [
  {
    provider: "UK Student Care",
    country: "United Kingdom",
    coverageTypes: ["Health", "Accident", "Liability"],
    benefits: ["24/7 Support", "Direct Billing", "Online Claims"],
    monthlyPremium: "£30",
    coverage: "Up to £2,000,000",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Comprehensive student insurance coverage with excellent support services and quick claims processing."
  },
  {
    provider: "Deutsche Studenten Versicherung",
    country: "Germany",
    coverageTypes: ["Health", "Personal Liability", "Accident"],
    benefits: ["Multilingual Support", "Hospital Network", "Emergency Assistance"],
    monthlyPremium: "€40",
    coverage: "Up to €3,000,000",
    image: "https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "German insurance provider specializing in international student coverage with extensive hospital network."
  },
  {
    provider: "Assurance Étudiante",
    country: "France",
    coverageTypes: ["Health", "Travel", "Personal Property"],
    benefits: ["Dental Coverage", "Prescription Drugs", "Mental Health Support"],
    monthlyPremium: "€35",
    coverage: "Up to €2,500,000",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "French student insurance with comprehensive health coverage including mental health and dental care."
  }
];

const StudentInsurance: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");
  
  const allCountries = regions.flatMap(region => region.countries).sort();
  const coverageTypes = ["Health", "Accident", "Liability", "Travel", "Personal Property"];

  const filteredInsurances = mockInsurances.filter(insurance => {
    if (country && insurance.country !== country) return false;
    if (coverageType && !insurance.coverageTypes.includes(coverageType)) return false;
    return true;
  });

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

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsurances.length > 0 ? (
            filteredInsurances.map((insurance, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{insurance.provider}</h3>
                  <p className="text-gray-600 mb-4">{insurance.country}</p>
                  <p className="text-gray-600 mb-4">{insurance.description}</p>
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

export default StudentInsurance;