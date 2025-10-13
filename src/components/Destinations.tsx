import { Link } from 'react-router-dom';
import { regions } from '../data/regions';

const Destinations = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
            Global Destinations
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore opportunities in over 60 countries across 5 continents
          </p>
        </div>

        <div className="mt-12">
          {regions.map((region) => (
            <div key={region.name} className="mb-12">
              <h3 className="text-2xl font-bold text-primary mb-4">{region.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {region.countries.map((country) => (
                  <Link
                    key={country}
                    to={`/country/${country}`}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200 hover:text-secondary border-2 border-transparent hover:border-secondary"
                  >
                    <p className="text-gray-800">{country}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Destinations;