import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import Newsletter from './Newsletter';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Benin', 'Bolivia', 'Bosnia',
  'Botswana', 'Brazil', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Costa Rica', "Côte d'Ivoire", 'Croatia',
  'Cuba', 'Czech Republic', 'Denmark', 'Dominican Republic', 'DR Congo', 'Ecuador', 'Egypt',
  'El Salvador', 'Ethiopia', 'Finland', 'France', 'Gabon', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Guatemala', 'Guinea', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kosovo', 'Kuwait', 'Laos', 'Latvia', 'Lebanon', 'Libya',
  'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Malta', 'Mauritania',
  'Mauritius', 'Mexico', 'Moldova', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tanzania', 'Thailand', 'Togo', 'Tunisia', 'Turkey', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
].sort();

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

const ALL_INTERESTS = [
  'Adventure Travel', 'Architecture', 'Art & Design', 'Business & Entrepreneurship',
  'Cinema & Film', 'Cooking & Gastronomy', 'Culture & Heritage', 'Dance & Performing Arts',
  'Digital Nomad', 'Ecology & Environment', 'Education & Learning', 'Fashion & Style',
  'Food & Cuisine', 'Health & Wellness', 'History & Archaeology', 'Hiking & Trekking',
  'International Relations', 'Languages & Linguistics', 'Literature & Writing',
  'Music', 'Nature & Wildlife', 'Photography', 'Politics & Society', 'Religion & Spirituality',
  'Safari & Wildlife', 'Science & Technology', 'Sports', 'Start-ups & Innovation',
  'Sustainable Living', 'Tourism & Discovery', 'Volunteering', 'Yoga & Meditation'
].sort();

const Profile: React.FC = () => {
  const { user, updateUserLocally } = useAuth();
  const { t } = useTranslation('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [interestDropdownOpen, setInterestDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const [formData, setFormData] = useState({
    fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    nationality: user.nationality || '',
    country_of_residence: user.country_of_residence || '',
    languages: (user.languages || []) as { language: string; level: string }[],
    education: '',
    occupation: '',
    interests: [] as string[],
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

  const toggleInterest = (interest: string) => {
    const exists = formData.interests.includes(interest);
    setFormData({
      ...formData,
      interests: exists ? formData.interests.filter(i => i !== interest) : [...formData.interests, interest],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const [first_name, ...rest] = formData.fullName.trim().split(' ');
    try {
      await apiService.updateExtendedProfile({
        first_name,
        last_name: rest.join(' ') || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        nationality: formData.nationality || undefined,
        country_of_residence: formData.country_of_residence || undefined,
        languages: formData.languages.length ? formData.languages : undefined,
      });
      updateUserLocally({
        first_name,
        last_name: rest.join(' ') || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        nationality: formData.nationality || undefined,
        country_of_residence: formData.country_of_residence || undefined,
        languages: formData.languages.length ? formData.languages : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // silent — backend may not have these fields yet
    } finally {
      setIsSaving(false);
      setIsEditing(false);
      setLangDropdownOpen(false);
      setInterestDropdownOpen(false);
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
            <CheckIcon className="h-4 w-4" /> Profil mis à jour avec succès.
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
                        {isEditing ? (
                          <input type="email" value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                        ) : <span className="text-gray-900">{formData.email}</span>}
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

                {/* Education & Work */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('education_work')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('fields.education')}</label>
                      <div className="mt-1 flex items-center">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                        {isEditing ? (
                          <input type="text" value={formData.education}
                            onChange={e => setFormData({ ...formData, education: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                        ) : <span className="text-gray-900">{formData.education || '—'}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('fields.occupation')}</label>
                      <div className="mt-1 flex items-center">
                        <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
                        {isEditing ? (
                          <input type="text" value={formData.occupation}
                            onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                        ) : <span className="text-gray-900">{formData.occupation || '—'}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages with levels */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('languages_interests')}</h2>
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
                                onClick={() => { setLangDropdownOpen(!langDropdownOpen); setInterestDropdownOpen(false); }}
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

                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('fields.interests')}</label>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.interests.map(interest => (
                            <span key={interest} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary">
                              {interest}
                              {isEditing && (
                                <button type="button" onClick={() => toggleInterest(interest)} className="ml-1 hover:text-red-500">
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="relative">
                            <button type="button"
                              onClick={() => { setInterestDropdownOpen(!interestDropdownOpen); setLangDropdownOpen(false); }}
                              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-secondary/10 hover:text-secondary border border-gray-200">
                              + {t('add_interest')}
                            </button>
                            {interestDropdownOpen && (
                              <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                {ALL_INTERESTS.filter(i => !formData.interests.includes(i)).map(interest => (
                                  <button key={interest} type="button"
                                    onClick={() => { toggleInterest(interest); setInterestDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary/10 hover:text-secondary">
                                    {interest}
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
                <button className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg text-sm hover:bg-white/90">
                  Découvrir Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
