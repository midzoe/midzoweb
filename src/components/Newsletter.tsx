import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface NewsletterProps {
  type: 'study' | 'tourism';
  title?: string;
  subtitle?: string;
  className?: string;
}

const defaults = {
  study: {
    title: 'Newsletter Études',
    subtitle: 'Recevez les meilleures opportunités académiques, bourses et conseils pour étudier à l\'étranger.',
    color: 'bg-primary',
    badge: 'Études',
  },
  tourism: {
    title: 'Newsletter Tourisme',
    subtitle: 'Destinations, bons plans voyages et événements touristiques directement dans votre boîte mail.',
    color: 'bg-orange-500',
    badge: 'Tourisme',
  },
};

const Newsletter: React.FC<NewsletterProps> = ({ type, title, subtitle, className = '' }) => {
  const { user, updateUserLocally } = useAuth();
  const config = defaults[type];

  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isAlreadySubscribed =
    (type === 'study' && user?.newsletter_study) ||
    (type === 'tourism' && user?.newsletter_tourism);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await apiService.subscribeNewsletter(type, email);
      setSuccess(true);
      if (user) {
        updateUserLocally(
          type === 'study' ? { newsletter_study: true } : { newsletter_tourism: true }
        );
      }
    } catch {
      setError('Une erreur est survenue. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadySubscribed || success) {
    return (
      <div className={`rounded-2xl ${config.color} p-6 text-white ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-8 w-8 shrink-0" />
          <div>
            <p className="font-semibold text-lg">Vous êtes abonné·e !</p>
            <p className="text-white/80 text-sm">Newsletter {config.badge} — vous recevrez nos prochains envois.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl ${config.color} p-6 text-white ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg shrink-0">
          <EnvelopeIcon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <span className="inline-block text-xs font-semibold bg-white/20 rounded-full px-3 py-0.5 mb-2">
            {config.badge}
          </span>
          <h3 className="text-lg font-bold mb-1">{title || config.title}</h3>
          <p className="text-white/80 text-sm mb-4">{subtitle || config.subtitle}</p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="flex-1 px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? '...' : "S'abonner"}
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-white/80">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
