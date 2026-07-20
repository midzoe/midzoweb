import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

// Story 10.2 (FR34/FR35) : contenu d'orientation études & formations.
// Le lieu de formation (`location`) n'est renvoyé par le backend qu'aux premium.
const TYPES = [
  { key: '', label: 'Tout' },
  { key: 'guide', label: 'Guides' },
  { key: 'book', label: 'Livres' },
  { key: 'company', label: 'Entreprises' },
  { key: 'certification', label: 'Certifications' },
];

const Orientation: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiService
      .getOrientation(type ? { type } : undefined)
      .then(res => {
        setItems(res?.data || []);
        setPremium(!!res?.premium);
      })
      .catch(() => setError('Impossible de charger les ressources.'))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-3">Orientation & Formations</h1>
          <p className="text-lg text-gray-600">Guides, formations, entreprises et certifications pour construire votre parcours.</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TYPES.map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${type === t.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {!premium && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
            Passez <strong>premium</strong> pour voir le lieu des formations.
          </div>
        )}

        {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucune ressource disponible pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                <span className="inline-block self-start text-xs font-semibold bg-primary/10 text-primary rounded-full px-3 py-0.5 mb-3">
                  {r.type}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{r.title}</h3>
                {r.provider && <p className="text-sm text-gray-500 mb-2">{r.provider}</p>}
                {r.description && <p className="text-sm text-gray-600 mb-3 flex-1">{r.description}</p>}
                {r.location && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Lieu :</span> {r.location}
                  </p>
                )}
                {r.link && (
                  <a href={r.link} target="_blank" rel="noreferrer"
                    className="mt-auto text-sm text-primary font-medium hover:underline">
                    En savoir plus →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orientation;
