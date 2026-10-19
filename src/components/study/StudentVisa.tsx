import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCountries } from '../../hooks/useCountries';
import { localizedCountryOptions } from '../../data/countryLabels';
import VisaChecker from '../visa/VisaChecker';

const TEXT = {
  fr: {
    title: 'Visa étudiant',
    intro: 'Choisissez votre nationalité et le pays où vous voulez étudier : vous obtenez la fiche visa étudiant (délais, coût, documents) et l’ambassade compétente.',
    residence: 'Pays de résidence', nationality: 'Nationalité', destination: 'Pays d’études', choose: '— Choisir —',
    residenceHint: 'Si vous résidez hors de votre pays de nationalité, la demande se dépose en principe auprès de la représentation compétente pour votre pays de résidence.',
    cta: 'Construire mon projet d’études complet', ctaText: 'Université, logement, langue, banque et visa dans un seul projet, avec un conseiller Midzo.',
  },
  en: {
    title: 'Student visa',
    intro: 'Choose your nationality and the country where you want to study: you get the student visa sheet (timing, cost, documents) and the competent embassy.',
    residence: 'Country of residence', nationality: 'Nationality', destination: 'Country of study', choose: '— Select —',
    residenceHint: 'If you live outside your country of nationality, you usually apply at the mission responsible for your country of residence.',
    cta: 'Build my complete study project', ctaText: 'University, housing, language, bank and visa in one project, with a Midzo advisor.',
  },
  de: {
    title: 'Studentenvisum',
    intro: 'Wählen Sie Ihre Staatsangehörigkeit und das Studienland: Sie erhalten das Merkblatt zum Studentenvisum (Fristen, Kosten, Unterlagen) und die zuständige Botschaft.',
    residence: 'Wohnsitzland', nationality: 'Staatsangehörigkeit', destination: 'Studienland', choose: '— Auswählen —',
    residenceHint: 'Wenn Sie außerhalb Ihres Heimatlandes leben, stellen Sie den Antrag in der Regel bei der für Ihr Wohnsitzland zuständigen Vertretung.',
    cta: 'Mein vollständiges Studienprojekt planen', ctaText: 'Universität, Unterkunft, Sprache, Bank und Visum in einem Projekt, mit einem Midzo-Berater.',
  },
};

const StudentVisa: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = (['fr', 'en', 'de'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'en') as keyof typeof TEXT;
  const tx = TEXT[lang];
  const [residenceCountry, setResidenceCountry] = useState('');
  const [nationality, setNationality] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const { countries } = useCountries();
  const options = useMemo(() => localizedCountryOptions(countries, lang), [countries, lang]);

  const select = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
        <option value="">{tx.choose}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-3">{tx.title}</h1>
        <p className="text-gray-600 mb-8 max-w-3xl">{tx.intro}</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {select('sv-nationality', tx.nationality, nationality, setNationality)}
            {select('sv-residence', tx.residence, residenceCountry, setResidenceCountry)}
            {select('sv-destination', tx.destination, destinationCountry, setDestinationCountry)}
          </div>
          {residenceCountry && nationality && residenceCountry !== nationality && (
            <p className="mt-4 text-sm text-gray-600">{tx.residenceHint}</p>
          )}
        </div>

        <VisaChecker nationality={nationality} destination={destinationCountry} visaType="Étudiant" />

        <div className="mt-10 rounded-2xl bg-primary/5 border border-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-gray-700">{tx.ctaText}</p>
          <Link to="/study" className="px-5 py-3 rounded-xl bg-primary text-white font-semibold text-center">{tx.cta}</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentVisa;
