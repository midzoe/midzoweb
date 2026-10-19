import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

/**
 * Pied de page. Aucune promesse non vérifiable (nombre de clients, note, certification) :
 * seuls des faits (paiement Stripe) et des liens vers de vraies pages. Les réseaux sociaux
 * s'affichent uniquement si leur adresse est configurée (VITE_SOCIAL_*).
 */
const SOCIAL = [
  { key: 'facebook', label: 'Facebook', url: import.meta.env.VITE_SOCIAL_FACEBOOK as string | undefined },
  { key: 'instagram', label: 'Instagram', url: import.meta.env.VITE_SOCIAL_INSTAGRAM as string | undefined },
  { key: 'linkedin', label: 'LinkedIn', url: import.meta.env.VITE_SOCIAL_LINKEDIN as string | undefined },
  { key: 'tiktok', label: 'TikTok', url: import.meta.env.VITE_SOCIAL_TIKTOK as string | undefined },
  { key: 'whatsapp', label: 'WhatsApp', url: import.meta.env.VITE_WHATSAPP_URL as string | undefined },
].filter(s => s.url);

const Footer: React.FC = () => {
  const { t } = useTranslation('footer');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'study' | 'tourism'>('study');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const year = new Date().getFullYear();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('busy');
    try {
      await apiService.subscribeNewsletter(type, email.trim());
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  const col = (title: string, links: [string, string][]) => (
    <div>
      <h4 className="font-semibold mb-5">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([to, label]) => (
          <li key={to + label}><Link to={to} className="text-gray-400 hover:text-white transition">{label}</Link></li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-primary to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-1">{t('newsletter_title')}</h3>
            <p className="text-white/90 text-sm">{t('newsletter_text')}</p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
            <select aria-label={t('newsletter_title')} value={type} onChange={e => setType(e.target.value as 'study' | 'tourism')}
              className="px-3 py-3 rounded-lg text-gray-900 bg-white">
              <option value="study">{t('newsletter_study')}</option>
              <option value="tourism">{t('newsletter_tourism')}</option>
            </select>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t('newsletter_placeholder')}
              aria-label={t('newsletter_placeholder')} className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none" />
            <button type="submit" disabled={state === 'busy'}
              className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60">
              {t('subscribe')}
            </button>
          </form>
          {state === 'done' && <p role="status" className="md:col-start-2 text-sm">✓ {t('subscribed')}</p>}
          {state === 'error' && <p role="alert" className="md:col-start-2 text-sm">{t('subscribe_error')}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌍</span>
              <span className="text-2xl font-bold">Midzo</span>
            </div>
            <p className="text-gray-400 text-sm mb-5">{t('tagline')}</p>
            {SOCIAL.length > 0 && (
              <div className="flex flex-wrap gap-3 text-sm">
                {SOCIAL.map(s => (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white underline">{s.label}</a>
                ))}
              </div>
            )}
          </div>
          {col(t('col_midzo'), [['/', t('home')], ['/about', t('about')], ['/services', t('services')], ['/packages', t('packages')], ['/contact', t('contact')], ['/blog', t('blog')], ['/faq', t('faq')]])}
          {col(t('col_study'), [['/study', t('study_plan')], ['/services/university-finder', t('university_finder')], ['/services/student-visa', t('student_visa')], ['/services/student-accommodation', t('housing')]])}
          {col(t('col_travel'), [['/tourism/plan', t('travel_plan')], ['/tourism/circuits', t('circuits')], ['/tourism', t('destinations')], ['/services/tourism-events', t('events')], ['/avis', t('reviews')]])}
          {col(t('col_legal'), [['/cgv', t('cgv')], ['/remboursement', t('refund')], ['/mentions-legales', t('legal_notice')], ['/terms', t('terms')], ['/privacy', t('privacy')]])}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <p>&copy; {year} Midzo. {t('rights')}</p>
          <p>🔒 {t('secure_payment')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
