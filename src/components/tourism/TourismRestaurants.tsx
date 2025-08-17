import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Restaurant {
  name: string;
  location: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  reviews: number;
  features: string[];
}

const mockRestaurants: Restaurant[] = [
  {
    name: "Le Petit Bistro",
    location: "Paris, France",
    cuisine: "French",
    priceRange: "€€€",
    rating: 4.8,
    reviews: 450,
    features: ["Outdoor Seating", "Wine Bar", "Vegetarian Options"]
  },
  {
    name: "Tapas & More",
    location: "Barcelona, Spain",
    cuisine: "Spanish",
    priceRange: "€€",
    rating: 4.6,
    reviews: 320,
    features: ["Live Music", "Late Night", "Group Friendly"]
  },
  {
    name: "Bella Italia",
    location: "Rome, Italy",
    cuisine: "Italian",
    priceRange: "€€",
    rating: 4.7,
    reviews: 580,
    features: ["Family Style", "Romantic", "Wine Selection"]
  }
];

const TourismRestaurants: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [cuisine, setCuisine] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const cuisines = ["French", "Italian", "Spanish", "Japanese", "Chinese", "Indian", "American"];
  const priceRanges = ["€", "€€", "€€€", "€€€€"];

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    if (location && !restaurant.location.includes(location)) return false;
    if (cuisine && restaurant.cuisine !== cuisine) return false;
    if (priceRange && restaurant.priceRange !== priceRange) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Restaurant Reservations</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Locations</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine
              </label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Cuisines</option>
                {cuisines.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Ranges</option>
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 mb-4">{restaurant.location}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cuisine:</span>{" "}
                      {restaurant.cuisine}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price Range:</span>{" "}
                      {restaurant.priceRange}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Features:</span>{" "}
                      {restaurant.features.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span>{" "}
                      {restaurant.rating}/5.0 ({restaurant.reviews} reviews)
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Reserve Table
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No restaurants found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourismRestaurants;