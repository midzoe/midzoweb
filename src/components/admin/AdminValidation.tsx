import React, { useCallback, useEffect, useState } from 'react';
import { CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { PageHeader, Card, TableShell, EmptyRow, Badge, SecondaryButton } from './ui';

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
    } catch (e: any) {
      setError(
        e?.status === 401
          ? 'Session expirée — déconnectez-vous puis reconnectez-vous.'
          : `Impossible de charger la file de validation${e?.message ? ` : ${e.message}` : '.'}`
      );
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
      setCounts(prev => ({ ...prev, [item.entity]: Math.max(0, (prev[item.entity] ?? 1) - 1) }));
    } catch {
      setError('Échec de la validation.');
    } finally {
      setValidating(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="File de validation"
        subtitle="Brouillons en attente de publication (contenu piloté par le backend)."
        actions={<SecondaryButton onClick={load}>Rafraîchir</SecondaryButton>}
      />

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(counts).map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{ENTITY_LABELS[k] || k}</p>
            <p className="mt-1 text-2xl font-bold text-stone-900 tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <TableShell head={<>
        <th>Type</th><th>Élément</th><th>Source</th><th className="text-right">Action</th>
      </>}>
        {loading ? (
          <EmptyRow colSpan={4}>Chargement…</EmptyRow>
        ) : items.length === 0 ? (
          <EmptyRow colSpan={4}>
            <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 text-primary/40" />
            Aucun brouillon en attente 🎉
          </EmptyRow>
        ) : items.map(item => (
          <tr key={`${item.entity}:${item.id}`} className="hover:bg-stone-50 transition-colors duration-150">
            <td className="px-4 py-3"><Badge tone="indigo">{ENTITY_LABELS[item.entity] || item.entity}</Badge></td>
            <td className="px-4 py-3 font-medium text-stone-900">{item.label}</td>
            <td className="px-4 py-3">
              {item.source ? <Badge tone="amber">{item.source}</Badge> : <span className="text-stone-400 text-xs">manuel</span>}
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end">
                <button
                  onClick={() => validate(item)}
                  disabled={validating === `${item.entity}:${item.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                >
                  <CheckIcon className="h-4 w-4" /> Valider
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
};

export default AdminValidation;

