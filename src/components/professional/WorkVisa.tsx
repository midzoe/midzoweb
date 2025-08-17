import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface VisaService {
  provider: string;
  country: string;
  visaTypes: string[];
  processingTime: string;
  price: string;
  requirements: string[];
  features: string[];
  success_rate: string;
}

const mockServices: VisaService[] = [
  {
    provider: "Global Work Visa Services",
    country: "Germany",
    visaTypes: ["Work Permit", "Blue Card", "Freelance Visa"],
    processingTime: "4-6 weeks",
    price: "€2,000-€3,000",
    requirements: [
      "Job Contract",
      "University Degree",
      "Work Experience Proof",
      "Language Certificate"
    ],
    features: [
      "Document Translation",
      "Application Support",
      "Interview Preparation",
      "Post-arrival Support"
    ],
    success_rate: "94%"
  },
  {
    provider: "UK Work Visa Center",
    country: "United Kingdom",
    visaTypes: ["Skilled Worker Visa", "Global Talent Visa"],
    processingTime: "3-4 weeks",
    price: "£1,500-£2,500",
    requirements: [
      "Job Offer",
      "Qualification Documents",
      "English Proficiency",
      "Financial Proof"
    ],
    features: [
      "Priority Processing",
      "Legal Consultation",
      "Document Check",
      "Visa Extension Support"
    ],
    success_rate: "92%"
  },
  {
    provider: "French Immigration Services",
    country: "France",
    visaTypes: ["Talent Passport", "Employee Visa"],
    processingTime: "6-8 weeks",
    price: "€1,800-€2,800",
    requirements: [
      "Employment Contract",
      "Educational Certificates",
      "Professional Experience",
      "Health Insurance"
    ],
    features: [
      "Full Application Support",
      "Translation Services",
      "Local Registration",
      "Family Visa Support"
    ],
    success_rate: "90%"
  }
];

const WorkVisa: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [visaType, setVisaType] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const visaTypes = [
    "Work Permit",
    "Blue Card",
    "Skilled Worker Visa",
    "Global Talent Visa",
    "Freelance Visa",
    "Talent Passport"
  ];

  const filteredServices = mockServices.filter(service => {
    if (destinationCountry && service.country !== destinationCountry) return false;
    if (visaType && !service.visaTypes.includes(visaType)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Work Visa Assistance</h1>

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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{service.provider}</h3>
                      <p className="text-gray-600">{service.country}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {service.success_rate} Success Rate
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Visa Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.visaTypes.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {service.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {service.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Processing Time:</span> {service.processingTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Price Range:</span> {service.price}
                      </p>
                    </div>
                  </div>

                  <button className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Start Application
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

export default WorkVisa;