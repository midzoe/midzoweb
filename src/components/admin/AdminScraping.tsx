import React, { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

// Story 11.1/11.2 : lance le scraping des actus immigration et valide (publie) les brouillons.
const AdminScraping: React.FC = () => {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.adminGetScrapedDrafts();
      setDrafts(res?.data || []);
    } catch { setError('Impossible de charger les brouillons.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runScrape = async () => {
    setRunning(true); setMsg(''); setError('');
    try {
      const res = await apiService.adminScrapeImmigrationNews();
      const r = res?.result;
      setMsg(`Scraping : ${r?.created ?? 0} créé(s), ${r?.skipped ?? 0} déjà présent(s), ${r?.errors?.length ?? 0} erreur(s) sur ${r?.sources ?? 0} source(s).`);
      load();
    } catch (e: any) {
      setError(e?.message || 'Échec du scraping (SCRAPE_SOURCES configuré ?).');
    } finally { setRunning(false); }
  };

  const publish = async (id: number) => {
    try {
      await apiService.adminPublishNews(id, true);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch { setError('Échec de la publication.'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Supprimer ce brouillon ?')) return;
    try {
      await apiService.adminDeleteNews(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch { setError('Échec de la suppression.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Actus immigration (scraping)</h1>
        <button onClick={runScrape} disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
          <ArrowPathIcon className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Scraping...' : 'Lancer le scraping'}
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Sources configurées via <code>SCRAPE_SOURCES</code> (flux RSS). Les articles arrivent en brouillon
        et ne sont publiés qu'après validation.
      </p>

      {msg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{msg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Lien</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-400">Chargement...</td></tr>
            ) : drafts.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-400">Aucun brouillon en attente</td></tr>
            ) : drafts.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{d.title}</td>
                <td className="px-4 py-3 text-blue-600 truncate max-w-xs">
                  {d.link ? <a href={d.link} target="_blank" rel="noreferrer">{d.link}</a> : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => publish(d.id)} title="Publier"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                      <CheckIcon className="h-4 w-4" /> Publier
                    </button>
                    <button onClick={() => remove(d.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminScraping;
