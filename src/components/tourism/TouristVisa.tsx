import React, { useState, useEffect } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useAuth } from '../../context/AuthContext';
import VisaChecker from '../visa/VisaChecker';

const TouristVisa: React.FC = () => {
  const { user } = useAuth();
  const { countries: allCountries } = useCountries();

  const [nationality, setNationality] = useState<string>(user?.nationality || '');
  const [destinationCountry, setDestinationCountry] = useState<string>('');

  // Pre-fill nationality from profile
  useEffect(() => {
    if (user?.nationality && !nationality) setNationality(user.nationality);
  }, [user?.nationality]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Assistance Visa Touristique</h1>
        <p className="text-gray-600 mb-8">
          Sélectionnez votre nationalité et la destination pour voir les exigences visa et
          l'ambassade compétente.
        </p>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nationalité
                {user?.nationality && (
                  <span className="ml-2 text-xs text-green-600">(depuis votre profil)</span>
                )}
              </label>
              <select
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Sélectionner votre nationalité</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays de destination
              </label>
              <select
                value={destinationCountry}
                onChange={e => setDestinationCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Sélectionner la destination</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visa requirement result + embassy (story 4.5) */}
        <VisaChecker nationality={nationality} destination={destinationCountry} />
      </div>
    </div>
  );
};

export default TouristVisa;
