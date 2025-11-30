import { Link } from 'react-router-dom';
import { useState } from 'react';
import { studyCountries, tourismCountries, getContinentForCountry } from '../data/countryAvailability';

const Hero = () => {
  const [expandedStudy, setExpandedStudy] = useState(false);
  const [expandedTourism, setExpandedTourism] = useState(false);

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
              Let Midzoe be your trusted companion in every international journey. Whether you're pursuing education abroad 🎓, seeking professional growth 💼, exploring new destinations 🌍, or expanding your business ventures 🤝, we're here to make your global experience seamless and memorable.
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
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Midzoe?</h2>
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

      {/* Your Global Journey Starts Here - Proposition 3 */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Your Global Journey Starts Here
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Tailored experiences for your goals
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
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">Study Abroad</h3>
                  <p className="text-lg md:text-xl mb-8 text-blue-50 max-w-2xl">
                    Access to world-class education, expert guidance, and seamless university integration
                  </p>

                  {/* Featured destinations - First 4 */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {studyCountries.slice(0, 4).map((country) => (
                      <Link
                        key={country}
                        to={`/country/${country}`}
                        className="px-4 py-2 bg-blue-500 rounded-full text-sm font-medium hover:bg-blue-400 transition cursor-pointer"
                      >
                        {getContinentForCountry(country)} {country}
                      </Link>
                    ))}
                    <button
                      onClick={() => setExpandedStudy(!expandedStudy)}
                      className="px-4 py-2 bg-blue-400/60 rounded-full text-sm font-medium hover:bg-blue-400 transition"
                    >
                      +{studyCountries.length - 4} more
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
                          {getContinentForCountry(country)} {country}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/services#study"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
                  >
                    Explore Programs <span>→</span>
                  </Link>
                </div>

                {/* Statistics box */}
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 md:p-8 text-center border border-blue-400/30 md:min-w-max">
                  <p className="text-sm text-blue-100 mb-2 font-medium">Available in</p>
                  <p className="text-5xl md:text-6xl font-black text-white">{studyCountries.length}</p>
                  <p className="text-sm text-blue-100 mt-2 font-medium">Countries</p>
                  <div className="mt-6 pt-6 border-t border-blue-400/30">
                    <p className="text-xs text-blue-100 mb-3">Click to explore</p>
                    <p className="text-xs text-blue-100">Each country has detailed info</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOURISM Card - Expandable */}
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-8 md:p-12 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Animated background circle */}
              <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-400 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="text-6xl md:text-7xl mb-6">🌍</div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">Global Tourism</h3>
                  <p className="text-lg md:text-xl mb-8 text-emerald-50 max-w-2xl">
                    Explore experiences across all continents with curated travel packages and local insights
                  </p>

                  {/* Featured destinations - First 6 */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {tourismCountries.slice(0, 6).map((country) => (
                      <Link
                        key={country}
                        to={`/country/${country}`}
                        className="px-4 py-2 bg-emerald-400 rounded-full text-sm font-medium hover:bg-emerald-300 transition cursor-pointer"
                      >
                        {getContinentForCountry(country)} {country}
                      </Link>
                    ))}
                    <button
                      onClick={() => setExpandedTourism(!expandedTourism)}
                      className="px-4 py-2 bg-emerald-400/60 rounded-full text-sm font-medium hover:bg-emerald-400 transition"
                    >
                      +{tourismCountries.length - 6} more
                    </button>
                  </div>

                  {/* Expanded countries list */}
                  {expandedTourism && (
                    <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 bg-emerald-500/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {tourismCountries.map((country) => (
                        <Link
                          key={country}
                          to={`/country/${country}`}
                          className="px-3 py-2 bg-emerald-600 rounded-lg text-sm hover:bg-emerald-500 transition text-center font-medium"
                        >
                          {getContinentForCountry(country)} {country}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/services#tourism"
                    className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition"
                  >
                    Explore Destinations <span>→</span>
                  </Link>
                </div>

                {/* Statistics box */}
                <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-6 md:p-8 text-center border border-emerald-400/30 md:min-w-max">
                  <p className="text-sm text-emerald-100 mb-2 font-medium">Available in</p>
                  <p className="text-5xl md:text-6xl font-black text-white">{tourismCountries.length}</p>
                  <p className="text-sm text-emerald-100 mt-2 font-medium">Countries</p>
                  <div className="mt-6 pt-6 border-t border-emerald-400/30">
                    <p className="text-xs text-emerald-100 mb-3">Click to explore</p>
                    <p className="text-xs text-emerald-100">Each country has detailed info</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;