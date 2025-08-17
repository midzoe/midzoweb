import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface DocumentService {
  provider: string;
  country: string;
  services: string[];
  processingTime: string;
  price: string;
  rating: number;
  type: 'legalization' | 'recognition';
  requirements: string[];
}

const mockServices: DocumentService[] = [
  {
    provider: "Global Docs International",
    country: "United Kingdom",
    services: ["Document Authentication", "Apostille", "Embassy Legalization"],
    processingTime: "5-7 business days",
    price: "$200-$300",
    rating: 4.8,
    type: "legalization",
    requirements: ["Original Documents", "Passport Copy", "Application Form"]
  },
  {
    provider: "UK NARIC",
    country: "United Kingdom",
    services: ["Qualification Recognition", "Statement of Comparability", "Career Path Report"],
    processingTime: "15-20 business days",
    price: "$250-$400",
    rating: 4.7,
    type: "recognition",
    requirements: ["Original Diploma", "Transcripts", "Certified Translations"]
  },
  {
    provider: "EuroLegal Services",
    country: "Germany",
    services: ["Document Translation", "Authentication", "Embassy Legalization"],
    processingTime: "7-10 business days",
    price: "$150-$250",
    rating: 4.6,
    type: "legalization",
    requirements: ["Original Documents", "Passport Copy", "Proof of Address"]
  },
  {
    provider: "German ENIC-NARIC",
    country: "Germany",
    services: ["Degree Recognition", "Professional Qualification Assessment"],
    processingTime: "20-25 business days",
    price: "$200-$350",
    rating: 4.5,
    type: "recognition",
    requirements: ["Notarized Diploma Copy", "Transcript Translation", "CV"]
  },
  {
    provider: "LegalDocs France",
    country: "France",
    services: ["Document Authentication", "Translation", "Ministry Legalization"],
    processingTime: "8-12 business days",
    price: "$180-$280",
    rating: 4.7,
    type: "legalization",
    requirements: ["Original Documents", "ID Card Copy", "Proof of Purpose"]
  },
  {
    provider: "ENIC-NARIC France",
    country: "France",
    services: ["Academic Recognition", "Professional Recognition", "Comparability Statement"],
    processingTime: "15-20 business days",
    price: "$220-$380",
    rating: 4.6,
    type: "recognition",
    requirements: ["Original Diploma", "Course Descriptions", "Official Translations"]
  }
];

const DocumentServices: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [serviceType, setServiceType] = useState<'legalization' | 'recognition' | 'all'>('all');

  const allCountries = regions.flatMap(region => region.countries).sort();
  const documentTypes = [
    // Academic Documents
    "High School Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD Degree",
    "Transcripts",
    "Language Certificates",
    "Professional Qualifications",
    // Personal Documents
    "Birth Certificate",
    "Marriage Certificate",
    "Divorce Certificate",
    "Death Certificate",
    "Police Clearance",
    "Medical Records",
    "Passport",
    "National ID",
    "Driver's License",
    "Power of Attorney",
    "Employment Records",
    "Tax Documents",
    // Other Documents
    "Other Academic Documents",
    "Other Personal Documents"
  ].sort();

  const filteredServices = mockServices.filter(service => {
    if (destinationCountry && service.country !== destinationCountry) return false;
    if (serviceType !== 'all' && service.type !== serviceType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Document Services</h1>

        {/* Service Type Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Service Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${
                serviceType === 'legalization' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => setServiceType('legalization')}
            >
              <h3 className="text-lg font-semibold mb-2">Document Legalization</h3>
              <p className="text-gray-600 text-sm">
                Authentication of documents in your country of residence through embassies, 
                ministries, or qualified institutions. Typically done before traveling abroad.
              </p>
            </div>
            <div 
              className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${
                serviceType === 'recognition' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => setServiceType('recognition')}
            >
              <h3 className="text-lg font-semibold mb-2">Translation & Recognition</h3>
              <p className="text-gray-600 text-sm">
                Professional translation of your documents and official recognition of your 
                qualifications in the destination country. This process validates your 
                credentials for study or work purposes.
              </p>
            </div>
          </div>
        </div>

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
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Document Type</option>
                <optgroup label="Academic Documents">
                  <option value="High School Diploma">High School Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD Degree">PhD Degree</option>
                  <option value="Transcripts">Transcripts</option>
                  <option value="Language Certificates">Language Certificates</option>
                  <option value="Professional Qualifications">Professional Qualifications</option>
                  <option value="Other Academic Documents">Other Academic Documents</option>
                </optgroup>
                <optgroup label="Personal Documents">
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Marriage Certificate">Marriage Certificate</option>
                  <option value="Divorce Certificate">Divorce Certificate</option>
                  <option value="Death Certificate">Death Certificate</option>
                  <option value="Police Clearance">Police Clearance</option>
                  <option value="Medical Records">Medical Records</option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Power of Attorney">Power of Attorney</option>
                  <option value="Employment Records">Employment Records</option>
                  <option value="Tax Documents">Tax Documents</option>
                  <option value="Other Personal Documents">Other Personal Documents</option>
                </optgroup>
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
                    <h3 className="text-xl font-bold text-primary">{service.provider}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.type === 'legalization' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {service.type === 'legalization' ? 'Legalization' : 'Translation & Recognition'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{service.country}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Services:</span>{" "}
                      {service.services.join(", ")}
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
                      <span className="font-medium">Rating:</span>{" "}
                      {service.rating}/5.0
                    </p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Requirements:</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {service.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Get Started
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No services found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>

        {/* Information Sections */}
        <div className="space-y-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Document Services Process</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Legalization Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Document authentication by issuing institution</li>
                  <li>Notarization by certified notary public</li>
                  <li>Authentication by Ministry of Foreign Affairs</li>
                  <li>Legalization by destination country's embassy/consulate</li>
                  <li>Translation by certified translator (if required)</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Translation & Recognition Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Professional translation of documents</li>
                  <li>Certification of translations</li>
                  <li>Submission to recognition authority</li>
                  <li>Evaluation and assessment</li>
                  <li>Issuance of recognition certificate</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Important Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Processing Times</h3>
                <div className="space-y-2 text-gray-600">
                  <p>• Standard Processing: 15-20 working days</p>
                  <p>• Express Processing: 5-7 working days (additional fee)</p>
                  <p>• Emergency Processing: 2-3 working days (premium fee)</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Documents</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Original documents</li>
                  <li>Official translations</li>
                  <li>Identity documents</li>
                  <li>Application forms</li>
                  <li>Supporting documentation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentServices;