import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { studyCountries, getContinentForCountry } from '../data/countryAvailability';

const Hero = () => {
  const { t } = useTranslation('hero');
  const { t: tCountries } = useTranslation('countries');
  const [expandedStudy, setExpandedStudy] = useState(false);

  const getCountryName = (country: string) => {
    return tCountries(`names.${country}`, country);
  };

  return (
    <div className="relative bg-white">
      {/* Hero Image Section */}
      <div className="relative h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              {t('main_heading')}
              <span className="block text-primary">{t('main_highlight')}</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t('main_description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/services"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-white hover:text-primary transition-colors"
              >
                {t('explore_services')}
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary transition-colors"
              >
                {t('common:buttons.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('value_proposition_title')}</h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('value_proposition_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('value_1_title')}</h3>
              <p className="text-gray-600">
                {t('value_1_description')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('value_2_title')}</h3>
              <p className="text-gray-600">
                {t('value_2_description')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('value_3_title')}</h3>
              <p className="text-gray-600">
                {t('value_3_description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Global Journey Starts Here */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              {t('journey_title')}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {t('journey_subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {/* STUDY Card - Expandable */}
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 md:p-12 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Animated background circle */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500 rounded-full opacity-20 group-hover:scale-125 transition-transform duration-500"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="text-6xl md:text-7xl mb-6">🎓</div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">{t('study_title')}</h3>
                  <p className="text-lg md:text-xl mb-8 text-blue-50 max-w-2xl">
                    {t('study_description')}
                  </p>

                  {/* Featured destinations - First 4 */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {studyCountries.slice(0, 4).map((country) => (
                      <Link
                        key={country}
                        to={`/country/${country}`}
                        className="px-4 py-2 bg-blue-500 rounded-full text-sm font-medium hover:bg-blue-400 transition cursor-pointer"
                      >
                        {getContinentForCountry(country)} {getCountryName(country)}
                      </Link>
                    ))}
                    <button
                      onClick={() => setExpandedStudy(!expandedStudy)}
                      className="px-4 py-2 bg-blue-400/60 rounded-full text-sm font-medium hover:bg-blue-400 transition"
                    >
                      +{studyCountries.length - 4} {t('study_more')}
                    </button>
                  </div>

                  {/* Expanded countries list */}
                  {expandedStudy && (
                    <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-3 bg-blue-500/20 rounded-lg p-4">
                      {studyCountries.map((country) => (
                        <Link
                          key={country}
                          to={`/country/${country}`}
                          className="px-3 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-500 transition text-center font-medium"
                        >
                          {getContinentForCountry(country)} {getCountryName(country)}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/services#study"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
                  >
                    {t('study_cta')} <span>→</span>
                  </Link>
                </div>

                {/* Statistics box */}
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 md:p-8 text-center border border-blue-400/30 md:min-w-max">
                  <p className="text-sm text-blue-100 mb-2 font-medium">{t('study_available')}</p>
                  <p className="text-5xl md:text-6xl font-black text-white">{studyCountries.length}</p>
                  <p className="text-sm text-blue-100 mt-2 font-medium">{t('study_countries')}</p>
                  <div className="mt-6 pt-6 border-t border-blue-400/30">
                    <p className="text-xs text-blue-100 mb-3">{t('study_click_explore')}</p>
                    <p className="text-xs text-blue-100">{t('study_country_details')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ORIENTATION Card */}
            <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-8 md:p-12 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Animated background circle */}
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-purple-500 rounded-full opacity-20 group-hover:scale-125 transition-transform duration-500"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="text-6xl md:text-7xl mb-6">🧭</div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">Orientation</h3>
                  <p className="text-lg md:text-xl mb-8 text-purple-50 max-w-2xl">
                    Besoin de conseils avant votre grand projet? Orientation vous guide à travers les décisions clés — études, carrière ou business.
                  </p>

                  <Link
                    to="/services#orientation"
                    className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition"
                  >
                    Découvrir l'Orientation <span>→</span>
                  </Link>
                </div>

                {/* Info box */}
                <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-6 md:p-8 text-center border border-purple-400/30 md:min-w-max">
                  <p className="text-sm text-purple-100 mb-3 font-medium">3 Parcours</p>
                  <ul className="space-y-2 text-sm text-purple-100">
                    <li>🏫 Orientation École</li>
                    <li>💼 Orientation Carrière</li>
                    <li>📚 Orientation Formation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA vers Midzoe Tourism */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-secondary font-semibold mb-2">Envie d'aventure?</p>
          <h2 className="text-4xl font-bold mb-4">Découvrez Midzoe Tourism</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
            Safari en Afrique, Coupe du Monde 2026, Tourisme Sportif, Événements mondiaux... Vivez les expériences qui font rêver.
          </p>
          <Link
            to="/tourism"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-orange-500 text-white font-bold rounded-lg transition-colors text-lg"
          >
            Entrer dans Midzoe Tourism <span>🌍</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
