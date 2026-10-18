import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, EnvelopeIcon, StarIcon, UserIcon, UsersIcon, InboxArrowDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { PageHeader, StatCard, Card, Badge, TableShell, EmptyRow, IconButton, contactStatusTone, Modal, PrimaryButton, SecondaryButton, TextArea } from './ui';

const STATUS_LABELS: Record<string, string> = { new: 'Nouveau', read: 'Lu', archived: 'Archivé' };

// Story 9.6/9.8 (FR30) : messages de contact + insights (volume, catégories, domaines, audience).
const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replying, setReplying] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Réponse au client : email envoyé, historique gardé dans le message, notification s'il a un compte.
  const sendReply = async () => {
    if (!replying || reply.trim().length < 2) return;
    setSendingReply(true);
    try {
      const res = await apiService.adminReplyContactMessage(replying.id, reply.trim());
      setMessages(prev => prev.map(m => (m.id === replying.id ? { ...m, ...res?.data } : m)));
      setReplying(null);
      setReply('');
    } catch { setError('L’envoi de la réponse a échoué.'); }
    finally { setSendingReply(false); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [msgRes, insRes] = await Promise.all([
        apiService.adminGetContactMessages(),
        apiService.adminGetContactInsights(),
      ]);
      setMessages(msgRes?.data || []);
      setInsights(insRes?.data || null);
    } catch {
      setError('Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, status: 'new' | 'read' | 'archived') => {
    try {
      await apiService.adminSetContactMessageStatus(id, status);
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, status } : m)));
    } catch { setError('Échec de la mise à jour.'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await apiService.adminDeleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch { setError('Échec de la suppression.'); }
  };

  return (
    <div>
      <PageHeader title="Messages de contact" subtitle="Demandes entrantes et statistiques de contact." />

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

      {/* Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={insights?.total ?? '—'} icon={InboxArrowDownIcon} tone="indigo" />
        <StatCard label="Premium" value={insights?.audience?.premium ?? '—'} icon={StarIcon} tone="gold" />
        <StatCard label="Clients" value={insights?.audience?.registered ?? '—'} icon={UserIcon} tone="primary" />
        <StatCard label="Visiteurs" value={insights?.audience?.visitors ?? '—'} icon={UsersIcon} tone="default" />
      </div>

      {insights?.byCategory?.length > 0 && (
        <Card className="p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Répartition par catégorie</p>
          <div className="flex flex-wrap gap-2">
            {insights.byCategory.map((c: any) => (
              <Badge key={c.category} tone="slate">{c.category} · <b className="ml-0.5">{c.count}</b></Badge>
            ))}
          </div>
          {insights?.topDomains?.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mt-4 mb-3">Top domaines email</p>
              <div className="flex flex-wrap gap-2">
                {insights.topDomains.slice(0, 8).map((d: any) => (
                  <Badge key={d.domain} tone="slate">@{d.domain} · <b className="ml-0.5">{d.count}</b></Badge>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      <TableShell
        head={<>
          <th>Expéditeur</th>
          <th>Catégorie</th>
          <th>Message</th>
          <th>Statut</th>
          <th className="text-right">Actions</th>
        </>}
      >
        {loading ? (
          <EmptyRow colSpan={5}>Chargement…</EmptyRow>
        ) : messages.length === 0 ? (
          <EmptyRow colSpan={5}>
            <EnvelopeIcon className="h-8 w-8 mx-auto mb-2 text-stone-300" />
            Aucun message pour le moment.
          </EmptyRow>
        ) : messages.map(m => (
          <tr key={m.id} className="hover:bg-stone-50 transition-colors duration-150 align-top">
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-stone-900">{m.name}</span>
                {m.isPremium && <StarIcon className="h-4 w-4 text-amber-500" title="Premium" />}
              </div>
              <div className="text-xs text-stone-500">{m.email}</div>
              {m.account_user_id
                ? <Link to={`/admin/users?search=${encodeURIComponent(m.email)}`} className="text-xs text-primary underline">Voir la fiche client</Link>
                : <span className="text-[11px] text-stone-400">visiteur sans compte</span>}
            </td>
            <td className="px-4 py-3">
              {(m.category || m.subcategory)
                ? <Badge tone="green">{[m.category, m.subcategory].filter(Boolean).join(' / ')}</Badge>
                : <span className="text-stone-400 text-xs">—</span>}
            </td>
            <td className="px-4 py-3 text-stone-600 max-w-xs">
              {m.subject && <div className="font-medium text-stone-800 truncate">{m.subject}</div>}
              <div className="text-xs line-clamp-2">{String(m.message).slice(0, 140)}</div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Badge tone={contactStatusTone(m.status)}>{STATUS_LABELS[m.status] ?? m.status}</Badge>
                {Array.isArray(m.replies) && m.replies.length > 0 && <Badge tone="green">Répondu ({m.replies.length})</Badge>}
                <select
                  value={m.status}
                  onChange={e => setStatus(m.id, e.target.value as any)}
                  aria-label="Changer le statut"
                  className="text-xs border border-stone-300 rounded-md px-1.5 py-1 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="new">Nouveau</option>
                  <option value="read">Lu</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <IconButton tone="blue" title="Répondre" onClick={() => { setReplying(m); setReply(''); }}><ChatBubbleLeftRightIcon className="h-4 w-4" /></IconButton>
                <IconButton tone="rose" title="Supprimer" onClick={() => remove(m.id)}><TrashIcon className="h-4 w-4" /></IconButton>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      {replying && (
        <Modal title={`Répondre à ${replying.name}`} onClose={() => setReplying(null)} maxWidth="max-w-2xl"
          footer={<><SecondaryButton onClick={() => setReplying(null)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={sendReply} disabled={sendingReply || reply.trim().length < 2}>{sendingReply ? 'Envoi…' : 'Envoyer la réponse'}</PrimaryButton></>}>
          <div className="text-sm bg-stone-50 rounded-lg p-3 whitespace-pre-line text-stone-700">
            {replying.subject && <p className="font-medium mb-1">{replying.subject}</p>}
            {replying.message}
          </div>
          {Array.isArray(replying.replies) && replying.replies.map((r: any, i: number) => (
            <div key={i} className="text-sm border-l-4 border-emerald-300 pl-3 text-stone-700 whitespace-pre-line">
              <p className="text-xs text-stone-500">{r.admin} — {new Date(r.sent_at).toLocaleString('fr-FR')}</p>{r.body}
            </div>
          ))}
          <TextArea aria-label="Votre réponse" rows={6} value={reply} onChange={e => setReply(e.target.value)} placeholder={`Bonjour ${replying.name}, …`} />
          <p className="text-xs text-stone-500">Envoyée par email à {replying.email}{replying.account_user_id ? ' et visible dans son espace client' : ''}.</p>
        </Modal>
      )}
    </div>
  );
};

export default AdminContactMessages;

