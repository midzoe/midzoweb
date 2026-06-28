import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Partner {
  name: string;
  description: string;
  url: string;
  specialty: string;
  logo: string;
  color: string;
}

const partners: Partner[] = [
  {
    name: 'Booking.com',
    description: 'World\'s largest accommodation platform. Hotels, apartments, villas, hostels — filtered by your destination and budget.',
    url: 'https://www.booking.com',
    specialty: 'Hotels & Accommodation',
    logo: 'B',
    color: 'bg-blue-600'
  },
  {
    name: 'Skyscanner',
    description: 'Compare flights from hundreds of airlines worldwide. Find the cheapest routes and flexible date options.',
    url: 'https://www.skyscanner.com',
    specialty: 'Flights',
    logo: 'S',
    color: 'bg-cyan-500'
  },
  {
    name: 'Expedia',
    description: 'Complete travel packages: flight + hotel bundles at discounted rates. Car rentals and activities included.',
    url: 'https://www.expedia.com',
    specialty: 'Flight + Hotel Packages',
    logo: 'E',
    color: 'bg-yellow-500'
  },
  {
    name: 'Airbnb',
    description: 'Unique stays and local experiences worldwide. Perfect for longer stays or immersive local experiences.',
    url: 'https://www.airbnb.com',
    specialty: 'Unique Stays & Experiences',
    logo: 'A',
    color: 'bg-rose-500'
  },
  {
    name: 'Kayak',
    description: 'Search hundreds of travel sites at once. Best for price comparison across multiple booking platforms.',
    url: 'https://www.kayak.com',
    specialty: 'Price Comparison',
    logo: 'K',
    color: 'bg-orange-500'
  },
  {
    name: 'GetYourGuide',
    description: 'Activities, tours and experiences at your destination. Skip-the-line tickets, guided tours, day trips.',
    url: 'https://www.getyourguide.com',
    specialty: 'Activities & Tours',
    logo: 'G',
    color: 'bg-teal-500'
  }
];

const TourismPartners = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';

  const labels = {
    en: {
      title: 'Flights & Stays',
      subtitle: 'For standard flight + hotel packages, we redirect you to the world\'s best travel platforms. These are the same platforms the big tour operators use.',
      why_title: 'Why we redirect instead of compete',
      why_desc: 'Booking.com, Expedia and Skyscanner have billions invested in infrastructure, real-time pricing and global inventory. Rather than offer you an inferior version, we send you directly to the best tools — and focus our energy on what we do better: curated niche experiences, event packages, and full-service support.',
      visit: 'Visit Platform',
      specialty: 'Speciality',
      need_help_title: 'Need help choosing?',
      need_help_desc: 'Not sure which platform is right for your trip? Tell us your destination, dates, and budget — we\'ll point you in the right direction for free.',
      need_help_cta: 'Ask Midzoe',
      midzoe_title: 'What Midzoe does instead',
      midzoe_1: 'Event packages (World Cup, AFCON, Olympics)',
      midzoe_2: 'Safari & curated Africa experiences',
      midzoe_3: 'Sports tourism trips',
      midzoe_4: 'Visa assistance for your destination',
      midzoe_5: 'Full orientation & guidance services',
      midzoe_cta: 'Explore Midzoe Services'
    },
    fr: {
      title: 'Vols & Séjours',
      subtitle: 'Pour les packages vols + hôtel standard, nous vous redirigeons vers les meilleures plateformes de voyage au monde. Ce sont les mêmes plateformes qu\'utilisent les grands tour-opérateurs.',
      why_title: 'Pourquoi nous redirigeons plutôt que de concurrencer',
      why_desc: 'Booking.com, Expedia et Skyscanner ont des milliards investis dans l\'infrastructure, la tarification en temps réel et l\'inventaire mondial. Plutôt que de vous offrir une version inférieure, nous vous envoyons directement vers les meilleurs outils — et concentrons notre énergie sur ce que nous faisons mieux : expériences de niche, packages événementiels et support complet.',
      visit: 'Visiter la Plateforme',
      specialty: 'Spécialité',
      need_help_title: 'Besoin d\'aide pour choisir?',
      need_help_desc: 'Pas sûr de quelle plateforme choisir? Dites-nous votre destination, vos dates et votre budget — nous vous orienterons gratuitement.',
      need_help_cta: 'Demander à Midzoe',
      midzoe_title: 'Ce que fait Midzoe à la place',
      midzoe_1: 'Packages événementiels (Coupe du Monde, CAN, JO)',
      midzoe_2: 'Safari & expériences Afrique curated',
      midzoe_3: 'Voyages tourisme sportif',
      midzoe_4: 'Assistance visa pour votre destination',
      midzoe_5: 'Services d\'orientation & accompagnement complet',
      midzoe_cta: 'Explorer les Services Midzoe'
    },
    de: {
      title: 'Flüge & Aufenthalte',
      subtitle: 'Für Standard-Flug+Hotel-Pakete leiten wir Sie zu den besten Reiseplattformen der Welt weiter. Dies sind dieselben Plattformen, die die großen Reiseveranstalter verwenden.',
      why_title: 'Warum wir weiterleiten statt zu konkurrieren',
      why_desc: 'Booking.com, Expedia und Skyscanner haben Milliarden in Infrastruktur, Echtzeit-Preisgestaltung und globalen Bestand investiert. Statt Ihnen eine minderwertige Version anzubieten, schicken wir Sie direkt zu den besten Tools — und konzentrieren unsere Energie auf das, was wir besser machen: kuratierte Nischenerlebnisse, Event-Pakete und Full-Service-Support.',
      visit: 'Plattform Besuchen',
      specialty: 'Spezialgebiet',
      need_help_title: 'Brauchen Sie Hilfe bei der Auswahl?',
      need_help_desc: 'Nicht sicher, welche Plattform für Ihre Reise die richtige ist? Nennen Sie uns Ihr Reiseziel, Ihre Daten und Ihr Budget — wir helfen kostenlos weiter.',
      need_help_cta: 'Midzoe Fragen',
      midzoe_title: 'Was Midzoe stattdessen macht',
      midzoe_1: 'Event-Pakete (Weltmeisterschaft, AFCON, Olympia)',
      midzoe_2: 'Safari & kuratierte Afrika-Erlebnisse',
      midzoe_3: 'Sporttourismus-Reisen',
      midzoe_4: 'Visum-Unterstützung für Ihr Reiseziel',
      midzoe_5: 'Vollständige Orientierungs- & Beratungsleistungen',
      midzoe_cta: 'Midzoe Services Erkunden'
    }
  };

  const t = labels[lang];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-gold-500/20 border border-gold-400/40 px-4 py-2 rounded-lg text-sm font-semibold mb-6 text-gold-200">
            ✨ Midzoe Tourism
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4 tracking-tight">{t.title}</h1>
          <p className="text-xl text-slate-100 max-w-3xl mx-auto font-light">{t.subtitle}</p>
        </div>
      </div>

      {/* Why we redirect */}
      <div className="bg-gold-50 border-b border-gold-200">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-3">{t.why_title}</h2>
          <p className="text-slate-700 leading-relaxed font-light">{t.why_desc}</p>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              <div className={`${partner.color} p-6 flex items-center gap-4`}>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                  {partner.logo}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{partner.name}</h2>
                  <span className="text-white/80 text-xs font-light">{t.specialty}: {partner.specialty}</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-slate-700 text-sm flex-grow mb-6 font-light">{partner.description}</p>
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-2.5 border-2 border-gold-300 hover:border-gold-600 text-gold-600 hover:bg-gold-50 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  {t.visit} →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Need help */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-3">{t.need_help_title}</h2>
          <p className="text-slate-700 max-w-lg mx-auto mb-6 font-light">{t.need_help_desc}</p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg font-semibold transition-colors duration-200"
          >
            {t.need_help_cta}
          </Link>
        </div>

        {/* What Midzoe does instead */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-10 text-white border border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-center tracking-tight">{t.midzoe_title}</h2>
          <ul className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            {[t.midzoe_1, t.midzoe_2, t.midzoe_3, t.midzoe_4, t.midzoe_5].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-100">
                <svg className="w-5 h-5 text-gold-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <div className="text-center">
            <Link
              to="/services"
              className="inline-block px-8 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg font-semibold transition-colors duration-200"
            >
              {t.midzoe_cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourismPartners;
