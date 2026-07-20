import React, { useCallback, useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

// Story 9.6/9.8 (FR30) : messages de contact + insights (volume, catégories, domaines, audience).
const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages de contact</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Insights */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-2xl font-bold text-gray-900">{insights.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500">Premium</div>
            <div className="text-2xl font-bold text-primary">{insights.audience?.premium ?? 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500">Clients</div>
            <div className="text-2xl font-bold text-gray-900">{insights.audience?.registered ?? 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500">Visiteurs</div>
            <div className="text-2xl font-bold text-gray-900">{insights.audience?.visitors ?? 0}</div>
          </div>
        </div>
      )}

      {insights?.byCategory?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Répartition par catégorie</div>
          <div className="flex flex-wrap gap-2">
            {insights.byCategory.map((c: any) => (
              <span key={c.category} className="text-xs bg-gray-100 rounded-full px-3 py-1">
                {c.category} · <b>{c.count}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">De</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Message</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Chargement...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Aucun message</td></tr>
              ) : messages.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{m.name} {m.isPremium && <span className="text-xs text-primary">★</span>}</div>
                    <div className="text-gray-500 text-xs">{m.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{[m.category, m.subcategory].filter(Boolean).join(' / ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs">{String(m.message).slice(0, 120)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={m.status}
                      onChange={e => setStatus(m.id, e.target.value as any)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="new">new</option>
                      <option value="read">read</option>
                      <option value="archived">archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(m.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminContactMessages;
