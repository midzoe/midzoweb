import React, { useState } from 'react';
import { regions } from '../data/regions';

interface Flight {
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: string;
  type: string;
  duration: string;
  stops: number;
  baggage: string;
  features: string[];
  image: string;
}

const mockFlights: Flight[] = [
  {
    airline: "British Airways",
    from: "London",
    to: "New York",
    departure: "10:00 AM",
    arrival: "1:30 PM",
    price: "$450",
    type: "Economy",
    duration: "7h 30m",
    stops: 0,
    baggage: "2x23kg",
    features: ["Meals", "Entertainment", "WiFi"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    airline: "Lufthansa",
    from: "Berlin",
    to: "Paris",
    departure: "2:00 PM",
    arrival: "3:30 PM",
    price: "$150",
    type: "Business",
    duration: "1h 30m",
    stops: 0,
    baggage: "2x32kg",
    features: ["Lounge Access", "Priority Boarding", "Gourmet Meals"],
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    airline: "Air France",
    from: "Paris",
    to: "Rome",
    departure: "9:00 AM",
    arrival: "11:00 AM",
    price: "$180",
    type: "Economy Premium",
    duration: "2h",
    stops: 0,
    baggage: "2x23kg",
    features: ["Extra Legroom", "Priority Check-in", "Meals"],
    image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
];

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

  const allCities = regions.flatMap(region => region.countries).sort();
  const cabinClasses = ["Economy", "Premium Economy", "Business", "First"];
  const purposes = ["Tourism", "Business", "Study", "Professional"];
  const priceRanges = ["Under $200", "$200-$500", "$500-$1000", "Above $1000"];
  const stopOptions = ["Non-stop", "1 Stop", "2+ Stops"];

  const filteredFlights = mockFlights.filter(flight => {
    if (from && flight.from !== from) return false;
    if (to && flight.to !== to) return false;
    if (cabinClass && flight.type !== cabinClass) return false;
    return true;
  });

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

        {/* Results */}
        <div className="space-y-6">
          {filteredFlights.length > 0 ? (
            filteredFlights.map((flight, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="relative h-48 md:h-full">
                    <img
                      src={flight.image}
                      alt={flight.airline}
                      className="w-full h-full object-cover"
                    />
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
                        <p className="text-gray-600">{flight.from}</p>
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
                        <p className="text-gray-600">{flight.to}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {flight.features.map((feature, idx) => (
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
      </div>
    </div>
  );
};

export default FlightBooking;