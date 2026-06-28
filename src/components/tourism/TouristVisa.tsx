import React, { useState, useEffect } from 'react';
import { regions } from '../../data/regions';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { MagnifyingGlassIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface VisaResult {
  origin_country: string;
  destination_country: string;
  visa_required: boolean;
  visa_type?: string;
  processing_time?: string;
  cost?: string;
  documents_required?: string;
  notes?: string;
}

interface StaticService {
  provider: string;
  country: string;
  visaTypes: string[];
  processingTime: string;
  price: string;
  requirements: string[];
}

const staticServices: StaticService[] = [
  {
    provider: "EuroVisa Services",
    country: "France",
    visaTypes: ["Tourist Visa", "Short-stay Visa"],
    processingTime: "10-15 days",
    price: "€80–€120",
    requirements: ["Valid Passport", "Travel Insurance", "Hotel Booking"]
  },
  {
    provider: "UK Visa Center",
    country: "United Kingdom",
    visaTypes: ["Standard Visitor Visa", "Tourist Visa"],
    processingTime: "15-20 days",
    price: "£95–£150",
    requirements: ["Passport", "Bank Statements", "Travel Itinerary"]
  },
  {
    provider: "Schengen Visa Services",
    country: "Germany",
    visaTypes: ["Tourist Visa", "Business Visa"],
    processingTime: "10-15 days",
    price: "€60–€100",
    requirements: ["Valid Passport", "Financial Proof", "Travel Insurance"]
  },
  {
    provider: "Dubai Tourism Visa",
    country: "United Arab Emirates",
    visaTypes: ["Tourist Visa", "Transit Visa"],
    processingTime: "3-5 days",
    price: "$90–$150",
    requirements: ["Passport", "Photo", "Hotel Booking"]
  },
  {
    provider: "Canada eTA / Visa",
    country: "Canada",
    visaTypes: ["Visitor Visa", "eTA"],
    processingTime: "7-30 days",
    price: "CA$100–$200",
    requirements: ["Passport", "Financial Proof", "Return Ticket"]
  },
];

const allCountries = regions.flatMap(r => r.countries).sort();
const visaTypes = ["Tourist Visa", "Short-stay Visa", "Business Visa", "Transit Visa", "Visitor Visa"];

const TouristVisa: React.FC = () => {
  const { user } = useAuth();

  const [nationality, setNationality] = useState<string>(user?.nationality || "");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [visaType, setVisaType] = useState<string>("");
  const [visaResult, setVisaResult] = useState<VisaResult | null>(null);
  const [loadingVisa, setLoadingVisa] = useState(false);

  // Pre-fill nationality from profile
  useEffect(() => {
    if (user?.nationality && !nationality) setNationality(user.nationality);
  }, [user?.nationality]);

  // Lookup visa when both fields are set
  useEffect(() => {
    if (!nationality || !destinationCountry) {
      setVisaResult(null);
      return;
    }
    setLoadingVisa(true);
    apiService.getVisaInfo(nationality, destinationCountry)
      .then(res => {
        if (res.success && res.data) setVisaResult(res.data);
        else setVisaResult(null);
      })
      .catch(() => setVisaResult(null))
      .finally(() => setLoadingVisa(false));
  }, [nationality, destinationCountry]);

  const filteredServices = staticServices.filter(s => {
    if (destinationCountry && s.country !== destinationCountry) return false;
    if (visaType && !s.visaTypes.includes(visaType)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Assistance Visa Touristique</h1>
        <p className="text-gray-600 mb-8">Sélectionnez votre nationalité et la destination pour voir les exigences visa.</p>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nationalité
                {user?.nationality && <span className="ml-2 text-xs text-green-600">(depuis votre profil)</span>}
              </label>
              <select
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Sélectionner votre nationalité</option>
                {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
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
                {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Visa Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de visa
              </label>
              <select
                value={visaType}
                onChange={e => setVisaType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Tous les types</option>
                {visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Visa requirement result from API */}
        {(nationality && destinationCountry) && (
          <div className="mb-8">
            {loadingVisa ? (
              <div className="bg-white rounded-xl shadow p-6 flex items-center gap-3 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                Vérification des exigences visa...
              </div>
            ) : visaResult ? (
              <div className={`rounded-xl shadow-lg p-6 border-l-4 ${visaResult.visa_required ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className={`h-6 w-6 mt-0.5 shrink-0 ${visaResult.visa_required ? 'text-amber-600' : 'text-green-600'}`} />
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${visaResult.visa_required ? 'text-amber-800' : 'text-green-800'}`}>
                      {visaResult.visa_required
                        ? `Visa requis : ${nationality} → ${destinationCountry}`
                        : `Pas de visa requis : ${nationality} → ${destinationCountry}`}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                      {visaResult.visa_type && (
                        <div><span className="font-medium text-gray-700">Type : </span>{visaResult.visa_type}</div>
                      )}
                      {visaResult.processing_time && (
                        <div><span className="font-medium text-gray-700">Délai : </span>{visaResult.processing_time}</div>
                      )}
                      {visaResult.cost && (
                        <div><span className="font-medium text-gray-700">Coût : </span>{visaResult.cost}</div>
                      )}
                      {visaResult.documents_required && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Documents : </span>{visaResult.documents_required}
                        </div>
                      )}
                      {visaResult.notes && (
                        <div className="md:col-span-2 italic text-gray-600">{visaResult.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl shadow p-6 flex items-center gap-3 text-blue-700">
                <MagnifyingGlassIcon className="h-5 w-5 shrink-0" />
                <span>Aucune donnée visa disponible pour cette combinaison. Consultez l'ambassade du pays de destination.</span>
              </div>
            )}
          </div>
        )}

        {/* Static service cards */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Services d'assistance visa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary mb-1">{service.provider}</h3>
                  <p className="text-gray-500 text-sm mb-4">{service.country}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Types :</span> {service.visaTypes.join(', ')}</p>
                    <p><span className="font-medium">Délai :</span> {service.processingTime}</p>
                    <p><span className="font-medium">Prix :</span> {service.price}</p>
                    <p><span className="font-medium">Documents :</span> {service.requirements.join(', ')}</p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                    Demander assistance
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              Aucun service trouvé pour ces filtres.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristVisa;
