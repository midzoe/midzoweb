import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

/** Retour après connexion : un chemin interne uniquement (pas d'URL externe ni `//hôte`). */
const safeRedirect = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';

const Login: React.FC = () => {
  const { t } = useTranslation('forms');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login, verifyEmail, isLoading } = useAuth();

  // Compte créé mais email jamais vérifié (page fermée avant de saisir le code) :
  // sans ce panneau, la personne restait bloquée hors de son compte.
  const [verifyEmailAddress, setVerifyEmailAddress] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(identifier, password);
    if (result.success) {
      navigate(safeRedirect(redirectParam));
    } else if (/not verified/i.test(result.error ?? '')) {
      setVerifyEmailAddress(identifier.includes('@') ? identifier.trim() : '');
    } else {
      setError(t('messages.login_failed'));
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await apiService.resendVerificationCode(verifyEmailAddress ?? '');
      setVerifyMessage(t('register.resend_success'));
    } catch {
      setError(t('password.generic_error'));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await verifyEmail(verifyEmailAddress ?? '', code.trim());
    if (result.success) navigate(safeRedirect(redirectParam));
    else setError(t('register.verify_error'));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t('buttons.login')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {verifyEmailAddress !== null && (
            <form className="space-y-4 mb-6 rounded-md border border-amber-200 bg-amber-50 p-4" onSubmit={handleVerify}>
              <p className="text-sm text-amber-900">{t('password.not_verified')}</p>
              <div>
                <label htmlFor="verify-email" className="block text-sm font-medium text-gray-700">{t('password.email_label')}</label>
                <input id="verify-email" type="email" required value={verifyEmailAddress}
                  onChange={(e) => setVerifyEmailAddress(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label htmlFor="verify-code" className="block text-sm font-medium text-gray-700">{t('register.verify_code_label')}</label>
                <input id="verify-code" inputMode="numeric" maxLength={6} required value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary tracking-[0.4em] text-center" />
              </div>
              {verifyMessage && <p className="text-sm text-emerald-700">{verifyMessage}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={isLoading} className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
                  {t('register.verify_button')}
                </button>
                <button type="button" onClick={handleResend} disabled={!verifyEmailAddress} className="flex-1 py-2 px-4 rounded-md text-sm font-medium border border-primary text-primary disabled:opacity-50">
                  {t('register.resend_code')}
                </button>
              </div>
            </form>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                {t('fields.identifier')}
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('fields.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? t('messages.loading') : t('buttons.login')}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link to={identifier.includes('@') ? `/forgot-password?email=${encodeURIComponent(identifier.trim())}` : '/forgot-password'}
              className="font-medium text-secondary hover:text-primary">
              {t('password.forgot_link')}
            </Link>
          </p>
          <p className="mt-6 text-center text-sm text-gray-600">
            {t('register.no_account')}{' '}
            <Link to={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'} className="font-medium text-primary hover:text-primary/80">
              {t('buttons.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;