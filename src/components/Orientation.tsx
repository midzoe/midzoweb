import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

// Story 10.2 (FR34/FR35) : contenu d'orientation études & formations.
// Le lieu de formation (`location`) n'est renvoyé par le backend qu'aux premium.
const TYPES = [
  { key: '', label: 'Tout' },
  { key: 'guide', label: 'Guides' },
  { key: 'book', label: 'Livres' },
  { key: 'company', label: 'Organismes' },
  { key: 'certification', label: 'Certifications' },
];

const TYPE_LABELS: Record<string, string> = {
  guide: 'Guide',
  book: 'Livre',
  company: 'Organisme',
  certification: 'Certification',
};

const Orientation: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [error, setError] = useState('');

  // Les catégories sont celles saisies en admin : on les lit une fois, sans filtre,
  // pour que les puces restent stables quand l'utilisateur change de type.
  useEffect(() => {
    apiService
      .getOrientation()
      .then(res => {
        const all = (res?.data || [])
          .map((r: any) => r.category)
          .filter((c: string | null): c is string => !!c);
        setCategories([...new Set<string>(all)].sort((a, b) => a.localeCompare(b, 'fr')));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params: { type?: string; category?: string } = {};
    if (type) params.type = type;
    if (category) params.category = category;
    apiService
      .getOrientation(Object.keys(params).length ? params : undefined)
      .then(res => {
        setItems(res?.data || []);
        setPremium(!!res?.premium);
      })
      .catch(() => setError('Impossible de charger les ressources.'))
      .finally(() => setLoading(false));
  }, [type, category]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-3">Orientation & Formations</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Guides officiels, ouvrages de référence, organismes de formation et certifications
            pour construire votre parcours d'études ou de carrière à l'étranger.
          </p>
          <Link to="/services/orientation" className="inline-block mt-4 text-sm font-medium text-secondary hover:underline">
            Besoin d'un accompagnement personnalisé ? Découvrir le service d'orientation →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {TYPES.map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${type === t.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button onClick={() => setCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${category === '' ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-500 border-gray-200 hover:border-secondary'}`}>
              Tous les domaines
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${category === c ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-500 border-gray-200 hover:border-secondary'}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {!premium && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
            Passez <Link to="/premium" className="font-semibold underline">premium</Link> pour voir le lieu des formations.
          </div>
        )}

        {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucune ressource disponible pour le moment.</div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {items.length} ressource{items.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(r => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block text-xs font-semibold bg-primary/10 text-primary rounded-full px-3 py-0.5">
                      {TYPE_LABELS[r.type] || r.type}
                    </span>
                    {r.category && (
                      <span className="inline-block text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-3 py-0.5">
                        {r.category}
                      </span>
                    )}
                  </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Orientation;
