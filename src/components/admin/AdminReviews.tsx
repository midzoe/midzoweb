import React, { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Badge, Card, PageHeader, PrimaryButton, SecondaryButton, TextArea, TextInput } from './ui';

/** Modération des avis clients : publier, refuser (avec motif), répondre. Le texte du client n'est jamais modifiable. */
const LABELS: Record<string, string> = { pending: 'À relire', approved: 'Publié', rejected: 'Refusé' };
const TONES: Record<string, 'amber' | 'green' | 'rose'> = { pending: 'amber', approved: 'green', rejected: 'rose' };

const ReviewRow: React.FC<{ r: any; onChanged: () => void }> = ({ r, onChanged }) => {
  const [reply, setReply] = useState(r.adminReply ?? '');
  const [reason, setReason] = useState(r.rejectReason ?? '');
  const [busy, setBusy] = useState(false);
  const act = async (data: object) => {
    setBusy(true);
    try { await apiService.adminModerateReview(r.id, data); onChanged(); } finally { setBusy(false); }
  };
  return (
    <div data-testid="admin-review">
    <Card className="p-5 space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="font-semibold text-stone-800">{r.authorName} · {'★'.repeat(r.rating)}<span className="text-stone-300">{'★'.repeat(5 - r.rating)}</span></p>
          <p className="text-xs text-stone-500">{r.user?.email ?? 'compte supprimé'} · {r.service}{r.destination ? ` · ${r.destination}` : ''} · {new Date(r.createdAt).toLocaleDateString('fr-FR')} {r.verified && '· achat vérifié'}</p>
        </div>
        <Badge tone={TONES[r.status] ?? 'slate'}>{LABELS[r.status] ?? r.status}</Badge>
      </div>
      {r.title && <p className="font-medium text-stone-800">{r.title}</p>}
      <p className="text-stone-700 whitespace-pre-line">{r.body}</p>
      <TextArea aria-label={`Réponse publique à ${r.authorName}`} rows={2} placeholder="Réponse publique de Midzo (facultatif)" value={reply} onChange={e => setReply(e.target.value)} />
      <div className="flex flex-wrap gap-2 items-center">
        <PrimaryButton disabled={busy} onClick={() => act({ status: 'approved', admin_reply: reply })}>Publier</PrimaryButton>
        <TextInput aria-label={`Motif de refus pour ${r.authorName}`} placeholder="Motif de refus (envoyé au client)" value={reason} onChange={e => setReason(e.target.value)} className="max-w-xs" />
        <SecondaryButton disabled={busy} onClick={() => act({ status: 'rejected', reject_reason: reason })}>Refuser</SecondaryButton>
        {r.status !== 'pending' && <SecondaryButton disabled={busy} onClick={() => act({ admin_reply: reply })}>Enregistrer la réponse</SecondaryButton>}
      </div>
    </Card>
    </div>
  );
};

const AdminReviews: React.FC = () => {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const load = useCallback(async () => {
    const r = await apiService.adminGetReviews(status || undefined).catch(() => null);
    setRows(r?.data ?? []);
    setCounts(r?.counts ?? {});
  }, [status]);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <PageHeader title="Avis clients" subtitle="Seuls les clients ayant payé peuvent publier ; relisez avant publication, sans modifier le texte." />
      <div className="flex flex-wrap gap-2 mb-5">
        {['pending', 'approved', 'rejected', ''].map(s => (
          <button key={s || 'all'} type="button" onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm border ${status === s ? 'bg-primary text-white border-primary' : 'bg-white border-stone-300 text-stone-700'}`}>
            {s ? LABELS[s] : 'Tous'}{s && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {rows.length === 0 && <p className="text-stone-500">Aucun avis dans cette liste.</p>}
        {rows.map(r => <ReviewRow key={`${r.id}-${r.status}`} r={r} onChanged={load} />)}
      </div>
    </div>
  );
};

export default AdminReviews;
