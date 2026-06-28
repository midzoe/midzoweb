import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { countryDetails } from '../data/countryDetails';

const CountryDetail: React.FC = () => {
  const { country } = useParams();
  const { t, i18n } = useTranslation('countries');
  const details = countryDetails[country || ''];
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';

  if (!details) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-primary mb-8">{t('country_not_found')}</h1>
        </div>
      </div>
    );
  }

  const tr = lang !== 'en' ? (details as any)[lang] : null;

  const getHistory = () => tr?.history || details.history;
  const getModernLife = () => tr?.modernLife || details.modernLife;
  const getTrends = (): string[] => tr?.trends || details.trends;
  const getMotto = () => tr?.motto || details.motto;
  const getTradition = (i: number) => ({
    name: tr?.traditions?.[i]?.name || details.traditions[i].name,
    description: tr?.traditions?.[i]?.description || details.traditions[i].description,
  });
  const getCuisine = (i: number) => ({
    name: tr?.cuisine?.[i]?.name || details.cuisine[i].name,
    description: tr?.cuisine?.[i]?.description || details.cuisine[i].description,
  });
  const getPlace = (i: number) => ({
    name: tr?.places?.[i]?.name || details.places[i].name,
    description: tr?.places?.[i]?.description || details.places[i].description,
  });
  const getQuickFact = (i: number) => ({
    title: tr?.quickFacts?.[i]?.title || details.quickFacts[i].title,
    value: tr?.quickFacts?.[i]?.value || details.quickFacts[i].value,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-12">
          <img
            src={details.heroImage}
            alt={`${country} landscape`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">{t(`names.${country}`, { defaultValue: country })}</h1>
              <p className="text-xl text-white/90">{getMotto()}</p>
            </div>
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg"
            >
              {t('plan_journey')} →
            </Link>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {details.quickFacts.map((_, index) => {
            const fact = getQuickFact(index);
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{fact.title}</h3>
                <p className="text-gray-600">{fact.value}</p>
              </div>
            );
          })}
        </div>

        {/* History & Culture */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">{t('history_culture')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('historical_background')}</h3>
              <p className="text-gray-600 mb-4">{getHistory()}</p>
            </div>
            <div>
              <img
                src={details.culturalImage}
                alt={`${country} culture`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Traditions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">{t('traditions_customs')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.traditions.map((tradition, index) => {
              const tr_item = getTradition(index);
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <img
                    src={tradition.image}
                    alt={tr_item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{tr_item.name}</h3>
                  <p className="text-gray-600">{tr_item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Food & Cuisine */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">{t('food_cuisine')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.cuisine.map((dish, index) => {
              const dish_tr = getCuisine(index);
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <img
                    src={dish.image}
                    alt={dish_tr.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{dish_tr.name}</h3>
                  <p className="text-gray-600">{dish_tr.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modern Life & Trends */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">{t('modern_life')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('contemporary_culture')}</h3>
              <p className="text-gray-600 mb-4">{getModernLife()}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {getTrends().map((trend, index) => (
                  <li key={index}>{trend}</li>
                ))}
              </ul>
            </div>
            <div>
              <img
                src={details.modernImage}
                alt={`Modern ${country}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Must-Visit Places */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-primary mb-6">{t('must_visit_places')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.places.map((place, index) => {
              const place_tr = getPlace(index);
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <img
                    src={place.image}
                    alt={place_tr.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{place_tr.name}</h3>
                  <p className="text-gray-600">{place_tr.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetail;
