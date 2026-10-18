import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { usePricing } from '../pricing/usePricing';
import { formatEuros } from '../pricing/pricingEngine';
// import { useTranslation } from 'react-i18next';

const DestinationGuide = () => {
  const { destination = 'botswana' } = useParams();
  // const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('itinerary');

  // Guide data for different destinations
  const guides: Record<string, any> = {
    botswana: {
      country: 'Botswana',
      title: 'Botswana — The Jewel of Africa',
      subtitle: 'Pristine wilderness, authentic safaris, and unforgettable encounters',
      hero: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      overview: 'Botswana is Africa\'s best-kept secret. Home to the iconic Okavango Delta, pristine national parks, and some of the world\'s most exclusive safari experiences. With Midzoe, you\'ll experience authentic wildlife encounters without the crowds.',
      highlights: [
        '🦁 Big Five game drives in pristine reserves',
        '🛶 Mokoro canoe rides through the Okavango Delta',
        '🌅 Sunrise and sunset safaris',
        '🏕️ Luxury bush camps and lodge stays',
        '📸 World-class photography opportunities',
        '🌿 Eco-conscious tourism practices'
      ],
      bestTime: 'June — October (dry season, best wildlife viewing)',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Gaborone',
          description: 'Land in Botswana\'s capital, transfer to your lodge. Orientation briefing and dinner.',
          meals: 'Dinner',
          included: '✈️ Transfer • 🏨 Accommodation'
        },
        {
          day: 2,
          title: 'Chobe National Park — Elephant Paradise',
          description: 'Full-day game drive in Chobe NP. See the largest elephant population in Africa. Sunset cruise.',
          meals: 'All meals',
          included: '🚗 Game drive • 🍽️ Meals • 🏨 Lodge'
        },
        {
          day: 3,
          title: 'Okavango Delta — Mokoro Adventure',
          description: 'Traditional mokoro canoe rides through the delta channels. Bush walk and birdwatching.',
          meals: 'All meals',
          included: '🛶 Mokoro • 🚶 Bush walk • 📸 Photography'
        },
        {
          day: '4-5',
          title: 'Deep Safari Experience',
          description: 'Multi-day lodge stay with twice-daily game drives. Night drives for nocturnal predators.',
          meals: 'All meals',
          included: '🦁 Game drives • 🏕️ Premium lodge • 🌙 Night drives'
        },
        {
          day: 6,
          title: 'Cultural Experience & Relaxation',
          description: 'Visit a local San community. Learn about their culture and traditions. Relax at the lodge.',
          meals: 'All meals',
          included: '👥 Cultural visit • 💆 Spa treatment'
        },
        {
          day: 7,
          title: 'Return Home',
          description: 'Final morning game drive, breakfast, and transfer to airport.',
          meals: 'Breakfast',
          included: '✈️ Transfer to airport'
        }
      ],
      whatToExpect: [
        {
          icon: '🌅',
          title: 'Early Mornings',
          desc: 'Game drives start at 5:30 AM to catch wildlife at their most active.'
        },
        {
          icon: '☀️',
          title: 'Hot Days',
          desc: 'Daytime temperatures can reach 35°C. Bring sunscreen and light clothing.'
        },
        {
          icon: '🦁',
          title: 'Wildlife Close Encounters',
          desc: 'You\'ll see lions, elephants, buffalo, leopards, and countless bird species.'
        },
        {
          icon: '🏕️',
          title: 'Authentic Accommodation',
          desc: 'Luxury bush camps offer comfort while keeping you immersed in nature.'
        }
      ]
    }
  };

  const guide = guides[destination.toLowerCase()];
  const { pricing } = usePricing();
  const tourismTiers = (pricing?.packages ?? []).filter(p => p.family === 'tourism');

  // Une destination sans guide affichait jusqu'ici le guide du Botswana sous son propre titre.
  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <h1 className="text-2xl font-bold text-gray-900">Guide pas encore disponible</h1>
          <p className="text-gray-600 mt-3">
            Nous n'avons pas encore de guide détaillé pour cette destination. Composez votre voyage : un conseiller
            MIDZOE vous prépare un programme sur mesure.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/tourism/plan" className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg">Composer mon voyage</Link>
            <Link to="/tourism" className="px-6 py-3 border-2 border-orange-600 text-orange-600 font-bold rounded-lg">Toutes les destinations</Link>
          </div>
        </div>
      </div>
    );
  }
  const planHref = `/tourism/plan?country=${encodeURIComponent(guide.country)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to="/tourism" className="text-sm font-medium text-gray-600 hover:text-primary">
            ← Back to Midzoe Tourism
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img src={guide.hero} alt={guide.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{guide.title}</h1>
          <p className="text-xl md:text-2xl text-white/90">{guide.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-3xl">{guide.overview}</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Highlights</h3>
              <ul className="space-y-3">
                {guide.highlights.map((highlight: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="text-xl">{highlight.split(' ')[0]}</span>
                    {highlight.slice(2)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Best Time to Visit</h3>
              <p className="text-lg font-semibold text-orange-600 mb-4">{guide.bestTime}</p>
              <p className="text-gray-700 mb-6">
                Peak season offers the best wildlife viewing, cooler temperatures, and optimal photography conditions.
              </p>
              <Link
                to={planHref}
                className="block text-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Plan Your Visit
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex border-b border-gray-200 mb-8 gap-8 overflow-x-auto">
            {['itinerary', 'pricing', 'expect'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-orange-600 border-orange-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab === 'itinerary' && '📋 Itinerary'}
                {tab === 'pricing' && '💰 Pricing'}
                {tab === 'expect' && '✓ What to Expect'}
              </button>
            ))}
          </div>

          {/* Itinerary */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              {guide.itinerary.map((item: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border-l-4 border-orange-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Day {item.day}</h3>
                      <p className="font-semibold text-orange-600 mt-1">{item.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div><span className="font-semibold text-gray-900">Meals:</span> {item.meals}</div>
                    <div><span className="font-semibold text-gray-900">Included:</span> {item.included}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing : grille tarifaire réelle (services à la carte ou packages Tourism) */}
          {activeTab === 'pricing' && (
            <div>
              <p className="text-gray-700 mb-6 max-w-3xl">
                Le prix dépend des services que vous choisissez (guide, hébergement, itinéraire, accueil à l'aéroport…).
                Composez votre voyage pour obtenir le prix exact : nous comparons le prix à la carte et nos packages Tourism.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                {tourismTiers.map(t => (
                  <div key={t.id} className="border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{t.service_label}</p>
                    <p className="text-2xl font-black text-orange-600">{formatEuros(t.price_from_cents, t.currency)}</p>
                  </div>
                ))}
              </div>
              <Link to={planHref} className="inline-block mt-6 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700">
                Calculer le prix de mon voyage
              </Link>
            </div>
          )}

          {/* What to Expect */}
          {activeTab === 'expect' && (
            <div className="grid md:grid-cols-2 gap-8">
              {guide.whatToExpect.map((item: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-8">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience {guide.title.split(' —')[0]}?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Let us handle all the details. You focus on creating memories.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={planHref}
              className="px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Build Your Custom Trip
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact Our Experts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationGuide;
