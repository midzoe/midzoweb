import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPinIcon, DocumentCheckIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface Destination {
  id: string;
  country: string;
  flag: string;
  tagline: string;
  description: string;
  image: string;
  experiences: string[];
  bestTime: string;
  duration: string;
  price: string;
  badge?: string;
}

const destinations: Destination[] = [
  {
    id: 'botswana',
    country: 'Botswana',
    flag: 'BW',
    tagline: 'Africa\'s Pristine Wilderness',
    description: 'Home to the Okavango Delta — one of the world\'s largest inland deltas and a UNESCO World Heritage Site. Botswana offers some of the most exclusive and authentic safari experiences on the continent.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    experiences: [
      'Mokoro canoe rides through the Okavango Delta',
      'Big Five game drives (lion, elephant, buffalo, leopard, rhino)',
      'Chobe National Park — largest elephant population in Africa',
      'Night game drives and bush walks',
      'Traditional San Bushmen village visits',
      'Victoria Falls day trip (Zimbabwe border)'
    ],
    bestTime: 'June — October (dry season)',
    duration: '7 — 14 days recommended',
    price: 'From $1,800',
    badge: 'Trending'
  },
  {
    id: 'lesotho',
    country: 'Lesotho',
    flag: 'LS',
    tagline: 'The Kingdom in the Sky',
    description: 'Entirely encircled by South Africa, Lesotho is Africa\'s most underrated gem. At over 1,000m altitude even at its lowest point, this mountain kingdom offers dramatic landscapes, authentic Basotho culture, and zero tourist crowds.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    experiences: [
      'Pony trekking through the Maluti & Drakensberg Mountains',
      'Semonkong Lodge & Maletsunyane Falls (highest single-drop in Africa)',
      'Authentic Basotho village homestays',
      'Sehlabathebe National Park — remote & unspoilt',
      'Skiing at Afriski (Africa\'s highest ski resort)',
      'Combined tour with South Africa & Eswatini'
    ],
    bestTime: 'April — September',
    duration: '4 — 10 days recommended',
    price: 'From $950',
    badge: 'Hidden Gem'
  },
  {
    id: 'namibia',
    country: 'Namibia',
    flag: 'NA',
    tagline: 'Land of Vast Horizons',
    description: 'Sossusvlei\'s iconic red dunes, the Skeleton Coast, and Etosha\'s salt pans. Namibia is a land of extraordinary contrasts — one of Africa\'s most spectacular and least-crowded destinations.',
    image: 'https://images.unsplash.com/photo-1548017787-de2a60019a2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    experiences: [
      'Sossusvlei & Deadvlei — iconic red sand dunes',
      'Etosha National Park game drives',
      'Skeleton Coast & Cape Cross seal colony',
      'Fish River Canyon hike (2nd largest in the world)',
      'Himba tribe cultural visits',
      'Self-drive safari adventure'
    ],
    bestTime: 'May — October',
    duration: '10 — 14 days recommended',
    price: 'From $1,500'
  },
  {
    id: 'zimbabwe',
    country: 'Zimbabwe',
    flag: 'ZW',
    tagline: 'Victoria Falls & Untamed Safari',
    description: 'Victoria Falls — the world\'s largest waterfall — is just the beginning. Zimbabwe\'s national parks offer some of the most exclusive wildlife encounters in Africa, with far fewer visitors than neighboring countries.',
    image: 'https://images.unsplash.com/photo-1504198416323-30f7bf32fc48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    experiences: [
      'Victoria Falls — the Smoke that Thunders',
      'Hwange National Park (largest elephant herds)',
      'Mana Pools UNESCO site — canoe safari on Zambezi',
      'White water rafting on the Zambezi',
      'Matobo Hills & ancient San rock art',
      'Sunset cruise on the Zambezi River'
    ],
    bestTime: 'July — October',
    duration: '7 — 12 days recommended',
    price: 'From $1,300'
  }
];

const SafariAfrica = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';

  const labels = {
    en: {
      title: 'Safari & Africa Discovery',
      subtitle: 'We know these destinations inside out. Authentic experiences, no tourist traps — just Africa as it really is.',
      badge_trending: 'Trending',
      badge_gem: 'Hidden Gem',
      experiences: 'Signature Experiences',
      best_time: 'Best Time',
      duration: 'Recommended Stay',
      cta: 'Build My Safari',
      blog_title: 'Africa Travel Tips',
      why_title: 'Why Book Africa with Midzoe?',
      why_1: 'We know the region',
      why_1_desc: 'Our team has on-the-ground experience in Southern Africa — not just Google Maps knowledge.',
      why_2: 'Visa handled',
      why_2_desc: 'Complex multi-country visas, KAZA Univisa, e-visas — we manage the paperwork.',
      why_3: 'Curated, not generic',
      why_3_desc: 'No copy-paste tour packages. Every trip is built around your interests and budget.'
    },
    fr: {
      title: 'Safari & Découverte Afrique',
      subtitle: 'Nous connaissons ces destinations sur le bout des doigts. Expériences authentiques, sans pièges à touristes — juste l\'Afrique telle qu\'elle est vraiment.',
      badge_trending: 'Tendance',
      badge_gem: 'Joyau Caché',
      experiences: 'Expériences Signature',
      best_time: 'Meilleure Période',
      duration: 'Séjour Recommandé',
      cta: 'Construire Mon Safari',
      blog_title: 'Conseils Voyage Afrique',
      why_title: 'Pourquoi Réserver l\'Afrique avec Midzoe?',
      why_1: 'Nous connaissons la région',
      why_1_desc: 'Notre équipe a une expérience terrain en Afrique australe — pas seulement des connaissances Google Maps.',
      why_2: 'Visa géré',
      why_2_desc: 'Visas multi-pays complexes, KAZA Univisa, e-visas — nous gérons toute la paperasse.',
      why_3: 'Curated, pas générique',
      why_3_desc: 'Pas de packages copier-coller. Chaque voyage est construit autour de vos intérêts et de votre budget.'
    },
    de: {
      title: 'Safari & Afrika-Entdeckung',
      subtitle: 'Wir kennen diese Reiseziele in- und auswendig. Authentische Erlebnisse, keine Touristenfallen — nur Afrika, wie es wirklich ist.',
      badge_trending: 'Im Trend',
      badge_gem: 'Geheimtipp',
      experiences: 'Signature-Erlebnisse',
      best_time: 'Beste Reisezeit',
      duration: 'Empfohlener Aufenthalt',
      cta: 'Meine Safari Planen',
      blog_title: 'Afrika-Reisetipps',
      why_title: 'Warum Afrika mit Midzoe buchen?',
      why_1: 'Wir kennen die Region',
      why_1_desc: 'Unser Team hat Vor-Ort-Erfahrung in Südafrika — nicht nur Google-Maps-Kenntnisse.',
      why_2: 'Visum geregelt',
      why_2_desc: 'Komplexe Mehrländer-Visa, KAZA Univisa, E-Visa — wir erledigen den Papierkram.',
      why_3: 'Kuratiert, nicht generisch',
      why_3_desc: 'Keine Copy-Paste-Tourpakete. Jede Reise wird um Ihre Interessen und Ihr Budget herum aufgebaut.'
    }
  };

  const t = labels[lang];

  const badgeColors: Record<string, string> = {
    'Trending': 'bg-gold-600 text-white',
    'Tendance': 'bg-gold-600 text-white',
    'Im Trend': 'bg-gold-600 text-white',
    'Hidden Gem': 'bg-emerald-600 text-white',
    'Joyau Caché': 'bg-emerald-600 text-white',
    'Geheimtipp': 'bg-emerald-600 text-white',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-24 overflow-hidden border-b border-slate-700">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Safari"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-gold-500/20 border border-gold-400/40 px-4 py-2 rounded-lg text-sm font-semibold mb-6 text-gold-200">
            ✨ Midzoe Tourism
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4 tracking-tight">
            {t.title}
          </h1>
          <p className="text-xl text-slate-100 max-w-2xl mx-auto font-light">{t.subtitle}</p>
        </div>
      </div>

      {/* Why Midzoe */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
          {[
            { Icon: MapPinIcon, title: t.why_1, desc: t.why_1_desc },
            { Icon: DocumentCheckIcon, title: t.why_2, desc: t.why_2_desc },
            { Icon: SparklesIcon, title: t.why_3, desc: t.why_3_desc }
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="p-3 bg-gold-50 rounded-lg flex-shrink-0">
                <item.Icon className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-1 font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destinations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-100/50 group"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={dest.image} alt={dest.country} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {dest.badge && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      badgeColors[lang === 'fr' ? (dest.badge === 'Trending' ? 'Tendance' : 'Joyau Caché') :
                        lang === 'de' ? (dest.badge === 'Trending' ? 'Im Trend' : 'Geheimtipp') : dest.badge] || 'bg-slate-200 text-slate-800'
                    }`}>
                      {lang === 'fr' ? (dest.badge === 'Trending' ? t.badge_trending : t.badge_gem) :
                        lang === 'de' ? (dest.badge === 'Trending' ? t.badge_trending : t.badge_gem) : dest.badge}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                      {dest.flag}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{dest.country}</h2>
                      <p className="text-white/80 text-sm italic font-light">{dest.tagline}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-slate-700 text-sm leading-relaxed mb-5 font-light">{dest.description}</p>

                <div className="mb-5">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <ArrowRightIcon className="w-4 h-4 text-gold-600" />
                    {t.experiences}
                  </h3>
                  <ul className="space-y-1.5">
                    {dest.experiences.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-gold-500 mt-0.5 font-bold">→</span>
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 mb-5 bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">{t.best_time}</span>
                    <span className="text-xs font-light">{dest.bestTime}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">{t.duration}</span>
                    <span className="text-xs font-light">{dest.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gold-600">{dest.price}</span>
                  <Link
                    to="/contact"
                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg font-semibold text-sm transition-colors duration-200"
                  >
                    {t.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mini Blog */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">{t.blog_title}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg p-6 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Botswana</span>
              <h3 className="font-semibold text-slate-900 mt-3 mb-2">Why Botswana safari is worth the premium price</h3>
              <p className="text-sm text-slate-600 font-light">Low-volume tourism policy = fewer tourists per game area = more authentic encounters. The silence of the Okavango is unlike anything else.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-gold-500 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="text-xs font-semibold text-gold-600 uppercase tracking-wide">Lesotho</span>
              <h3 className="font-semibold text-slate-900 mt-3 mb-2">Lesotho as a day trip from Johannesburg — is it worth it?</h3>
              <p className="text-sm text-slate-600 font-light">Yes — but 2-3 nights minimum to really experience it. The mountain scenery alone justifies the trip. No visa needed for most African passport holders.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Multi-Country</span>
              <h3 className="font-semibold text-slate-900 mt-3 mb-2">KAZA Univisa — one visa for Zambia & Zimbabwe</h3>
              <p className="text-sm text-slate-600 font-light">The KAZA Univisa ($50) covers both Zambia and Zimbabwe including Victoria Falls. Midzoe handles the application as part of your package.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafariAfrica;
