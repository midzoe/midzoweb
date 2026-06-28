import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface SportCategory {
  id: string;
  sport: string;
  description: string;
  events: string[];
  image: string;
}

const sportCategories: SportCategory[] = [
  {
    id: 'football',
    sport: 'Football',
    description: 'From local derbies to the Champions League final — we organize your complete football travel experience.',
    events: ['World Cup 2026', 'Champions League Final', 'Premier League & La Liga matches', 'AFCON 2027', 'CAF Champions League'],
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'running',
    sport: 'Running & Marathons',
    description: 'Run the world\'s most iconic marathons with everything arranged — from bib registration to finish line celebrations.',
    events: ['Paris Marathon', 'London Marathon', 'New York Marathon', 'Two Oceans (Cape Town)', 'Comrades Marathon (SA)'],
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tennis',
    sport: 'Tennis',
    description: 'The Grand Slams, Davis Cup, ATP & WTA Finals — experience world-class tennis with courtside hospitality.',
    events: ['Roland Garros (Paris)', 'Wimbledon', 'US Open (New York)', 'Australian Open', 'ATP Finals'],
    image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rugby',
    sport: 'Rugby',
    description: 'Rugby World Cup, Six Nations, United Rugby Championship — the full hospitality package for rugby fans.',
    events: ['Rugby World Cup 2027 (Australia)', 'Six Nations', 'Lions Tours', 'Top 14 (France)', 'Currie Cup (SA)'],
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cycling',
    sport: 'Cycling',
    description: 'Follow the peloton across Europe or ride the classics yourself. Cycling tourism at its finest.',
    events: ['Tour de France', 'Giro d\'Italia', 'Vuelta España', 'Cape Argus (SA)', 'L\'Étape du Tour'],
    image: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'motorsport',
    sport: 'Motorsport',
    description: 'Formula 1, MotoGP, Dakar Rally — access to the paddock, grandstands, and VIP hospitality.',
    events: ['F1 Monaco Grand Prix', 'F1 Abu Dhabi', 'F1 Bahrain', 'MotoGP', 'Dakar Rally'],
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const SportsTourism = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';

  const labels = {
    en: {
      title: 'Sports Tourism',
      subtitle: 'Your passion for sport deserves more than just watching on TV. We take you there.',
      events_label: 'Key Events We Cover',
      cta: 'Plan My Sports Trip',
      how_title: 'How It Works',
      step1: 'Choose your sport & event',
      step1_desc: 'Tell us which event you want to attend. We\'ll handle the rest.',
      step2: 'We build your package',
      step2_desc: 'Flights, accommodation near the venue, tickets, and local transport — all in one.',
      step3: 'You travel stress-free',
      step3_desc: 'Just show up. Our on-ground support is available throughout your trip.',
      custom_title: 'Don\'t see your sport?',
      custom_desc: 'We cover virtually any sport and event worldwide. Contact us with your request and we\'ll build a custom package for you.',
      custom_cta: 'Request Custom Package'
    },
    fr: {
      title: 'Tourisme Sportif',
      subtitle: 'Votre passion pour le sport mérite plus que de regarder à la télé. Nous vous y emmenons.',
      events_label: 'Événements Clés Couverts',
      cta: 'Planifier Mon Voyage Sportif',
      how_title: 'Comment Ça Marche',
      step1: 'Choisissez votre sport & événement',
      step1_desc: 'Dites-nous à quel événement vous souhaitez assister. Nous nous chargeons du reste.',
      step2: 'Nous construisons votre package',
      step2_desc: 'Vols, hébergement près du lieu, billets et transport local — tout en un.',
      step3: 'Vous voyagez sans stress',
      step3_desc: 'Présentez-vous simplement. Notre support sur place est disponible tout au long de votre voyage.',
      custom_title: 'Vous ne voyez pas votre sport?',
      custom_desc: 'Nous couvrons pratiquement tous les sports et événements mondiaux. Contactez-nous et nous construirons un package personnalisé.',
      custom_cta: 'Demander un Package Personnalisé'
    },
    de: {
      title: 'Sporttourismus',
      subtitle: 'Ihre Leidenschaft für Sport verdient mehr als nur Fernsehen. Wir bringen Sie dorthin.',
      events_label: 'Wichtige Events, die wir abdecken',
      cta: 'Meine Sportreise Planen',
      how_title: 'Wie es funktioniert',
      step1: 'Wählen Sie Ihren Sport & Event',
      step1_desc: 'Sagen Sie uns, welches Event Sie besuchen möchten. Wir kümmern uns um den Rest.',
      step2: 'Wir erstellen Ihr Paket',
      step2_desc: 'Flüge, Unterkunft in der Nähe des Veranstaltungsorts, Tickets und lokaler Transport — alles in einem.',
      step3: 'Sie reisen stressfrei',
      step3_desc: 'Kommen Sie einfach an. Unser Vor-Ort-Support ist während Ihrer gesamten Reise verfügbar.',
      custom_title: 'Ihren Sport nicht gefunden?',
      custom_desc: 'Wir decken praktisch jeden Sport und jedes Event weltweit ab. Kontaktieren Sie uns und wir erstellen ein individuelles Paket.',
      custom_cta: 'Individuelles Paket Anfragen'
    }
  };

  const t = labels[lang];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 py-24 overflow-hidden border-b border-slate-700">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Sports Tourism"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-gold-500/20 border border-gold-400/40 px-4 py-2 rounded-lg text-sm font-semibold mb-6 text-gold-200">
            ✨ Midzoe Tourism
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4 tracking-tight">{t.title}</h1>
          <p className="text-xl text-slate-100 max-w-2xl mx-auto font-light">{t.subtitle}</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12 tracking-tight">{t.how_title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: t.step1, desc: t.step1_desc },
              { num: '02', title: t.step2, desc: t.step2_desc },
              { num: '03', title: t.step3, desc: t.step3_desc }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sport Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sportCategories.map((sport) => (
            <div
              key={sport.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-100/50 group"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={sport.image} alt={sport.sport} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h2 className="text-lg font-semibold text-white">{sport.sport}</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-700 mb-4 font-light">{sport.description}</p>
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gold-600 uppercase tracking-wide mb-2">{t.events_label}</p>
                  <ul className="space-y-1">
                    {sport.events.map((ev, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/contact"
                  className="block text-center py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  {t.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Request CTA */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-10 text-center text-white border border-slate-700">
          <h2 className="text-2xl font-bold mb-3 tracking-tight">{t.custom_title}</h2>
          <p className="text-slate-200 max-w-xl mx-auto mb-6 font-light">{t.custom_desc}</p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg font-semibold transition-colors duration-200"
          >
            {t.custom_cta}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SportsTourism;
