import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../../services/api';
import { MagnifyingGlassIcon, StarIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_premium: boolean;
  created_at?: string;
}

interface EditState {
  id: number;
  email: string;
  password: string;
  role: string;
  is_premium: boolean;
}

const ROLES = ['user', 'admin', 'superadmin'];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetUsers(page, limit, search);
      console.log('[AdminUsers] response:', res); // debug — retirer après confirmation
      // Support multiple response formats from backend
      const users = res.data ?? res.users ?? res.results ?? res.items ?? [];
      const total = res.total ?? res.count ?? res.total_count ?? users.length ?? 0;
      setUsers(Array.isArray(users) ? users : []);
      setTotal(typeof total === 'number' ? total : 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (u: AdminUser) =>
    setEditing({ id: u.id, email: u.email, password: '', role: u.role, is_premium: u.is_premium });

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: any = { role: editing.role, is_premium: editing.is_premium };
      if (editing.email) payload.email = editing.email;
      if (editing.password) payload.password = editing.password;
      await apiService.adminUpdateUser(editing.id, payload);
      setEditing(null);
      load();
    } catch {
      setError('Endpoint non disponible — à configurer côté backend.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await apiService.adminDeleteUser(id);
      load();
    } catch {
      setError('Endpoint non disponible — à configurer côté backend.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <span className="text-sm text-gray-500">{total} au total</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Premium</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Aucun utilisateur trouvé</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  {editing?.id === u.id ? (
                    <>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{u.username}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editing.email}
                          onChange={e => setEditing({ ...editing, email: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Email"
                        />
                        <input
                          type="password"
                          value={editing.password}
                          onChange={e => setEditing({ ...editing, password: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                          placeholder="Nouveau mot de passe (optionnel)"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editing.role}
                          onChange={e => setEditing({ ...editing, role: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={editing.is_premium}
                          onChange={e => setEditing({ ...editing, is_premium: e.target.checked })}
                          className="rounded text-yellow-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={saveEdit} disabled={saving}
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{u.username}</div>
                        {(u.first_name || u.last_name) && (
                          <div className="text-xs text-gray-500">{[u.first_name, u.last_name].filter(Boolean).join(' ')}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                          ${u.role === 'superadmin' ? 'bg-red-100 text-red-700' :
                            u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_premium && <StarIcon className="h-5 w-5 text-yellow-500" />}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(u)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteUser(u.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-40">
              ← Précédent
            </button>
            <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-40">
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
