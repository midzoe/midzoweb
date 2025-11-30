import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { countryDetails } from '../data/countryDetails';

const CountryDetail: React.FC = () => {
  const { country } = useParams();
  const details = countryDetails[country || ''];

  if (!details) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Country not found</h1>
        </div>
      </div>
    );
  }

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
              <h1 className="text-5xl font-bold text-white mb-4">{country}</h1>
              <p className="text-xl text-white/90">{details.motto}</p>
            </div>
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg"
            >
              Plan Your Journey →
            </Link>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {details.quickFacts.map((fact, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{fact.title}</h3>
              <p className="text-gray-600">{fact.value}</p>
            </div>
          ))}
        </div>

        {/* History & Culture */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">History & Culture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Historical Background</h3>
              <p className="text-gray-600 mb-4">{details.history}</p>
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
          <h2 className="text-3xl font-bold text-primary mb-6">Traditions & Customs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.traditions.map((tradition, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <img
                  src={tradition.image}
                  alt={tradition.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{tradition.name}</h3>
                <p className="text-gray-600">{tradition.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Food & Cuisine */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">Food & Cuisine</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.cuisine.map((dish, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                <p className="text-gray-600">{dish.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Life & Trends */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">Modern Life & Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contemporary Culture</h3>
              <p className="text-gray-600 mb-4">{details.modernLife}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {details.trends.map((trend, index) => (
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
          <h2 className="text-3xl font-bold text-primary mb-6">Must-Visit Places</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.places.map((place, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                <p className="text-gray-600">{place.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetail;