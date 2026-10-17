import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendLeadMagnetEmail, trackLeadEvent, checkExistingLead, saveLead } from '../../services/emailService';

interface LeadMagnetFormProps {
  onSuccess: () => void;
}

const LeadMagnetForm: React.FC<LeadMagnetFormProps> = ({ onSuccess }) => {
  const { t, i18n } = useTranslation(['forms', 'common']);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    countryOfInterest: '',
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setErrorMessage('First name is required');
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      setErrorMessage('First name must be at least 2 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!formData.consent) {
      setErrorMessage('Please agree to receive emails');
      return false;
    }

    // Check if email already captured
    if (checkExistingLead(formData.email)) {
      setErrorMessage('You already received this guide! Check your inbox.');
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await sendLeadMagnetEmail({
        firstName: formData.firstName,
        email: formData.email,
        countryOfInterest: formData.countryOfInterest,
        language: i18n.language,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        saveLead(formData.email);
        trackLeadEvent('lead_captured', {
          email: formData.email,
          country: formData.countryOfInterest,
          language: i18n.language,
        });
        setSubmitState('success');
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setSubmitState('error');
        setErrorMessage(result.error || 'Failed to send email. Please try again.');
      }
    } catch (error) {
      setSubmitState('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitState === 'success') {
    return (
      <div className="text-center">
        <div className="mb-4">
          <span className="text-5xl">✅</span>
        </div>
        <h4 className="text-lg font-semibold text-green-600 mb-2">
          Check Your Email!
        </h4>
        <p className="text-sm text-gray-600">
          Your guide will arrive in 2-3 minutes. If you don't see it, check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 text-left">
          {t('forms:fields.firstName')}
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder={t('forms:placeholders.firstName')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
          {t('forms:fields.email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('forms:placeholders.email')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Country of Interest (Optional) */}
      <div>
        <label htmlFor="countryOfInterest" className="block text-sm font-medium text-gray-700 text-left">
          {t('forms:fields.countryOfInterest')} (Optional)
        </label>
        <select
          id="countryOfInterest"
          name="countryOfInterest"
          value={formData.countryOfInterest}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a country...</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="France">France</option>
          <option value="Germany">Germany</option>
          <option value="Netherlands">Netherlands</option>
          <option value="Spain">Spain</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={formData.consent}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          required
        />
        <label htmlFor="consent" className="ml-3 text-sm text-gray-700 text-left">
          I agree to receive helpful study abroad tips via email
        </label>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sending...' : 'Download My Free Guide'}
      </button>
    </form>
  );
};

export default LeadMagnetForm;
