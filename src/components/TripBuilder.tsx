import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  HomeIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserIcon,
  InformationCircleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

interface TripData {
  // Étape 1: Mon Projet
  projectType: string;
  destination: string;
  nationality: string;
  currentCountry: string;
  startDate: string;
  duration: string;
  studyLevel: string;
  studyField: string;
  
  // Étape 2: Mon Université
  university: any;
  program: string;
  applicationDeadline: string;
  
  // Étape 3: Mon Logement
  accommodation: any;
  budget: string;
  preferences: string;
  
  // Étape 4: Mes Documents
  documentsNeeded: string[];
  visaStatus: string;
  
  // Étape 5: Mon Voyage
  flightBooked: boolean;
  insuranceStatus: string;
  transferBooked?: boolean;
  emergencyContact?: string;
  localContact?: string;
  
  // Étape 3: Mon Logement (additional properties)
  maxDistance?: string;
  
  // Étape 4: Mes Documents (additional properties)
  languageLevel?: string;
  hasVisa?: boolean;
  
  // Progression
  completedSteps: string[];
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  required: boolean;
}


const TripBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('project');
  const [tripData, setTripData] = useState<TripData>({
    projectType: '',
    destination: '',
    nationality: '',
    currentCountry: '',
    startDate: '',
    duration: '',
    studyLevel: '',
    studyField: '',
    university: null,
    program: '',
    applicationDeadline: '',
    accommodation: null,
    budget: '',
    preferences: '',
    documentsNeeded: [],
    visaStatus: '',
    flightBooked: false,
    insuranceStatus: '',
    completedSteps: []
  });

  // Universities state for API integration
  const [universities, setUniversities] = useState<any[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [universitiesError, setUniversitiesError] = useState<string | null>(null);

  const steps: Step[] = [
    {
      id: 'project',
      title: '🎯 Mon Projet d\'Études',
      description: 'Définir mes objectifs et destination d\'études',
      icon: <SparklesIcon className="w-6 h-6" />,
      estimatedTime: '5 min',
      required: true
    },
    {
      id: 'university',
      title: '🏫 Mon Université',
      description: 'Choisir et candidater dans une université',
      icon: <AcademicCapIcon className="w-6 h-6" />,
      estimatedTime: '15 min',
      required: true
    },
    {
      id: 'housing',
      title: '🏠 Mon Logement',
      description: 'Trouver un hébergement près du campus',
      icon: <HomeIcon className="w-6 h-6" />,
      estimatedTime: '10 min',
      required: true
    },
    {
      id: 'documents',
      title: '📄 Mes Documents',
      description: 'Préparer visa et légalisation de documents',
      icon: <DocumentCheckIcon className="w-6 h-6" />,
      estimatedTime: '20 min',
      required: true
    },
    {
      id: 'travel',
      title: '✈️ Mon Voyage',
      description: 'Réserver vol et assurance voyage',
      icon: <GlobeAltIcon className="w-6 h-6" />,
      estimatedTime: '10 min',
      required: false
    },
    {
      id: 'summary',
      title: '📋 Récapitulatif',
      description: 'Checklist finale avant le départ',
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
      estimatedTime: '5 min',
      required: false
    }
  ];

  const getStepProgress = (stepId: string) => {
    // Calculer le pourcentage de completion pour chaque étape
    switch (stepId) {
      case 'project':
        const projectFields = [tripData.projectType, tripData.destination, tripData.nationality, tripData.currentCountry, tripData.startDate, tripData.studyLevel, tripData.studyField];
        return (projectFields.filter(Boolean).length / projectFields.length) * 100;
      case 'university':
        return tripData.university ? 100 : 0;
      case 'housing':
        return tripData.accommodation ? 100 : 0;
      case 'documents':
        return tripData.documentsNeeded.length > 0 ? 50 : 0;
      case 'travel':
        return tripData.flightBooked && tripData.insuranceStatus ? 100 : 50;
      default:
        return 0;
    }
  };

  const isStepCompleted = (stepId: string) => {
    return tripData.completedSteps.includes(stepId) || getStepProgress(stepId) === 100;
  };

  const updateTripData = (updates: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...updates }));
    // Auto-save
    localStorage.setItem('tripBuilderData', JSON.stringify({ ...tripData, ...updates }));
  };

  // Load universities from API
  const loadUniversities = async () => {
    setUniversitiesLoading(true);
    setUniversitiesError(null);
    
    try {
      const filters: any = {};
      if (tripData.destination) {
        filters.country = tripData.destination;
      }
      
      const response = await apiService.getUniversities(filters);
      
      if (response.success && response.data) {
        // Transform API data to match our interface
        const transformedUniversities = response.data.map((uni: any) => ({
          id: uni.id,
          name: uni.name,
          city: uni.city,
          country: uni.country,
          programs: uni.programs?.map((p: any) => p.name) || [],
          tuition: uni.tuition || 'Non spécifié',
          ranking: uni.specialty || uni.ranking || 'Non classé',
          applicationDeadline: uni.applicationDeadline || '2024-06-30',
          requirements: ['Diplôme légalisé', 'Certificat de langue', 'Lettre de motivation'],
          website: uni.website,
          applicationUrl: uni.applicationUrl
        }));
        
        setUniversities(transformedUniversities);
      } else {
        throw new Error('Aucune donnée reçue');
      }
    } catch (error) {
      console.error('Error loading universities:', error);
      setUniversitiesError('Impossible de charger les universités');
      
      // Fallback to mock data
      const mockUniversities = [
        {
          id: 1,
          name: "Sorbonne Université",
          city: "Paris",
          country: "France",
          programs: ["Informatique", "Mathématiques", "Physique"],
          tuition: "€170/an",
          ranking: "#1 en France",
          applicationDeadline: "2024-03-15",
          requirements: ["Baccalauréat", "B2 Français", "Lettre motivation"]
        },
        {
          id: 2,
          name: "Technical University of Munich",
          city: "Munich", 
          country: "Germany",
          programs: ["Engineering", "Computer Science", "Physics"],
          tuition: "€150/semestre",
          ranking: "#1 Tech Europe",
          applicationDeadline: "2024-02-28",
          requirements: ["Abitur", "B2 English/German", "CV"]
        },
        {
          id: 3,
          name: "Università Bocconi",
          city: "Milan",
          country: "Italy", 
          programs: ["Business", "Economics", "Finance"],
          tuition: "€13,000/an",
          ranking: "#1 Business Europe",
          applicationDeadline: "2024-04-30",
          requirements: ["Diploma", "IELTS 6.5", "GMAT"]
        }
      ].filter(uni => !tripData.destination || uni.country === tripData.destination);
      
      setUniversities(mockUniversities);
    }
    
    setUniversitiesLoading(false);
  };

  // Load universities when destination changes or when accessing university step
  useEffect(() => {
    if (currentStep === 'university') {
      loadUniversities();
    }
  }, [tripData.destination, currentStep]);


  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'project':
        return tripData.destination && tripData.studyField && tripData.studyLevel && tripData.startDate;
      case 'university':
        return tripData.university !== null;
      case 'housing':
        return tripData.accommodation !== null;
      case 'documents':
        return tripData.documentsNeeded.length > 0;
      case 'travel':
        return tripData.flightBooked || tripData.insuranceStatus;
      default:
        return true;
    }
  };

  const getNextStepMessage = () => {
    if (canProceedToNextStep()) return '';
    
    switch (currentStep) {
      case 'project':
        return 'Complète les informations de base pour continuer';
      case 'university':
        return 'Sélectionne une université pour continuer';
      case 'housing':
        return 'Choisis un logement pour continuer';
      case 'documents':
        return 'Ajoute au moins un document pour continuer';
      case 'travel':
        return 'Configure au moins un élément de voyage pour continuer';
      default:
        return '';
    }
  };

  // Liste complète des pays du monde
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
    'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
    'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Congo (DRC)', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
    'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
    'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
    'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
    'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
    'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
    'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
    'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
    'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
    'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
    'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ].sort();

  const renderProjectStep = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-4 sm:mb-6">
          <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Raconte-nous ton rêve d'études ! 🎓
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
          Commençons par définir ton projet. Où veux-tu étudier et quoi ?
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Destination */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Ma Destination</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dans quel pays veux-tu étudier ?
                </label>
                <select
                  value={tripData.destination}
                  onChange={(e) => updateTripData({ destination: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Choisir un pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    Ma nationalité *
                  </label>
                  <select
                    value={tripData.nationality}
                    onChange={(e) => updateTripData({ nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="">Choisir ma nationalité</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <HomeIcon className="w-4 h-4 inline mr-1" />
                    Pays où je vis actuellement *
                  </label>
                  <select
                    value={tripData.currentCountry}
                    onChange={(e) => updateTripData({ currentCountry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="">Choisir mon pays actuel</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quand veux-tu commencer ?
                </label>
                <input
                  type="date"
                  value={tripData.startDate}
                  onChange={(e) => updateTripData({ startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Durée prévue des études
                </label>
                <select
                  value={tripData.duration}
                  onChange={(e) => updateTripData({ duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Choisir la durée</option>
                  <option value="6-months">6 mois (1 semestre)</option>
                  <option value="1-year">1 an (2 semestres)</option>
                  <option value="2-years">2 ans (Licence)</option>
                  <option value="3-years">3 ans (Master)</option>
                  <option value="4-years">4+ ans (Doctorat)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Études */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Mes Études</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quel niveau d'études ?
                </label>
                <select
                  value={tripData.studyLevel}
                  onChange={(e) => updateTripData({ studyLevel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Choisir le niveau</option>
                  <option value="bachelor">Licence (Bachelor)</option>
                  <option value="master">Master</option>
                  <option value="phd">Doctorat (PhD)</option>
                  <option value="exchange">Programme d'échange</option>
                  <option value="language">Cours de langue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dans quel domaine ?
                </label>
                <select
                  value={tripData.studyField}
                  onChange={(e) => updateTripData({ studyField: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Choisir le domaine</option>
                  <option value="computer-science">Informatique</option>
                  <option value="engineering">Ingénierie</option>
                  <option value="business">Commerce/Business</option>
                  <option value="medicine">Médecine</option>
                  <option value="law">Droit</option>
                  <option value="arts">Arts et Culture</option>
                  <option value="languages">Langues</option>
                  <option value="economics">Économie</option>
                  <option value="sciences">Sciences</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé du projet */}
        {(tripData.destination || tripData.studyField || tripData.nationality || tripData.currentCountry) && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    📋 Aperçu de ton projet
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    {(tripData.nationality && tripData.currentCountry) || (tripData.studyField && tripData.destination) || tripData.startDate ? (
                      <div className="space-y-2">
                        {tripData.nationality && tripData.currentCountry && (
                          <p className="text-base">
                            👤 Je suis de nationalité <span className="font-bold text-primary">{tripData.nationality}</span> et je vis actuellement en{' '}
                            <span className="font-bold text-primary">{tripData.currentCountry}</span>
                          </p>
                        )}
                        {tripData.studyField && tripData.destination && (
                          <p className="text-base">
                            🎓 Je veux étudier <span className="font-bold text-primary">{tripData.studyField.replace('-', ' ')}</span> en{' '}
                            <span className="font-bold text-secondary">{tripData.destination}</span>
                          </p>
                        )}
                        {tripData.startDate && (
                          <p className="text-sm text-gray-600">
                            📅 Début prévu : <span className="font-medium">{new Date(tripData.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                          </p>
                        )}
                        {tripData.duration && (
                          <p className="text-sm text-gray-600">
                            ⏰ Durée : <span className="font-medium">{tripData.duration.replace('-', ' ')}</span>
                          </p>
                        )}
                        {tripData.studyLevel && (
                          <p className="text-sm text-gray-600">
                            🎯 Niveau : <span className="font-medium">{tripData.studyLevel}</span>
                          </p>
                        )}
                        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between">
                            <p className="text-primary font-medium text-sm">
                              🚀 C'est un super projet ! Continue pour planifier les détails.
                            </p>
                            <button
                              onClick={() => setCurrentStep('university')}
                              className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                            >
                              Suivant
                              <ArrowRightIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 italic">
                        Complète les informations ci-dessus pour voir l'aperçu de ton projet d'études.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUniversityStep = () => {

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6">
            <AcademicCapIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Choisir ton université 🎓
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            {tripData.destination ? `Découvre les meilleures universités en ${tripData.destination}` : "Sélectionne l'université parfaite pour tes études"}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Université sélectionnée */}
          {tripData.university && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-700">Université Sélectionnée</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{tripData.university.name}</h4>
                <p className="text-gray-600 mb-4">{tripData.university.city}, {tripData.university.country}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Frais:</span> {tripData.university.tuition}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Classement:</span> {tripData.university.ranking}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Deadline:</span> {tripData.university.applicationDeadline}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {universitiesLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">Chargement des universités...</span>
            </div>
          )}

          {/* Error State */}
          {universitiesError && !universitiesLoading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="text-red-600 mb-2">⚠️ {universitiesError}</div>
              <button
                onClick={loadUniversities}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
              >
                Réessayer
              </button>
              <p className="text-red-500 text-sm mt-2">Affichage des universités de démonstration</p>
            </div>
          )}

          {/* Liste des universités */}
          {!universitiesLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tripData.destination ? `Universités en ${tripData.destination}` : "Universités disponibles"}
                </h3>
                {universities.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {universities.length} université{universities.length > 1 ? 's' : ''} trouvée{universities.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              {universities.length === 0 && !universitiesLoading && !universitiesError && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="text-gray-500 mb-4">🔍 Aucune université trouvée</div>
                  <p className="text-gray-400">
                    {tripData.destination 
                      ? `Nous n'avons pas encore d'universités référencées en ${tripData.destination}`
                      : 'Sélectionnez une destination pour voir les universités disponibles'}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {universities.map((university) => (
                <div key={university.id} className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all cursor-pointer ${
                  tripData.university?.id === university.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-primary/50 hover:shadow-xl'
                }`}
                onClick={() => updateTripData({ university })}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{university.name}</h4>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {university.city}, {university.country}
                      </p>
                    </div>
                    {tripData.university?.id === university.id && (
                      <CheckCircleIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {university.ranking}
                      </span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {university.tuition}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Programmes disponibles:</p>
                      <div className="flex flex-wrap gap-1">
                        {university.programs.map((program: any, idx: number) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                        Deadline: {university.applicationDeadline}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Prérequis:</p>
                      <div className="space-y-1">
                        {university.requirements.map((req: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                            {req}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className={`w-full mt-4 py-2 px-4 rounded-xl font-medium transition-all ${
                    tripData.university?.id === university.id
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}>
                    {tripData.university?.id === university.id ? 'Sélectionnée ✓' : 'Choisir cette université'}
                  </button>
                </div>
              ))}
              </div>
              
              {/* Refresh Button */}
              {!universitiesError && universities.length > 0 && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadUniversities}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    🔄 Actualiser la liste
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHousingStep = () => {
    const accommodationTypes = [
      {
        id: 'residence',
        name: 'Résidence Universitaire',
        description: 'Logement sur le campus ou à proximité',
        price: '€300-500/mois',
        pros: ['Proche des cours', 'Vie étudiante', 'Économique'],
        cons: ['Moins d\'intimité', 'Règles strictes']
      },
      {
        id: 'apartment',
        name: 'Appartement Privé',
        description: 'Studio ou appartement indépendant',
        price: '€500-800/mois',
        pros: ['Indépendance totale', 'Confort', 'Pas de colocation'],
        cons: ['Plus cher', 'Peut être isolant']
      },
      {
        id: 'shared',
        name: 'Colocation',
        description: 'Partage d\'appartement avec d\'autres étudiants',
        price: '€400-600/mois',
        pros: ['Coût partagé', 'Compagnie', 'Expérience sociale'],
        cons: ['Moins d\'intimité', 'Gestion partagée']
      },
      {
        id: 'family',
        name: 'Famille d\'accueil',
        description: 'Logement chez une famille locale',
        price: '€350-550/mois',
        pros: ['Immersion culturelle', 'Repas inclus', 'Soutien'],
        cons: ['Moins de liberté', 'Règles familiales']
      }
    ];

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4 sm:mb-6">
            <HomeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ton chez-toi à l'étranger 🏠
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Trouve le logement parfait près de ton université
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Logement sélectionné */}
          {tripData.accommodation && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-700">Logement Choisi</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{tripData.accommodation.name}</h4>
                <p className="text-gray-600 mb-2">{tripData.accommodation.description}</p>
                <p className="text-primary font-semibold text-lg">{tripData.accommodation.price}</p>
              </div>
            </div>
          )}

          {/* Critères de recherche */}
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tes critères de logement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget mensuel maximum
                </label>
                <select
                  value={tripData.budget || ''}
                  onChange={(e) => updateTripData({ budget: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Choisir un budget</option>
                  <option value="300-400">€300-400/mois</option>
                  <option value="400-500">€400-500/mois</option>
                  <option value="500-600">€500-600/mois</option>
                  <option value="600-800">€600-800/mois</option>
                  <option value="800+">Plus de €800/mois</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distance du campus (max)
                </label>
                <select
                  value={tripData.maxDistance || ''}
                  onChange={(e) => updateTripData({ maxDistance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Choisir la distance</option>
                  <option value="walking">À pied (5-10 min)</option>
                  <option value="bike">À vélo (10-15 min)</option>
                  <option value="transport">En transport (20-30 min)</option>
                  <option value="any">Peu importe</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Préférences supplémentaires
              </label>
              <textarea
                value={tripData.preferences || ''}
                onChange={(e) => updateTripData({ preferences: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={3}
                placeholder="Ex: Cuisine équipée, WiFi, laverie, animaux acceptés..."
              />
            </div>
          </div>

          {/* Types de logement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accommodationTypes.map((type) => (
              <div 
                key={type.id}
                className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all cursor-pointer ${
                  tripData.accommodation?.id === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50 hover:shadow-xl'
                }`}
                onClick={() => updateTripData({ accommodation: type })}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h4>
                    <p className="text-gray-600 mb-3">{type.description}</p>
                    <p className="text-primary font-semibold text-lg">{type.price}</p>
                  </div>
                  {tripData.accommodation?.id === type.id && (
                    <CheckCircleIcon className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">✅ Avantages:</p>
                    <ul className="space-y-1">
                      {type.pros.map((pro, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <span>•</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-2">⚠️ Points d'attention:</p>
                    <ul className="space-y-1">
                      {type.cons.map((con, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <span>•</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button className={`w-full mt-4 py-2 px-4 rounded-xl font-medium transition-all ${
                  tripData.accommodation?.id === type.id
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}>
                  {tripData.accommodation?.id === type.id ? 'Sélectionné ✓' : 'Choisir ce type'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentsStep = () => {
    const allDocuments = [
      { id: 'passport', name: 'Passeport valide', required: true },
      { id: 'bac', name: 'Baccalauréat (légalisé et reconnu)', required: true },
      { id: 'diploma', name: 'Diplômes/Certificats (légalisés)', required: true },
      { id: 'transcripts', name: 'Relevés de notes (légalisés)', required: true },
      { id: 'language', name: 'Certificat de langue (B1/B2/C1)', required: true },
      { id: 'motivation', name: 'Lettre de motivation', required: true },
      { id: 'cv', name: 'CV', required: true },
      { id: 'birth', name: 'Acte de naissance (légalisé)', required: true },
      { id: 'bank', name: 'Relevés bancaires', required: true },
      { id: 'medical', name: 'Certificat médical', required: true },
      { id: 'insurance', name: 'Assurance santé', required: true },
      { id: 'visa', name: 'Visa étudiant', required: false },
      { id: 'police', name: 'Casier judiciaire', required: false },
      { id: 'sponsor', name: 'Lettre de garant financier', required: false },
      { id: 'scholarship', name: 'Preuve de bourse', required: false },
      { id: 'vaccines', name: 'Carnet de vaccination', required: false },
      { id: 'photos', name: 'Photos d\'identité', required: false }
    ];

    const toggleDocument = (docId: string) => {
      const currentDocs = tripData.documentsNeeded || [];
      const updatedDocs = currentDocs.includes(docId)
        ? currentDocs.filter(id => id !== docId)
        : [...currentDocs, docId];
      updateTripData({ documentsNeeded: updatedDocs });
    };

    const completedCount = (tripData.documentsNeeded || []).length;

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 sm:mb-6">
            <DocumentCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Mes Documents 📄
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Liste des documents nécessaires pour ton dossier
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-900">Progression</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{completedCount}/{allDocuments.length}</div>
                <div className="text-sm text-blue-600">Documents préparés</div>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / allDocuments.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Liste complète des documents</h3>
            
            <div className="space-y-3">
              {allDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    tripData.documentsNeeded?.includes(doc.id)
                      ? 'border-green-500 bg-green-50'
                      : doc.required
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold text-gray-900">{doc.name}</div>
                      {doc.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Obligatoire
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      tripData.documentsNeeded?.includes(doc.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tripData.documentsNeeded?.includes(doc.id) ? 'Oui ✓' : 'Non'}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!tripData.documentsNeeded?.includes(doc.id)) {
                            toggleDocument(doc.id);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          tripData.documentsNeeded?.includes(doc.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => {
                          if (tripData.documentsNeeded?.includes(doc.id)) {
                            toggleDocument(doc.id);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          !tripData.documentsNeeded?.includes(doc.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Level Requirements */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Niveau de langue requis</h3>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
              <p className="text-blue-800 text-sm font-medium mb-2">💡 Important à savoir :</p>
              <p className="text-blue-700 text-sm">Certaines universités ne donnent pas d'admission sans niveau de langue minimum. Vous devez passer par un <strong>Centre de langue</strong> pour obtenir le niveau requis (B1, B2 ou C1).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['B1', 'B2', 'C1'].map((level) => (
                <div 
                  key={level}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    tripData.languageLevel === level
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateTripData({ languageLevel: level })}
                >
                  <div className="text-2xl font-bold text-primary mb-2">{level}</div>
                  <div className="text-sm text-gray-600">
                    {level === 'B1' && 'Niveau seuil (intermédiaire)'}
                    {level === 'B2' && 'Niveau avancé'}
                    {level === 'C1' && 'Niveau autonome'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visa Status & Tips */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🛂 Statut de ton visa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => updateTripData({ hasVisa: true })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tripData.hasVisa === true
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-medium text-gray-900">J'ai déjà mon visa</div>
                </div>
              </button>
              <button
                onClick={() => updateTripData({ hasVisa: false })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tripData.hasVisa === false
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⏳</div>
                  <div className="font-medium text-gray-900">Je dois faire ma demande</div>
                </div>
              </button>
            </div>

            {/* Visa Tips */}
            {tripData.hasVisa !== undefined && (
              <div className={`p-4 rounded-xl border ${
                tripData.hasVisa
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  tripData.hasVisa ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {tripData.hasVisa ? '🎉 Tips pour ton arrivée :' : '📋 Tips personnalisés pour ta demande de visa :'}
                </h4>
                <div className={`space-y-2 text-sm ${
                  tripData.hasVisa ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {tripData.hasVisa ? (
                    <>
                      <p>• Vérifie la date d'expiration de ton visa avant le départ</p>
                      <p>• Prépare une copie de tous tes documents importants</p>
                      <p>• Informe-toi sur les conditions de renouvellement si nécessaire</p>
                      <p>• Garde toujours ton passeport et visa sur toi à l'arrivée</p>
                      <p>• Enregistre-toi auprès des autorités locales si requis</p>
                      {(['France', 'Germany', 'Spain', 'Italy'].includes(tripData.nationality) && ['France', 'Germany', 'Spain', 'Italy'].includes(tripData.destination)) && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-blue-700 font-medium">🇪🇺 Citoyens UE : Pas de visa nécessaire, carte d'identité suffisante</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Conseils généraux */}
                      <p>• Commence ta demande 3-4 mois avant ton départ</p>
                      <p>• Assure-toi d'avoir tous les documents légalisés</p>
                      
                      {/* Conseils spécifiques selon nationalité et destination */}
                      {(['Morocco', 'Tunisia', 'Algeria'].includes(tripData.nationality) && tripData.destination === 'France') && (
                        <>
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-blue-700 font-medium">🇫🇷 Maghreb vers France :</p>
                            <p className="text-blue-600 text-xs">• RDV Campus France obligatoire • Entretien en français recommandé</p>
                          </div>
                        </>
                      )}
                      
                      {(['Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Ivory Coast', 'Cameroon'].includes(tripData.nationality) && tripData.destination === 'France') && (
                        <>
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-700 font-medium">🇫🇷 Afrique Francophone vers France :</p>
                            <p className="text-green-600 text-xs">• Procédure CEF simplifiée • Bourses d'excellence possibles</p>
                          </div>
                        </>
                      )}
                      
                      {(tripData.nationality !== tripData.currentCountry) && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-orange-700 font-medium">⚠️ Résidence différente de nationalité :</p>
                          <p className="text-orange-600 text-xs">• Preuve de résidence légale en {tripData.currentCountry} requise • Délais majorés</p>
                        </div>
                      )}
                      
                      <p>• Prépare tes justificatifs financiers (relevés bancaires récents)</p>
                      <p>• Réserve ton rendez-vous au consulat de {tripData.destination} en {tripData.currentCountry}</p>
                      <p>• Souscris ton assurance santé avant la demande</p>
                      <p>• Prépare-toi à l'entretien consulaire</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Document Legalization Tips by Country */}
          {tripData.destination && tripData.currentCountry && (
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">⚖️ Légalisation des documents</h3>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">📍 Ton profil :</h4>
                <p className="text-blue-700 text-sm">
                  Nationalité <strong>{tripData.nationality}</strong> • Résidant en <strong>{tripData.currentCountry}</strong> • Destination <strong>{tripData.destination}</strong>
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Processus personnalisé pour ton cas :</h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  {/* Cas spécifique: Même pays de nationalité et résidence */}
                  {tripData.nationality === tripData.currentCountry ? (
                    <>
                      <p className="font-medium text-yellow-800">✅ Processus simplifié (même nationalité et résidence)</p>
                      {tripData.destination === 'Germany' && (
                        <>
                          <p>• <strong>Apostille :</strong> Documents apostillés dans ton pays ({tripData.currentCountry}) au Ministère des Affaires Étrangères</p>
                          <p>• <strong>Traduction :</strong> Tous documents traduits en allemand par traducteur assermenté</p>
                          <p>• <strong>Reconnaissance :</strong> Diplômes reconnus par ENIC-NARIC Allemagne</p>
                          <p>• <strong>Délai :</strong> 4-6 semaines depuis {tripData.currentCountry}</p>
                        </>
                      )}
                      {tripData.destination === 'France' && (
                        <>
                          <p>• <strong>Légalisation :</strong> Documents légalisés au consulat de France en {tripData.currentCountry}</p>
                          <p>• <strong>Traduction :</strong> Documents traduits en français par traducteur agréé</p>
                          <p>• <strong>Reconnaissance :</strong> Diplômes évalués par ENIC-NARIC France</p>
                          <p>• <strong>Délai :</strong> 3-5 semaines depuis {tripData.currentCountry}</p>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-orange-800">⚠️ Processus complexe (nationalité différente de la résidence)</p>
                      <p>• <strong>Double vérification :</strong> Documents peuvent nécessiter légalisation dans les 2 pays</p>
                      <p>• <strong>Consulat origine :</strong> Contacter le consulat de {tripData.nationality} en {tripData.currentCountry}</p>
                      <p>• <strong>Consulat destination :</strong> Puis légalisation au consulat de {tripData.destination}</p>
                      <p>• <strong>Délai majoré :</strong> Compter 6-8 semaines supplémentaires</p>
                    </>
                  )}
                  
                  {/* Cas spéciaux selon nationalité */}
                  {(['Morocco', 'Tunisia', 'Algeria', 'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Ivory Coast', 'Cameroon'].includes(tripData.nationality) && tripData.destination === 'France') && (
                    <>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800">🇫🇷 Avantage Franco-Africain :</p>
                        <p className="text-green-700 text-xs">Procédures simplifiées grâce aux accords de coopération</p>
                      </div>
                    </>
                  )}
                  
                  {/* Conseils spéciaux pour l'UE */}
                  {(['France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Portugal'].includes(tripData.nationality) && ['France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Portugal'].includes(tripData.destination)) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-800">🇪🇺 Avantage Union Européenne :</p>
                      <p className="text-blue-700 text-xs">Reconnaissance automatique des diplômes dans l'UE - Processus facilité</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    const subject = `Aide légalisation - ${tripData.nationality} vers ${tripData.destination}`;
                    const body = `Bonjour,\n\nJ'ai besoin d'aide pour la légalisation de mes documents pour étudier à l'étranger.\n\nMon profil :\n- Nationalité : ${tripData.nationality || 'Non défini'}\n- Pays de résidence : ${tripData.currentCountry || 'Non défini'}\n- Destination : ${tripData.destination || 'Non défini'}\n- Niveau d'études : ${tripData.studyLevel || 'Non défini'}\n- Domaine : ${tripData.studyField || 'Non défini'}\n\nCas particulier : ${tripData.nationality === tripData.currentCountry ? 'Même nationalité et résidence' : 'Nationalité différente de la résidence'}\n\nPouvez-vous m'accompagner dans ce processus spécifique à ma situation ?\n\nCordialement`;
                    window.location.href = `mailto:support@midzo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto"
                >
                  <span>📧</span>
                  Demander de l'aide pour la légalisation
                </button>
              </div>
            </div>
          )}

          {/* Help with Housing */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🏠 Besoin d'aide pour le logement ?</h3>
            <p className="text-gray-600 mb-4">Notre équipe peut t'aider à trouver le logement parfait selon tes critères et ton budget.</p>
            <div className="text-center">
              <button
                onClick={() => {
                  const subject = `Aide recherche logement - ${tripData.destination || 'Études à l\'étranger'}`;
                  const body = `Bonjour,\n\nJ'ai besoin d'aide pour trouver un logement pour mes études.\n\nMes informations :\n- Destination : ${tripData.destination || 'Non défini'}\n- Université : ${tripData.university?.name || 'Non définie'}\n- Budget : ${tripData.budget || 'Non défini'}\n- Type préféré : ${tripData.accommodation?.name || 'Non défini'}\n- Distance max : ${tripData.maxDistance || 'Non défini'}\n\nPouvez-vous m'aider dans ma recherche ?\n\nCordialement`;
                  window.location.href = `mailto:housing@midzo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all flex items-center gap-2 mx-auto"
              >
                <span>🏠</span>
                Demander de l'aide pour le logement
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTravelStep = () => {
    const travelServices = [
      {
        id: 'flight',
        name: 'Vol Aller-Retour',
        icon: '✈️',
        description: 'Réservation de tes billets d\'avion',
        price: '€200-800',
        status: tripData.flightBooked ? 'completed' : 'pending',
        tips: ['Réserver 2-3 mois à l\'avance', 'Vérifier les bagages inclus', 'Comparer les prix']
      },
      {
        id: 'insurance',
        name: 'Assurance Voyage',
        icon: '🛡️',
        description: 'Protection santé et rapatriement',
        price: '€20-50/mois',
        status: tripData.insuranceStatus ? 'completed' : 'pending',
        tips: ['Obligatoire pour le visa', 'Couvrir toute la durée', 'Vérifier les exclusions']
      },
      {
        id: 'transfer',
        name: 'Transport Aéroport',
        icon: '🚌',
        description: 'Transfer aéroport vers logement',
        price: '€15-50',
        status: tripData.transferBooked ? 'completed' : 'pending',
        tips: ['Réserver à l\'avance', 'Vérifier les horaires', 'Avoir l\'adresse exacte']
      }
    ];

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 sm:mb-6">
            <GlobeAltIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Organiser ton voyage ✈️
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Les derniers préparatifs avant le grand départ
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Travel Summary */}
          {(tripData.destination && tripData.startDate) && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Résumé de ton voyage</h3>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{tripData.destination}</div>
                    <div className="text-sm text-gray-600">Destination</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(tripData.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-sm text-gray-600">Départ prévu</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {tripData.duration?.replace('-', ' ') || 'Non défini'}
                    </div>
                    <div className="text-sm text-gray-600">Durée</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Travel Services */}
          <div className="space-y-6">
            {travelServices.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{service.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <p className="text-gray-600">{service.description}</p>
                      <p className="text-primary font-semibold mt-1">{service.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (service.id === 'flight') {
                        updateTripData({ flightBooked: !tripData.flightBooked });
                      } else if (service.id === 'insurance') {
                        updateTripData({ insuranceStatus: tripData.insuranceStatus ? '' : 'active' });
                      } else if (service.id === 'transfer') {
                        updateTripData({ transferBooked: !tripData.transferBooked });
                      }
                    }}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      service.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {service.status === 'completed' ? 'Réservé ✓' : 'Réserver'}
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">💡 Conseils:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {service.tips.map((tip, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 text-gray-600 p-2 rounded-lg">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Contacts */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📞 Contacts d'urgence à noter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact d'urgence (famille/ami)
                </label>
                <input
                  type="text"
                  value={tripData.emergencyContact || ''}
                  onChange={(e) => updateTripData({ emergencyContact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nom et téléphone"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact sur place (université/logement)
                </label>
                <input
                  type="text"
                  value={tripData.localContact || ''}
                  onChange={(e) => updateTripData({ localContact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Contact local"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryStep = () => {
    const completionRate = Math.round(
      (steps.slice(0, -1).reduce((sum, step) => sum + getStepProgress(step.id), 0) / (steps.length - 1))
    );

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 sm:mb-6">
            <ClipboardDocumentListIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ton projet est prêt ! 🎉
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Récapitulatif de ton plan d'études à l'étranger
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Completion Overview */}
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-green-600 mb-2">{completionRate}%</div>
              <p className="text-green-700 text-lg font-medium">Projet complété</p>
            </div>
          </div>

          {/* Project Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary" />
                Mon Projet
              </h3>
              <div className="space-y-3">
                <div><strong>Nationalité:</strong> {tripData.nationality || 'Non défini'}</div>
                <div><strong>Pays actuel:</strong> {tripData.currentCountry || 'Non défini'}</div>
                <div><strong>Destination:</strong> {tripData.destination || 'Non défini'}</div>
                <div><strong>Domaine:</strong> {tripData.studyField?.replace('-', ' ') || 'Non défini'}</div>
                <div><strong>Niveau:</strong> {tripData.studyLevel || 'Non défini'}</div>
                <div><strong>Début:</strong> {tripData.startDate ? new Date(tripData.startDate).toLocaleDateString('fr-FR') : 'Non défini'}</div>
                <div><strong>Durée:</strong> {tripData.duration?.replace('-', ' ') || 'Non défini'}</div>
              </div>
            </div>

            {/* Language Requirements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LanguageIcon className="w-5 h-5 text-blue-600" />
                Exigences Linguistiques
              </h3>
              {tripData.destination ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Niveaux de langue requis</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-bold text-blue-600">B1</div>
                        <div className="text-xs text-gray-600">Intermédiaire</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-bold text-green-600">B2</div>
                        <div className="text-xs text-gray-600">Intermédiaire+</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-bold text-purple-600">C1</div>
                        <div className="text-xs text-gray-600">Avancé</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Documents requis</h4>
                    <ul className="text-sm space-y-1 text-yellow-800">
                      <li>• Diplômes légalisés et reconnus</li>
                      <li>• Certificats de langue officiels</li>
                      <li>• Attestations traduites</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Facultés créatives</h4>
                    <p className="text-sm text-green-800">
                      Examens d'aptitude préalables requis pour tester vos compétences
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Flexibilité</h4>
                    <p className="text-sm text-purple-800">
                      Les exigences varient selon l'université choisie
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Sélectionnez une destination pour voir les exigences linguistiques</p>
              )}
            </div>

            {/* Housing */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HomeIcon className="w-5 h-5 text-green-600" />
                Mon Logement
              </h3>
              {tripData.accommodation ? (
                <div className="space-y-3">
                  <div><strong>Type:</strong> {tripData.accommodation.name}</div>
                  <div><strong>Prix:</strong> {tripData.accommodation.price}</div>
                  <div><strong>Budget max:</strong> {tripData.budget || 'Non défini'}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun logement sélectionné</p>
              )}
            </div>

            {/* Documents & Travel */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentCheckIcon className="w-5 h-5 text-orange-600" />
                Documents & Voyage
              </h3>
              <div className="space-y-3">
                <div><strong>Documents préparés:</strong> {(tripData.documentsNeeded || []).length}</div>
                <div><strong>Statut visa:</strong> {tripData.visaStatus || 'Non défini'}</div>
                <div><strong>Vol réservé:</strong> {tripData.flightBooked ? 'Oui ✓' : 'Non'}</div>
                <div><strong>Assurance:</strong> {tripData.insuranceStatus ? 'Active ✓' : 'À souscrire'}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Prochaines étapes</h3>
              <div className="space-y-3">
                {!tripData.university && <p className="text-orange-600">• Sélectionner une université</p>}
                {!tripData.accommodation && <p className="text-orange-600">• Choisir un logement</p>}
                {(tripData.documentsNeeded || []).length === 0 && <p className="text-orange-600">• Préparer les documents</p>}
                {!tripData.flightBooked && <p className="text-orange-600">• Réserver le vol</p>}
                {!tripData.insuranceStatus && <p className="text-orange-600">• Souscrire une assurance</p>}
                {completionRate === 100 && <p className="text-green-600 text-lg font-medium">🎉 Tout est prêt pour ton aventure !</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'project':
        return renderProjectStep();
      case 'university':
        return renderUniversityStep();
      case 'housing':
        return renderHousingStep();
      case 'documents':
        return renderDocumentsStep();
      case 'travel':
        return renderTravelStep();
      case 'summary':
        return renderSummaryStep();
      default:
        return renderProjectStep();
    }
  };

  // Auto-save et restoration
  useEffect(() => {
    const savedData = localStorage.getItem('tripBuilderData');
    if (savedData) {
      setTripData(JSON.parse(savedData));
    }
  }, []);

  const globalProgress = Math.round(
    (steps.reduce((sum, step) => sum + getStepProgress(step.id), 0) / steps.length)
  );

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const currentStepObj   = steps[currentStepIndex];

  const goTo = (dir: 'prev' | 'next') => {
    const idx = currentStepIndex + (dir === 'next' ? 1 : -1);
    if (idx >= 0 && idx < steps.length) setCurrentStep(steps[idx].id);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">

      {/* ── TOP PROGRESS BAR ── */}
      <div className="h-1.5 bg-gray-100 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out"
          style={{ width: `${globalProgress}%` }}
        />
      </div>

      {/* ── HORIZONTAL STEP TRACKER ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step bubble */}
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isStepCompleted(step.id)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                      : step.id === currentStep
                      ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md shadow-primary/20 scale-110'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    {isStepCompleted(step.id)
                      ? <CheckCircleIcon className="w-5 h-5" />
                      : index + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors whitespace-nowrap ${
                    step.id === currentStep
                      ? 'text-primary'
                      : isStepCompleted(step.id)
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}>
                    {/* Strip emoji, keep text */}
                    {step.title.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u231A-\u23FF]|[\u25AA-\u27FF]|\uD83E[\uDD00-\uDDFF]/gu, '').trim()}
                  </span>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-1 sm:mx-2 mb-5">
                    <div className={`h-0.5 rounded-full transition-all duration-500 ${
                      isStepCompleted(step.id) ? 'bg-emerald-400' : 'bg-gray-200'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── STEP META BAR ── */}
      <div className="bg-white border-b border-gray-50 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Étape {currentStepIndex + 1} / {steps.length}
            </span>
            {currentStepObj?.required && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Requis</span>
            )}
          </div>
          <span className="text-xs font-bold text-primary">{globalProgress}% complété</span>
        </div>
      </div>

      {/* ── STEP CONTENT (scrollable) ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-6 sm:py-10">
          {renderCurrentStep()}
        </div>
      </div>

      {/* ── FOOTER NAVIGATION ── */}
      <div className="bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">

            {/* Previous */}
            <button
              onClick={() => goTo('prev')}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
                disabled:opacity-30 disabled:cursor-not-allowed
                border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary enabled:active:scale-95"
            >
              <ArrowRightIcon className="w-4 h-4 rotate-180" />
              Précédent
            </button>

            {/* Center: validation message or progress dots */}
            <div className="flex-1 text-center min-w-0">
              {!canProceedToNextStep() ? (
                <p className="text-xs text-orange-500 font-medium flex items-center justify-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{getNextStepMessage()}</span>
                </p>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  {steps.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(s.id)}
                      className={`rounded-full transition-all duration-300 ${
                        s.id === currentStep
                          ? 'w-5 h-2 bg-primary'
                          : isStepCompleted(s.id)
                          ? 'w-2 h-2 bg-emerald-400'
                          : 'w-2 h-2 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Next / Finish */}
            <button
              onClick={() => goTo('next')}
              disabled={!canProceedToNextStep()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95
                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                enabled:bg-gradient-to-r enabled:from-primary enabled:to-secondary enabled:text-white enabled:hover:shadow-lg enabled:hover:-translate-y-0.5"
            >
              {currentStepIndex === steps.length - 1 ? (
                <><CheckCircleIcon className="w-4 h-4" /> Terminer</>
              ) : (
                <>Continuer <ArrowRightIcon className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBuilder;