import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingTrip?: any;
  onSave: (tripData: any) => void;
  onDelete?: () => void;
}

const EMPTY = { title: '', destination: '', startDate: '', endDate: '', status: 'ongoing' };

/** Les dates arrivent du backend en ISO complet ; un champ `type="date"` n'accepte que AAAA-MM-JJ. */
const toDateInput = (value?: string) => (value ? String(value).slice(0, 10) : '');

const fieldClass = 'w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary';

const TripForm: React.FC<TripFormProps> = ({ isOpen, onClose, existingTrip, onSave, onDelete }) => {
  const { t } = useTranslation('dashboard');
  const [formData, setFormData] = useState(EMPTY);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Le formulaire reste monté entre deux ouvertures : on le réinitialise à chaque ouverture,
  // sinon « Nouveau voyage » reprenait le voyage modifié juste avant (et créait un doublon).
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setShowDeleteConfirm(false);
    setFormData(existingTrip
      ? {
          title: existingTrip.title ?? '',
          destination: existingTrip.destination ?? '',
          startDate: toDateInput(existingTrip.startDate),
          endDate: toDateInput(existingTrip.endDate),
          status: existingTrip.status === 'completed' ? 'completed' : 'ongoing',
        }
      : EMPTY);
  }, [isOpen, existingTrip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setError(t('trip_form.dates_error'));
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full" role="dialog" aria-modal="true" aria-labelledby="trip-form-title">
        <div className="flex justify-between items-center mb-6">
          <h2 id="trip-form-title" className="text-2xl font-bold text-gray-900">
            {existingTrip ? t('trip_form.edit_title') : t('trip_form.new_title')}
          </h2>
          <div className="flex items-center gap-2">
            {existingTrip && onDelete && (
              <button type="button" onClick={() => setShowDeleteConfirm(true)} aria-label={t('delete_trip')} title={t('delete_trip')}
                className="text-red-500 hover:text-red-700">
                <TrashIcon className="w-6 h-6" />
              </button>
            )}
            <button type="button" onClick={onClose} aria-label={t('trip_form.close')} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="trip-title" className="block text-sm font-medium text-gray-700 mb-2">{t('trip_form.title')}</label>
            <input id="trip-title" type="text" value={formData.title} required className={fieldClass}
              onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div>
            <label htmlFor="trip-destination" className="block text-sm font-medium text-gray-700 mb-2">{t('trip_form.destination')}</label>
            {/* La destination se fixe à la création ; l'espace voyage gère les étapes multiples. */}
            <input id="trip-destination" type="text" value={formData.destination} required={!existingTrip} disabled={Boolean(existingTrip)}
              className={`${fieldClass} disabled:bg-gray-50 disabled:text-gray-500`}
              onChange={e => setFormData({ ...formData, destination: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-start" className="block text-sm font-medium text-gray-700 mb-2">{t('trip_form.start')}</label>
              <input id="trip-start" type="date" value={formData.startDate} required className={fieldClass}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div>
              <label htmlFor="trip-end" className="block text-sm font-medium text-gray-700 mb-2">{t('trip_form.end')}</label>
              <input id="trip-end" type="date" value={formData.endDate} required min={formData.startDate || undefined} className={fieldClass}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>

          <div>
            <label htmlFor="trip-status" className="block text-sm font-medium text-gray-700 mb-2">{t('trip_form.status')}</label>
            <select id="trip-status" value={formData.status} className={fieldClass}
              onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value="ongoing">{t('trip_status.ongoing')}</option>
              <option value="completed">{t('trip_status.completed')}</option>
            </select>
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              {t('trip_form.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
              {existingTrip ? t('trip_form.save') : t('trip_form.add')}
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full" role="alertdialog" aria-modal="true">
              <h3 className="text-xl font-semibold mb-4">{t('trip_form.delete_title')}</h3>
              <p className="text-gray-600 mb-6">{t('trip_form.delete_text')}</p>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  {t('trip_form.cancel')}
                </button>
                <button type="button" onClick={() => { setShowDeleteConfirm(false); onDelete?.(); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  {t('delete_trip')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripForm;
