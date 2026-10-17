import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LeadMagnetForm from './LeadMagnetForm';
import { trackLeadEvent } from '../../services/emailService';

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadMagnetModal: React.FC<LeadMagnetModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common');
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (isOpen && !hasViewed) {
      setHasViewed(true);
      trackLeadEvent('lead_magnet_viewed', {
        timestamp: new Date().toISOString(),
      });
    }
  }, [isOpen, hasViewed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-lg">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">&times;</span>
          </button>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">📚</span>
              </div>

              {/* Heading */}
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                {t('buttons.download_guide')}
              </h3>

              {/* Subheading */}
              <p className="text-sm text-gray-600 mb-4">
                Join 10,000+ students who successfully studied abroad
              </p>

              {/* Benefits List */}
              <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">What's Inside:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Step-by-step university application process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Visa requirements for 20+ countries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Scholarship opportunities & financial aid</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Student accommodation tips</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Cultural adaptation strategies</span>
                  </li>
                </ul>
              </div>

              {/* Form */}
              <LeadMagnetForm onSuccess={onClose} />

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 mt-4">
                We respect your privacy. Your information will never be shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadMagnetModal;
