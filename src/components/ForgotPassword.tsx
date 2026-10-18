import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

// Mot de passe oublié en deux temps : un code à 6 chiffres est envoyé par email, puis
// code + nouveau mot de passe. Le message d'envoi est le même que le compte existe ou
// non : la page ne révèle pas quels emails sont inscrits.
const inputClass =
  'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary';
const buttonClass =
  'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation('forms');
  const [searchParams] = useSearchParams();
  // ?step=code : lien d'invitation (le code a déjà été envoyé), on ouvre directement la saisie du code.
  const [step, setStep] = useState<'email' | 'reset' | 'done'>(searchParams.get('step') === 'code' && searchParams.get('email') ? 'reset' : 'email');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setBusy(true);
    try {
      await apiService.forgotPassword(email.trim());
      setInfo(t('password.code_sent'));
      setStep('reset');
    } catch {
      setError(t('password.generic_error'));
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError(t('password.password_too_short'));
    if (password !== confirm) return setError(t('password.passwords_mismatch'));
    setBusy(true);
    try {
      await apiService.resetPassword(email.trim(), code.trim(), password);
      setStep('done');
    } catch (err: any) {
      setError(err?.status === 400 ? t('password.invalid_code') : t('password.generic_error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{t('password.forgot_title')}</h2>
        {step === 'email' && <p className="mt-2 text-center text-sm text-gray-600">{t('password.forgot_subtitle')}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
          {error && <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {info && step === 'reset' && <div role="status" className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">{info}</div>}

          {step === 'email' && (
            <form className="space-y-6" onSubmit={sendCode}>
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700">{t('password.email_label')}</label>
                <input id="fp-email" type="email" required autoComplete="email" value={email}
                  onChange={e => setEmail(e.target.value)} className={`mt-1 ${inputClass}`} />
              </div>
              <button type="submit" disabled={busy} className={buttonClass}>{t('password.send_code')}</button>
            </form>
          )}

          {step === 'reset' && (
            <form className="space-y-6" onSubmit={reset}>
              <div>
                <label htmlFor="fp-code" className="block text-sm font-medium text-gray-700">{t('password.code_label')}</label>
                <input id="fp-code" inputMode="numeric" maxLength={6} required value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className={`mt-1 ${inputClass} tracking-[0.4em] text-center`} />
              </div>
              <div>
                <label htmlFor="fp-password" className="block text-sm font-medium text-gray-700">{t('password.new_password')}</label>
                <input id="fp-password" type="password" required autoComplete="new-password" value={password}
                  onChange={e => setPassword(e.target.value)} className={`mt-1 ${inputClass}`} />
              </div>
              <div>
                <label htmlFor="fp-confirm" className="block text-sm font-medium text-gray-700">{t('password.confirm_password')}</label>
                <input id="fp-confirm" type="password" required autoComplete="new-password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} className={`mt-1 ${inputClass}`} />
              </div>
              <button type="submit" disabled={busy} className={buttonClass}>{t('password.reset_button')}</button>
              <button type="button" disabled={busy} onClick={() => sendCode()} className="w-full text-sm text-secondary hover:text-primary underline">
                {t('register.resend_code')}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div role="status" className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">{t('password.reset_success')}</div>
          )}

          <p className="text-center text-sm">
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">{t('password.back_to_login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
