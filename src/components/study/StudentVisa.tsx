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
    provider: "UK Student Visa Services",
    country: "United Kingdom",
    visaTypes: ["Student Visa (Tier 4)", "Short-term Study Visa"],
    processingTime: "3-4 weeks",
    price: "$400-$600",
    requirements: ["University Acceptance", "Financial Proof", "English Proficiency"]
  },
  {
    provider: "German Academic Exchange Service",
    country: "Germany",
    visaTypes: ["Student Visa", "Language Course Visa"],
    processingTime: "4-6 weeks",
    price: "$100-$200",
    requirements: ["University Admission", "Blocked Account", "Health Insurance"]
  },
  {
    provider: "Campus France",
    country: "France",
    visaTypes: ["Long-stay Student Visa", "Short-stay Student Visa"],
    processingTime: "2-3 weeks",
    price: "$150-$300",
    requirements: ["Acceptance Letter", "Financial Guarantee", "Accommodation Proof"]
  }
];

const StudentVisa: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [studyDuration, setStudyDuration] = useState<string>("");
  const [programLevel, setProgramLevel] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const durations = [
    "Less than 6 months",
    "6-12 months",
    "1-2 years",
    "2-4 years",
    "More than 4 years"
  ];
  const levels = [
    "Language Course",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Professional Training"
  ];

  const filteredServices = mockServices.filter(service => {
    if (destinationCountry && service.country !== destinationCountry) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Student Visa Assistance</h1>

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
                Study Duration
              </label>
              <select
                value={studyDuration}
                onChange={(e) => setStudyDuration(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Duration</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Level
              </label>
              <select
                value={programLevel}
                onChange={(e) => setProgramLevel(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
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
                      <span className="font-medium">Key Requirements:</span>{" "}
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

export default StudentVisa;