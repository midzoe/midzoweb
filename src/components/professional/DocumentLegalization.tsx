import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface LegalizationService {
  provider: string;
  country: string;
  services: string[];
  processingTime: string;
  price: string;
  requirements: string[];
  features: string[];
  success_rate: string;
  documentTypes: string[];
}

const mockServices: LegalizationService[] = [
  {
    provider: "Global Document Services",
    country: "Germany",
    services: ["Document Authentication", "Apostille", "Embassy Legalization", "Document Translation"],
    processingTime: "2-3 weeks",
    price: "€200-€500 per document",
    requirements: [
      "Original Documents",
      "Passport Copy",
      "Application Form",
      "Power of Attorney (if applicable)"
    ],
    features: [
      "Free Document Review",
      "Express Processing Available",
      "Document Translation",
      "Courier Service",
      "Online Tracking"
    ],
    success_rate: "98%",
    documentTypes: [
      "Academic Degrees",
      "Professional Certificates",
      "Work Experience Letters",
      "Birth Certificates",
      "Marriage Certificates"
    ]
  },
  {
    provider: "UK Legalization Center",
    country: "United Kingdom",
    services: ["Apostille Service", "Embassy Attestation", "Document Translation", "Certification"],
    processingTime: "1-2 weeks",
    price: "£150-£400 per document",
    requirements: [
      "Original/Notarized Documents",
      "ID Proof",
      "Supporting Documents",
      "Application Details"
    ],
    features: [
      "Same Day Processing Option",
      "Multi-Language Translation",
      "Door-to-Door Service",
      "Digital Copy Storage",
      "24/7 Support"
    ],
    success_rate: "99%",
    documentTypes: [
      "University Degrees",
      "Professional Qualifications",
      "Employment Records",
      "Legal Documents",
      "Commercial Documents"
    ]
  },
  {
    provider: "European Document Authority",
    country: "France",
    services: ["Document Authentication", "Apostille", "Ministry Legalization", "Certified Translation"],
    processingTime: "2-4 weeks",
    price: "€180-€450 per document",
    requirements: [
      "Original Documents",
      "Identity Documents",
      "Proof of Address",
      "Application Form"
    ],
    features: [
      "Multilingual Service",
      "Priority Processing",
      "Secure Document Handling",
      "International Shipping",
      "Expert Consultation"
    ],
    success_rate: "97%",
    documentTypes: [
      "Educational Certificates",
      "Professional Licenses",
      "Corporate Documents",
      "Personal Documents",
      "Medical Certificates"
    ]
  }
];

const DocumentLegalization: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const documentTypes = [
    "Academic Degrees",
    "Professional Certificates",
    "Work Experience Letters",
    "Birth Certificates",
    "Marriage Certificates",
    "Commercial Documents",
    "Legal Documents",
    "Medical Certificates"
  ].sort();

  const services = [
    "Document Authentication",
    "Apostille",
    "Embassy Legalization",
    "Document Translation",
    "Ministry Legalization",
    "Certification"
  ].sort();

  const processingTimes = [
    "Standard (2-4 weeks)",
    "Express (1-2 weeks)",
    "Urgent (2-3 days)"
  ];

  const filteredServices = mockServices.filter(service => {
    if (country && service.country !== country) return false;
    if (documentType && !service.documentTypes.includes(documentType)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Document Legalization & Recognition</h1>

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
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Document Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Services</option>
                {services.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Time
              </label>
              <select
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Processing Times</option>
                {processingTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
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
                      <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.services.map((type, idx) => (
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
                      <h4 className="font-medium text-gray-900 mb-2">Document Types</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {service.documentTypes.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
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

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {service.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
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
                    Start Process
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
      </div>
    </div>
  );
};

export default DocumentLegalization;