/**
 * Generic reusable CRUD table used by News, Blog, Visa, Countries admin pages.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'date';
  options?: string[];
  required?: boolean;
  hideInTable?: boolean;
}

interface AdminCRUDProps {
  title: string;
  fields: FieldDef[];
  fetchItems: (page: number) => Promise<any>;
  createItem: (data: any) => Promise<any>;
  updateItem: (id: number, data: any) => Promise<any>;
  deleteItem: (id: number) => Promise<any>;
  itemLabelKey?: string; // reserved for future use
}

const emptyForm = (fields: FieldDef[]) =>
  Object.fromEntries(fields.map(f => [f.key, f.type === 'checkbox' ? false : '']));

const AdminCRUD: React.FC<AdminCRUDProps> = ({
  title, fields, fetchItems, createItem, updateItem, deleteItem,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm(fields));
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchItems(page);
      // Support multiple response formats from backend
      const items = res.data ?? res.results ?? res.items ?? res.news ?? res.blogs ?? res.countries ?? res.visa ?? [];
      const total = res.total ?? res.count ?? res.total_count ?? (Array.isArray(items) ? items.length : 0);
      setItems(Array.isArray(items) ? items : []);
      setTotal(typeof total === 'number' ? total : 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, fetchItems]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(fields));
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] ?? (f.type === 'checkbox' ? false : '')])));
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId !== null) {
        await updateItem(editingId, form);
      } else {
        await createItem(form);
      }
      setShowForm(false);
      load();
    } catch {
      setError('Endpoint non disponible — à configurer côté backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      await deleteItem(id);
      load();
    } catch {
      setError('Endpoint non disponible — à configurer côté backend.');
    }
  };

  const tableFields = fields.filter(f => !f.hideInTable);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId !== null ? 'Modifier' : 'Ajouter'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">— Choisir —</option>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                      className="rounded text-primary"
                    />
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : 'text'}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <CheckIcon className="h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {tableFields.map(f => (
                  <th key={f.key} className="text-left px-4 py-3 font-medium text-gray-600">{f.label}</th>
                ))}
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={tableFields.length + 1} className="text-center py-10 text-gray-400">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={tableFields.length + 1} className="text-center py-10 text-gray-400">Aucun élément</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {tableFields.map(f => (
                    <td key={f.key} className="px-4 py-3 text-gray-700">
                      {f.type === 'checkbox'
                        ? (item[f.key] ? '✓' : '—')
                        : String(item[f.key] ?? '—').slice(0, 80)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

export default AdminCRUD;
