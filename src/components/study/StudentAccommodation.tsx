import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Accommodation {
  name: string;
  location: string;
  city: string;
  type: string;
  priceRange: string;
  amenities: string[];
  distance: string;
  rating: number;
  image: string;
  description: string;
}

const mockAccommodations: Accommodation[] = [
  {
    name: "Student Village Cambridge",
    location: "United Kingdom",
    city: "Cambridge",
    type: "Student Residence",
    priceRange: "$600-$800/month",
    amenities: ["WiFi", "Gym", "Study Room", "Laundry"],
    distance: "10 min to university",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Modern student accommodation with excellent facilities and a vibrant community atmosphere."
  },
  {
    name: "Munich Student Housing",
    location: "Germany",
    city: "Munich",
    type: "Shared Apartment",
    priceRange: "$400-$600/month",
    amenities: ["WiFi", "Kitchen", "Balcony", "Bike Storage"],
    distance: "15 min to university",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Cozy shared apartments in the heart of Munich, perfect for students seeking a home-like environment."
  },
  {
    name: "Paris Student Residence",
    location: "France",
    city: "Paris",
    type: "Studio Apartment",
    priceRange: "$700-$900/month",
    amenities: ["WiFi", "Private Bathroom", "Kitchenette", "Security"],
    distance: "5 min to university",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Elegant studio apartments in the Latin Quarter, offering independence and comfort for students."
  }
];

const StudentAccommodation: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  
  const allCountries = regions.flatMap(region => region.countries).sort();
  const cities = Array.from(new Set(mockAccommodations.map(acc => acc.city))).sort();
  const types = ["Student Residence", "Shared Apartment", "Studio", "Private Room"];
  const priceRanges = [
    "Under $400/month",
    "$400-$600/month",
    "$600-$800/month",
    "Above $800/month"
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
        <h1 className="text-4xl font-bold text-primary mb-8">Student Accommodation</h1>

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
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={accommodation.image}
                    alt={accommodation.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium text-primary">
                    {accommodation.rating}/5.0
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{accommodation.name}</h3>
                  <p className="text-gray-600 mb-4">{accommodation.city}, {accommodation.location}</p>
                  <p className="text-gray-600 mb-4">{accommodation.description}</p>
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
                      <span className="font-medium">Distance:</span>{" "}
                      {accommodation.distance}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Amenities:</span>{" "}
                      {accommodation.amenities.join(", ")}
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

export default StudentAccommodation;