import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { formatMoney, useCurrency } from '../../pricing/currency';

/**
 * Programmes à destination fixe (safari, sport) publiés en admin. Prix affiché seulement s'il a
 * été saisi ; sinon « prix sur devis » (aucun tarif inventé).
 */
type Kind = 'safari' | 'sport';
const T = {
  fr: {
    safari: { title: 'Safari & découverte de l’Afrique', intro: 'Botswana, Kenya, Rwanda, Namibie, Zimbabwe, Afrique du Sud… des programmes conçus avec des partenaires locaux, à adapter à vos dates et à votre budget.' },
    sport: { title: 'Tourisme sportif', intro: 'Marathons, tournois, grands prix et stages : nous organisons le voyage autour de l’événement (dossard ou billets selon disponibilité).' },
    itinerary: 'Itinéraire', transport: 'Transport', onQuote: 'Prix sur devis', plan: 'Organiser ce voyage', empty: 'Aucun programme publié pour le moment.', circuits: 'Voir aussi les circuits types', loading: 'Chargement…',
  },
  en: {
    safari: { title: 'Safari & Africa discovery', intro: 'Botswana, Kenya, Rwanda, Namibia, Zimbabwe, South Africa… programmes designed with local partners, adapted to your dates and budget.' },
    sport: { title: 'Sports tourism', intro: 'Marathons, tournaments, grands prix and camps: we organise the trip around the event (bib or tickets subject to availability).' },
    itinerary: 'Itinerary', transport: 'Transport', onQuote: 'Price on request', plan: 'Organise this trip', empty: 'No programme published yet.', circuits: 'See also sample tours', loading: 'Loading…',
  },
  de: {
    safari: { title: 'Safari & Afrika entdecken', intro: 'Botswana, Kenia, Ruanda, Namibia, Simbabwe, Südafrika… Programme mit lokalen Partnern, angepasst an Ihre Daten und Ihr Budget.' },
    sport: { title: 'Sporttourismus', intro: 'Marathons, Turniere, Grands Prix und Camps: Wir organisieren die Reise rund um das Event (Startplatz oder Tickets je nach Verfügbarkeit).' },
    itinerary: 'Reiseverlauf', transport: 'Transport', onQuote: 'Preis auf Anfrage', plan: 'Diese Reise organisieren', empty: 'Noch keine Programme veröffentlicht.', circuits: 'Siehe auch Beispielreisen', loading: 'Lädt…',
  },
};

const ProgramsPage: React.FC<{ kind: Kind }> = ({ kind }) => {
  useCurrency();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : i18n.language?.startsWith('de') ? 'de' : 'en') as keyof typeof T;
  const t = T[lang];
  const [programs, setPrograms] = useState<any[] | null>(null);
  useEffect(() => {
    apiService.getTourismPrograms(kind).then(r => setPrograms(r?.data ?? [])).catch(() => setPrograms([]));
  }, [kind]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">{t[kind].title}</h1>
        <p className="text-slate-600 mb-8 max-w-3xl">{t[kind].intro}</p>
        {programs === null ? <p className="text-slate-500">{t.loading}</p> : programs.length === 0 ? (
          <p className="text-slate-600">{t.empty}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5" data-testid="programs-list">
            {programs.map(p => (
              <article key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
                <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">{[p.country, p.city].filter(Boolean).join(' · ')}</p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{p.title}</h2>
                {p.description && <p className="text-slate-700 mt-2 text-sm">{p.description}</p>}
                {p.itinerary && <p className="text-xs text-slate-600 mt-3 whitespace-pre-line"><strong>{t.itinerary} :</strong> {p.itinerary}</p>}
                {p.transport && <p className="text-xs text-slate-600 mt-2"><strong>{t.transport} :</strong> {p.transport}</p>}
                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">{p.price ? formatMoney(Math.round(p.price * 100)) : t.onQuote}</span>
                  <Link to={`/tourism/plan?country=${encodeURIComponent(p.country)}`} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold">{t.plan}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <Link to="/tourism/circuits" className="inline-block mt-10 text-orange-600 underline">{t.circuits} →</Link>
      </div>
    </div>
  );
};

export default ProgramsPage;
