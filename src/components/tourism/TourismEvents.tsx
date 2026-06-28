import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';

const eventImages: Record<string, string> = {
  worldcup2026: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  afcon2027: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
};

const statusLabels: Record<string, Record<string, string>> = {
  available: { en: 'Bookings Open', fr: 'Réservations Ouvertes', de: 'Buchungen Offen' },
  coming_soon: { en: 'Coming Soon', fr: 'Bientôt Disponible', de: 'Demnächst' },
  limited: { en: 'Limited Spots', fr: 'Places Limitées', de: 'Begrenzte Plätze' }
};

interface EventItem {
  id: string;
  event: string;
  location: string;
  dates: string;
  description: string;
  highlights: string[];
  price: string;
  status: 'available' | 'coming_soon' | 'limited';
}

interface NewsItem {
  tag: string;
  tagColor: string;
  borderColor: string;
  title: string;
  body: string;
}

interface Labels {
  title: string;
  subtitle: string;
  highlights_title: string;
  cta: string;
  cta_soon: string;
  blog_title: string;
  back: string;
  events: EventItem[];
  news: NewsItem[];
}

const allLabels: Record<string, Labels> = {
  en: {
    title: 'Events & Spectacles',
    subtitle: "Live the world's biggest events. We handle everything — you just show up.",
    highlights_title: "What's included",
    cta: 'Reserve My Spot',
    cta_soon: 'Get Notified',
    blog_title: 'Latest Event News',
    back: '← Back to Events',
    events: [
      {
        id: 'worldcup2026',
        event: 'FIFA World Cup 2026',
        location: 'USA / Canada / Mexico',
        dates: 'June 11 — July 19, 2026',
        description: 'The biggest football event in history — 48 nations, 16 venues across 3 countries. Live the atmosphere in New York, Los Angeles, Toronto, Mexico City and more.',
        highlights: [
          'Match tickets (Group stage, Knockouts, Final)',
          'Flights from your city + local transport',
          'Accommodation near stadiums',
          'Fan zone access & guided city tours',
          'Visa assistance included'
        ],
        price: 'From $2,500',
        status: 'available'
      },
      {
        id: 'afcon2027',
        event: 'Africa Cup of Nations 2027',
        location: 'East Africa (Kenya, Uganda, Tanzania)',
        dates: 'January 2027',
        description: 'AFCON returns to East Africa. Experience the passion of African football in its most authentic setting, with vibrant local culture and incredible landscapes.',
        highlights: [
          'Group stage + knockout match packages',
          'Flights + ground transport',
          'Hotels or eco-lodge stays',
          'Safari extension available',
          'Local cultural immersion program'
        ],
        price: 'From $1,200',
        status: 'coming_soon'
      }
    ],
    news: [
      {
        tag: 'World Cup 2026',
        tagColor: 'text-yellow-600',
        borderColor: 'border-yellow-500',
        title: 'Group draw results & travel tips per city',
        body: 'Los Angeles, Dallas, and Miami are the most booked venues. Book early — accommodation fills fast around stadiums.'
      },
      {
        tag: 'Visa Alert',
        tagColor: 'text-emerald-600',
        borderColor: 'border-emerald-500',
        title: 'ESTA & eTA requirements for non-US/Canada nationals',
        body: 'African passport holders need a full visa for USA & Canada. Start your application 3+ months ahead. Midzoe handles it.'
      },
      {
        tag: 'AFCON 2027',
        tagColor: 'text-amber-600',
        borderColor: 'border-amber-500',
        title: 'East Africa confirmed as host — packages announced soon',
        body: 'Kenya, Uganda and Tanzania confirmed as co-hosts. Register your interest now to be notified first when packages drop.'
      }
    ]
  },
  fr: {
    title: 'Événements & Spectacles',
    subtitle: "Vivez les plus grands événements mondiaux. Nous gérons tout — vous n'avez qu'à vous présenter.",
    highlights_title: 'Ce qui est inclus',
    cta: 'Réserver Ma Place',
    cta_soon: 'Me Notifier',
    blog_title: 'Dernières Nouvelles Événements',
    back: '← Retour aux Événements',
    events: [
      {
        id: 'worldcup2026',
        event: 'Coupe du Monde FIFA 2026',
        location: 'USA / Canada / Mexique',
        dates: '11 juin — 19 juillet 2026',
        description: "Le plus grand événement footballistique de l'histoire — 48 nations, 16 stades dans 3 pays. Vivez l'atmosphère à New York, Los Angeles, Toronto, Mexico et bien plus.",
        highlights: [
          'Billets de match (Phase de groupes, Quarts, Finale)',
          'Vols depuis votre ville + transport local',
          'Hébergement près des stades',
          'Accès fan zone & visites guidées',
          'Assistance visa incluse'
        ],
        price: 'À partir de 2 500$',
        status: 'available'
      },
      {
        id: 'afcon2027',
        event: "Coupe d'Afrique des Nations 2027",
        location: "Afrique de l'Est (Kenya, Ouganda, Tanzanie)",
        dates: 'Janvier 2027',
        description: "La CAN revient en Afrique de l'Est. Vivez la passion du football africain dans son cadre le plus authentique, avec une culture locale vibrante et des paysages incroyables.",
        highlights: [
          "Forfaits phase de groupes + matches à élimination directe",
          'Vols + transport terrestre',
          'Hôtels ou séjours en écolodge',
          'Extension safari disponible',
          'Programme d\'immersion culturelle locale'
        ],
        price: 'À partir de 1 200$',
        status: 'coming_soon'
      }
    ],
    news: [
      {
        tag: 'Coupe du Monde 2026',
        tagColor: 'text-yellow-600',
        borderColor: 'border-yellow-500',
        title: 'Résultats du tirage au sort & conseils de voyage par ville',
        body: 'Los Angeles, Dallas et Miami sont les stades les plus réservés. Réservez tôt — les hébergements se remplissent vite autour des stades.'
      },
      {
        tag: 'Alerte Visa',
        tagColor: 'text-emerald-600',
        borderColor: 'border-emerald-500',
        title: 'Exigences ESTA & eTA pour les ressortissants hors USA/Canada',
        body: "Les détenteurs de passeport africain ont besoin d'un visa complet pour les USA & le Canada. Commencez votre demande 3+ mois à l'avance. Midzoe s'en charge."
      },
      {
        tag: 'CAN 2027',
        tagColor: 'text-amber-600',
        borderColor: 'border-amber-500',
        title: "L'Afrique de l'Est confirmée comme hôte — forfaits bientôt annoncés",
        body: "Le Kenya, l'Ouganda et la Tanzanie confirmés comme co-hôtes. Enregistrez votre intérêt maintenant pour être notifié en premier dès que les forfaits seront disponibles."
      }
    ]
  },
  de: {
    title: 'Events & Spektakel',
    subtitle: 'Erleben Sie die größten Events der Welt. Wir kümmern uns um alles — Sie kommen einfach.',
    highlights_title: 'Was enthalten ist',
    cta: 'Meinen Platz Reservieren',
    cta_soon: 'Benachrichtigen',
    blog_title: 'Neueste Event-Nachrichten',
    back: '← Zurück zu Events',
    events: [
      {
        id: 'worldcup2026',
        event: 'FIFA Fußball-Weltmeisterschaft 2026',
        location: 'USA / Kanada / Mexiko',
        dates: '11. Juni — 19. Juli 2026',
        description: 'Das größte Fußballereignis der Geschichte — 48 Nationen, 16 Spielorte in 3 Ländern. Erleben Sie die Atmosphäre in New York, Los Angeles, Toronto, Mexiko-Stadt und mehr.',
        highlights: [
          'Spieltickets (Gruppenphase, K.o.-Runde, Finale)',
          'Flüge aus Ihrer Stadt + lokaler Transport',
          'Unterkunft in Stadionnähe',
          'Fan-Zone-Zugang & geführte Stadtrundfahrten',
          'Visa-Unterstützung inklusive'
        ],
        price: 'Ab 2.500$',
        status: 'available'
      },
      {
        id: 'afcon2027',
        event: 'Afrika-Cup 2027',
        location: 'Ostafrika (Kenia, Uganda, Tansania)',
        dates: 'Januar 2027',
        description: 'Der AFCON kehrt nach Ostafrika zurück. Erleben Sie die Leidenschaft des afrikanischen Fußballs in seiner authentischsten Umgebung mit lebhafter Lokalkultur.',
        highlights: [
          'Gruppenphase + K.o.-Runden-Pakete',
          'Flüge + Bodentransport',
          'Hotels oder Öko-Lodge-Aufenthalte',
          'Safari-Verlängerung verfügbar',
          'Lokales Kulturimmersionsprogramm'
        ],
        price: 'Ab 1.200$',
        status: 'coming_soon'
      }
    ],
    news: [
      {
        tag: 'Weltmeisterschaft 2026',
        tagColor: 'text-yellow-600',
        borderColor: 'border-yellow-500',
        title: 'Auslosung & Reisetipps pro Stadt',
        body: 'Los Angeles, Dallas und Miami sind die meistgebuchten Spielorte. Früh buchen — Unterkünfte füllen sich schnell rund um die Stadien.'
      },
      {
        tag: 'Visa-Warnung',
        tagColor: 'text-emerald-600',
        borderColor: 'border-emerald-500',
        title: 'ESTA & eTA Anforderungen für Nicht-US/Kanada-Bürger',
        body: 'Afrikanische Reisepassinhaber benötigen ein vollständiges Visum für USA & Kanada. Starten Sie Ihren Antrag 3+ Monate im Voraus. Midzoe kümmert sich darum.'
      },
      {
        tag: 'AFCON 2027',
        tagColor: 'text-amber-600',
        borderColor: 'border-amber-500',
        title: 'Ostafrika als Gastgeber bestätigt — Pakete bald angekündigt',
        body: 'Kenia, Uganda und Tansania als Mitgastgeber bestätigt. Registrieren Sie jetzt Ihr Interesse, um als Erste benachrichtigt zu werden.'
      }
    ]
  }
};

const TourismEvents = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const t: Labels = allLabels[lang];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-24 overflow-hidden border-b border-slate-700">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Events"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-sm font-semibold mb-6 text-white/80">
            ✨ Midzoe Tourism
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4 tracking-tight">{t.title}</h1>
          <p className="text-xl text-slate-100 max-w-2xl mx-auto font-light">{t.subtitle}</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          {t.events.map((event: EventItem) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-100/50 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={eventImages[event.id]}
                  alt={event.event}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    event.status === 'available'
                      ? 'bg-emerald-500 text-white'
                      : event.status === 'coming_soon'
                      ? 'bg-yellow-500 text-slate-900'
                      : 'bg-red-500 text-white'
                  }`}>
                    {statusLabels[event.status][lang]}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-2xl font-bold text-white">{event.event}</h2>
                  <p className="text-white/80 text-sm font-light">{event.location} · {event.dates}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-slate-700 mb-5 leading-relaxed font-light">{event.description}</p>
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-primary" />
                    {t.highlights_title}
                  </h3>
                  <ul className="space-y-2">
                    {event.highlights.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-2xl font-bold text-primary">{event.price}</span>
                  <Link
                    to="/contact"
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      event.status === 'available'
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-slate-300 hover:bg-slate-400 text-slate-600'
                    }`}
                  >
                    {event.status === 'available' ? t.cta : t.cta_soon}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* News */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">{t.blog_title}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {t.news.map((item: NewsItem, i: number) => (
              <div key={i} className={`bg-white rounded-lg p-6 border-l-4 ${item.borderColor} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <span className={`text-xs font-semibold ${item.tagColor} uppercase tracking-wide`}>{item.tag}</span>
                <h3 className="font-semibold text-slate-900 mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 font-light">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourismEvents;
