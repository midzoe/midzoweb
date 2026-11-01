import React, { useMemo, useState } from 'react';
import { useApiList } from '../hooks/useApiList';
import { apiService } from '../services/api';
import ActionButton from './common/ActionButton';
import { amountOf, bucketOf, FilterSelect, presentBuckets, useCatalog, CatalogEmpty } from './common/catalogKit';

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

const PRICE_EDGES = [200, 500, 1000];

const FlightBooking: React.FC = () => {
  const { t, val, duration, options, countryOptions, money, bucketOptions, colon } = useCatalog();
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [departDate, setDepartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [passengers, setPassengers] = useState<string>("1");
  const [cabinClass, setCabinClass] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [stops, setStops] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: flights, loading, error } = useApiList<Flight>(
    () => apiService.getFlights({ audience: 'general' }),
    [],
    { errorMessage: t('common.error') }
  );

  const stopKey = (n: number) => (n >= 2 ? '2+' : String(n));
  const stopLabel = (k: string) => (k === '0' ? t('flights.nonstop') : k === '2+' ? t('flights.stops_more') : t('flights.stop_count', { count: Number(k) }));
  const currency = /£/.test(flights[0]?.price ?? '') ? 'GBP' : /€/.test(flights[0]?.price ?? '') ? 'EUR' : 'USD';

  const filteredFlights = useMemo(() => flights.filter(f =>
    (!from || f.fromCountry === from)
    && (!to || f.toCountry === to)
    && (!cabinClass || f.type === cabinClass)
    && (!priceRange || bucketOf(amountOf(f.price), PRICE_EDGES) === priceRange)
    && (!stops || stopKey(f.stops) === stops)
  ), [flights, from, to, cabinClass, priceRange, stops]);

  // Dates et voyageurs ne filtrent pas le catalogue : ils accompagnent la demande de réservation.
  const requestDetails = [
    departDate && `${departDate}${tripType === 'roundtrip' && returnDate ? ` → ${returnDate}` : ''}`,
    `${passengers} passager${Number(passengers) > 1 ? 's' : ''}`,
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('flights.title')}</h1>

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
                {t('flights.roundtrip')}
              </button>
              <button
                onClick={() => setTripType('oneway')}
                className={`px-4 py-2 rounded-full ${
                  tripType === 'oneway'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t('flights.oneway')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterSelect label={t('flights.from')} all={t('flights.all_departures')} value={from} onChange={setFrom}
                options={countryOptions(flights.map(f => f.fromCountry))} />
              <FilterSelect label={t('flights.to')} all={t('flights.all_destinations')} value={to} onChange={setTo}
                options={countryOptions(flights.map(f => f.toCountry))} />

              <div>
                <label htmlFor="flight-depart" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('flights.depart_date')}
                </label>
                <input
                  id="flight-depart"
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
              </div>

              {tripType === 'roundtrip' && (
                <div>
                  <label htmlFor="flight-return" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('flights.return_date')}
                  </label>
                  <input
                    id="flight-return"
                    type="date"
                    value={returnDate}
                    min={departDate || undefined}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="flight-passengers" className="block text-sm font-medium text-gray-700 mb-2">
                {t('flights.passengers')}
              </label>
              <select
                id="flight-passengers"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{t('flights.passenger_count', { count: num })}</option>
                ))}
              </select>
            </div>

            <FilterSelect label={t('flights.cabin')} all={t('flights.all_classes')} value={cabinClass} onChange={setCabinClass}
              options={options(flights.map(f => f.type))} />
            <FilterSelect label={t('common.price_range')} all={t('common.all_prices')} value={priceRange} onChange={setPriceRange}
              options={bucketOptions(presentBuckets(flights.map(f => amountOf(f.price)), PRICE_EDGES), n => money(n, currency))} />
            <FilterSelect label={t('flights.stops')} all={t('flights.all_stops')} value={stops} onChange={setStops}
              options={['0', '1', '2+'].filter(k => flights.some(f => stopKey(f.stops) === k)).map(k => ({ value: k, label: stopLabel(k) }))} />
          </div>

          <p className="mt-4 text-sm text-gray-500">{t('flights.hint')}</p>

          {/* Les filtres s'appliquent en direct : le bouton amène aux résultats. */}
          <button type="button" onClick={() => document.getElementById('flight-results')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-4 w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors">
            {t('flights.search')}
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="space-y-6" id="flight-results">
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
                        <p className="text-gray-600">{val(flight.type)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        flight.stops === 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {flight.stops === 0 ? t('flights.nonstop') : t('flights.stop_count', { count: flight.stops })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('flights.departure')}</p>
                        <p className="font-semibold">{flight.departure}</p>
                        <p className="text-gray-600">{flight.fromCity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">{t('flights.duration')}</p>
                        <p className="font-semibold">{duration(flight.duration)}</p>
                        <div className="relative">
                          <div className="border-t border-gray-300 absolute w-full top-1/2"></div>
                          <div className="relative z-10 bg-white inline-block px-2">✈️</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{t('flights.arrival')}</p>
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
                        <span className="font-medium">{colon(t('flights.baggage'))}</span> {flight.baggage}
                      </div>
                      <ActionButton href={(flight as any).link} service={`Vol — ${flight.airline} (${flight.fromCity} → ${flight.toCity}) — ${requestDetails}`} className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors">
                        {t('flights.book')}
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CatalogEmpty total={flights.length} service="Réservation de vol" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default FlightBooking;
