import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';

interface SubjectCategory {
  id: string;
  name: string;
  subcategories: { id: number | string; name: string; isOther?: boolean }[];
}

const Contact: React.FC = () => {
  const { t } = useTranslation('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subcategory: '',
    message: ''
  });
  // Story 8.2/8.6 : arbre des sujets servi par le backend (catégories → sous-catégories + « Autre »).
  const [subjects, setSubjects] = useState<SubjectCategory[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    apiService
      .getContactSubjects()
      .then((res) => setSubjects(res?.subjects || []))
      .catch(() => setSubjects([]));
  }, []);

  const currentSubcategories = useMemo(
    () => subjects.find((s) => s.id === formData.category)?.subcategories || [],
    [subjects, formData.category]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const selected = subjects.find((s) => s.id === formData.category);
      await apiService.sendContact({
        name: formData.name,
        email: formData.email,
        subject: selected?.name,
        category: formData.category || undefined,
        subcategory: formData.subcategory || undefined,
        message: formData.message,
      });
      setStatus('sent');
      setFormData({ name: '', email: '', category: '', subcategory: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Une erreur est survenue.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Changer de catégorie réinitialise la sous-catégorie (le filtre se pré-sélectionne, AC 8.6).
    if (name === 'category') {
      setFormData((prev) => ({ ...prev, category: value, subcategory: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const offices = [
    {
      city: 'London',
      country: 'United Kingdom',
      address: '123 Business Street, London SW1A 1AA',
      phone: '+44 20 1234 5678',
      email: 'london@midzo.com',
      hours: '9:00 AM - 6:00 PM GMT'
    },
    {
      city: 'Paris',
      country: 'France',
      address: '45 Rue de Commerce, 75015 Paris',
      phone: '+33 1 23 45 67 89',
      email: 'paris@midzo.com',
      hours: '9:00 AM - 6:00 PM CET'
    },
    {
      city: 'New York',
      country: 'United States',
      address: '789 Fifth Avenue, New York, NY 10022',
      phone: '+1 212 555 0123',
      email: 'newyork@midzo.com',
      hours: '9:00 AM - 6:00 PM EST'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">{t('page_title')}</h1>
          <p className="text-xl text-gray-600">
            {t('page_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('form_title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.subject')}
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {currentSubcategories.length > 0 && (
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('fields.subcategory', { defaultValue: 'Sous-catégorie' })}
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">—</option>
                    {currentSubcategories.map((sub) => (
                      <option key={String(sub.id)} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? '…' : t('buttons.send')}
              </button>

              {status === 'sent' && (
                <p className="text-green-600 text-sm text-center">
                  {t('feedback.sent', { defaultValue: 'Message envoyé, merci ! Nous revenons vers vous rapidement.' })}
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-sm text-center">{errorMsg}</p>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* General Contact */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">General Contact</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">info@midzo.com</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h2>
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {office.city}, {office.country}
                    </h3>
                    <div className="space-y-2 text-gray-600">
                      <p>{office.address}</p>
                      <p>{t('info.phone')}: {office.phone}</p>
                      <p>{t('info.email')}: {office.email}</p>
                      <p>{t('info.hours')}: {office.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Us</h2>
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
            {/* Map would be integrated here */}
            <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Interactive Map Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;