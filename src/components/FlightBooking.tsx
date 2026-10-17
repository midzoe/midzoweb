import React, { useState } from 'react';
import { useCountries } from '../hooks/useCountries';
import { useApiList } from '../hooks/useApiList';
import { apiService } from '../services/api';

// Vols servis par le backend (Flight, audience = "general").
interface Flight {
  id: number;
  airline: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  departure: string;
  arrival: string;
  price: string;
  type: string;
  duration?: string;
  stops: number;
  baggage?: string;
  features?: string[];
  image?: string;
}

const FlightBooking: React.FC = () => {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [departDate, setDepartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [passengers, setPassengers] = useState<string>("1");
  const [cabinClass, setCabinClass] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [stops, setStops] = useState<string>("");

  const { countries: allCities } = useCountries();
  const cabinClasses = ["Economy", "Premium Economy", "Business", "First"];
  const purposes = ["Tourism", "Business", "Study", "Professional"];
  const priceRanges = ["Under $200", "$200-$500", "$500-$1000", "Above $1000"];
  const stopOptions = ["Non-stop", "1 Stop", "2+ Stops"];

  // Départ, destination et classe sont filtrés côté serveur (mêmes critères qu'avant).
  const { items: filteredFlights, loading, error } = useApiList<Flight>(
    () => apiService.getFlights({
      audience: 'general',
      from,
      to,
      type: cabinClass,
    }),
    [from, to, cabinClass],
    { errorMessage: 'Unable to load flights. Please try again later.' }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Flight Booking</h1>

        {/* Search Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setTripType('roundtrip')}
                className={`px-4 py-2 rounded-full ${
                  tripType === 'roundtrip'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Round Trip
              </button>
              <button
                onClick={() => setTripType('oneway')}
                className={`px-4 py-2 rounded-full ${
                  tripType === 'oneway'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                One Way
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Departure</option>
                  {allCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Destination</option>
                  {allCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depart Date
                </label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
              </div>

              {tripType === 'roundtrip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passengers
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cabin Class
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Any Class</option>
                {cabinClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select Purpose</option>
                {purposes.map(p => (
                  <option key={p} value={p}>{p}</option>
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
                <option value="">Any Price</option>
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stops
              </label>
              <select
                value={stops}
                onChange={(e) => setStops(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Any Stops</option>
                {stopOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="mt-6 w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors">
            Search Flights
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading flights...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="space-y-6">
          {filteredFlights.length > 0 ? (
            filteredFlights.map(flight => (
              <div key={flight.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="relative h-48 md:h-full">
                    {flight.image ? (
                      <img
                        src={flight.image}
                        alt={flight.airline}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">✈️</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {flight.price}
                    </div>
                  </div>
                  <div className="col-span-3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{flight.airline}</h3>
                        <p className="text-gray-600">{flight.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        flight.stops === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Departure</p>
                        <p className="font-semibold">{flight.departure}</p>
                        <p className="text-gray-600">{flight.fromCity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-semibold">{flight.duration}</p>
                        <div className="relative">
                          <div className="border-t border-gray-300 absolute w-full top-1/2"></div>
                          <div className="relative z-10 bg-white inline-block px-2">✈️</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Arrival</p>
                        <p className="font-semibold">{flight.arrival}</p>
                        <p className="text-gray-600">{flight.toCity}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(flight.features ?? []).map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Baggage:</span> {flight.baggage}
                      </div>
                      <button className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No flights found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default FlightBooking;