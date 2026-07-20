import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

// Story 9.3/9.8 (FR38) : suivi de dossier premium séparé (statut, notes, achats).
const STATUSES = ['open', 'in_progress', 'closed'];

const PremiumCasePanel: React.FC<{ userId: number; onClose: () => void }> = ({ userId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    apiService.adminGetPremiumCase(userId)
      .then(res => {
        if (!alive) return;
        setData(res?.data);
        setStatus(res?.data?.case?.status || 'open');
        setNotes(res?.data?.case?.notes || '');
      })
      .catch(() => setMsg('Impossible de charger le dossier.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [userId]);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await apiService.adminUpdatePremiumCase(userId, { status, notes });
      setMsg('Dossier enregistré.');
    } catch { setMsg('Échec de l’enregistrement.'); }
    finally { setSaving(false); }
  };

  const u = data?.user;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Dossier premium</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : (
            <>
              {u && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-medium text-gray-900">{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}</div>
                  <div className="text-gray-500">{u.email}</div>
                  {u.premiumSince && <div className="text-gray-500 text-xs">Premium depuis {new Date(u.premiumSince).toLocaleDateString('fr-FR')}</div>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut du dossier</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes de suivi</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>

              {data?.purchases?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Achats</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {data.purchases.map((p: any) => (
                      <li key={p.id}>
                        {(p.amountCents / 100).toFixed(2)} {p.currency} — {p.status}
                        {p.paidAt ? ` · payé le ${new Date(p.paidAt).toLocaleDateString('fr-FR')}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {msg && <p className="text-sm text-gray-600">{msg}</p>}
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Fermer</button>
          <button onClick={save} disabled={saving || loading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {saving ? '...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumCasePanel;
