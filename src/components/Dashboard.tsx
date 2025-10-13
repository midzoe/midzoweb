import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories';
import { format } from 'date-fns';
import { 
  PlusCircleIcon, StarIcon, XMarkIcon,
  AcademicCapIcon, DocumentCheckIcon, HomeIcon, LanguageIcon,
  MapPinIcon,  CheckCircleIcon, BriefcaseIcon,
  GlobeAltIcon,  UserGroupIcon, 
  CheckIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import TripForm from './TripForm';
import TripWizard from './TripWizard';
import TripBuilder from './TripBuilder';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTripForm, setShowTripForm] = useState(false);
  const [showTripWizard, setShowTripWizard] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showTripBuilder, setShowTripBuilder] = useState(false);

  const ongoingTrips = trips.filter(trip => trip.status !== 'completed');
  const completedTrips = trips.filter(trip => trip.status === 'completed');

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripForm(true);
  };

  const handleSaveTrip = (trip: Trip) => {
    if (selectedTrip) {
      setTrips(trips.map(t => t.id === trip.id ? trip : t));
    } else {
      setTrips([...trips, { ...trip, id: Math.random().toString() }]);
    }
    setShowTripForm(false);
    setShowTripWizard(false);
    setSelectedTrip(null);
  };


  const getServiceIcon = (service: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'University': <AcademicCapIcon className="w-6 h-6 text-primary" />,
      'Language': <LanguageIcon className="w-6 h-6 text-primary" />,
      'Visa': <DocumentCheckIcon className="w-6 h-6 text-primary" />,
      'Jobs': <BriefcaseIcon className="w-6 h-6 text-primary" />,
      'Insurance': <ShieldCheckIcon className="w-6 h-6 text-primary" />,
    };
    return iconMap[service] || <StarIcon className="w-6 h-6 text-primary" />;
  };

  const calculateTripStats = () => {
    const uniqueContinents = new Set(trips.map(trip => getContinent(trip.destination)));
    const uniqueCities = new Set(trips.map(trip => trip.destination));
    
    return {
      totalTrips: trips.length,
      continents: uniqueContinents.size,
      cities: uniqueCities.size,
      completedTrips: trips.filter(trip => trip.status === 'completed').length
    };
  };

  const getContinent = (country: string) => {
    const mapping: { [key: string]: string } = {
      'United Kingdom': 'Europe',
      'France': 'Europe',
      'Germany': 'Europe',
      'Spain': 'Europe',
      'Italy': 'Europe'
    };
    return mapping[country] || 'Other';
  };

  const getNextDeparture = () => {
    const now = new Date();
    const upcomingTrips = ongoingTrips
      .filter(trip => new Date(trip.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    if (upcomingTrips.length === 0) return null;
    
    const nextTrip = upcomingTrips[0];
    const daysUntil = Math.ceil((new Date(nextTrip.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      trip: nextTrip,
      daysUntil
    };
  };

  const stats = calculateTripStats();
  const nextDeparture = getNextDeparture();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trip Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setSelectedTrip(null);
              setShowTripForm(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg group"
          >
            <PlusCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Check Trip</span>
          </button>
          <button
            onClick={() => setShowTripBuilder(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105 group"
          >
            <PlusCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Planifier mes Études</span>
          </button>
        </div>

        {/* Hero Profile Section */}
        <div 
          className="relative rounded-lg shadow-lg overflow-hidden mb-8"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90"></div>
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.username}! 👋
                  </h1>
                  <p className="text-white/90 text-lg">
                    Here's an overview of your {selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name.toLowerCase() : ''} activities and plans
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg group"
                >
                  <UserGroupIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>View Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 
                ${!selectedCategory || selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 flex items-center gap-2
                  ${selectedCategory === category.id 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="text-2xl">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <GlobeAltIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Continents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.continents}</p>
              </div>
              <div className="p-4 rounded-full bg-secondary/10 text-secondary">
                <MapPinIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cities}</p>
              </div>
              <div className="p-4 rounded-full bg-green-100 text-green-600">
                <HomeIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
              <div className="p-4 rounded-full bg-purple-100 text-purple-600">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Next Departure Countdown */}
        {nextDeparture && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Next Departure</h2>
                <p className="text-gray-600">{nextDeparture.trip.title} - {nextDeparture.trip.destination}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{nextDeparture.daysUntil}</p>
                <p className="text-sm text-gray-600">days until departure</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${nextDeparture.trip.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Quick Links Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedCategory !== 'all' ? (
              // Show subcategories based on selected category
              categories
                .find(cat => cat.id === selectedCategory)
                ?.services.map((service, index) => (
                  <Link
                    key={index}
                    to={`/services/${service.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center p-4 rounded-lg border-2 border-transparent hover:border-primary transition-all duration-300 group"
                  >
                    {getServiceIcon(service)}
                    <span className="ml-3 text-gray-900 group-hover:text-primary">{service}</span>
                  </Link>
                ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                Please select a category to see relevant quick links
              </div>
            )}
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ongoing Trips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ongoing Trips</h2>
            <div className="space-y-4">
              {ongoingTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleTripClick(trip)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{trip.title}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {trip.progress}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{trip.destination}</p>
                  <div className="text-sm text-gray-500">
                    {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
              {ongoingTrips.length === 0 && (
                <p className="text-gray-500 text-center py-4">No ongoing trips in this category</p>
              )}
            </div>
          </div>

          {/* Completed Trips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Trips</h2>
            <div className="space-y-4">
              {completedTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleTripClick(trip)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{trip.title}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{trip.destination}</p>
                  <div className="text-sm text-gray-500">
                    {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
              {completedTrips.length === 0 && (
                <p className="text-gray-500 text-center py-4">No completed trips in this category</p>
              )}
            </div>
          </div>
        </div>

        {/* Trip Form Modal */}
        <TripForm
          isOpen={showTripForm}
          onClose={() => {
            setShowTripForm(false);
            setSelectedTrip(null);
          }}
          existingTrip={selectedTrip}
          onSave={handleSaveTrip}
       
        />

        {/* Trip Wizard Modal */}
        <TripWizard
          isOpen={showTripWizard}
          onClose={() => setShowTripWizard(false)}
          onSave={handleSaveTrip}
        />

        {/* Trip Builder Full Page */}
        {showTripBuilder && (
          <div className="fixed inset-0 z-50 bg-white">
            <button
              onClick={() => setShowTripBuilder(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
            <TripBuilder />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;