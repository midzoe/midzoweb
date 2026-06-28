import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../../services/api';
import { blogsData } from '../../data/blogsData';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Études', 'Tourisme', 'Visa', 'Culture', 'Conseils', 'Témoignage'];

interface BlogRow {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  image?: string;
  excerpt?: string;
  body?: string;
  published_at: string;
  is_published: boolean;
}

const emptyForm: Omit<BlogRow, 'id'> = {
  title: '', slug: '', category: '', author: '', image: '',
  excerpt: '', body: '', published_at: '', is_published: true,
};

const AdminBlogs: React.FC = () => {
  const [items, setItems] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<BlogRow, 'id'>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usingLocal, setUsingLocal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.adminGetBlogs();
      const data = res.data ?? res.blogs ?? res.results ?? res.items ?? [];
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
        setUsingLocal(false);
      } else {
        setItems(blogsData);
        setUsingLocal(true);
      }
    } catch {
      setItems(blogsData);
      setUsingLocal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: BlogRow) => {
    setEditingId(item.id);
    setForm({ title: item.title, slug: item.slug, category: item.category,
      author: item.author, image: item.image ?? '', excerpt: item.excerpt ?? '',
      body: item.body ?? '', published_at: item.published_at, is_published: item.is_published });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editingId !== null) await apiService.adminUpdateBlog(editingId, form);
      else await apiService.adminCreateBlog(form);
      setShowForm(false); load();
    } catch {
      setError('Endpoint non disponible côté backend — actif après intégration.');
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce blog ?')) return;
    try {
      await apiService.adminDeleteBlog(id);
      load();
    } catch {
      setError('Suppression non disponible — endpoint backend manquant.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
          <PlusIcon className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {usingLocal && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Affichage des données locales — connecté au backend dès que <code>/admin/blogs</code> est disponible.
        </div>
      )}
      {error && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">{error}</div>}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingId !== null ? 'Modifier' : 'Ajouter'} un blog</h2>
              <button onClick={() => setShowForm(false)}><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: 'title', label: 'Titre' },
                { key: 'slug', label: 'Slug (URL)' },
                { key: 'author', label: 'Auteur' },
                { key: 'image', label: 'URL Image' },
                { key: 'published_at', label: 'Date de publication', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type ?? 'text'} value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">— Choisir —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea rows={5} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pub" checked={form.is_published}
                  onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                <label htmlFor="pub" className="text-sm text-gray-700">Publié</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <CheckIcon className="h-4 w-4" />{saving ? '...' : 'Enregistrer'}
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug (URL)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Auteur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Publié le</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Publié</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Aucun élément</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{item.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-gray-600">{item.author}</td>
                  <td className="px-4 py-3 text-gray-600">{item.published_at}</td>
                  <td className="px-4 py-3">{item.is_published ? <span className="text-green-600 font-medium">✓</span> : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><TrashIcon className="h-4 w-4" /></button>
                    </div>
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

export default AdminBlogs;
