/**
 * Generic reusable CRUD table used by most admin pages.
 * Design « data-dense dashboard » : en-tête cohérent, table dense, badges, actions discrètes.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon, CheckCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { PageHeader, PrimaryButton, TableShell, EmptyRow, IconButton, Badge } from './ui';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'date';
  options?: string[];
  // Pour un select dont la valeur diffère du libellé (ex. embassy_id numérique).
  optionItems?: { value: string; label: string }[];
  required?: boolean;
  hideInTable?: boolean;
}

interface AdminCRUDProps {
  title: string;
  subtitle?: string;
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
  title, subtitle, fields, fetchItems, createItem, updateItem, deleteItem,
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

  const renderCell = (item: any, f: FieldDef) => {
    const val = item[f.key];
    if (f.type === 'checkbox') {
      return val ? (
        <Badge tone="green"><CheckCircleIcon className="h-3.5 w-3.5" /> Oui</Badge>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-stone-400"><MinusCircleIcon className="h-3.5 w-3.5" /> Non</span>
      );
    }
    if (f.type === 'select' && val) {
      return <Badge tone="slate">{String(val)}</Badge>;
    }
    const text = String(val ?? '—');
    return <span className={val == null || val === '' ? 'text-stone-400' : 'text-stone-700'}>{text.slice(0, 80)}</span>;
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle ?? `${total} élément${total > 1 ? 's' : ''}`}
        actions={
          <PrimaryButton onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            Ajouter
          </PrimaryButton>
        }
      />

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-stone-900">
                {editingId !== null ? 'Modifier' : 'Ajouter'} — {title}
              </h2>
              <IconButton onClick={() => setShowForm(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>
            <div className="p-6 space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label htmlFor={`f-${f.key}`} className="block text-sm font-medium text-stone-700 mb-1.5">
                    {f.label}{f.required && <span className="text-rose-500"> *</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={`f-${f.key}`}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      rows={3}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      id={`f-${f.key}`}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    >
                      <option value="">— Choisir —</option>
                      {f.optionItems
                        ? f.optionItems.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                        : f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        id={`f-${f.key}`}
                        type="checkbox"
                        checked={!!form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
                      />
                      <span className="text-sm text-stone-500">Activer</span>
                    </label>
                  ) : (
                    <input
                      id={`f-${f.key}`}
                      type={f.type === 'date' ? 'date' : 'text'}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
                Annuler
              </button>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                <CheckIcon className="h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <TableShell
        head={<>
          {tableFields.map(f => <th key={f.key}>{f.label}</th>)}
          <th className="text-right">Actions</th>
        </>}
      >
        {loading ? (
          <EmptyRow colSpan={tableFields.length + 1}>Chargement…</EmptyRow>
        ) : items.length === 0 ? (
          <EmptyRow colSpan={tableFields.length + 1}>Aucun élément — cliquez « Ajouter » pour commencer.</EmptyRow>
        ) : items.map(item => (
          <tr key={item.id} className="hover:bg-stone-50 transition-colors duration-150">
            {tableFields.map(f => (
              <td key={f.key} className="px-4 py-3">{renderCell(item, f)}</td>
            ))}
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <IconButton tone="blue" title="Modifier" onClick={() => openEdit(item)}><PencilIcon className="h-4 w-4" /></IconButton>
                <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(item.id)}><TrashIcon className="h-4 w-4" /></IconButton>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer">
            ← Précédent
          </button>
          <span className="text-sm text-stone-500">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer">
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCRUD;

