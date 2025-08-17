import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface TouristSite {
  name: string;
  location: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  price: string;
  features: string[];
}

const mockSites: TouristSite[] = [
  {
    name: "Eiffel Tower",
    location: "Paris, France",
    category: "Landmarks",
    description: "Iconic iron lattice tower on the Champ de Mars",
    rating: 4.7,
    reviews: 12500,
    price: "€26",
    features: ["Guided Tours", "Restaurant", "Observation Deck"]
  },
  {
    name: "Colosseum",
    location: "Rome, Italy",
    category: "Historical",
    description: "Ancient amphitheater in the center of Rome",
    rating: 4.8,
    reviews: 9800,
    price: "€16",
    features: ["Audio Guide", "Skip the Line", "Guided Tours"]
  },
  {
    name: "Sagrada Familia",
    location: "Barcelona, Spain",
    category: "Religious Sites",
    description: "Unfinished basilica designed by Antoni Gaudí",
    rating: 4.9,
    reviews: 8900,
    price: "€20",
    features: ["Audio Guide", "Guided Tours", "Museum"]
  }
];

const TouristSites: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const categories = ["Landmarks", "Historical", "Religious Sites", "Museums", "Parks", "Entertainment"];
  const priceRanges = ["Free", "Under €10", "€10-€25", "Above €25"];

  const filteredSites = mockSites.filter(site => {
    if (location && !site.location.includes(location)) return false;
    if (category && site.category !== category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Tourist Sites</h1>

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
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
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
          {filteredSites.length > 0 ? (
            filteredSites.map((site, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{site.name}</h3>
                  <p className="text-gray-600 mb-4">{site.location}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Category:</span>{" "}
                      {site.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Description:</span>{" "}
                      {site.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span>{" "}
                      {site.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Features:</span>{" "}
                      {site.features.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span>{" "}
                      {site.rating}/5.0 ({site.reviews} reviews)
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Book Tickets
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No tourist sites found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristSites;