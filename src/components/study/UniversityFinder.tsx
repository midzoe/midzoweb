import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { regions } from '../../data/regions';
import { apiService } from '../../services/api';

interface University {
  id: number;
  name: string;
  country: string;
  city: string;
  website?: string;
  applicationUrl?: string;
  specialty?: string;
  programs: UniversityProgram[];
}

interface UniversityProgram {
  id: number;
  name: string;
  level: string;
}



const UniversityFinder: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';

  const labels = {
    en: {
      title: 'University Finder',
      searchPlaceholder: 'Search universities by name or specialty...',
      reset: 'Reset',
      country: 'Country',
      allCountries: 'All Countries',
      program: 'Program',
      allPrograms: 'All Programs',
      level: 'Level',
      city: 'City',
      allCities: 'All Cities',
      allLevels: 'All Levels',
      loading: 'Loading universities...',
      availablePrograms: 'Available Programs:',
      visitWebsite: 'Visit Website',
      applyNow: 'Apply Now',
      more: 'more',
      noResults: 'No universities found matching your criteria. Please adjust your filters.',
      noData: 'No universities available. Please check back later.',
      errorLoad: 'Error loading universities. Please try again.',
      failedLoad: 'Failed to load universities',
    },
    fr: {
      title: 'Recherche d\'Université',
      searchPlaceholder: 'Rechercher des universités par nom ou spécialité...',
      reset: 'Réinitialiser',
      country: 'Pays',
      allCountries: 'Tous les pays',
      program: 'Programme',
      allPrograms: 'Tous les programmes',
      level: 'Niveau',
      city: 'Ville',
      allCities: 'Toutes les villes',
      allLevels: 'Tous les niveaux',
      loading: 'Chargement des universités...',
      availablePrograms: 'Programmes disponibles :',
      visitWebsite: 'Visiter le site',
      applyNow: 'Postuler maintenant',
      more: 'de plus',
      noResults: 'Aucune université trouvée correspondant à vos critères. Veuillez ajuster vos filtres.',
      noData: 'Aucune université disponible. Veuillez revenir plus tard.',
      errorLoad: 'Erreur lors du chargement des universités. Veuillez réessayer.',
      failedLoad: 'Impossible de charger les universités',
    },
    de: {
      title: 'Universitätsfinder',
      searchPlaceholder: 'Universitäten nach Name oder Fachrichtung suchen...',
      reset: 'Zurücksetzen',
      country: 'Land',
      allCountries: 'Alle Länder',
      program: 'Programm',
      allPrograms: 'Alle Programme',
      level: 'Niveau',
      city: 'Stadt',
      allCities: 'Alle Städte',
      allLevels: 'Alle Niveaus',
      loading: 'Universitäten werden geladen...',
      availablePrograms: 'Verfügbare Programme:',
      visitWebsite: 'Website besuchen',
      applyNow: 'Jetzt bewerben',
      more: 'weitere',
      noResults: 'Keine Universitäten gefunden, die Ihren Kriterien entsprechen. Bitte passen Sie Ihre Filter an.',
      noData: 'Keine Universitäten verfügbar. Bitte schauen Sie später wieder vorbei.',
      errorLoad: 'Fehler beim Laden der Universitäten. Bitte versuchen Sie es erneut.',
      failedLoad: 'Universitäten konnten nicht geladen werden',
    },
  };

  const t = labels[lang];

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const levels = ["Bachelor", "Master", "PhD", "Certificate"];

  useEffect(() => {
    loadUniversities();
    loadCountries();
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedCountry || selectedProgram || selectedLevel || searchQuery || selectedCity) {
      loadUniversities();
    }
  }, [selectedCountry, selectedCity, selectedProgram, selectedLevel, searchQuery]);

  // Load cities when country changes
  useEffect(() => {
    setSelectedCity("");
    setAvailableCities([]);
    if (!selectedCountry) return;
    setLoadingCities(true);
    apiService.getUniversityCities(selectedCountry)
      .then(res => {
        if (res.success) setAvailableCities(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  }, [selectedCountry]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      setError("");
      
      const filters = {
        ...(selectedCountry && { country: selectedCountry }),
        ...(selectedCity && { city: selectedCity }),
        ...(selectedProgram && { program: selectedProgram }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await apiService.getUniversities(filters);
      
      if (response.success) {
        setUniversities(response.data || []);
      } else {
        setError(t.failedLoad);
      }
    } catch (err) {
      console.error("Error loading universities:", err);
      setError(t.errorLoad);
    
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await apiService.getUniversityCountries();
      if (response.success) {
        setAvailableCountries(response.data || []);
      }
    } catch (err) {
      console.error("Error loading countries:", err);
      // Fallback to regions data
      setAvailableCountries(regions.flatMap(region => region.countries).sort());
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await apiService.getUniversityPrograms();
      if (response.success && response.data) {
        setAvailablePrograms(response.data.programNames || []);
      }
    } catch (err) {
      console.error("Error loading programs:", err);
      // Fallback to static programs
      setAvailablePrograms([
        "Computer Science", "Engineering", "Business", "Medicine", "Law",
        "Literature", "History", "Philosophy", "Economics", "Political Science",
        "Architecture", "Physics", "Chemistry", "Mathematics", "Psychology",
        "Journalism", "International Relations", "Languages", "Arts", "Social Sciences"
      ].sort());
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleReset = () => {
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedProgram("");
    setSelectedLevel("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t.title}</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.country}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">{t.allCountries}</option>
                {availableCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* City filter — shown only after a country is selected */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.city}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedCountry || loadingCities}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:opacity-50"
              >
                <option value="">{loadingCities ? '...' : t.allCities}</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.program}
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">{t.allPrograms}</option>
                {availablePrograms.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.level}
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">{t.allLevels}</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universities.length > 0 ? (
              universities.map((university) => (
                <div key={university.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">{university.name}</h3>
                    <p className="text-gray-600 mb-4">{university.city}, {university.country}</p>

                    {university.specialty && (
                      <p className="text-gray-600 mb-4">{university.specialty}</p>
                    )}

                    <div className="space-y-2">
                      {university.programs.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{t.availablePrograms}</p>
                          <div className="flex flex-wrap gap-1">
                            {university.programs.slice(0, 5).map((program) => (
                              <span
                                key={`${program.id}`}
                                className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                              >
                                {program.name} ({program.level})
                              </span>
                            ))}
                            {university.programs.length > 5 && (
                              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                +{university.programs.length - 5} {t.more}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {university.website && (
                        <a
                          href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors text-center text-sm"
                        >
                          {t.visitWebsite}
                        </a>
                      )}
                      {university.applicationUrl && (
                        <a
                          href={university.applicationUrl.startsWith('http') ? university.applicationUrl : `https://${university.applicationUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center text-sm"
                        >
                          {t.applyNow}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">
                  {searchQuery || selectedCountry || selectedProgram || selectedLevel
                    ? t.noResults
                    : t.noData}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityFinder;