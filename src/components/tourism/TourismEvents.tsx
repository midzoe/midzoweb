import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { formatMoney, useCurrency } from '../../pricing/currency';

/**
 * Événements : uniquement ceux publiés en admin, à venir, dates vérifiées. Plus aucun événement
 * codé en dur (la Coupe du Monde 2026, terminée, restait affichée « réservations ouvertes »).
 */
const T = {
  fr: { title: 'Événements', intro: 'Sport, festivals, culture : les grands rendez-vous où nous pouvons organiser votre voyage (vol, hébergement, visa, billets selon disponibilité).', empty: 'Aucun événement à venir n’est publié pour le moment. Dites-nous lequel vous intéresse : un conseiller vous répond.', contact: 'Proposer un événement', plan: 'Organiser mon voyage', official: 'Site officiel', from: 'À partir de', onQuote: 'Prix sur devis', includes: 'Ce que nous pouvons organiser', all: 'Tous les pays', loading: 'Chargement…' },
  en: { title: 'Events', intro: 'Sport, festivals, culture: major events for which we can organise your trip (flight, accommodation, visa, tickets subject to availability).', empty: 'No upcoming event is published yet. Tell us which one you are interested in: an advisor will answer.', contact: 'Suggest an event', plan: 'Organise my trip', official: 'Official site', from: 'From', onQuote: 'Price on request', includes: 'What we can organise', all: 'All countries', loading: 'Loading…' },
  de: { title: 'Veranstaltungen', intro: 'Sport, Festivals, Kultur: große Events, für die wir Ihre Reise organisieren können (Flug, Unterkunft, Visum, Tickets je nach Verfügbarkeit).', empty: 'Derzeit ist keine kommende Veranstaltung veröffentlicht. Sagen Sie uns, welche Sie interessiert: Ein Berater antwortet.', contact: 'Veranstaltung vorschlagen', plan: 'Meine Reise organisieren', official: 'Offizielle Website', from: 'Ab', onQuote: 'Preis auf Anfrage', includes: 'Was wir organisieren können', all: 'Alle Länder', loading: 'Lädt…' },
};

const TourismEvents: React.FC = () => {
  useCurrency();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : i18n.language?.startsWith('de') ? 'de' : 'en') as keyof typeof T;
  const t = T[lang];
  const [events, setEvents] = useState<any[] | null>(null);
  const [country, setCountry] = useState('');

  useEffect(() => {
    apiService.getTourismEvents().then(r => {
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const upcoming = (r?.data ?? [])
        .filter((e: any) => !e.startDate || new Date(e.endDate ?? e.startDate) >= now)
        .sort((a: any, b: any) => new Date(a.startDate ?? '2100-01-01').getTime() - new Date(b.startDate ?? '2100-01-01').getTime());
      setEvents(upcoming);
    }).catch(() => setEvents([]));
  }, []);

  const countries = useMemo(() => [...new Set((events ?? []).map(e => e.country).filter(Boolean))].sort(), [events]);
  const shown = (events ?? []).filter(e => !country || e.country === country);
  const dates = (e: any) => [e.startDate, e.endDate].filter(Boolean).map((d: string) => new Date(d).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })).join(' → ');

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">{t.title}</h1>
        <p className="text-slate-600 mb-8 max-w-3xl">{t.intro}</p>
        {events === null ? <p className="text-slate-500">{t.loading}</p> : events.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center">
            <p className="text-slate-600 mb-4">{t.empty}</p>
            <Link to="/contact?service=Événements" className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-medium">{t.contact}</Link>
          </div>
        ) : (
          <>
            {countries.length > 1 && (
              <select aria-label={t.all} value={country} onChange={e => setCountry(e.target.value)} className="mb-6 border-gray-300 rounded-md">
                <option value="">{t.all}</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <div className="space-y-4" data-testid="events-list">
              {shown.map(e => (
                <article key={e.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">{[e.subcategory, e.country, e.city].filter(Boolean).join(' · ')}</p>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">{e.title}</h2>
                      <p className="text-sm text-slate-500 mt-1">{dates(e)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{e.priceFrom ? `${t.from} ${formatMoney(Math.round(e.priceFrom * 100))}` : t.onQuote}</p>
                  </div>
                  {e.description && <p className="text-slate-700 mt-3">{e.description}</p>}
                  {e.offerIncludes?.length > 0 && <p className="text-sm text-slate-600 mt-3"><strong>{t.includes} :</strong> {e.offerIncludes.join(' · ')}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/tourism/plan?country=${encodeURIComponent(e.country ?? '')}`} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold">{t.plan}</Link>
                    {e.link && <a href={e.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700">{t.official} ↗</a>}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TourismEvents;
