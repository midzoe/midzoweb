// Import Swiper React components
import { useTranslation } from 'react-i18next';



const NewsSlider = () => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
            {t('news.title')}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {t('news.subtitle')}
          </p>
        </div>

      
      </div>
    </div>
  );
};

export default NewsSlider;