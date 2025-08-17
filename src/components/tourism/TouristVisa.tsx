import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface VisaService {
  provider: string;
  country: string;
  visaTypes: string[];
  processingTime: string;
  price: string;
  requirements: string[];
}

const mockServices: VisaService[] = [
  {
    provider: "EuroVisa Services",
    country: "France",
    visaTypes: ["Tourist Visa", "Short-stay Visa"],
    processingTime: "10-15 days",
    price: "€80-€120",
    requirements: ["Valid Passport", "Travel Insurance", "Hotel Booking"]
  },
  {
    provider: "UK Visa Center",
    country: "United Kingdom",
    visaTypes: ["Standard Visitor Visa", "Tourist Visa"],
    processingTime: "15-20 days",
    price: "£95-£150",
    requirements: ["Passport", "Bank Statements", "Travel Itinerary"]
  },
  {
    provider: "Schengen Visa Services",
    country: "Germany",
    visaTypes: ["Tourist Visa", "Business Visa"],
    processingTime: "10-15 days",
    price: "€60-€100",
    requirements: ["Valid Passport", "Financial Proof", "Travel Insurance"]
  }
];

const TouristVisa: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [visaType, setVisaType] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const visaTypes = ["Tourist Visa", "Short-stay Visa", "Business Visa"];

  const filteredServices = mockServices.filter(service => {
    if (destinationCountry && service.country !== destinationCountry) return false;
    if (visaType && !service.visaTypes.includes(visaType)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Tourist Visa Assistance</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country of Residence
              </label>
              <select
                value={residenceCountry}
                onChange={(e) => setResidenceCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Country</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Nationality</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Country
              </label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Country</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visa Type
              </label>
              <select
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Type</option>
                {visaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{service.provider}</h3>
                  <p className="text-gray-600 mb-4">{service.country}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Visa Types:</span>{" "}
                      {service.visaTypes.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Processing Time:</span>{" "}
                      {service.processingTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price Range:</span>{" "}
                      {service.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requirements:</span>{" "}
                      {service.requirements.join(", ")}
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No visa services found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristVisa;