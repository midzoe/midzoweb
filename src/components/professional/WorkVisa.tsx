import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

// Prestataires de visa travail servis par le backend
// (ServiceProvider, serviceType = "work_visa").
interface VisaService {
  id: number;
  provider: string;
  country: string;
  visaTypes?: string[];
  processingTime?: string;
  price?: string;
  requirements?: string[];
  features?: string[];
  successRate?: string;
}

const WorkVisa: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [visaType, setVisaType] = useState<string>("");

  const { countries: allCountries } = useCountries();
  const visaTypes = [
    "Work Permit",
    "Blue Card",
    "Skilled Worker Visa",
    "Global Talent Visa",
    "Freelance Visa",
    "Talent Passport"
  ];

  // Le pays de destination filtre côté serveur ; le type de visa est une liste JSON,
  // affinée ici.
  const { items: services, loading, error } = useApiList<VisaService>(
    () => apiService.getServiceProviders({ type: 'work_visa', country: destinationCountry }),
    [destinationCountry],
    { errorMessage: 'Unable to load visa services. Please try again later.' }
  );

  const filteredServices = visaType
    ? services.filter(s => (s.visaTypes ?? []).includes(visaType))
    : services;

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

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading visa services...</p>
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
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{service.provider}</h3>
                      <p className="text-gray-600">{service.country}</p>
                    </div>
                    {service.successRate && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {service.successRate} Success Rate
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Visa Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {(service.visaTypes ?? []).map((type, idx) => (
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
                        {(service.requirements ?? []).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {(service.features ?? []).map((feature, idx) => (
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
        )}
      </div>
    </div>
  );
};

export default WorkVisa;