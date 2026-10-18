import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

/** Historique des actions de l'équipe sur un compte client (qui a fait quoi, quand). */
const LABELS: Record<string, string> = {
  'user.create': 'a créé le compte',
  'user.update': 'a modifié la fiche',
  'user.delete': 'a supprimé le compte',
  'case.update': 'a mis à jour le dossier',
  'purchase.record': 'a enregistré un paiement',
  'purchase.update': 'a modifié un paiement',
  'trip.create': 'a créé un voyage',
  'trip.update': 'a modifié un voyage',
  'trip.delete': 'a supprimé un voyage',
  'trip.service.add': 'a ajouté un service',
  'trip.service.update': 'a fait avancer un service',
  'trip.service.delete': 'a retiré un service',
  'trip.checklist.add': 'a ajouté un élément de checklist',
  'trip.checklist.update': 'a coché / modifié la checklist',
  'trip.checklist.delete': 'a retiré un élément de checklist',
  'contact.reply': 'a répondu à une demande',
};

const summary = (details: any) => {
  if (!details || typeof details !== 'object') return '';
  const parts = Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && typeof v !== 'object')
    .slice(0, 4)
    .map(([k, v]) => `${k} : ${String(v).slice(0, 60)}`);
  return parts.join(' · ');
};

const AuditTrail: React.FC<{ userId: number }> = ({ userId }) => {
  const [logs, setLogs] = useState<any[] | null>(null);
  useEffect(() => {
    apiService.adminGetAudit(userId).then(r => setLogs(r?.data ?? [])).catch(() => setLogs([]));
  }, [userId]);
  if (!logs) return <p className="text-sm text-stone-400">Chargement…</p>;
  if (!logs.length) return <p className="text-sm text-stone-400">Aucune action enregistrée sur ce compte.</p>;
  return (
    <ul className="space-y-1.5 text-sm" data-testid="audit-trail">
      {logs.map(l => (
        <li key={l.id} className="border-b border-stone-100 pb-1.5">
          <span className="text-stone-400 tabular-nums">{new Date(l.createdAt).toLocaleString('fr-FR')}</span>{' '}
          <strong className="text-stone-700">{l.adminName ?? `admin #${l.adminId}`}</strong>{' '}
          <span className="text-stone-700">{LABELS[l.action] ?? l.action}</span>
          {summary(l.details) && <span className="block text-xs text-stone-500">{summary(l.details)}</span>}
        </li>
      ))}
    </ul>
  );
};

export default AuditTrail;
