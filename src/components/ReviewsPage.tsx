import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Avis clients vérifiés : publiés uniquement par des clients ayant payé un accompagnement,
 * relus avant publication, jamais modifiés. Moyenne et nombre d'avis RÉELS (aucun chiffre affiché
 * tant qu'il n'y a pas d'avis).
 */
const T = {
  fr: { title: 'Avis clients', intro: 'Seuls les clients ayant payé un accompagnement Midzo peuvent laisser un avis. Chaque avis est relu avant publication, sans modification.', all: 'Tous', study: 'Études', tourism: 'Voyages', consultation: 'Consultation', empty: 'Aucun avis publié pour le moment. Les premiers avis de nos clients apparaîtront ici après relecture.', verified: 'Client vérifié', reply: 'Réponse de Midzo', average: 'Note moyenne', reviews: 'avis', write: 'Donner mon avis', writeTitle: 'Votre avis sur votre accompagnement', rating: 'Note', titleLabel: 'Titre (facultatif)', body: 'Votre expérience (20 caractères minimum)', destination: 'Destination (facultatif)', send: 'Envoyer mon avis', sent: 'Merci ! Votre avis sera publié après relecture.', notEligible: 'Vous pourrez laisser un avis après le paiement d’un accompagnement.', login: 'Connectez-vous pour laisser un avis', mine: 'Mes avis', status: { pending: 'en relecture', approved: 'publié', rejected: 'non publié' }, error: 'Envoi impossible. Vérifiez votre texte et réessayez.' },
  en: { title: 'Customer reviews', intro: 'Only customers who paid for Midzo support can leave a review. Each review is checked before publication, without changes.', all: 'All', study: 'Studies', tourism: 'Travel', consultation: 'Consultation', empty: 'No review published yet. Our customers’ first reviews will appear here after checking.', verified: 'Verified customer', reply: 'Midzo’s reply', average: 'Average rating', reviews: 'reviews', write: 'Write a review', writeTitle: 'Your review of your support', rating: 'Rating', titleLabel: 'Title (optional)', body: 'Your experience (at least 20 characters)', destination: 'Destination (optional)', send: 'Send my review', sent: 'Thank you! Your review will be published after checking.', notEligible: 'You can leave a review after paying for support.', login: 'Sign in to leave a review', mine: 'My reviews', status: { pending: 'being checked', approved: 'published', rejected: 'not published' }, error: 'Could not send. Check your text and try again.' },
  de: { title: 'Kundenbewertungen', intro: 'Nur Kunden mit bezahlter Midzo-Begleitung können bewerten. Jede Bewertung wird vor der Veröffentlichung geprüft, ohne Änderung.', all: 'Alle', study: 'Studium', tourism: 'Reisen', consultation: 'Beratung', empty: 'Noch keine Bewertung veröffentlicht. Die ersten Bewertungen unserer Kunden erscheinen hier nach Prüfung.', verified: 'Geprüfter Kunde', reply: 'Antwort von Midzo', average: 'Durchschnitt', reviews: 'Bewertungen', write: 'Bewertung schreiben', writeTitle: 'Ihre Bewertung der Begleitung', rating: 'Note', titleLabel: 'Titel (optional)', body: 'Ihre Erfahrung (mind. 20 Zeichen)', destination: 'Reiseziel (optional)', send: 'Bewertung senden', sent: 'Danke! Ihre Bewertung wird nach Prüfung veröffentlicht.', notEligible: 'Sie können nach der Bezahlung einer Begleitung bewerten.', login: 'Anmelden, um zu bewerten', mine: 'Meine Bewertungen', status: { pending: 'in Prüfung', approved: 'veröffentlicht', rejected: 'nicht veröffentlicht' }, error: 'Senden nicht möglich. Text prüfen und erneut versuchen.' },
};

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span aria-label={`${value}/5`} className="text-amber-500">{'★'.repeat(Math.round(value))}<span className="text-gray-300">{'★'.repeat(5 - Math.round(value))}</span></span>
);

const ReviewsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : i18n.language?.startsWith('de') ? 'de' : 'en') as keyof typeof T;
  const t = T[lang];
  const { user } = useAuth();
  const [service, setService] = useState('');
  const [list, setList] = useState<any[] | null>(null);
  const [stats, setStats] = useState<{ count: number; average: number | null }>({ count: 0, average: null });
  const [mine, setMine] = useState<{ reviews: any[]; eligible: any[] } | null>(null);
  const [form, setForm] = useState({ rating: 5, title: '', body: '', destination: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    apiService.getReviews({ service: service || undefined }).then(r => { setList(r?.data ?? []); setStats(r?.stats ?? { count: 0, average: null }); }).catch(() => setList([]));
  }, [service]);
  useEffect(load, [load]);
  useEffect(() => {
    if (!user) { setMine(null); return; }
    apiService.getMyReviews().then(r => setMine(r?.data ?? null)).catch(() => setMine(null));
  }, [user]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await apiService.postReview({ rating: form.rating, title: form.title || undefined, body: form.body, destination: form.destination || undefined, purchase_id: mine?.eligible?.[0]?.purchase_id });
      setMsg({ ok: true, text: t.sent });
      setForm({ rating: 5, title: '', body: '', destination: '' });
      const r = await apiService.getMyReviews(); setMine(r?.data ?? null);
    } catch {
      setMsg({ ok: false, text: t.error });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{t.title}</h1>
        <p className="text-gray-600 mb-6">{t.intro}</p>

        {stats.count > 0 && stats.average !== null && (
          <p className="mb-6 text-lg text-gray-800" data-testid="reviews-stats"><Stars value={stats.average} /> <strong>{stats.average.toFixed(1)}/5</strong> · {stats.count} {t.reviews}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={t.all}>
          {['', 'study', 'tourism', 'consultation'].map(s => (
            <button key={s || 'all'} type="button" aria-pressed={service === s} onClick={() => setService(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${service === s ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
              {s ? t[s as 'study'] : t.all}
            </button>
          ))}
        </div>

        <div className="space-y-4" data-testid="reviews-list">
          {list !== null && list.length === 0 && <p className="bg-white rounded-xl border p-6 text-gray-600">{t.empty}</p>}
          {list?.map(r => (
            <article key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-gray-900">{r.author}{r.country ? ` · ${r.country}` : ''}</p>
                <Stars value={r.rating} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{r.verified && <span className="text-emerald-700 font-medium">✓ {t.verified}</span>} · {t[r.service as 'study'] ?? r.service}{r.destination ? ` · ${r.destination}` : ''} · {r.published_at ? new Date(r.published_at).toLocaleDateString(lang) : ''}</p>
              {r.title && <h2 className="font-semibold text-gray-900 mt-3">{r.title}</h2>}
              <p className="text-gray-700 mt-2 whitespace-pre-line">{r.body}</p>
              {r.admin_reply && <p className="mt-3 text-sm bg-gray-50 border-l-4 border-primary p-3"><strong>{t.reply} :</strong> {r.admin_reply}</p>}
            </article>
          ))}
        </div>

        <section className="mt-10 bg-white rounded-2xl border border-gray-100 p-6" aria-labelledby="write-review">
          <h2 id="write-review" className="text-xl font-bold text-gray-900 mb-3">{t.writeTitle}</h2>
          {!user ? (
            <Link to="/login?redirect=%2Favis" className="text-primary underline">{t.login}</Link>
          ) : mine && mine.eligible.length > 0 ? (
            <form onSubmit={send} className="space-y-3" data-testid="review-form">
              <label className="block text-sm text-gray-700">{t.rating}
                <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="mt-1 block border-gray-300 rounded-md">
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}
                </select>
              </label>
              <label className="block text-sm text-gray-700">{t.titleLabel}
                <input value={form.title} maxLength={120} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full border-gray-300 rounded-md" />
              </label>
              <label className="block text-sm text-gray-700">{t.destination}
                <input value={form.destination} maxLength={80} onChange={e => setForm({ ...form, destination: e.target.value })} className="mt-1 w-full border-gray-300 rounded-md" />
              </label>
              <label className="block text-sm text-gray-700">{t.body}
                <textarea required minLength={20} maxLength={3000} rows={5} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="mt-1 w-full border-gray-300 rounded-md" />
              </label>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">{t.send}</button>
            </form>
          ) : (
            <p className="text-gray-600">{t.notEligible}</p>
          )}
          {msg && <p role="status" className={`mt-3 text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</p>}
          {mine && mine.reviews.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">{t.mine}</p>
              <ul className="text-sm text-gray-600 space-y-1" data-testid="my-reviews">
                {mine.reviews.map(r => <li key={r.id}>{'★'.repeat(r.rating)} — {r.title || r.body.slice(0, 60)} <em>({t.status[r.status as 'pending'] ?? r.status})</em></li>)}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReviewsPage;
