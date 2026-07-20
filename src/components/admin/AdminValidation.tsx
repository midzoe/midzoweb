import React, { useCallback, useEffect, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

interface QueueItem {
  entity: string;
  id: number;
  label: string;
  source: string | null;
}

const ENTITY_LABELS: Record<string, string> = {
  'study-country': "Pays d'étude",
  'tourism-country': 'Pays tourisme',
  'tourism-program': 'Programme tourisme',
  country: 'Pays (fiche)',
};

// Story 9.7 (FR37) : file de validation des brouillons (isValidated=false), tous epics confondus.
const AdminValidation: React.FC = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetValidationQueue();
      setItems(res?.items || []);
      setCounts(res?.counts || {});
    } catch {
      setError('Impossible de charger la file de validation.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const validate = async (item: QueueItem) => {
    setValidating(`${item.entity}:${item.id}`);
    try {
      await apiService.adminValidate(item.entity, item.id, true);
      setItems(prev => prev.filter(i => !(i.entity === item.entity && i.id === item.id)));
    } catch {
      setError('Échec de la validation.');
    } finally {
      setValidating(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">File de validation</h1>
        <button onClick={load} className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50">Rafraîchir</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-white rounded-lg shadow-sm px-4 py-2 text-sm">
            <span className="text-gray-500">{ENTITY_LABELS[k] || k}</span>{' '}
            <span className="font-semibold text-gray-900">{v}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Élément</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Aucun brouillon en attente 🎉</td></tr>
            ) : items.map(item => (
              <tr key={`${item.entity}:${item.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{ENTITY_LABELS[item.entity] || item.entity}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{item.label}</td>
                <td className="px-4 py-3 text-gray-500">{item.source || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => validate(item)}
                    disabled={validating === `${item.entity}:${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Valider
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminValidation;
