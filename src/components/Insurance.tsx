import React, { useState } from 'react';
import { regions } from '../data/regions';

interface InsurancePlan {
  provider: string;
  country: string;
  coverageTypes: string[];
  benefits: string[];
  monthlyPremium: string;
  coverage: string;
  insuranceTypes: string[];
  rating: number;
  reviews: number;
  image: string;
  description: string;
}

const mockInsurances: InsurancePlan[] = [
  {
    provider: "Global Care Plus",
    country: "United Kingdom",
    coverageTypes: ["Medical", "Dental", "Vision", "Prescription Drugs"],
    benefits: [
      "24/7 Support",
      "Direct Billing",
      "Online Claims",
      "Worldwide Coverage",
      "Emergency Evacuation"
    ],
    monthlyPremium: "£30",
    coverage: "Up to £2,000,000",
    insuranceTypes: ["Health Insurance", "Travel Medical Insurance"],
    rating: 4.8,
    reviews: 1250,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Comprehensive health and travel medical insurance with worldwide coverage."
  },
  {
    provider: "Professional Shield",
    country: "Germany",
    coverageTypes: ["Professional Liability", "Errors & Omissions", "Cyber Liability", "Business Property"],
    benefits: [
      "Legal Defense Coverage",
      "Professional Indemnity",
      "Data Breach Protection",
      "Business Interruption",
      "Equipment Coverage"
    ],
    monthlyPremium: "€100",
    coverage: "Up to €5,000,000",
    insuranceTypes: ["Professional Liability Insurance", "Business Insurance"],
    rating: 4.9,
    reviews: 850,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Comprehensive professional and business liability coverage."
  },
  {
    provider: "Travel Guard Elite",
    country: "France",
    coverageTypes: ["Trip Cancellation", "Lost Baggage", "Emergency Medical", "Travel Delay"],
    benefits: [
      "Trip Cancellation/Interruption",
      "Emergency Medical Coverage",
      "Baggage Protection",
      "Flight Accident",
      "24/7 Travel Assistance"
    ],
    monthlyPremium: "€40",
    coverage: "Up to €3,000,000",
    insuranceTypes: ["Travel Insurance", "Travel Medical Insurance"],
    rating: 4.7,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Comprehensive travel insurance with emergency medical coverage."
  },
  {
    provider: "Life & Income Protect",
    country: "United Kingdom",
    coverageTypes: ["Life", "Critical Illness", "Income Protection", "Disability"],
    benefits: [
      "Death Benefit",
      "Critical Illness Coverage",
      "Monthly Income Replacement",
      "Permanent Disability Benefit",
      "Family Support"
    ],
    monthlyPremium: "£85",
    coverage: "Up to £1,000,000",
    insuranceTypes: ["Life Insurance", "Income Protection Insurance"],
    rating: 4.8,
    reviews: 920,
    image: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Comprehensive life and income protection coverage."
  },
  {
    provider: "Property Shield Plus",
    country: "Germany",
    coverageTypes: ["Building", "Contents", "Personal Liability", "Natural Disasters"],
    benefits: [
      "Building Coverage",
      "Contents Protection",
      "Liability Coverage",
      "Natural Disaster Protection",
      "Emergency Repairs"
    ],
    monthlyPremium: "€75",
    coverage: "Up to €2,500,000",
    insuranceTypes: ["Property Insurance", "Home Insurance", "Renters Insurance"],
    rating: 4.6,
    reviews: 1580,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Complete property protection for homeowners and renters."
  }
];

const Insurance: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [insuranceType, setInsuranceType] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  
  const allCountries = regions.flatMap(region => region.countries).sort();
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

  const filteredInsurances = mockInsurances.filter(insurance => {
    if (country && insurance.country !== country) return false;
    if (insuranceType && !insurance.insuranceTypes.includes(insuranceType)) return false;
    if (coverageType && !insurance.coverageTypes.includes(coverageType)) return false;
    return true;
  });

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
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary">{insurance.provider}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">
                        {insurance.rating} ({insurance.reviews})
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{insurance.description}</p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {insurance.insuranceTypes.map((type, idx) => (
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
                        {insurance.coverageTypes.map((type, idx) => (
                          <li key={idx}>{type}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Key Benefits:</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {insurance.benefits.map((benefit, idx) => (
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
      </div>
    </div>
  );
};

export default Insurance;