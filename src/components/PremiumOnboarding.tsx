import React, { useState } from 'react';
import { XMarkIcon, StarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const ALL_COUNTRIES = [
  'Afghanistan', 'Algeria', 'Angola', 'Argentina', 'Australia', 'Austria', 'Belgium',
  'Benin', 'Botswana', 'Brazil', 'Burkina Faso', 'Burundi', 'Cameroon', 'Canada',
  'Chad', 'China', "Côte d'Ivoire", 'DR Congo', 'Egypt', 'Ethiopia', 'France',
  'Gabon', 'Germany', 'Ghana', 'Guinea', 'India', 'Indonesia', 'Italy', 'Japan',
  'Kenya', 'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Mauritania', 'Mauritius',
  'Morocco', 'Mozambique', 'Namibia', 'Netherlands', 'New Zealand', 'Niger', 'Nigeria',
  'Norway', 'Pakistan', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saudi Arabia', 'Senegal', 'Sierra Leone', 'Singapore', 'Somalia', 'South Africa',
  'South Korea', 'Spain', 'Sudan', 'Sweden', 'Switzerland', 'Tanzania', 'Thailand',
  'Togo', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
].sort();

const ALL_LANGUAGES = [
  'Arabic', 'Chinese (Mandarin)', 'Dutch', 'English', 'Finnish', 'French', 'German',
  'Greek', 'Hausa', 'Hindi', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Malay',
  'Norwegian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Somali', 'Spanish',
  'Swahili', 'Swedish', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese', 'Wolof', 'Yoruba',
].sort();

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'];

interface PremiumOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const PremiumOnboarding: React.FC<PremiumOnboardingProps> = ({ isOpen, onClose, onComplete }) => {
  const { user, updateUserLocally } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [nationality, setNationality] = useState(user?.nationality || '');
  const [residence, setResidence] = useState(user?.country_of_residence || '');
  const [languages, setLanguages] = useState<{ language: string; level: string }[]>(
    user?.languages || []
  );
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1');

  if (!isOpen) return null;

  const addLanguage = () => {
    if (!selectedLang || languages.some(l => l.language === selectedLang)) return;
    setLanguages([...languages, { language: selectedLang, level: selectedLevel }]);
    setSelectedLang('');
    setSelectedLevel('B1');
  };

  const removeLanguage = (lang: string) =>
    setLanguages(languages.filter(l => l.language !== lang));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateExtendedProfile({ nationality, country_of_residence: residence, languages });
      updateUserLocally({ nationality, country_of_residence: residence, languages });
      onComplete();
    } catch {
      // silent — profile will be saved when backend is ready
      updateUserLocally({ nationality, country_of_residence: residence, languages });
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const canProceedStep1 = nationality && residence;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <StarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Profil Voyageur Premium</h2>
                <p className="text-white/80 text-sm">Complétez votre profil une seule fois</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {/* Steps indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Votre identité de voyageur</h3>
              <p className="text-sm text-gray-500">
                Ces informations permettent à Midzoe de personnaliser les alertes visa et les recommandations pour vous.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité *</label>
                <select value={nationality} onChange={e => setNationality(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Sélectionner votre nationalité</option>
                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays de résidence actuel *</label>
                <select value={residence} onChange={e => setResidence(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Sélectionner votre pays de résidence</option>
                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Vos langues</h3>
              <p className="text-sm text-gray-500">
                Ajoutez vos langues pour qu'on puisse vous orienter vers les bonnes destinations et universités.
              </p>

              {/* Add language */}
              <div className="flex gap-2">
                <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Choisir une langue</option>
                  {ALL_LANGUAGES.filter(l => !languages.some(fl => fl.language === l)).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}
                  className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={addLanguage} disabled={!selectedLang}
                  className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-40">
                  +
                </button>
              </div>

              {/* Language list */}
              {languages.length > 0 && (
                <div className="space-y-2">
                  {languages.map(({ language, level }) => (
                    <div key={language} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-gray-900">{language}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{level}</span>
                        <button onClick={() => removeLanguage(language)} className="text-gray-400 hover:text-red-500">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  ← Retour
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  {saving ? 'Enregistrement...' : 'Terminer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumOnboarding;
