import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Modal, Field, Select, TextArea, PrimaryButton, SecondaryButton, Badge } from './ui';

// Story 9.3/9.8 (FR38) : suivi de dossier premium séparé (statut, notes, achats).
const STATUSES = ['open', 'in_progress', 'closed'];
const statusTone = (s: string): 'blue' | 'amber' | 'slate' =>
  s === 'open' ? 'blue' : s === 'in_progress' ? 'amber' : 'slate';

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
    <Modal
      title="Dossier premium"
      onClose={onClose}
      footer={<>
        <SecondaryButton onClick={onClose}>Fermer</SecondaryButton>
        <PrimaryButton onClick={save} disabled={saving || loading}>{saving ? '...' : 'Enregistrer'}</PrimaryButton>
      </>}
    >
      {loading ? (
        <p className="text-stone-400 text-sm">Chargement...</p>
      ) : (
        <>
          {u && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-stone-900 truncate">{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}</div>
                <div className="text-sm text-stone-500 truncate">{u.email}</div>
                {u.premiumSince && <div className="text-xs text-stone-400">Premium depuis {new Date(u.premiumSince).toLocaleDateString('fr-FR')}</div>}
              </div>
              <Badge tone={statusTone(status)}>{status}</Badge>
            </div>
          )}

          <Field label="Statut du dossier">
            <Select value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>

          <Field label="Notes de suivi">
            <TextArea value={notes} onChange={e => setNotes(e.target.value)} rows={5} />
          </Field>

          {data?.purchases?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Achats</p>
              <ul className="space-y-1">
                {data.purchases.map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between text-sm border border-stone-200 rounded-lg px-3 py-1.5">
                    <span className="text-stone-700">{(p.amountCents / 100).toFixed(2)} {p.currency}</span>
                    <span className="flex items-center gap-2 text-xs text-stone-500">
                      <Badge tone={p.status === 'paid' ? 'green' : 'slate'}>{p.status}</Badge>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {msg && <p className="text-sm text-stone-600">{msg}</p>}
        </>
      )}
    </Modal>
  );
};

export default PremiumCasePanel;

