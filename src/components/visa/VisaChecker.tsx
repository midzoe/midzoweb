import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import {
  InformationCircleIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface EmbassyBlock {
  id: number;
  country: string;
  name: string;
  location: string | null;
  link: string | null;
  email: string | null;
  phone: string | null;
}

interface TravelCheckResult {
  visaRequired: boolean | null;
  message: string;
  embassy: EmbassyBlock | null;
}

// Story 4.5 : vérificateur de visa partagé par TouristVisa et StudentVisa.
// Interroge travel/check (story 4.3) et affiche le message généré + le bloc ambassade.
const VisaChecker: React.FC<{ nationality: string; destination: string }> = ({
  nationality,
  destination,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const fr = lang === 'fr';

  const [result, setResult] = useState<TravelCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nationality || !destination) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiService
      .checkTravelRequirements(nationality, destination, lang)
      .then(res => {
        if (cancelled) return;
        setResult({
          visaRequired: res?.visaRequired ?? null,
          message: res?.message ?? '',
          embassy: res?.embassy ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nationality, destination, lang]);

  if (!nationality || !destination) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-3 text-gray-500">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        {fr ? 'Vérification des exigences visa...' : 'Checking visa requirements...'}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-blue-50 rounded-xl shadow p-6 flex items-center gap-3 text-blue-700">
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0" />
        <span>
          {fr
            ? "Aucune donnée visa disponible. Consultez l'ambassade du pays de destination."
            : 'No visa data available. Please contact the destination embassy.'}
        </span>
      </div>
    );
  }

  const required = result.visaRequired === true;
  const embassy = result.embassy;

  return (
    <div
      className={`rounded-xl shadow-lg p-6 border-l-4 ${
        required ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'
      }`}
    >
      <div className="flex items-start gap-3">
        <InformationCircleIcon
          className={`h-6 w-6 mt-0.5 shrink-0 ${required ? 'text-amber-600' : 'text-green-600'}`}
        />
        <div className="flex-1">
          <p className={`text-sm ${required ? 'text-amber-800' : 'text-green-800'}`}>
            {result.message}
          </p>

          {embassy && (
            <div className="mt-4 bg-white/70 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
                <BuildingLibraryIcon className="h-5 w-5 text-primary" />
                {embassy.name}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {embassy.location && (
                  <p>
                    <span className="font-medium">{fr ? 'Localisation : ' : 'Location: '}</span>
                    {embassy.location}
                  </p>
                )}
                {embassy.link && (
                  <p>
                    <a
                      href={embassy.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {fr ? 'Site officiel' : 'Official website'}
                    </a>
                  </p>
                )}
                {embassy.email && (
                  <p>
                    <span className="font-medium">Email : </span>
                    <a href={`mailto:${embassy.email}`} className="text-primary hover:underline">
                      {embassy.email}
                    </a>
                  </p>
                )}
                {embassy.phone && (
                  <p>
                    <span className="font-medium">{fr ? 'Téléphone : ' : 'Phone: '}</span>
                    {embassy.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaChecker;
