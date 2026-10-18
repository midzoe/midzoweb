import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import Newsletter from './Newsletter';
import AccountSecurity from './AccountSecurity';
import { ALL_COUNTRIES } from '../data/countryNames';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LanguageIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';


const ALL_LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Bambara',
  'Bengali', 'Bulgarian', 'Burmese', 'Catalan', 'Chinese (Mandarin)', 'Chinese (Cantonese)',
  'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Farsi', 'Finnish',
  'French', 'Georgian', 'German', 'Greek', 'Gujarati', 'Hausa', 'Hebrew', 'Hindi',
  'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Khmer', 'Korean', 'Kurdish',
  'Latvian', 'Lithuanian', 'Macedonian', 'Malagasy', 'Malay', 'Marathi', 'Nepali',
  'Norwegian', 'Pashto', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian',
  'Serbian', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Swahili',
  'Swedish', 'Tagalog', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Ukrainian', 'Urdu',
  'Uzbek', 'Vietnamese', 'Wolof', 'Yoruba', 'Zulu'
].sort();

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'];


const Profile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <ProfileContent />;
};

const ProfileContent: React.FC = () => {
  const { user: authUser, updateUserLocally } = useAuth();
  const user = authUser!;
  const { t } = useTranslation('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [formData, setFormData] = useState({
    fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    nationality: user.nationality || '',
    country_of_residence: user.country_of_residence || '',
    languages: (user.languages || []) as { language: string; level: string }[],
  });

  const addLanguage = (lang: string) => {
    if (formData.languages.some(l => l.language === lang)) return;
    setFormData({ ...formData, languages: [...formData.languages, { language: lang, level: 'B1' }] });
    setLangDropdownOpen(false);
  };

  const removeLanguage = (lang: string) =>
    setFormData({ ...formData, languages: formData.languages.filter(l => l.language !== lang) });

  const updateLanguageLevel = (lang: string, level: string) =>
    setFormData({
      ...formData,
      languages: formData.languages.map(l => l.language === lang ? { ...l, level } : l),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    const [first_name, ...rest] = formData.fullName.trim().split(' ');
    const changes = {
      first_name,
      last_name: rest.join(' ') || undefined,
      phone: formData.phone || undefined,
      nationality: formData.nationality || undefined,
      country_of_residence: formData.country_of_residence || undefined,
      languages: formData.languages.length ? formData.languages : undefined,
    };

    try {
      await apiService.updateExtendedProfile(changes);
      updateUserLocally(changes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
      setLangDropdownOpen(false);
    } catch {
      // Une sauvegarde échouée doit se voir : on reste en édition pour préserver la saisie.
      setSaveError(t('save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-primary">
            {user.is_premium && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-bold shadow">
                <StarIcon className="h-4 w-4" />
                Premium
              </div>
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-center -mt-20">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">{formData.fullName}</h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {user.role && user.role !== 'user' && (
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
                    {user.role}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
              >
                {isEditing
                  ? <><XMarkIcon className="h-5 w-5 mr-2" />{t('cancel_editing')}</>
                  : <><PencilIcon className="h-5 w-5 mr-2" />{t('edit_profile')}</>}
              </button>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <CheckIcon className="h-4 w-4" /> {t('saved')}
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <XMarkIcon className="h-4 w-4 flex-shrink-0" /> {saveError}
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">

                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('personal_info')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('fields.full_name')}</label>
                      <div className="mt-1 flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                        {isEditing ? (
                          <input type="text" value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                        ) : <span className="text-gray-900">{formData.fullName}</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('fields.email')}</label>
                      <div className="mt-1 flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
<span className="text-gray-900">{formData.email}</span>
                        {isEditing && <span className="ml-2 text-xs text-gray-400">{t('security.email_note')}</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('fields.phone')}</label>
                      <div className="mt-1 flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                        {isEditing ? (
                          <input type="tel" value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                        ) : <span className="text-gray-900">{formData.phone || '—'}</span>}
                      </div>
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('fields.nationality')}</label>
                      <div className="mt-1 flex items-center">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                        {isEditing ? (
                          <select value={formData.nationality}
                            onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">— Nationalité —</option>
                            {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <span className="text-gray-900">{formData.nationality || '—'}</span>}
                      </div>
                    </div>

                    {/* Country of residence */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pays de résidence</label>
                      <div className="mt-1 flex items-center">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                        {isEditing ? (
                          <select value={formData.country_of_residence}
                            onChange={e => setFormData({ ...formData, country_of_residence: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">— Pays de résidence —</option>
                            {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <span className="text-gray-900">{formData.country_of_residence || '—'}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages with levels */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('fields.languages')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('fields.languages')}</label>
                      <div className="flex items-start gap-2">
                        <LanguageIcon className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
                        <div className="flex-1">
                          <div className="space-y-2 mb-2">
                            {formData.languages.map(({ language, level }) => (
                              <div key={language} className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {language}
                                </span>
                                {isEditing ? (
                                  <>
                                    <select
                                      value={level}
                                      onChange={e => updateLanguageLevel(language, e.target.value)}
                                      className="text-xs border-gray-300 rounded px-1 py-0.5"
                                    >
                                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeLanguage(language)}
                                      className="text-red-400 hover:text-red-600">
                                      <XMarkIcon className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-500">{level}</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {isEditing && (
                            <div className="relative">
                              <button type="button"
                                onClick={() => { setLangDropdownOpen(!langDropdownOpen); }}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary border border-gray-200">
                                + {t('add_language')}
                              </button>
                              {langDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                  {ALL_LANGUAGES.filter(l => !formData.languages.some(fl => fl.language === l)).map(lang => (
                                    <button key={lang} type="button"
                                      onClick={() => addLanguage(lang)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary">
                                      {lang}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
                      <CheckIcon className="h-5 w-5 mr-2" />
                      {isSaving ? '...' : t('save_changes')}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <AccountSecurity email={user.email ?? ''} />

        {/* Newsletter preferences */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-gray-500" />
            Newsletters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Newsletter type="study" />
            <Newsletter type="tourism" />
          </div>
        </div>

        {/* Premium CTA for non-premium users */}
        {!user.is_premium && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Passez en Premium</h3>
                <p className="text-white/90 text-sm mb-3">
                  Accédez aux alertes visa automatiques, aux recommandations personnalisées et à un suivi dédié de vos voyages.
                </p>
                <Link to="/packages" className="inline-block px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg text-sm hover:bg-white/90">
                  Découvrir Premium
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
