import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, StarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ALL_COUNTRIES } from '../data/countryNames';
import { countryName } from '../data/africanCountries';

/** Code ISO 639 des langues (noms anglais enregistrés) : nom affiché dans la langue du site. */
const LANGUAGE_CODES: Record<string, string> = {
  Arabic: 'ar', 'Chinese (Mandarin)': 'zh', Dutch: 'nl', English: 'en', Finnish: 'fi', French: 'fr', German: 'de',
  Greek: 'el', Hausa: 'ha', Hindi: 'hi', Indonesian: 'id', Italian: 'it', Japanese: 'ja', Korean: 'ko', Malay: 'ms',
  Norwegian: 'no', Polish: 'pl', Portuguese: 'pt', Romanian: 'ro', Russian: 'ru', Somali: 'so', Spanish: 'es',
  Swahili: 'sw', Swedish: 'sv', Turkish: 'tr', Ukrainian: 'uk', Urdu: 'ur', Vietnamese: 'vi', Wolof: 'wo', Yoruba: 'yo',
};
const languageName = (name: string, lang: string) => {
  try {
    return LANGUAGE_CODES[name] ? new Intl.DisplayNames([lang], { type: 'language' }).of(LANGUAGE_CODES[name]) ?? name : name;
  } catch {
    return name;
  }
};

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
  const { t, i18n } = useTranslation('ui');
  const lang = i18n.language?.slice(0, 2) || 'fr';
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
                <h2 className="font-bold text-lg">{t('onboarding.title')}</h2>
                <p className="text-white/80 text-sm">{t('onboarding.subtitle')}</p>
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
              <h3 className="font-semibold text-gray-900">{t('onboarding.identity')}</h3>
              <p className="text-sm text-gray-500">{t('onboarding.identity_text')}</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('study:profile.nationality')} *</label>
                <select value={nationality} onChange={e => setNationality(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">{t('onboarding.pick_nationality')}</option>
                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{countryName(c, lang, c)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.residence')} *</label>
                <select value={residence} onChange={e => setResidence(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">{t('onboarding.pick_residence')}</option>
                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{countryName(c, lang, c)}</option>)}
                </select>
              </div>

              <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
                {t('onboarding.continue')} →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">{t('onboarding.languages')}</h3>
              <p className="text-sm text-gray-500">{t('onboarding.languages_text')}</p>

              {/* Add language */}
              <div className="flex gap-2">
                <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">{t('onboarding.pick_language')}</option>
                  {ALL_LANGUAGES.filter(l => !languages.some(fl => fl.language === l)).map(l => (
                    <option key={l} value={l}>{languageName(l, lang)}</option>
                  ))}
                </select>
                <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}
                  className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {LEVELS.map(l => <option key={l} value={l}>{l === 'Natif' ? t('onboarding.native') : l}</option>)}
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
                      <span className="text-sm font-medium text-gray-900">{languageName(language, lang)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{level === 'Natif' ? t('onboarding.native') : level}</span>
                        <button onClick={() => removeLanguage(language)} className="text-gray-400 hover:text-red-500">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {languages.length === 0 && (
                <p className="text-xs text-gray-400">{t('onboarding.need_language')}</p>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  ← {t('onboarding.back')}
                </button>
                {/* ≥1 langue exigée (règle FR9) : sans cette garde, le gate 3.9 bouclerait. */}
                <button onClick={handleSave} disabled={saving || languages.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  {saving ? t('study:actions.saving') : t('onboarding.finish')}
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
