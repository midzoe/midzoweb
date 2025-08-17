import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';

const Hero = () => {
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Your Gateway to
              <span className="block text-primary">Global Opportunities</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Let Midzo be your trusted companion in every international journey. Whether you're pursuing education abroad 🎓, seeking professional growth 💼, exploring new destinations 🌍, or expanding your business ventures 🤝, we're here to make your global experience seamless and memorable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/services"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Explore Services
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Midzo?</h2>
            <p className="mt-4 text-lg text-gray-600">
              We make your international journey smooth, safe, and memorable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">
                Get personalized support from our experienced travel specialists at every step
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Travel with confidence knowing you're protected by our comprehensive support system
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Experience</h3>
              <p className="text-gray-600">
                Enjoy high-quality services and exclusive benefits with our premium packages
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Your Global Journey Starts Here
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Choose your path and let us guide you through every step
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:border-secondary border-2 border-transparent"
              >
                <div className="text-3xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-medium text-primary">{category.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{category.description}</p>
                <ul className="mt-4 space-y-2">
                  {category.services.slice(0, 3).map((service, index) => (
                    <li key={index} className="text-sm text-gray-600 hover:text-secondary">
                      • {service}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/services#${category.id}`}
                  className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-secondary"
                >
                  Learn more
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;