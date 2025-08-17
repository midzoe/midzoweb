import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Accommodation {
  name: string;
  location: string;
  city: string;
  type: string;
  priceRange: string;
  amenities: string[];
  rating: number;
  reviews: number;
}

const mockAccommodations: Accommodation[] = [
  {
    name: "Grand Plaza Hotel",
    location: "France",
    city: "Paris",
    type: "Hotel",
    priceRange: "$200-$400/night",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    rating: 4.8,
    reviews: 1250
  },
  {
    name: "Coastal Villa Resort",
    location: "Spain",
    city: "Barcelona",
    type: "Resort",
    priceRange: "$300-$600/night",
    amenities: ["Beach Access", "Pool", "Restaurant", "Gym"],
    rating: 4.7,
    reviews: 890
  },
  {
    name: "City Center Apartments",
    location: "Germany",
    city: "Berlin",
    type: "Apartment",
    priceRange: "$150-$300/night",
    amenities: ["Kitchen", "WiFi", "Laundry", "Parking"],
    rating: 4.5,
    reviews: 675
  }
];

const TourismAccommodation: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const cities = Array.from(new Set(mockAccommodations.map(acc => acc.city))).sort();
  const types = ["Hotel", "Resort", "Apartment", "Villa", "Guesthouse"];
  const priceRanges = [
    "Under $100/night",
    "$100-$200/night",
    "$200-$400/night",
    "Above $400/night"
  ];

  const filteredAccommodations = mockAccommodations.filter(acc => {
    if (location && acc.location !== location) return false;
    if (city && acc.city !== city) return false;
    if (type && acc.type !== type) return false;
    if (priceRange && acc.priceRange !== priceRange) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Tourism Accommodation</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accommodation Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
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
          {filteredAccommodations.length > 0 ? (
            filteredAccommodations.map((accommodation, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{accommodation.name}</h3>
                  <p className="text-gray-600 mb-4">{accommodation.city}, {accommodation.location}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span>{" "}
                      {accommodation.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span>{" "}
                      {accommodation.priceRange}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Amenities:</span>{" "}
                      {accommodation.amenities.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span>{" "}
                      {accommodation.rating}/5.0 ({accommodation.reviews} reviews)
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No accommodations found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourismAccommodation;