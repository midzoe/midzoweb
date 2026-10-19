import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { formatMoney, useCurrency } from '../../pricing/currency';
import { TOURISM_SERVICES } from './tourismProject';

/**
 * Circuits types : inspiration avec itinéraire, durée et prix de l'accompagnement Midzo
 * calculé par le serveur depuis la grille (« à partir de », voyageurs de base). Le budget sur
 * place (vols, hôtels, activités) reste indicatif et dépend des choix du voyageur.
 */
const T = {
  fr: { title: 'Circuits types', intro: 'Des itinéraires prêts à personnaliser : changez les étapes, les dates et les services, un conseiller Midzo prépare le reste.', days: 'jours', nights: 'nuits', from: 'Accompagnement Midzo dès', forTravelers: 'pour {{n}} voyageurs', budget: 'Budget sur place indicatif', included: 'Services inclus', best: 'Meilleure période', customize: 'Personnaliser ce circuit', details: 'Voir le circuit', empty: 'Les circuits types arrivent bientôt. Composez dès maintenant votre propre voyage.', plan: 'Composer mon voyage', back: 'Tous les circuits', note: 'Le prix affiché est celui de l’accompagnement Midzo (services inclus). Vols, hébergements et activités sont en plus, selon vos choix ; le budget par jour est une fourchette indicative.', notFound: 'Circuit introuvable', visa: 'Visa' },
  en: { title: 'Sample tours', intro: 'Ready-to-customise itineraries: change stops, dates and services, a Midzo advisor prepares the rest.', days: 'days', nights: 'nights', from: 'Midzo support from', forTravelers: 'for {{n}} travellers', budget: 'Indicative on-site budget', included: 'Included services', best: 'Best time', customize: 'Customise this tour', details: 'See the tour', empty: 'Sample tours are coming soon. Plan your own trip now.', plan: 'Plan my trip', back: 'All tours', note: 'The price shown is Midzo’s support (included services). Flights, accommodation and activities are extra, depending on your choices; the daily budget is an indicative range.', notFound: 'Tour not found', visa: 'Visa' },
  de: { title: 'Beispielreisen', intro: 'Fertige Routen zum Anpassen: Etappen, Daten und Leistungen ändern – ein Midzo-Berater erledigt den Rest.', days: 'Tage', nights: 'Nächte', from: 'Midzo-Begleitung ab', forTravelers: 'für {{n}} Reisende', budget: 'Budget vor Ort (Richtwert)', included: 'Enthaltene Leistungen', best: 'Beste Reisezeit', customize: 'Diese Reise anpassen', details: 'Zur Reise', empty: 'Beispielreisen folgen in Kürze. Planen Sie jetzt Ihre eigene Reise.', plan: 'Meine Reise planen', back: 'Alle Rundreisen', note: 'Der angezeigte Preis ist die Midzo-Begleitung (enthaltene Leistungen). Flüge, Unterkunft und Aktivitäten kommen je nach Wahl hinzu; das Tagesbudget ist ein Richtwert.', notFound: 'Rundreise nicht gefunden', visa: 'Visum' },
};
const useT = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : i18n.language?.startsWith('de') ? 'de' : 'en') as keyof typeof T;
  return T[lang];
};

const serviceLabel = (code: string) => TOURISM_SERVICES.find(s => s.id === code)?.label ?? code;
export const customizeHref = (slug: string) => `/tourism/plan?circuit=${encodeURIComponent(slug)}`;

const CircuitCard: React.FC<{ c: any }> = ({ c }) => {
  const t = useT();
  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col" data-testid="circuit-card">
      {c.image && <img src={c.image} alt="" className="h-44 w-full object-cover" />}
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-slate-900">{c.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{c.duration_days} {t.days} · {c.stops.map((s: any) => `${s.flag ?? ''} ${s.label}`.trim()).join(' → ')}</p>
        {c.summary && <p className="text-slate-600 mt-3 text-sm flex-1">{c.summary}</p>}
        {c.price_from && (
          <p className="mt-4 text-orange-700 font-semibold" data-testid="circuit-price">
            {t.from} {formatMoney(c.price_from.price_cents)} <span className="text-xs font-normal text-slate-500">{t.forTravelers.replace('{{n}}', String(c.travelers_base))}</span>
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/tourism/circuits/${c.slug}`} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium">{t.details}</Link>
          <Link to={customizeHref(c.slug)} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold">{t.customize}</Link>
        </div>
      </div>
    </article>
  );
};

export const TourismCircuits: React.FC = () => {
  useCurrency();
  const t = useT();
  const [circuits, setCircuits] = useState<any[] | null>(null);
  useEffect(() => { apiService.getCircuits().then(r => setCircuits(r?.data ?? [])).catch(() => setCircuits([])); }, []);
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">{t.title}</h1>
        <p className="text-slate-600 mb-2 max-w-3xl">{t.intro}</p>
        <p className="text-xs text-slate-500 mb-8 max-w-3xl">{t.note}</p>
        {circuits === null ? null : circuits.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center">
            <p className="text-slate-600 mb-4">{t.empty}</p>
            <Link to="/tourism/plan" className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-medium">{t.plan}</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="circuits">{circuits.map(c => <CircuitCard key={c.slug} c={c} />)}</div>
        )}
      </div>
    </div>
  );
};

export const TourismCircuitDetail: React.FC = () => {
  useCurrency();
  const t = useT();
  const { slug = '' } = useParams();
  const [c, setC] = useState<any | null | undefined>(undefined);
  useEffect(() => { apiService.getCircuit(slug).then(r => setC(r?.data ?? null)).catch(() => setC(null)); }, [slug]);
  if (c === undefined) return null;
  if (c === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-700">{t.notFound}</p>
        <Link to="/tourism/circuits" className="underline text-orange-600">{t.back}</Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-slate-900 text-white">
        {c.image && <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative max-w-5xl mx-auto px-4 py-14">
          <Link to="/tourism/circuits" className="text-sm text-slate-300">← {t.back}</Link>
          <h1 className="text-4xl font-bold mt-3" data-testid="circuit-title">{c.title}</h1>
          <p className="mt-2 text-slate-200">{c.duration_days} {t.days} · {c.stops.map((s: any) => s.label).join(' → ')}</p>
          {c.price_from && <p className="mt-4 text-xl font-semibold text-orange-300">{t.from} {formatMoney(c.price_from.price_cents)} <span className="text-sm font-normal text-slate-300">{t.forTravelers.replace('{{n}}', String(c.travelers_base))}</span></p>}
          <Link to={customizeHref(c.slug)} className="inline-block mt-6 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold" data-testid="customize-circuit">{t.customize}</Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {c.description && <p className="text-slate-700 text-lg whitespace-pre-line">{c.description}</p>}
        <ol className="space-y-3">
          {c.stops.map((s: any, i: number) => (
            <li key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{i + 1}. {s.flag} {s.label}{s.nights ? ` — ${s.nights} ${t.nights}` : ''}</p>
              {s.cities?.length > 0 && <p className="text-sm text-slate-600 mt-1">{s.cities.join(' · ')}</p>}
              <p className="text-xs text-slate-500 mt-2">
                {s.budget_per_day && <>{t.budget} : {s.budget_per_day}</>}
                {s.visa && <> · {t.visa} : {s.visa}</>}
              </p>
            </li>
          ))}
        </ol>
        {c.highlights?.length > 0 && <ul className="list-disc pl-5 text-slate-700 space-y-1">{c.highlights.map((h: string) => <li key={h}>{h}</li>)}</ul>}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t.included}</p>
            <ul className="text-sm text-slate-700 space-y-1">{c.services.map((code: string) => <li key={code}>✓ {serviceLabel(code)}</li>)}</ul>
          </div>
          {c.best_time && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t.best}</p>
              <p className="text-slate-800">{c.best_time}</p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">{t.note}</p>
      </div>
    </div>
  );
};

export default TourismCircuits;
