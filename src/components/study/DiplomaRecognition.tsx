import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface RecognitionService {
  provider: string;
  country: string;
  acceptedDegrees: string[];
  processingTime: string;
  price: string;
  successRate: string;
}

const mockServices: RecognitionService[] = [
  {
    provider: "European Qualification Framework",
    country: "Germany",
    acceptedDegrees: ["Bachelor's Degree", "Master's Degree", "PhD"],
    processingTime: "4-6 weeks",
    price: "$300-$500",
    successRate: "95%"
  },
  {
    provider: "UK NARIC",
    country: "United Kingdom",
    acceptedDegrees: ["High School", "Bachelor's Degree", "Master's Degree"],
    processingTime: "3-4 weeks",
    price: "$250-$400",
    successRate: "92%"
  },
  {
    provider: "French Ministry of Education",
    country: "France",
    acceptedDegrees: ["Bachelor's Degree", "Master's Degree", "Professional Certification"],
    processingTime: "6-8 weeks",
    price: "$200-$350",
    successRate: "90%"
  }
];

const DiplomaRecognition: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [fieldOfStudy, setFieldOfStudy] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const educationLevels = [
    "High School",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Professional Certification"
  ];
  const fields = [
    "Engineering",
    "Medicine",
    "Business",
    "Law",
    "Education",
    "Sciences",
    "Arts",
    "Other"
  ];

  const filteredServices = mockServices.filter(service => {
    if (destinationCountry && service.country !== destinationCountry) return false;
    if (educationLevel && !service.acceptedDegrees.includes(educationLevel)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Diploma Recognition</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Level</option>
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field of Study
              </label>
              <select
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Field</option>
                {fields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{service.provider}</h3>
                  <p className="text-gray-600 mb-4">{service.country}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Accepted Degrees:</span>{" "}
                      {service.acceptedDegrees.join(", ")}
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
                      <span className="font-medium">Success Rate:</span>{" "}
                      {service.successRate}
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Start Process
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No recognition services found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>

        {/* Information Sections */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Recognition Process</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Document preparation and translation</li>
              <li>Verification of authenticity</li>
              <li>Evaluation by recognition authority</li>
              <li>Comparative analysis with local education system</li>
              <li>Recognition certificate issuance</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Required Documents</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Original diploma/degree certificate</li>
              <li>Official transcripts</li>
              <li>Course descriptions</li>
              <li>Identity documents</li>
              <li>Previous education certificates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiplomaRecognition;