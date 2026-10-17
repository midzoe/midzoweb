import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

type Step = 'form' | 'verify';

const Register: React.FC = () => {
  const { t } = useTranslation('forms');
  const { register, verifyEmail, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  // Verify step state
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!formData.firstName.trim()) next.firstName = t('validation.required');
    else if (formData.firstName.trim().length < 2) next.firstName = t('validation.name_short');

    if (!formData.lastName.trim()) next.lastName = t('validation.required');
    else if (formData.lastName.trim().length < 2) next.lastName = t('validation.name_short');

    if (!formData.email.trim()) next.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = t('validation.email_invalid');

    if (!formData.password) next.password = t('validation.required');
    else if (formData.password.length < 6) next.password = t('validation.password_short');

    if (!formData.confirmPassword) next.confirmPassword = t('validation.required');
    else if (formData.password !== formData.confirmPassword) next.confirmPassword = t('validation.passwords_mismatch');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    // Auto-generate username from email
    const username = formData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    const result = await register({
      username,
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      phone: formData.phone.trim() || undefined,
    });

    if (result.success) {
      setEmail(formData.email.trim());
      setStep('verify');
    } else {
      const err = result.error || '';
      if (err.toLowerCase().includes('email')) {
        setGlobalError(t('register.error_email_exists'));
      } else {
        setGlobalError(t('register.error_generic'));
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    const result = await verifyEmail(email, code.trim());
    if (result.success) {
      navigate('/dashboard');
    } else {
      setVerifyError(t('register.verify_error'));
    }
  };

  const handleResend = async () => {
    setResendMessage('');
    setVerifyError('');
    try {
      await apiService.resendVerificationCode(email);
      setResendMessage(t('register.resend_success'));
    } catch {
      setVerifyError(t('register.error_generic'));
    }
  };

  const inputClass = (field: string) =>
    `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  /* ── Step 2: Email verification ── */
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center text-5xl mb-4">✉️</div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('register.verify_title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('register.verify_subtitle', { email })}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-5" onSubmit={handleVerify}>
              {verifyError && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {verifyError}
                </div>
              )}
              {resendMessage && (
                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                  {resendMessage}
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  {t('register.verify_code_label')}
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('register.verify_code_placeholder')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-center text-2xl tracking-widest font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length < 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? t('messages.loading') : t('register.verify_button')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {t('register.resend_code')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 1: Registration form ── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t('register.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('register.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>

            {globalError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {globalError}
              </div>
            )}

            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('fields.firstName')}
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t('placeholders.firstName')}
                    className={inputClass('firstName')}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('fields.lastName')}
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t('placeholders.lastName')}
                    className={inputClass('lastName')}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('fields.email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('placeholders.email')}
                  className={inputClass('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('fields.phone')}{' '}
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('placeholders.phone')}
                  className={inputClass('phone')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('fields.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('placeholders.password')}
                  className={inputClass('password')}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('fields.confirmPassword')}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass('confirmPassword')}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? t('messages.loading') : t('buttons.register')}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('register.have_account')}{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              {t('register.sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
