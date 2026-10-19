import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import { useNews, NewsItem } from '../hooks/useNews';
import { usePricing } from '../pricing/usePricing';

import { useCategories, catalogText } from '../hooks/useCategories';
import {
  CalendarIcon,
  GlobeAltIcon,
  TrophyIcon,
  PaperAirplaneIcon,
  UsersIcon,
  BookOpenIcon,
  MapPinIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { formatMoney, useCurrency } from '../pricing/currency';

const HERO = {
  fr: { a: 'Vivez votre', b: 'plus beau voyage', text: 'Safaris, villes, plages et grands événements : composez un voyage sur mesure, dans un ou plusieurs pays, avec un conseiller Midzo.', badge: 'Prix transparents : services à l’unité ou packages, calculés en ligne', plan: 'Composer mon voyage', circuits: 'Voir les circuits types', destinations: 'Nos destinations', destinationsText: 'Chaque destination a son guide : meilleure saison, budget sur place, visa et circuits.', guide: 'Lire le guide', explore: 'Explorez plus', reviewsTitle: 'Avis clients vérifiés', reviewsText: 'Les avis de nos clients ayant voyagé ou étudié avec Midzo, publiés après relecture.', reviewsCta: 'Lire les avis', circuitsTitle: 'Circuits types', circuitsText: 'Des itinéraires prêts à personnaliser, avec le prix de l’accompagnement calculé en ligne.', circuitsCta: 'Voir les circuits' },
  en: { a: 'Live your', b: 'greatest journey', text: 'Safaris, cities, beaches and major events: build a tailor-made trip, in one or several countries, with a Midzo advisor.', badge: 'Transparent prices: single services or packages, calculated online', plan: 'Plan my trip', circuits: 'See sample tours', destinations: 'Our destinations', destinationsText: 'Each destination has its guide: best season, on-site budget, visa and tours.', guide: 'Read the guide', explore: 'Explore more', reviewsTitle: 'Verified customer reviews', reviewsText: 'Reviews from customers who travelled or studied with Midzo, published after checking.', reviewsCta: 'Read reviews', circuitsTitle: 'Sample tours', circuitsText: 'Ready-to-customise itineraries, with the support price calculated online.', circuitsCta: 'See tours' },
  de: { a: 'Erleben Sie Ihre', b: 'schönste Reise', text: 'Safaris, Städte, Strände und große Events: Planen Sie eine individuelle Reise in einem oder mehreren Ländern, mit einem Midzo-Berater.', badge: 'Transparente Preise: Einzelleistungen oder Pakete, online berechnet', plan: 'Meine Reise planen', circuits: 'Beispielreisen ansehen', destinations: 'Unsere Reiseziele', destinationsText: 'Jedes Reiseziel hat seinen Reiseführer: beste Reisezeit, Budget vor Ort, Visum und Rundreisen.', guide: 'Zum Reiseführer', explore: 'Mehr entdecken', reviewsTitle: 'Geprüfte Kundenbewertungen', reviewsText: 'Bewertungen von Kunden, die mit Midzo gereist sind oder studiert haben – nach Prüfung veröffentlicht.', reviewsCta: 'Bewertungen lesen', circuitsTitle: 'Beispielreisen', circuitsText: 'Fertige Routen zum Anpassen, mit online berechnetem Begleitpreis.', circuitsCta: 'Rundreisen ansehen' },
};

export const destinationSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');

const TourismHome = () => {
  useCurrency();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const hx = HERO[lang];
  const [destinations, setDestinations] = useState<any[]>([]);
  useEffect(() => {
    apiService.getTourismCountries().then(r => setDestinations(r?.data ?? r?.countries ?? [])).catch(() => setDestinations([]));
  }, []);
  const [showQuiz, setShowQuiz] = useState(false);
  // Pas de filtre `scope` : la section affiche l'ensemble des actualités, comme avant.
  const { news: newsItems, loading: newsLoading } = useNews();
  const { categories: catalogCategories, serviceDetails } = useCategories();
  const tServices = useMemo(() => i18n.getFixedT(null, 'services'), [i18n, i18n.language]);

  // Paliers Tourism de la grille tarifaire (à la place d'offres « limitées » inventées).
  const { pricing } = usePricing();
  const tourismTiers = (pricing?.packages ?? []).filter(p => p.family === 'tourism');
  const tourismServicesValue = (pricing?.services ?? []).filter(sv => sv.family === 'tourism').reduce((n, sv) => n + sv.price_cents, 0);

  const getTitle = (item: NewsItem) =>
    lang === 'fr' ? item.titleFr : lang === 'de' ? item.titleDe : item.title;


  // Les cartes de cette section reprennent les services de la catégorie « tourism »
  // du catalogue : titre, description, image et lien viennent de la base, donc
  // publier un service en admin l'ajoute ici sans toucher au code. Icône et
  // couleur d'accent restent de la présentation, appliquées par position.
  const CARD_ICONS = [CalendarIcon, GlobeAltIcon, TrophyIcon, PaperAirplaneIcon, MapPinIcon, BuildingOffice2Icon];

  const categories = useMemo(() => {
    const tourism = catalogCategories.find(c => c.id === 'tourism');
    if (!tourism) return [];
    const details = serviceDetails['tourism'] ?? {};
    return tourism.services
      .map(name => details[name])
      .filter(Boolean)
      .map((detail, i) => ({
        id: detail.learnMoreLink || detail.name,
        title: catalogText(tServices, `${detail.translationKey}.name`, detail.name),
        icon: CARD_ICONS[i % CARD_ICONS.length],
        subline: catalogText(tServices, `${detail.translationKey}.description`, detail.description),
        image: detail.image,
        link: detail.learnMoreLink,
      }));
  }, [catalogCategories, serviceDetails, tServices]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Back */}
      <div className="bg-white border-b border-slate-100/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
            ← Retour à Midzo
          </Link>
        </div>
      </div>

      {/* HERO — Luxury Immersive */}
      <div className="relative h-[800px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Travel"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="mb-6 inline-block bg-gold-500/15 border border-gold-400/40 rounded-full px-6 py-2 backdrop-blur-sm">
            <span className="text-gold-300 font-semibold text-sm tracking-wide">✨ MIDZO TOURISM</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
            {hx.a}
            <br />
            <span className="bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 bg-clip-text text-transparent">
              {hx.b}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-100 max-w-2xl mb-6 font-light">{hx.text}</p>

          <div className="mb-10 inline-block bg-emerald-500/15 border border-emerald-400/40 rounded-full px-6 py-3 backdrop-blur-sm">
            <span className="text-emerald-200 font-semibold">{hx.badge}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/tourism/plan"
              className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-colors duration-200 text-lg shadow-lg">
              {hx.plan}
            </Link>
            <Link to="/tourism/circuits"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200 text-lg">
              {hx.circuits}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* QUIZ MODAL */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Quel voyageur êtes-vous?</h2>
              <button onClick={() => setShowQuiz(false)} className="text-xl text-slate-400 hover:text-slate-600 font-light">✕</button>
            </div>

            <p className="text-slate-600 mb-8">Découvrez l'expérience Midzo Tourism parfaite pour vous en 30 secondes.</p>

            <div className="space-y-3">
              {[
                { Icon: CalendarIcon, title: 'Aventurier d\'Événements', desc: 'Vivez les plus grands événements mondiaux', cta: '/services/tourism-events' },
                { Icon: GlobeAltIcon, title: 'Explorateur de Nature', desc: 'Safari, wilderness, découvrez l\'Afrique vierge', cta: '/services/tourism-safari' },
                { Icon: TrophyIcon, title: 'Passionné de Sport', desc: 'Marathons, Grand Slams, votre sport préféré', cta: '/services/tourism-sports' },
                { Icon: PaperAirplaneIcon, title: 'Voyageur Simple', desc: 'Vol + hôtel, facile et à bon prix', cta: '/services/tourism-partners' }
              ].map((type, i) => (
                <Link
                  key={i}
                  to={type.cta}
                  className="block p-4 border border-slate-200 rounded-lg hover:border-gold-300 hover:bg-gold-50 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <type.Icon className="w-6 h-6 text-slate-600 group-hover:text-gold-600 transition-colors duration-200 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-base group-hover:text-gold-600 transition-colors duration-200">{type.title}</h3>
                      <p className="text-sm text-slate-600">{type.desc}</p>
                    </div>
                    <span className="text-gold-600 font-semibold group-hover:translate-x-1 transition-transform duration-200 ml-2">→</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700"><strong>Conseil:</strong> Pas sûr? Utilisez notre Trip Builder pour customiser 100% votre voyage.</p>
              <Link to="/tourism/plan" className="inline-block mt-3 px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-200">
                Aller au Trip Builder
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* EXPERIENCE CATEGORIES */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Choisissez Votre Expérience
            </h2>
            <p className="text-xl text-slate-600 font-light">
              Des plus grands événements mondiaux aux derniers coins sauvages de la Terre
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link key={cat.id} to={cat.link}>
                  <div className="relative h-96 rounded-lg overflow-hidden shadow-sm border border-slate-100/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/15 backdrop-blur-sm rounded-lg group-hover:bg-white/20 transition-colors duration-200">
                            <IconComponent className="w-7 h-7 text-gold-300" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white">{cat.title}</h3>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm mb-4 font-light line-clamp-3">{cat.subline}</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold group-hover:bg-white/30 transition-colors duration-200">
                        Découvrir <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESTINATIONS — fiches pays de la base, chacune avec son guide */}
      {destinations.length > 0 && (
        <div className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-slate-900 mb-3 text-center tracking-tight">{hx.destinations}</h2>
            <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">{hx.destinationsText}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="tourism-destinations">
              {destinations.map((d: any) => (
                <Link key={d.id ?? d.name} to={`/destination/${destinationSlug(d.name)}`}
                  className="group rounded-xl bg-white border border-slate-200 p-4 hover:border-gold-400 hover:shadow transition">
                  <p className="text-lg font-semibold text-slate-900">{d.flag} {lang === 'fr' ? (d.nameFr || d.name) : d.name}</p>
                  {d.bestTime && <p className="text-xs text-slate-500 mt-1">{d.bestTime}</p>}
                  <span className="text-sm text-gold-700 font-medium mt-2 inline-block group-hover:translate-x-1 transition-transform">{hx.guide} →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PACKAGES TOURISM — grille tarifaire réelle */}
      <div className="py-24 bg-gradient-to-br from-gold-50 to-slate-50 border-y border-gold-200" data-testid="tourism-tiers">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900">Nos packages Tourism</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Choisissez vos services : guide, restaurants, vols, événements, hébergement, itinéraire, guide local, accueil à l'aéroport…
              {tourismServicesValue > 0 && ` Pris séparément, les 10 services valent ${formatMoney(tourismServicesValue)}.`}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tourismTiers.map(tier => (
              <div key={tier.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 p-6 flex flex-col">
                <h3 className="font-semibold text-slate-900 text-lg">{tier.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{tier.service_label}</p>
                <span className="text-3xl font-bold text-gold-600">{formatMoney(tier.price_from_cents, tier.currency)}</span>
                <ul className="mt-4 space-y-1 text-sm text-slate-600 flex-1">
                  {(tier.features ?? []).map(f => <li key={f}>• {f}</li>)}
                </ul>
                <Link
                  to={`/tourism/plan?package=${encodeURIComponent(tier.slug ?? '')}`}
                  className="mt-6 block text-center w-full py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-colors duration-200"
                >
                  Composer ce voyage
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/tourism/plan"
              className="inline-block px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors duration-200"
            >
              Construire Mon Voyage Personnalisé
            </Link>
          </div>
        </div>
      </div>

      {/* NEWS/INSPIRATION */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center tracking-tight">
            Inspiration & Actualités
          </h2>

          {newsLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-600"></div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {newsItems.map((item) => (
              <Link key={item.id} to={item.link || '/'}>
                <div className="bg-white rounded-lg shadow-sm border border-slate-100/50 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={item.image} alt={getTitle(item)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-gold-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 flex-1 group-hover:text-gold-600 transition-colors duration-200">
                      {getTitle(item)}
                    </h3>
                    <p className="text-xs text-slate-500 font-light">{item.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Explore More */}
      <div className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12 tracking-tight">{hx.explore}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/avis" className="group">
              <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-lg p-10 hover:shadow-lg transition-all duration-300 border border-gold-200">
                <div className="w-12 h-12 bg-gold-200 rounded-lg flex items-center justify-center mb-4">
                  <UsersIcon className="w-6 h-6 text-gold-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-gold-700 transition-colors duration-200">{hx.reviewsTitle}</h3>
                <p className="text-slate-700 mb-4 font-light">{hx.reviewsText}</p>
                <span className="inline-flex items-center gap-2 text-gold-700 font-semibold group-hover:translate-x-1 transition-transform duration-200">{hx.reviewsCta} →</span>
              </div>
            </Link>
            <Link to="/tourism/circuits" className="group">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-10 hover:shadow-lg transition-all duration-300 border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-200 rounded-lg flex items-center justify-center mb-4">
                  <BookOpenIcon className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors duration-200">{hx.circuitsTitle}</h3>
                <p className="text-slate-700 mb-4 font-light">{hx.circuitsText}</p>
                <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold group-hover:translate-x-1 transition-transform duration-200">{hx.circuitsCta} →</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Final — Back to Midzo */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4 text-slate-300 font-light">Besoin d'études ou formation?</p>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Retour à Midzo — Études & Formations</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors duration-200"
          >
            ← Retour à Midzo Principal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourismHome;
