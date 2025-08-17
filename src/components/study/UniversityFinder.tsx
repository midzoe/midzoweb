import React, { useState, useEffect } from 'react';
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

const mockUniversities: University[] = [
  {
    name: "University of Cambridge",
    country: "United Kingdom",
    city: "Cambridge",
    programs: ["Computer Science", "Engineering", "Business", "Law", "Medicine", "Literature", "History", "Physics"],
    tuitionRange: "£25,000 - £35,000",
    language: "English",
    ranking: 3,
    image: "https://images.unsplash.com/photo-1501503069356-3c6b82a17d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "A prestigious institution known for academic excellence and groundbreaking research.",
    website: "https://www.cam.ac.uk"
  },
  {
    name: "Oxford University",
    country: "United Kingdom",
    city: "Oxford",
    programs: ["Philosophy", "Economics", "Law", "Medicine", "Literature", "Mathematics", "Chemistry", "Politics"],
    tuitionRange: "£27,000 - £38,000",
    language: "English",
    ranking: 2,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "World-renowned university with centuries of academic tradition and innovation.",
    website: "https://www.ox.ac.uk"
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    programs: ["Engineering", "Computer Science", "Medicine", "Architecture", "Physics", "Chemistry", "Mathematics"],
    tuitionRange: "€500/semester",
    language: "German/English",
    ranking: 15,
    image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Leading technical university known for engineering and innovation.",
    website: "https://www.tum.de/en"
  },
  {
    name: "Humboldt University Berlin",
    country: "Germany",
    city: "Berlin",
    programs: ["Philosophy", "Law", "Economics", "Literature", "History", "Social Sciences", "Psychology"],
    tuitionRange: "€300/semester",
    language: "German/English",
    ranking: 25,
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Historic institution in the heart of Berlin with strong humanities programs.",
    website: "https://www.hu-berlin.de/en"
  },
  {
    name: "Sorbonne University",
    country: "France",
    city: "Paris",
    programs: ["Arts", "Literature", "Law", "Medicine", "History", "Philosophy", "Languages"],
    tuitionRange: "€3,000/year",
    language: "French/English",
    ranking: 25,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Prestigious French university with rich cultural heritage.",
    website: "https://www.sorbonne-universite.fr/en"
  },
  {
    name: "Sciences Po Paris",
    country: "France",
    city: "Paris",
    programs: ["Political Science", "International Relations", "Law", "Economics", "Journalism", "Public Policy"],
    tuitionRange: "€12,000/year",
    language: "French/English",
    ranking: 30,
    image: "https://images.unsplash.com/photo-1537202108838-e7072bad1927?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Leading institution for political science and international affairs.",
    website: "https://www.sciencespo.fr/en"
  }
];

const UniversityFinder: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const levels = ["Bachelor", "Master", "PhD", "Certificate"];

  useEffect(() => {
    loadUniversities();
    loadCountries();
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedCountry || selectedProgram || selectedLevel || searchQuery) {
      loadUniversities();
    }
  }, [selectedCountry, selectedProgram, selectedLevel, searchQuery]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      setError("");
      
      const filters = {
        ...(selectedCountry && { country: selectedCountry }),
        ...(selectedProgram && { program: selectedProgram }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await apiService.getUniversities(filters);
      
      if (response.success) {
        setUniversities(response.data || []);
      } else {
        setError("Failed to load universities");
      }
    } catch (err) {
      console.error("Error loading universities:", err);
      setError("Error loading universities. Please try again.");
      // Fallback to mock data if API fails
      setUniversities(mockUniversities.filter(uni => {
        if (selectedCountry && uni.country !== selectedCountry) return false;
        if (selectedProgram && !uni.programs.map(p => p.name).includes(selectedProgram)) return false;
        if (searchQuery && !uni.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      }));
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
    setSelectedProgram("");
    setSelectedLevel("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">University Finder</h1>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search universities by name or specialty..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {availableCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Programs</option>
                {availablePrograms.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Levels</option>
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
            <p className="mt-2 text-gray-600">Loading universities...</p>
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
                          <p className="text-sm font-medium text-gray-700 mb-1">Available Programs:</p>
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
                                +{university.programs.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      {university.website && (
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors text-center text-sm"
                        >
                          Visit Website
                        </a>
                      )}
                      {university.applicationUrl && (
                        <a
                          href={university.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center text-sm"
                        >
                          Apply Now
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
                    ? "No universities found matching your criteria. Please adjust your filters."
                    : "No universities available. Please check back later."}
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