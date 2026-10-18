import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { Badge, EmptyRow, Modal, PageHeader, SecondaryButton, Select, TableShell } from './ui';
import ClientTripsPanel from './ClientTripsPanel';

/** « Dossiers clients » : tous les voyages et projets des clients, à suivre et faire avancer. */
const STATUS: Record<string, string> = { planning: 'En préparation', upcoming: 'À venir', ongoing: 'En cours', completed: 'Terminé' };
const RECORDS: Record<string, string> = { study_project: 'Projet d’études', tourism_project: 'Projet de voyage' };

const AdminClientTrips: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [upcoming, setUpcoming] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<{ id: number; label: string } | null>(null);

  const requestSeq = useRef(0);
  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await apiService.adminListTrips({ search, status, upcoming, page });
      if (seq !== requestSeq.current) return;
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch { setRows([]); } finally { setLoading(false); }
  }, [search, status, upcoming, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const pages = Math.max(1, Math.ceil(total / 30));
  return (
    <div>
      <PageHeader title="Dossiers clients" subtitle="Voyages et projets de tous les clients : avancement, services, checklist." />
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input aria-label="Rechercher un dossier" placeholder="Client, email, titre, pays, ville…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm bg-white" />
        </div>
        <Select aria-label="Filtrer par statut" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={upcoming} onChange={e => { setUpcoming(e.target.checked); setPage(1); }} /> Départ à venir
        </label>
      </div>

      <TableShell head={<><th>Client</th><th>Voyage / projet</th><th>Étapes</th><th>Départ</th><th>Statut</th><th>Préparation</th><th className="text-right">Actions</th></>}>
        {loading ? <EmptyRow colSpan={7}>Chargement…</EmptyRow> : rows.length === 0 ? <EmptyRow colSpan={7}>Aucun dossier</EmptyRow> : rows.map(t => {
          const record = (t.services ?? []).find((s: any) => RECORDS[s.type]);
          const name = [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || t.user?.email;
          return (
            <tr key={t.id} className="hover:bg-stone-50">
              <td className="px-4 py-3">
                <div className="font-medium text-stone-800">{name}</div>
                <div className="text-xs text-stone-500">{t.user?.email}</div>
                {t.user?.isPremium && <Badge tone="gold">Premium</Badge>}
              </td>
              <td className="px-4 py-3">
                <div className="text-stone-800">{t.title}</div>
                {record && <Badge tone="indigo">{RECORDS[record.type]}</Badge>}
              </td>
              <td className="px-4 py-3 text-sm text-stone-600">{(t.destinations ?? []).map((d: any) => d.city || d.country).join(' → ') || '—'}</td>
              <td className="px-4 py-3 text-sm tabular-nums">{t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR') : '—'}</td>
              <td className="px-4 py-3"><Badge tone={t.status === 'completed' ? 'slate' : 'blue'}>{STATUS[t.status] ?? t.status}</Badge></td>
              <td className="px-4 py-3"><Badge tone={t.readiness?.ready ? 'green' : 'amber'}>{t.readiness?.done ?? 0}/{t.readiness?.total ?? 0}</Badge></td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <SecondaryButton onClick={() => setOpen({ id: t.user?.id, label: name })}>Gérer</SecondaryButton>{' '}
                <Link to={`/admin/users?search=${encodeURIComponent(t.user?.email ?? '')}`} className="text-xs text-primary underline ml-2">Fiche</Link>
              </td>
            </tr>
          );
        })}
      </TableShell>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">← Précédent</button>
          <span>Page {page} / {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Suivant →</button>
        </div>
      )}

      {open && (
        <Modal title={`Voyages de ${open.label}`} onClose={() => { setOpen(null); load(); }} maxWidth="max-w-5xl">
          <ClientTripsPanel userId={open.id} />
        </Modal>
      )}
    </div>
  );
};

export default AdminClientTrips;
