import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { serviceDetails } from '../data/services';
import { regions } from '../data/regions';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface TripWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripData: any) => void;
}

interface ServiceSelection {
  link?: string;
  preferences?: string;
  selections?: {
    [key: string]: any;
  };
  selectedAccommodation?: any;
}

interface TripData {
  category: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  services: {
    [key: string]: ServiceSelection;
  };
}

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (accommodation: any) => void;
  filters: {
    country?: string;
    city?: string;
    type?: string;
    priceRange?: string;
  };
}

interface UniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (university: any) => void;
  preselectedCountry?: string;
}

interface DocumentLegalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface University {
  id: number;
  name: string;
  country: string;
  city: string;
  website?: string;
  applicationUrl?: string;
  specialty?: string;
  createdAt?: string;
  programs?: UniversityProgram[];
}

interface UniversityProgram {
  id: number;
  name: string;
  level: string;
  universityId?: number;
  createdAt?: string;
}

// Composant DocumentLegalizationModal
const DocumentLegalizationModal: React.FC<DocumentLegalizationModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const handleWhatsAppContact = () => {
    const phoneNumber = "+22899230353";
    const message = "Bonjour, j'ai besoin d'aide avec la légalisation de documents.";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Légalisation de Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Process Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Processus de Légalisation</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Authentification par l'institution émettrice</li>
              <li>Légalisation par notaire certifié</li>
              <li>Authentification par le Ministère des Affaires Étrangères</li>
              <li>Légalisation par l'ambassade/consulat du pays de destination</li>
              <li>Traduction par traducteur certifié (si nécessaire)</li>
            </ol>
          </div>

          {/* Required Documents */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Documents Requis</h3>
            <ul className="list-disc list-inside space-y-2 text-green-800">
              <li>Documents originaux</li>
              <li>Copies certifiées conformes</li>
              <li>Pièce d'identité valide</li>
              <li>Formulaires de demande remplis</li>
              <li>Justificatifs du motif de la légalisation</li>
            </ul>
          </div>

          {/* Processing Times */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Délais de Traitement</h3>
            <div className="space-y-2 text-yellow-800">
              <p>• <strong>Standard :</strong> 15-20 jours ouvrables</p>
              <p>• <strong>Express :</strong> 5-7 jours ouvrables (frais supplémentaires)</p>
              <p>• <strong>Urgence :</strong> 2-3 jours ouvrables (frais premium)</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">⚠️ Important</h3>
            <p className="text-orange-800">
              Les procédures de légalisation varient selon le pays de destination. 
              Il est recommandé de vérifier les exigences spécifiques auprès de 
              l'ambassade ou du consulat concerné.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            J'ai compris et déjà fait
          </button>
          <button
            onClick={handleWhatsAppContact}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant AccommodationModal
const AccommodationModal: React.FC<AccommodationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  filters 
}) => {
  const [location, setLocation] = useState<string>(filters.country || "");
  const [city, setCity] = useState<string>(filters.city || "");
  const [type, setType] = useState<string>(filters.type || "");
  const [priceRange, setPriceRange] = useState<string>(filters.priceRange || "");

  const mockAccommodations = [
    {
      id: 1,
      name: "Grand Plaza Hotel",
      location: "France",
      city: "Paris",
      type: "Hotel",
      priceRange: "$200-$400/night",
      amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
      rating: 4.8,
      reviews: 1250
    },
    {
      id: 2,
      name: "Coastal Villa Resort",
      location: "Spain",
      city: "Barcelona",
      type: "Resort",
      priceRange: "$300-$600/night",
      amenities: ["Beach Access", "Pool", "Restaurant", "Gym"],
      rating: 4.7,
      reviews: 890
    },
    {
      id: 3,
      name: "City Center Apartments",
      location: "Germany",
      city: "Berlin",
      type: "Apartment",
      priceRange: "$150-$300/night",
      amenities: ["Kitchen", "WiFi", "Laundry", "Parking"],
      rating: 4.5,
      reviews: 675
    }
  ];

  const allCountries = regions.flatMap(region => region.countries).sort();
  const cities = Array.from(new Set(mockAccommodations.map(acc => acc.city))).sort();
  const types = ["Hotel", "Resort", "Apartment", "Villa", "Guesthouse"];
  const priceRanges = [
    "Under $100/night",
    "$100-$200/night",
    "$200-$400/night",
    "Above $400/night"
  ];

  const filteredAccommodations = mockAccommodations.filter(acc => {
    if (location && acc.location !== location) return false;
    if (city && acc.city !== city) return false;
    if (type && acc.type !== type) return false;
    if (priceRange && acc.priceRange !== priceRange) return false;
    return true;
  });

  const handleSelect = (accommodation: any) => {
    onSelect(accommodation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Select Accommodation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Ranges</option>
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredAccommodations.length > 0 ? (
            filteredAccommodations.map((accommodation) => (
              <div key={accommodation.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-primary mb-2">{accommodation.name}</h3>
                <p className="text-gray-600 mb-2">{accommodation.city}, {accommodation.location}</p>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">Type:</span> {accommodation.type}</p>
                  <p><span className="font-medium">Price:</span> {accommodation.priceRange}</p>
                  <p><span className="font-medium">Rating:</span> {accommodation.rating}/5.0 ({accommodation.reviews} reviews)</p>
                </div>
                <button
                  onClick={() => handleSelect(accommodation)}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Select This Accommodation
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No accommodations found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant UniversityModal
const UniversityModal: React.FC<UniversityModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  preselectedCountry 
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(preselectedCountry || "");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const levels = ["Bachelor", "Master"]; // Based on the API documentation

  useEffect(() => {
    if (isOpen) {
      setSelectedCountry(preselectedCountry || "");
      loadUniversities();
      loadCountries();
      loadPrograms();
    }
  }, [isOpen, preselectedCountry]);

  useEffect(() => {
    if (selectedCountry || selectedProgram || selectedLevel || searchQuery) {
      loadUniversities();
    }
  }, [selectedCountry, selectedProgram, selectedLevel, searchQuery]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      setError("");
      
      const filters: any = {
        region: 'europe', // Always filter for European universities
        ...(selectedCountry && { country: selectedCountry }),
        ...(selectedProgram && { program: selectedProgram }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await apiService.searchUniversities(filters);
      
      if (response.success) {
        setUniversities(response.data || []);
      } else {
        setError(response.error || "Failed to load universities");
      }
    } catch (err: any) {
      console.error("Error loading universities:", err);
      setError(err.message || "Error loading universities. Please try again.");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await apiService.getUniversityCountries();
      if (response.success && response.data) {
        setAvailableCountries(response.data);
      } else {
        // Fallback to European countries only for study trips
        setAvailableCountries(['France', 'Germany', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg', 'Estonia']);
      }
    } catch (err) {
      console.error("Error loading countries:", err);
      // Fallback to European countries only for study trips
      setAvailableCountries(['France', 'Germany', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg', 'Estonia']);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await apiService.getUniversityPrograms();
      if (response.success && response.data && response.data.programNames) {
        setAvailablePrograms(response.data.programNames.sort());
      } else {
        // Fallback to common programs
        setAvailablePrograms([
          "Informatique", "Médecine", "Mathématiques", "Physics", "Engineering", 
          "Business", "Law", "Literature", "History", "Philosophy", "Economics", 
          "Political Science", "Psychology", "Biology", "Chemistry"
        ].sort());
      }
    } catch (err) {
      console.error("Error loading programs:", err);
      // Fallback to common programs
      setAvailablePrograms([
        "Informatique", "Médecine", "Mathématiques", "Physics", "Engineering", 
        "Business", "Law", "Literature", "History", "Philosophy", "Economics", 
        "Political Science", "Psychology", "Biology", "Chemistry"
      ].sort());
    }
  };

  const handleSelect = (university: University) => {
    onSelect(university);
    onClose();
  };

  const handleReset = () => {
    setSelectedCountry(preselectedCountry || "");
    setSelectedProgram("");
    setSelectedLevel("");
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Select University</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search universities by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {universities.length > 0 ? (
              universities.map((university) => (
                <div key={university.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <h3 className="text-lg font-bold text-primary mb-2">{university.name}</h3>
                  <p className="text-gray-600 mb-2">{university.city}, {university.country}</p>
                  
                  {university.specialty && (
                    <p className="text-gray-600 mb-3 text-sm italic">{university.specialty}</p>
                  )}
                  
                  {university.programs && university.programs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Programmes disponibles:</p>
                      <div className="flex flex-wrap gap-1">
                        {university.programs.slice(0, 3).map((program: any) => (
                          <span
                            key={`${program.id}`}
                            className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                          >
                            {program.name} ({program.level})
                          </span>
                        ))}
                        {university.programs.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            +{university.programs.length - 3} programmes
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {university.website && (
                    <div className="mb-3">
                      <a 
                        href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Site officiel ↗
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelect(university)}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Sélectionner
                    </button>
                    {university.applicationUrl && (
                      <a
                        href={university.applicationUrl.startsWith('http') ? university.applicationUrl : `https://${university.applicationUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        Candidater ↗
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  {searchQuery || selectedCountry || selectedProgram || selectedLevel
                    ? "Aucune université trouvée correspondant à vos critères. Veuillez ajuster vos filtres."
                    : "Aucune université disponible. Veuillez réessayer plus tard."}
                </p>
                {!loading && !error && (
                  <button
                    onClick={loadUniversities}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Actualiser
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TripWizard: React.FC<TripWizardProps> = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [closeAfterSave, setCloseAfterSave] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [showDocumentLegalizationModal, setShowDocumentLegalizationModal] = useState(false);
  const [tripData, setTripData] = useState<TripData>({
    category: '',
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    services: {}
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedCategory('');
      setSelectedRegion('');
      setShowSavePrompt(false);
      setCloseAfterSave(false);
      setSelectedAccommodation(null);
      setSelectedUniversity(null);
      setShowDocumentLegalizationModal(false);
      setTripData({
        category: '',
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        services: {}
      });
    }
  }, [isOpen]);

  const validateDates = (startDate: string, endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      return "Start date cannot be before today";
    }

    if (end < start) {
      return "End date cannot be before start date";
    }

    return null;
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTripData({
      ...tripData,
      category: categoryId
    });
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedCategory) {
      return;
    }

    if (currentStep === 1) {
      // Validate that either region or destination country is selected
      if (!selectedRegion && !tripData.destination) {
        alert('Please select either a region or a destination country to continue.');
        return;
      }
      
      if (tripData.startDate && tripData.endDate) {
        const dateError = validateDates(tripData.startDate, tripData.endDate);
        if (dateError) {
          alert(dateError);
          return;
        }
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    onSave({
      ...tripData,
      status: 'ongoing',
      progress: 0
    });
    if (closeAfterSave) {
      onClose();
    }
  };

  const handleSavePromptResponse = (save: boolean) => {
    setShowSavePrompt(false);
    if (save) {
      handleSave();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleClose = () => {
    if (currentStep >= 1 && (tripData.title || tripData.destination || tripData.startDate || tripData.endDate)) {
      setCloseAfterSave(true);
      setShowSavePrompt(true);
    } else {
      onClose();
    }
  };

  const renderCategorySelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Select Trip Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`p-6 rounded-lg text-left transition-all ${
              selectedCategory === category.id
                ? 'border-2 border-primary bg-primary/5'
                : 'border-2 border-gray-200 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBasicInfo = () => {
    // For study trips, only show Europe region and specific countries
    const isStudyTrip = selectedCategory === 'study';
    
    const studyCountries = ['France', 'Germany', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg', 'Estonia'];
    
    const availableRegions = isStudyTrip 
      ? regions.filter(r => r.name === 'Europe')
      : regions;
    
    const availableCountries = isStudyTrip 
      ? studyCountries
      : selectedRegion
        ? regions.find(r => r.name === selectedRegion)?.countries || []
        : regions.flatMap(r => r.countries);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Basic Trip Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Title
            </label>
            <input
              type="text"
              value={tripData.title}
              onChange={(e) => setTripData({ ...tripData, title: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="Enter trip title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Region</option>
              {availableRegions.map(region => (
                <option key={region.name} value={region.name}>{region.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Country
            </label>
            <select
              value={tripData.destination}
              onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Country</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={tripData.startDate}
                onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={tripData.endDate}
                onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderServiceStep = () => {
    if (!selectedCategory) return null;

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return null;

    const currentService = category.services[currentStep - 2];
    const serviceDetail = serviceDetails[selectedCategory][currentService];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{serviceDetail.name}</h2>
        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
          <img
            src={serviceDetail.image}
            alt={serviceDetail.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-600 mb-4">{serviceDetail.description}</p>
          
          <div className="mb-6">
            {currentService === 'Accommodation finder' ? (
              <button
                onClick={() => setShowAccommodationModal(true)}
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Browse {serviceDetail.name}
              </button>
            ) : currentService === 'University finder' ? (
              <button
                onClick={() => setShowUniversityModal(true)}
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Browse {serviceDetail.name}
              </button>
            ) : currentService === 'Document Legalization & Recognition' ? (
              <button
                onClick={() => setShowDocumentLegalizationModal(true)}
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Browse {serviceDetail.name}
              </button>
            ) : (
              <Link
                to={serviceDetail.learnMoreLink}
                target="_blank"
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Browse {serviceDetail.name}
              </Link>
            )}
          </div>

          {selectedAccommodation && currentService === 'Accommodation finder' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">Selected Accommodation:</p>
              <p className="text-green-700">{selectedAccommodation.name} - {selectedAccommodation.city}, {selectedAccommodation.location}</p>
            </div>
          )}

          {selectedUniversity && currentService === 'University finder' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">Selected University:</p>
              <p className="text-green-700">{selectedUniversity.name} - {selectedUniversity.city}, {selectedUniversity.country}</p>
              {selectedUniversity.specialty && (
                <p className="text-green-600 text-sm mt-1">{selectedUniversity.specialty}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {renderServiceFilters(currentService)}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Preferences
              </label>
              <textarea
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                rows={4}
                placeholder={`Enter any specific preferences for ${serviceDetail.name.toLowerCase()}...`}
                value={tripData.services[currentService]?.preferences || ''}
                onChange={(e) => {
                  setTripData({
                    ...tripData,
                    services: {
                      ...tripData.services,
                      [currentService]: {
                        ...tripData.services[currentService],
                        preferences: e.target.value
                      }
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderServiceFilters = (serviceName: string) => {
    const currentSelections = tripData.services[serviceName]?.selections || {};
    
    const updateSelection = (field: string, value: any) => {
      setTripData({
        ...tripData,
        services: {
          ...tripData.services,
          [serviceName]: {
            ...tripData.services[serviceName],
            selections: {
              ...currentSelections,
              [field]: value
            }
          }
        }
      });
    };

    const isStudyTrip = selectedCategory === 'study';
    const studyCountries = ['France', 'Germany', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg', 'Estonia'];
    
    const availableCountries = isStudyTrip 
      ? studyCountries
      : selectedRegion
        ? regions.find(r => r.name === selectedRegion)?.countries || []
        : regions.flatMap(r => r.countries);

    const filters: { [key: string]: JSX.Element } = {
      'University finder': (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected University
            </label>
            <input
              type="text"
              value={selectedUniversity ? `${selectedUniversity.name} - ${selectedUniversity.city}, ${selectedUniversity.country}` : ''}
              placeholder="Click 'Browse University Finder' to select"
              readOnly
              className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country Preference
            </label>
            <select
              value={currentSelections.country || tripData.destination}
              onChange={(e) => updateSelection('country', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Country</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study
            </label>
            <select
              value={currentSelections.field || ''}
              onChange={(e) => updateSelection('field', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Field</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Law">Law</option>
              <option value="Arts">Arts</option>
              <option value="Economics">Economics</option>
              <option value="Political Science">Political Science</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={currentSelections.level || ''}
              onChange={(e) => updateSelection('level', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Level</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={currentSelections.startDate || tripData.startDate}
              onChange={(e) => updateSelection('startDate', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      ),
      'Student accommodation': (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={currentSelections.city || ''}
              onChange={(e) => updateSelection('city', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select City</option>
              {tripData.destination === 'United Kingdom' && (
                <>
                  <option value="London">London</option>
                  <option value="Manchester">Manchester</option>
                  <option value="Birmingham">Birmingham</option>
                  <option value="Edinburgh">Edinburgh</option>
                </>
              )}
              {tripData.destination === 'France' && (
                <>
                  <option value="Paris">Paris</option>
                  <option value="Lyon">Lyon</option>
                  <option value="Marseille">Marseille</option>
                  <option value="Bordeaux">Bordeaux</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Move-in Date
            </label>
            <input
              type="date"
              value={currentSelections.moveInDate || tripData.startDate}
              onChange={(e) => updateSelection('moveInDate', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={currentSelections.duration || ''}
              onChange={(e) => updateSelection('duration', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Duration</option>
              <option value="1-3">1-3 months</option>
              <option value="3-6">3-6 months</option>
              <option value="6-12">6-12 months</option>
              <option value="12+">12+ months</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodation Type
            </label>
            <select
              value={currentSelections.type || ''}
              onChange={(e) => updateSelection('type', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Type</option>
              <option value="Student Residence">Student Residence</option>
              <option value="Shared Apartment">Shared Apartment</option>
              <option value="Studio">Studio</option>
              <option value="Private Room">Private Room</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range (per month)
            </label>
            <select
              value={currentSelections.budget || ''}
              onChange={(e) => updateSelection('budget', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Budget Range</option>
              <option value="0-500">$0-$500</option>
              <option value="501-1000">$501-$1000</option>
              <option value="1001-1500">$1001-$1500</option>
              <option value="1501+">$1501+</option>
            </select>
          </div>
        </div>
      ),
      'Student visa assistance': (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visa Type
            </label>
            <select
              value={currentSelections.visaType || ''}
              onChange={(e) => updateSelection('visaType', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Visa Type</option>
              <option value="Student">Student Visa</option>
              <option value="Exchange">Exchange Student Visa</option>
              <option value="Language">Language Course Visa</option>
              <option value="Research">Research Visa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration of Stay
            </label>
            <select
              value={currentSelections.duration || ''}
              onChange={(e) => updateSelection('duration', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Duration</option>
              <option value="6">6 months</option>
              <option value="12">1 year</option>
              <option value="24">2 years</option>
              <option value="36">3 years</option>
              <option value="48">4 years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Speed
            </label>
            <select
              value={currentSelections.processing || ''}
              onChange={(e) => updateSelection('processing', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Processing Speed</option>
              <option value="standard">Standard (4-8 weeks)</option>
              <option value="express">Express (2-3 weeks)</option>
              <option value="priority">Priority (1 week)</option>
            </select>
          </div>
        </div>
      ),
      'Accommodation finder': (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Accommodation
            </label>
            <input
              type="text"
              value={selectedAccommodation ? `${selectedAccommodation.name} - ${selectedAccommodation.city}` : ''}
              placeholder="Click 'Browse Accommodation Finder' to select"
              readOnly
              className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City Preference
            </label>
            <input
              type="text"
              value={currentSelections.city || ''}
              onChange={(e) => updateSelection('city', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="Enter preferred city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodation Type
            </label>
            <select
              value={currentSelections.type || ''}
              onChange={(e) => updateSelection('type', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Type</option>
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Guesthouse">Guesthouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              value={currentSelections.priceRange || ''}
              onChange={(e) => updateSelection('priceRange', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select Price Range</option>
              <option value="Under $100/night">Under $100/night</option>
              <option value="$100-$200/night">$100-$200/night</option>
              <option value="$200-$400/night">$200-$400/night</option>
              <option value="Above $400/night">Above $400/night</option>
            </select>
          </div>
        </div>
      ),
    };

    return filters[serviceName] || (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Option
        </label>
        <input
          type="text"
          placeholder="Enter your selection"
          value={currentSelections.option || ''}
          onChange={(e) => updateSelection('option', e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
    );
  };

  if (!isOpen) return null;

  const category = categories.find(c => c.id === selectedCategory);
  const totalSteps = category ? category.services.length + 2 : 1;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Plan Your Trip
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {selectedCategory && (
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="mb-8">
          {currentStep === 0 && renderCategorySelection()}
          {currentStep === 1 && renderBasicInfo()}
          {currentStep > 1 && renderServiceStep()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={currentStep === 0}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Previous
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {isLastStep ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Save Trip
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Next
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Save Prompt Modal */}
        {showSavePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Save Trip</h3>
              <p className="text-gray-600 mb-6">
                Would you like to save your trip now or {closeAfterSave ? 'discard changes' : 'continue adding more details'}?
              </p>
              <div className="flex justify-end space-x-3">
                {closeAfterSave ? (
                  <>
                    <button
                      onClick={() => {
                        setShowSavePrompt(false);
                        setCloseAfterSave(false);
                        onClose();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => handleSavePromptResponse(true)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Save & Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleSavePromptResponse(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => handleSavePromptResponse(true)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Save Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* University Modal */}
        <UniversityModal
          isOpen={showUniversityModal}
          onClose={() => setShowUniversityModal(false)}
          onSelect={(university) => {
            setSelectedUniversity(university);
            // Auto-populate university form fields
            const firstProgram = university.programs && university.programs[0] ? university.programs[0] : null;
            const universitySelections = {
              country: university.country,
              field: firstProgram?.name || university.specialty || '',
              level: firstProgram?.level || '',
              startDate: tripData.startDate
            };
            setTripData({
              ...tripData,
              services: {
                ...tripData.services,
                'University finder': {
                  ...tripData.services['University finder'],
                  selectedUniversity: university,
                  selections: {
                    ...tripData.services['University finder']?.selections,
                    ...universitySelections
                  }
                }
              }
            });
          }}
          preselectedCountry={tripData.destination}
        />

        {/* Document Legalization Modal */}
        <DocumentLegalizationModal
          isOpen={showDocumentLegalizationModal}
          onClose={() => setShowDocumentLegalizationModal(false)}
        />

        {/* Accommodation Modal */}
        <AccommodationModal
          isOpen={showAccommodationModal}
          onClose={() => setShowAccommodationModal(false)}
          onSelect={(accommodation) => {
            setSelectedAccommodation(accommodation);
            setTripData({
              ...tripData,
              services: {
                ...tripData.services,
                'Accommodation finder': {
                  ...tripData.services['Accommodation finder'],
                  selectedAccommodation: accommodation
                }
              }
            });
          }}
          filters={{
            country: tripData.destination,
            city: tripData.services['Accommodation finder']?.selections?.city,
            type: tripData.services['Accommodation finder']?.selections?.type,
            priceRange: tripData.services['Accommodation finder']?.selections?.priceRange
          }}
        />
      </div>
    </div>
  );
};

export default TripWizard;