import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCountries } from '../../hooks/useCountries';
import { useAuth } from '../../context/AuthContext';
import { localizedCountryOptions } from '../../data/countryLabels';
import VisaChecker from '../visa/VisaChecker';

const TEXT = {
  fr: {
    title: 'Visa touristique',
    intro: 'Choisissez votre nationalité et la destination : vous obtenez la fiche visa tourisme (e-visa, délai, coût, documents) et l’ambassade compétente.',
    nationality: 'Votre nationalité', fromProfile: '(depuis votre profil)', destination: 'Destination', choose: '— Choisir —',
    cta: 'Composer mon voyage', ctaText: 'Plusieurs pays ? Composez votre itinéraire : visa, hébergement et services étape par étape.',
  },
  en: {
    title: 'Tourist visa',
    intro: 'Choose your nationality and destination: you get the tourist visa sheet (e-visa, timing, cost, documents) and the competent embassy.',
    nationality: 'Your nationality', fromProfile: '(from your profile)', destination: 'Destination', choose: '— Select —',
    cta: 'Plan my trip', ctaText: 'Several countries? Build your itinerary: visa, accommodation and services stop by stop.',
  },
  de: {
    title: 'Touristenvisum',
    intro: 'Wählen Sie Ihre Staatsangehörigkeit und Ihr Reiseziel: Sie erhalten das Merkblatt zum Touristenvisum (E-Visum, Fristen, Kosten, Unterlagen) und die zuständige Botschaft.',
    nationality: 'Ihre Staatsangehörigkeit', fromProfile: '(aus Ihrem Profil)', destination: 'Reiseziel', choose: '— Auswählen —',
    cta: 'Meine Reise planen', ctaText: 'Mehrere Länder? Planen Sie Ihre Route: Visum, Unterkunft und Leistungen Etappe für Etappe.',
  },
};

const TouristVisa: React.FC = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = (['fr', 'en', 'de'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'en') as keyof typeof TEXT;
  const tx = TEXT[lang];
  const { countries } = useCountries();
  const options = useMemo(() => localizedCountryOptions(countries, lang), [countries, lang]);
  const [nationality, setNationality] = useState<string>(user?.nationality || '');
  const [destinationCountry, setDestinationCountry] = useState<string>('');

  useEffect(() => {
    if (user?.nationality && !nationality) setNationality(user.nationality);
  }, [user?.nationality]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-2">{tx.title}</h1>
        <p className="text-gray-600 mb-8 max-w-3xl">{tx.intro}</p>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tv-nationality" className="block text-sm font-medium text-gray-700 mb-2">
                {tx.nationality}
                {user?.nationality && <span className="ml-2 text-xs text-green-600">{tx.fromProfile}</span>}
              </label>
              <select id="tv-nationality" value={nationality} onChange={e => setNationality(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                <option value="">{tx.choose}</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tv-destination" className="block text-sm font-medium text-gray-700 mb-2">{tx.destination}</label>
              <select id="tv-destination" value={destinationCountry} onChange={e => setDestinationCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                <option value="">{tx.choose}</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <VisaChecker nationality={nationality} destination={destinationCountry} visaType="Tourisme" />

        <div className="mt-10 rounded-2xl bg-orange-50 border border-orange-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-gray-700">{tx.ctaText}</p>
          <Link to="/tourism/plan" className="px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold text-center">{tx.cta}</Link>
        </div>
      </div>
    </div>
  );
};

export default TouristVisa;
