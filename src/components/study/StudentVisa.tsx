import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import VisaChecker from '../visa/VisaChecker';

const StudentVisa: React.FC = () => {
  const [residenceCountry, setResidenceCountry] = useState<string>('');
  const [nationality, setNationality] = useState<string>('');
  const [destinationCountry, setDestinationCountry] = useState<string>('');
  const [studyDuration, setStudyDuration] = useState<string>('');
  const [programLevel, setProgramLevel] = useState<string>('');

  const { countries: allCountries } = useCountries();
  const durations = [
    'Less than 6 months',
    '6-12 months',
    '1-2 years',
    '2-4 years',
    'More than 4 years',
  ];
  const levels = [
    'Language Course',
    "Bachelor's Degree",
    "Master's Degree",
    'PhD',
    'Professional Training',
  ];

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
                onChange={e => setResidenceCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Country</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <select
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Nationality</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Country
              </label>
              <select
                value={destinationCountry}
                onChange={e => setDestinationCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Country</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Duration</label>
              <select
                value={studyDuration}
                onChange={e => setStudyDuration(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Duration</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program Level</label>
              <select
                value={programLevel}
                onChange={e => setProgramLevel(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visa requirement result + embassy (story 4.5), fiche détaillée (story 4.7) */}
        <VisaChecker nationality={nationality} destination={destinationCountry} visaType="Étudiant" />
      </div>
    </div>
  );
};

export default StudentVisa;
