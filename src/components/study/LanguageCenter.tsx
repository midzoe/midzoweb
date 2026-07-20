import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCountries } from '../../hooks/useCountries';
import { apiService } from '../../services/api';

// Story 5.8 : centres de langue servis par le backend (modèle LanguageCenter, story 5.4).
// Cible de redirection depuis la vérification d'exigence de langue université (story 5.3) :
// quand le niveau de l'étudiant est insuffisant, on l'envoie ici avec ?language=&country=&level=&university=.
interface LanguageCenter {
  id: number;
  name: string;
  country: string;
  city?: string;
  language: string;
  levels?: string;
  link?: string;
  isPartner: boolean;
}

const LANGUAGES = ['Anglais', 'Allemand', 'Français', 'Espagnol', 'Italien', 'Chinois'];

const LanguageCenterPage: React.FC = () => {
  const { countries: allCountries } = useCountries();
  const [searchParams] = useSearchParams();

  // Contexte de redirection (niveau insuffisant) — optionnel.
  const redirectLanguage = searchParams.get('language') ?? '';
  const redirectLevel = searchParams.get('level') ?? '';
  const redirectUniversity = searchParams.get('university') ?? '';
  const redirectCountry = searchParams.get('country') ?? '';
  const cameFromCheck = !!(redirectLanguage || redirectUniversity);

  const [country, setCountry] = useState<string>(redirectCountry);
  const [language, setLanguage] = useState<string>(redirectLanguage);

  const [centers, setCenters] = useState<LanguageCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.getLanguageCenters({
        ...(language && { language }),
        ...(country && { country }),
      });
      setCenters(res.data ?? []);
    } catch (err) {
      console.error('Error loading language centers:', err);
      setError('Failed to load language centers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, language]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Language Centers</h1>

        {/* Bannière de redirection : niveau de langue insuffisant (story 5.3 → 5.8) */}
        {cameFromCheck && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 mb-6">
            <p className="text-amber-800 font-medium">
              {redirectUniversity
                ? `Votre niveau de langue n'atteint pas encore l'exigence de « ${redirectUniversity} ».`
                : 'Votre niveau de langue est insuffisant pour cette université.'}
            </p>
            <p className="text-amber-700 text-sm mt-1">
              {redirectLanguage && `Langue requise : ${redirectLanguage}${redirectLevel ? ` (niveau ${redirectLevel})` : ''}. `}
              Voici des centres de langue pour vous mettre à niveau.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading language centers...</p>
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
            {centers.length > 0 ? (
              centers.map(center => (
                <div key={center.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-primary">{center.name}</h3>
                      {center.isPartner && (
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Partner
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {center.city ? `${center.city}, ` : ''}{center.country}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Language:</span> {center.language}
                      </p>
                      {center.levels && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Levels:</span> {center.levels}
                        </p>
                      )}
                    </div>
                    {center.link && (
                      <a
                        href={center.link.startsWith('http') ? center.link : `https://${center.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors text-center"
                      >
                        Learn More
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">
                  No language centers found matching your criteria. Please adjust your filters or check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageCenterPage;
