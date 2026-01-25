import  { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { categories } from '../data/categories';
import { serviceDetails } from '../data/services';
import { Link, useLocation } from 'react-router-dom';

const Services = () => {
  const { t } = useTranslation('services');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const location = useLocation();

  // Synchronize category with URL hash on mount and when location changes
  useEffect(() => {
    const hash = location.hash.slice(1); // Remove '#' from hash
    if (hash && categories.some(cat => cat.id === hash)) {
      setSelectedCategory(hash);
      // Scroll to the category section
      setTimeout(() => {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [location.hash]);

  const displayedCategories = selectedCategory
    ? categories.filter(category => category.id === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-primary sm:text-5xl">
            {t('page_title')}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            {t('page_subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300
                ${!selectedCategory
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              {t('filters.all')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 
                  ${selectedCategory === category.id 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-12">
          {displayedCategories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-secondary transition-all duration-300"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.services.map((service) => {
                    const serviceDetail = serviceDetails[category.id][service];
                    return (
                      <div 
                        key={service}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        <img 
                          src={serviceDetail.image} 
                          alt={serviceDetail.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-primary mb-2">
                            {serviceDetail.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {serviceDetail.description}
                          </p>
                          <Link
                            to={serviceDetail.learnMoreLink}
                            className="inline-flex items-center text-secondary hover:text-primary transition-colors duration-300"
                          >
                            {t('services.learn_more')}
                            <svg
                              className="w-5 h-5 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;