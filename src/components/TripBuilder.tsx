import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TripState {
  type: string;
  destination: string;
  duration: string;
  month: string;
  budget: string;
  group: string;
  interests: string[];
}

const TripBuilder = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const [step, setStep] = useState(1);
  const [trip, setTrip] = useState<TripState>({
    type: '',
    destination: '',
    duration: '',
    month: '',
    budget: '',
    group: '',
    interests: []
  });

  const labels = {
    en: {
      title: 'Build Your Perfect Trip',
      subtitle: 'Let\'s create your dream experience step by step',
      step: 'Step',
      of: 'of',
      next: 'Next',
      back: 'Back',
      generate: 'Generate My Trip',
      select: 'Select',
      step1_title: 'What type of trip calls to you?',
      step2_title: 'Where do you want to go?',
      step3_title: 'How long do you have?',
      step4_title: 'When would you like to travel?',
      step5_title: 'What\'s your budget?',
      step6_title: 'Who\'s traveling?',
      step7_title: 'What interests you most?',
      all: 'See All My Trip Details',
      budget_per_person: 'per person',
      interests_select_multiple: 'Select as many as you like'
    },
    fr: {
      title: 'Construisez Votre Voyage Parfait',
      subtitle: 'Créons votre expérience idéale étape par étape',
      step: 'Étape',
      of: 'sur',
      next: 'Suivant',
      back: 'Retour',
      generate: 'Générer Mon Voyage',
      select: 'Sélectionner',
      step1_title: 'Quel type de voyage vous appelle?',
      step2_title: 'Où voulez-vous aller?',
      step3_title: 'Combien de temps avez-vous?',
      step4_title: 'Quand aimeriez-vous voyager?',
      step5_title: 'Quel est votre budget?',
      step6_title: 'Qui voyage avec vous?',
      step7_title: 'Qu\'est-ce qui vous intéresse le plus?',
      all: 'Voir tous les détails de mon voyage',
      budget_per_person: 'par personne',
      interests_select_multiple: 'Sélectionnez autant que vous le souhaitez'
    },
    de: {
      title: 'Bauen Sie Ihre Perfekte Reise',
      subtitle: 'Lassen Sie uns Ihre Traumerfahrung Schritt für Schritt erstellen',
      step: 'Schritt',
      of: 'von',
      next: 'Nächster',
      back: 'Zurück',
      generate: 'Meine Reise generieren',
      select: 'Auswählen',
      step1_title: 'Welche Art von Reise ruft Sie an?',
      step2_title: 'Wohin möchten Sie gehen?',
      step3_title: 'Wie lange haben Sie Zeit?',
      step4_title: 'Wann möchten Sie reisen?',
      step5_title: 'Wie ist Ihr Budget?',
      step6_title: 'Wer reist mit Ihnen?',
      step7_title: 'Was interessiert Sie am meisten?',
      all: 'Siehe alle meine Reisedetails',
      budget_per_person: 'pro Person',
      interests_select_multiple: 'Wählen Sie so viele wie Sie möchten'
    }
  };

  const t = labels[lang];

  const tripTypes = [
    { icon: '🎪', label: 'Events & Festivals', value: 'events' },
    { icon: '🦁', label: 'Safari & Nature', value: 'safari' },
    { icon: '⚽', label: 'Sports', value: 'sports' },
    { icon: '🏖️', label: 'Relaxation', value: 'relax' },
    { icon: '🏛️', label: 'Culture & History', value: 'culture' },
    { icon: '🚀', label: 'Adventure', value: 'adventure' }
  ];

  const destinations = [
    { emoji: '🇺🇸', name: 'USA', trips: 5 },
    { emoji: '🇲🇽', name: 'Mexico', trips: 3 },
    { emoji: '🇨🇦', name: 'Canada', trips: 2 },
    { emoji: '🇫🇷', name: 'France', trips: 4 },
    { emoji: '🇧🇼', name: 'Botswana', trips: 6 },
    { emoji: '🇱🇸', name: 'Lesotho', trips: 4 },
    { emoji: '🇪🇬', name: 'Egypt', trips: 3 },
    { emoji: '🇿🇦', name: 'South Africa', trips: 5 }
  ];

  const durations = [
    { label: '3-5 days', value: '3-5' },
    { label: '1-2 weeks', value: '1-2w' },
    { label: '2-3 weeks', value: '2-3w' },
    { label: '1 month', value: '1m' },
    { label: '1+ months', value: '1m+' }
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const budgets = [
    { label: '$500-1000', value: '500-1000' },
    { label: '$1000-2000', value: '1000-2000' },
    { label: '$2000-5000', value: '2000-5000' },
    { label: '$5000-10000', value: '5000-10000' },
    { label: '$10000+', value: '10000+' }
  ];

  const groups = [
    { emoji: '👤', label: 'Solo', value: 'solo' },
    { emoji: '👫', label: 'Couple', value: 'couple' },
    { emoji: '👨‍👩‍👧‍👦', label: 'Family', value: 'family' },
    { emoji: '👯', label: 'Friends', value: 'friends' },
    { emoji: '👥', label: 'Group (10+)', value: 'group' }
  ];

  const interests = [
    { emoji: '🎭', label: 'Entertainment' },
    { emoji: '🍽️', label: 'Gastronomy' },
    { emoji: '🏥', label: 'Wellness' },
    { emoji: '📸', label: 'Photography' },
    { emoji: '🎨', label: 'Art & Culture' },
    { emoji: '🌿', label: 'Eco-Tourism' },
    { emoji: '🏃', label: 'Sports' },
    { emoji: '🛍️', label: 'Shopping' }
  ];

  const toggleInterest = (label: string) => {
    if (trip.interests.includes(label)) {
      setTrip({ ...trip, interests: trip.interests.filter(i => i !== label) });
    } else {
      setTrip({ ...trip, interests: [...trip.interests, label] });
    }
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.step1_title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tripTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTrip({ ...trip, type: type.value })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    trip.type === type.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <p className="font-semibold text-gray-900">{type.label}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.step2_title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => setTrip({ ...trip, destination: dest.name })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    trip.destination === dest.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-3xl mb-1">{dest.emoji}</div>
                  <p className="font-semibold text-gray-900">{dest.name}</p>
                  <p className="text-xs text-gray-500">{dest.trips} trips</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.step3_title}</h2>
            <div className="space-y-3 max-w-md mx-auto">
              {durations.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setTrip({ ...trip, duration: dur.value })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    trip.duration === dur.value
                      ? 'border-orange-500 bg-orange-50 font-semibold text-orange-900'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.step4_title}</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setTrip({ ...trip, month })}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                    trip.month === month
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.step5_title}</h2>
            <div className="space-y-3 max-w-md mx-auto">
              {budgets.map((budget) => (
                <button
                  key={budget.value}
                  onClick={() => setTrip({ ...trip, budget: budget.value })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    trip.budget === budget.value
                      ? 'border-orange-500 bg-orange-50 font-semibold text-orange-900'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {budget.label} <span className="text-xs text-gray-500">{t.budget_per_person}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.step6_title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {groups.map((group) => (
                <button
                  key={group.value}
                  onClick={() => setTrip({ ...trip, group: group.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    trip.group === group.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{group.emoji}</div>
                  <p className="font-semibold text-gray-900 text-sm">{group.label}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{t.step7_title}</h2>
            <p className="text-center text-gray-600 mb-8">{t.interests_select_multiple}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {interests.map((interest) => (
                <button
                  key={interest.label}
                  onClick={() => toggleInterest(interest.label)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    trip.interests.includes(interest.label)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{interest.emoji}</div>
                  <p className="font-semibold text-gray-900 text-sm">{interest.label}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  function getStepValue(): boolean {
    switch (step) {
      case 1:
        return !!trip.type;
      case 2:
        return !!trip.destination;
      case 3:
        return !!trip.duration;
      case 4:
        return !!trip.month;
      case 5:
        return !!trip.budget;
      case 6:
        return !!trip.group;
      case 7:
        return trip.interests.length > 0;
      default:
        return false;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/tourism" className="text-sm font-medium text-gray-600 hover:text-primary mb-4 inline-block">
            ← Retour à Midzoe Tourism
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                s <= step ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="text-center mb-8">
          <span className="text-sm font-semibold text-gray-600">
            {t.step} {step} {t.of} 7
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 bg-white rounded-2xl shadow-lg mb-8">
        {getStepContent()}
      </div>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              step === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t.back}
          </button>

          {step < 7 ? (
            <button
              onClick={handleNext}
              disabled={!getStepValue()}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                getStepValue()
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t.next}
            </button>
          ) : (
            <Link
              to="/contact"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              {t.generate}
            </Link>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-12 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Your Trip Summary</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {trip.type && <div><span className="text-gray-600">Type:</span> <span className="font-semibold capitalize">{trip.type}</span></div>}
            {trip.destination && <div><span className="text-gray-600">Destination:</span> <span className="font-semibold">{trip.destination}</span></div>}
            {trip.duration && <div><span className="text-gray-600">Duration:</span> <span className="font-semibold">{trip.duration}</span></div>}
            {trip.month && <div><span className="text-gray-600">Month:</span> <span className="font-semibold">{trip.month}</span></div>}
            {trip.budget && <div><span className="text-gray-600">Budget:</span> <span className="font-semibold">${trip.budget}</span></div>}
            {trip.group && <div><span className="text-gray-600">Group:</span> <span className="font-semibold capitalize">{trip.group}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBuilder;
