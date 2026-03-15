import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories';
import { format } from 'date-fns';
import {
  PlusCircleIcon, StarIcon, XMarkIcon,
  MapPinIcon, CheckCircleIcon,
  GlobeAltIcon, UserGroupIcon,
  CheckIcon, CalendarDaysIcon, ArrowRightIcon, ClockIcon,
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

const quickServices = [
  { name: 'University Finder', link: '/services/university-finder', bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'border-blue-100',   emoji: '🎓' },
  { name: 'Student Visa',      link: '/services/student-visa',       bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100', emoji: '📋' },
  { name: 'Flight Booking',    link: '/flights',                     bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-100', emoji: '✈️' },
  { name: 'Insurance',         link: '/insurance',                   bg: 'bg-green-50',  color: 'text-green-600',  border: 'border-green-100',  emoji: '🛡️' },
  { name: 'Language Center',   link: '/services/language-center',    bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100', emoji: '🗣️' },
  { name: 'Jobs Finder',       link: '/services/jobs-finder',        bg: 'bg-amber-50',  color: 'text-amber-600',  border: 'border-amber-100',  emoji: '💼' },
];

const Dashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [showTripForm, setShowTripForm]       = useState(false);
  const [showTripWizard, setShowTripWizard]   = useState(false);
  const [selectedTrip, setSelectedTrip]       = useState<Trip | null>(null);
  const [trips, setTrips]                     = useState<Trip[]>([]);
  const [showTripBuilder, setShowTripBuilder] = useState(false);

  const ongoingTrips   = trips.filter(t => t.status !== 'completed');
  const completedTrips = trips.filter(t => t.status === 'completed');

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

  const stats = {
    totalTrips:     trips.length,
    countries:      new Set(trips.map(t => t.destination)).size,
    completedTrips: completedTrips.length,
  };

  const getNextDeparture = () => {
    const now = new Date();
    const upcoming = ongoingTrips
      .filter(t => new Date(t.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (!upcoming.length) return null;
    const next = upcoming[0];
    const days = Math.ceil((new Date(next.startDate).getTime() - now.getTime()) / 86400000);
    return { trip: next, daysUntil: days };
  };

  const nextDeparture = getNextDeparture();
  const displayName   = user?.first_name || user?.username || '';

  const statusBadge = (status: string) => ({
    completed: 'bg-emerald-100 text-emerald-700',
    ongoing:   'bg-amber-100 text-amber-700',
    planned:   'bg-blue-100 text-blue-700',
  }[status] ?? 'bg-gray-100 text-gray-600');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/85 to-secondary">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Avatar + name */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-white select-none">
                    {displayName.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                  {t('welcome_subtitle')}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {t('welcome', { name: displayName })}
                </h1>
                {user?.email && (
                  <p className="text-white/50 text-sm mt-0.5">{user.email}</p>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/20 backdrop-blur-sm"
              >
                <UserGroupIcon className="w-4 h-4" />
                {t('view_profile')}
              </Link>
              <button
                onClick={() => { setSelectedTrip(null); setShowTripForm(true); }}
                className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-lg"
              >
                <PlusCircleIcon className="w-4 h-4" />
                {t('new_trip')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-16 relative z-10">

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold">{stats.totalTrips}</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">{t('statistics.total_trips')}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/25">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold">{stats.countries}</span>
            </div>
            <p className="text-amber-100 text-sm font-medium">{t('statistics.continents_visited')}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold">{stats.completedTrips}</span>
            </div>
            <p className="text-emerald-100 text-sm font-medium">{t('statistics.services_used')}</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/25">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold">{nextDeparture ? nextDeparture.daysUntil : '—'}</span>
            </div>
            <p className="text-violet-100 text-sm font-medium">
              {nextDeparture ? t('days_away') : t('next_trip')}
            </p>
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">{t('quick_access')}</h2>
            <Link
              to="/services"
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              {t('view_services')}
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickServices.map(svc => (
              <Link
                key={svc.name}
                to={svc.link}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${svc.border} ${svc.bg} hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{svc.emoji}</span>
                <span className={`text-xs font-medium text-center leading-tight ${svc.color}`}>{svc.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Trips */}
          <div className="lg:col-span-2 space-y-5">

            {/* Active Trips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">{t('active_trips')}</h2>
                <button
                  onClick={() => { setSelectedTrip(null); setShowTripForm(true); }}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <PlusCircleIcon className="w-4 h-4" />
                  {t('new_trip')}
                </button>
              </div>

              {ongoingTrips.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🌍</span>
                  </div>
                  <h3 className="text-gray-800 font-semibold text-lg mb-2">{t('no_trips')}</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{t('no_trips_subtitle')}</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => { setSelectedTrip(null); setShowTripForm(true); }}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm shadow-md shadow-primary/20"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      {t('plan_trip_cta')}
                    </button>
                    <button
                      onClick={() => setShowTripBuilder(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                    >
                      {t('plan_studies')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {ongoingTrips.map(trip => (
                    <div
                      key={trip.id}
                      className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                      onClick={() => handleTripClick(trip)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-sm">
                            {trip.title}
                          </h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPinIcon className="w-3 h-3" /> {trip.destination}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${statusBadge(trip.status)}`}>
                          {t(`trip_status.${trip.status}`)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                        <span>
                          {format(new Date(trip.startDate), 'MMM dd')} → {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                        </span>
                        <span className="font-semibold text-primary">{trip.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                          style={{ width: `${trip.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Trips */}
            {completedTrips.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">{t('completed_trips')}</h2>
                <div className="space-y-3">
                  {completedTrips.map(trip => (
                    <div
                      key={trip.id}
                      className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
                      onClick={() => handleTripClick(trip)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{trip.title}</h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPinIcon className="w-3 h-3" /> {trip.destination}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckIcon className="w-3 h-3" />
                            {t('trip_status.completed')}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(trip.endDate), 'MMM yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-5">

            {/* Next Departure */}
            {nextDeparture && (
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">{t('next_trip')}</p>
                <h3 className="font-bold text-lg leading-tight mb-0.5">{nextDeparture.trip.title}</h3>
                <p className="text-white/70 text-sm flex items-center gap-1 mb-4">
                  <MapPinIcon className="w-3.5 h-3.5" /> {nextDeparture.trip.destination}
                </p>
                <div className="bg-white/15 rounded-xl p-4 text-center mb-4">
                  <span className="text-5xl font-bold">{nextDeparture.daysUntil}</span>
                  <p className="text-white/70 text-xs mt-1 uppercase tracking-wide">{t('days_away')}</p>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${nextDeparture.trip.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-300" />
                {t('recent_activity')}
              </h2>
              {user?.recentActivities && user.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {user.recentActivities.slice(0, 4).map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-base">
                          {categories.find(c => c.id === activity.category)?.icon || '🌍'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate leading-tight">{activity.service}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{activity.country}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-3">{t('activity_empty')}</p>
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                  >
                    {t('explore_now')}
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Recently Used Services */}
            {user?.recentServices && user.recentServices.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-gray-300" />
                  {t('recent_services_title')}
                </h2>
                <div className="space-y-1.5">
                  {user.recentServices.slice(0, 5).map((service, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <StarIcon className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-gray-700 truncate">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <TripForm
        isOpen={showTripForm}
        onClose={() => { setShowTripForm(false); setSelectedTrip(null); }}
        existingTrip={selectedTrip}
        onSave={handleSaveTrip}
      />
      <TripWizard
        isOpen={showTripWizard}
        onClose={() => setShowTripWizard(false)}
        onSave={handleSaveTrip}
      />
      {showTripBuilder && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
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
  );
};

export default Dashboard;
