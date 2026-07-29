import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

// Vols étudiants servis par le backend (Flight, audience = "student").
// Les filtres pays/type sont appliqués côté serveur.
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
  baggage?: string;
}

const StudentFlights: React.FC = () => {
  const [fromCountry, setFromCountry] = useState<string>("");
  const [toCountry, setToCountry] = useState<string>("");
  const [flightType, setFlightType] = useState<string>("");

  const { countries: allCountries } = useCountries();
  const flightTypes = ["Student Basic", "Student Flex", "Student Special"];

  const { items: filteredFlights, loading, error } = useApiList<Flight>(
    () => apiService.getFlights({
      audience: 'student',
      from: fromCountry,
      to: toCountry,
      type: flightType,
    }),
    [fromCountry, toCountry, flightType],
    { errorMessage: 'Unable to load student flights. Please try again later.' }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Student Flights</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <select
                value={fromCountry}
                onChange={(e) => setFromCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Departure Points</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <select
                value={toCountry}
                onChange={(e) => setToCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Destinations</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flight Type
              </label>
              <select
                value={flightType}
                onChange={(e) => setFlightType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {flightTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlights.length > 0 ? (
            filteredFlights.map(flight => (
              <div key={flight.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{flight.airline}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span>{" "}
                      {flight.fromCity}, {flight.fromCountry}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">To:</span>{" "}
                      {flight.toCity}, {flight.toCountry}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Departure:</span>{" "}
                      {flight.departure}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Arrival:</span>{" "}
                      {flight.arrival}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span>{" "}
                      {flight.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span>{" "}
                      {flight.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Baggage:</span>{" "}
                      {flight.baggage}
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
              <p className="text-gray-500 text-lg">No flights found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default StudentFlights;