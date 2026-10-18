import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

type Feedback = { tone: 'success' | 'error'; text: string } | null;

const inputClass = 'mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm';

const Message: React.FC<{ feedback: Feedback }> = ({ feedback }) =>
  feedback ? (
    <p role="status" className={`text-sm ${feedback.tone === 'success' ? 'text-green-700' : 'text-red-700'}`}>{feedback.text}</p>
  ) : null;

/**
 * Sécurité du compte client : mot de passe (ancien exigé) et email (mot de passe exigé, nouvelle
 * adresse à vérifier). Mêmes routes que l'écran Paramètres de l'admin (story 9.5).
 */
const AccountSecurity: React.FC<{ email: string }> = ({ email }) => {
  const { t } = useTranslation('profile');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState<Feedback>(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailFeedback, setEmailFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 6) { setPwdFeedback({ tone: 'error', text: t('security.password_short') }); return; }
    setBusy(true);
    try {
      await apiService.changePassword(current, next);
      setPwdFeedback({ tone: 'success', text: t('security.password_changed') });
      setCurrent(''); setNext('');
    } catch (err: any) {
      setPwdFeedback({ tone: 'error', text: /current password/i.test(err?.message ?? '') ? t('security.password_wrong') : t('security.error') });
    } finally { setBusy(false); }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) { setEmailFeedback({ tone: 'error', text: t('security.email_invalid') }); return; }
    setBusy(true);
    try {
      await apiService.changeEmail(newEmail.trim(), emailPassword);
      setEmailFeedback({ tone: 'success', text: t('security.email_changed') });
      setNewEmail(''); setEmailPassword('');
    } catch (err: any) {
      const msg = err?.message ?? '';
      setEmailFeedback({
        tone: 'error',
        text: /invalid password/i.test(msg) ? t('security.password_wrong') : /in use/i.test(msg) ? t('security.email_taken') : t('security.error'),
      });
    } finally { setBusy(false); }
  };

  return (
    <section className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 p-6" aria-labelledby="account-security">
      <h2 id="account-security" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <LockClosedIcon className="h-5 w-5 text-gray-500" /> {t('security.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={changePassword} className="space-y-3">
          <h3 className="font-medium text-gray-800">{t('security.password_title')}</h3>
          <label className="block text-sm text-gray-700">{t('security.current')}
            <input type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm text-gray-700">{t('security.new')}
            <input type="password" autoComplete="new-password" required value={next} onChange={e => setNext(e.target.value)} placeholder={t('security.new_hint')} className={inputClass} />
          </label>
          <Message feedback={pwdFeedback} />
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
            {t('security.change_password')}
          </button>
        </form>

        <form onSubmit={changeEmail} className="space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-2"><EnvelopeIcon className="h-4 w-4 text-gray-400" />{t('security.email_title')}</h3>
          <p className="text-xs text-gray-500">{email}</p>
          <label className="block text-sm text-gray-700">{t('security.new_email')}
            <input type="email" autoComplete="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm text-gray-700">{t('security.confirm_password')}
            <input type="password" autoComplete="current-password" required value={emailPassword} onChange={e => setEmailPassword(e.target.value)} className={inputClass} />
          </label>
          <Message feedback={emailFeedback} />
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-md text-sm font-medium text-primary border border-primary hover:bg-primary/5 disabled:opacity-50">
            {t('security.change_email')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AccountSecurity;
