import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { formatMoney, useCurrency } from '../pricing/currency';
import { destinationSlug } from './TourismHome';

/**
 * Guide d'une destination, construit à partir des données de la base (fiche pays, circuits
 * types, programmes et événements publiés). Plus de guide codé en dur : toute destination
 * ajoutée en admin a son guide.
 */
const T = {
  fr: { back: 'Toutes les destinations', notFound: 'Destination introuvable', notFoundText: 'Cette destination n’est pas encore proposée. Composez votre voyage : un conseiller Midzo vous prépare un programme sur mesure.', plan: 'Composer mon voyage', visa: 'Vérifier le visa', season: 'Meilleure saison', budget: 'Budget sur place (indicatif, par jour)', currency: 'Monnaie', language: 'Langue', visaInfo: 'Visa pour les ressortissants africains', visaTime: 'Délai de visa', flights: 'Vols directs depuis', top: 'Incontournables', circuits: 'Circuits types', from: 'Accompagnement dès', days: 'jours', programs: 'Programmes', onQuote: 'Prix sur devis', events: 'Événements à venir', see: 'Voir', loading: 'Chargement…', indicative: 'Informations indicatives : vérifiez les conditions officielles avant de réserver.' },
  en: { back: 'All destinations', notFound: 'Destination not found', notFoundText: 'This destination is not offered yet. Plan your trip: a Midzo advisor prepares a tailor-made programme.', plan: 'Plan my trip', visa: 'Check the visa', season: 'Best season', budget: 'On-site budget (indicative, per day)', currency: 'Currency', language: 'Language', visaInfo: 'Visa for African nationals', visaTime: 'Visa processing time', flights: 'Direct flights from', top: 'Highlights', circuits: 'Sample tours', from: 'Support from', days: 'days', programs: 'Programmes', onQuote: 'Price on request', events: 'Upcoming events', see: 'See', loading: 'Loading…', indicative: 'Indicative information: check official conditions before booking.' },
  de: { back: 'Alle Reiseziele', notFound: 'Reiseziel nicht gefunden', notFoundText: 'Dieses Reiseziel wird noch nicht angeboten. Planen Sie Ihre Reise: Ein Midzo-Berater erstellt ein individuelles Programm.', plan: 'Meine Reise planen', visa: 'Visum prüfen', season: 'Beste Reisezeit', budget: 'Budget vor Ort (Richtwert, pro Tag)', currency: 'Währung', language: 'Sprache', visaInfo: 'Visum für afrikanische Staatsangehörige', visaTime: 'Bearbeitungszeit Visum', flights: 'Direktflüge ab', top: 'Höhepunkte', circuits: 'Beispielreisen', from: 'Begleitung ab', days: 'Tage', programs: 'Programme', onQuote: 'Preis auf Anfrage', events: 'Kommende Veranstaltungen', see: 'Ansehen', loading: 'Lädt…', indicative: 'Richtwerte: Prüfen Sie vor der Buchung die offiziellen Bedingungen.' },
};

const DestinationGuide: React.FC = () => {
  useCurrency();
  const { destination = '' } = useParams();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : i18n.language?.startsWith('de') ? 'de' : 'en') as keyof typeof T;
  const t = T[lang];
  const [countries, setCountries] = useState<any[] | null>(null);
  const [circuits, setCircuits] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    apiService.getTourismCountries().then(r => setCountries(r?.data ?? r?.countries ?? [])).catch(() => setCountries([]));
  }, []);

  const country = useMemo(() => {
    const slug = destination.toLowerCase();
    return (countries ?? []).find(c => destinationSlug(c.name) === slug || (c.nameFr && destinationSlug(c.nameFr) === slug));
  }, [countries, destination]);

  useEffect(() => {
    if (!country) return;
    apiService.getCircuits(country.name).then(r => setCircuits(r?.data ?? [])).catch(() => setCircuits([]));
    apiService.getTourismPrograms().then(r => setPrograms((r?.data ?? []).filter((p: any) => p.country === country.name))).catch(() => setPrograms([]));
    apiService.getTourismEvents().then(r => {
      const now = Date.now();
      setEvents((r?.data ?? []).filter((e: any) => e.country === country.name && (!e.endDate && !e.startDate ? true : new Date(e.endDate ?? e.startDate).getTime() >= now)));
    }).catch(() => setEvents([]));
  }, [country]);

  if (countries === null) return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">{t.loading}</div>;

  if (!country) {
    return (
      <div className="min-h-[60vh] bg-gray-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.notFound}</h1>
          <p className="text-gray-600 mb-6">{t.notFoundText}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/tourism/plan" className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-medium">{t.plan}</Link>
            <Link to="/tourism" className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium">{t.back}</Link>
          </div>
        </div>
      </div>
    );
  }

  const name = lang === 'fr' ? (country.nameFr || country.name) : country.name;
  const facts: [string, string | null | undefined][] = [
    [t.season, country.bestTime], [t.budget, country.avgBudgetPerDay], [t.currency, country.currency], [t.language, country.language],
    [t.visaInfo, country.visaForAfricans], [t.visaTime, country.processingTimeVisa],
    [t.flights, (country.directFlightsFrom ?? []).join(', ')],
  ];
  const dateRange = (e: any) => [e.startDate, e.endDate].filter(Boolean).map((d: string) => new Date(d).toLocaleDateString(lang)).join(' → ');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-slate-900 text-white">
        {country.image && <img src={country.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Link to="/tourism" className="text-sm text-slate-300 hover:text-white">← {t.back}</Link>
          <h1 className="text-4xl md:text-5xl font-bold mt-4" data-testid="guide-title">{country.flag} {name}</h1>
          {country.description && <p className="mt-4 max-w-2xl text-lg text-slate-100">{country.description}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/tourism/plan?country=${encodeURIComponent(country.name)}`} className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold">{t.plan}</Link>
            <Link to="/services/tourist-visa" className="px-6 py-3 rounded-xl border border-white/60 hover:bg-white/10 font-semibold">{t.visa}</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <section className="grid md:grid-cols-3 gap-4" data-testid="guide-facts">
          {facts.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{k}</p>
              <p className="mt-1 text-slate-900 font-medium">{v}</p>
            </div>
          ))}
        </section>
        <p className="text-xs text-slate-500 -mt-8">{t.indicative}</p>

        {!!country.topAttractions?.length && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.top}</h2>
            <div className="flex flex-wrap gap-2">
              {country.topAttractions.map((a: string) => <span key={a} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">{a}</span>)}
            </div>
          </section>
        )}

        {circuits.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.circuits}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {circuits.map(c => (
                <Link key={c.slug} to={`/tourism/circuits/${c.slug}`} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{c.duration_days} {t.days} · {c.stops.map((s: any) => s.label).join(' → ')}</p>
                  {c.price_from && <p className="mt-2 text-sm text-orange-700 font-medium">{t.from} {formatMoney(c.price_from.price_cents)}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {programs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.programs}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {programs.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  {p.description && <p className="text-sm text-slate-600 mt-1">{p.description}</p>}
                  {p.itinerary && <p className="text-xs text-slate-500 mt-2 whitespace-pre-line">{p.itinerary}</p>}
                  <p className="mt-2 text-sm text-slate-700">{p.price ? formatMoney(Math.round(p.price * 100)) : t.onQuote}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.events}</h2>
            <ul className="space-y-2">
              {events.map(e => (
                <li key={e.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap justify-between gap-2">
                  <span><strong>{e.title}</strong>{e.city ? ` — ${e.city}` : ''}</span>
                  <span className="text-sm text-slate-500">{dateRange(e)}{e.link && <> · <a href={e.link} target="_blank" rel="noopener noreferrer" className="underline">{t.see}</a></>}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default DestinationGuide;
