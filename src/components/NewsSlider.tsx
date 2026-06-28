import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { newsItems } from '../data/news';

const categoryColors: Record<string, string> = {
  Events: 'bg-secondary text-white',
  Safari: 'bg-emerald-600 text-white',
  Sports: 'bg-blue-600 text-white',
  Study: 'bg-primary text-white',
  Business: 'bg-purple-600 text-white',
  Professional: 'bg-gray-600 text-white',
  Tourism: 'bg-teal-600 text-white'
};

const NewsSlider = () => {
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const [active, setActive] = useState(0);

  const getTitle = (item: typeof newsItems[0]) =>
    lang === 'fr' ? item.titleFr : lang === 'de' ? item.titleDe : item.title;

  const getDesc = (item: typeof newsItems[0]) =>
    lang === 'fr' ? item.descriptionFr : lang === 'de' ? item.descriptionDe : item.description;

  const readMore = { en: 'Read More', fr: 'Lire la Suite', de: 'Mehr Lesen' };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
            {t('news.title')}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {t('news.subtitle')}
          </p>
        </div>

        {/* Featured Article */}
        <div className="mb-10">
          <div className="relative rounded-2xl overflow-hidden shadow-xl h-72 md:h-96">
            <img
              src={newsItems[active].image}
              alt={getTitle(newsItems[active])}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${categoryColors[newsItems[active].category] || 'bg-gray-600 text-white'}`}>
                {newsItems[active].category}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {getTitle(newsItems[active])}
              </h3>
              <p className="text-white/80 text-sm hidden md:block line-clamp-2 mb-3">
                {getDesc(newsItems[active])}
              </p>
              {newsItems[active].link && (
                <Link
                  to={newsItems[active].link!}
                  className="inline-block text-secondary font-semibold text-sm hover:text-white transition-colors"
                >
                  {readMore[lang]} →
                </Link>
              )}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {newsItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === active ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>

        {/* News Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {newsItems.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setActive(i)}
              className={`cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${i === active ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="relative h-32">
                <img src={item.image} alt={getTitle(item)} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${categoryColors[item.category] || 'bg-gray-600 text-white'}`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">
                  {getTitle(item)}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">{getDesc(item)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSlider;
