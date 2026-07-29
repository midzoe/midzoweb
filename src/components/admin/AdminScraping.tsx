import React, { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { PageHeader, PrimaryButton, TableShell, EmptyRow, IconButton } from './ui';

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
      <PageHeader
        title="Actus immigration"
        subtitle="Scraping RSS → brouillons validés manuellement avant publication."
        actions={
          <PrimaryButton onClick={runScrape} disabled={running}>
            <ArrowPathIcon className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Scraping...' : 'Lancer le scraping'}
          </PrimaryButton>
        }
      />

      <div className="mb-4 p-3 bg-stone-100 border border-stone-200 rounded-lg text-sm text-stone-600">
        Sources configurées via <code className="text-stone-800">SCRAPE_SOURCES</code> (flux RSS). Les articles arrivent en brouillon et ne sont publiés qu'après validation.
      </div>

      {msg && <div className="mb-4 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm">{msg}</div>}
      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

      <TableShell head={<>
        <th>Titre</th><th>Lien</th><th className="text-right">Actions</th>
      </>}>
        {loading ? (
          <EmptyRow colSpan={3}>Chargement…</EmptyRow>
        ) : drafts.length === 0 ? (
          <EmptyRow colSpan={3}>Aucun brouillon en attente</EmptyRow>
        ) : drafts.map(d => (
          <tr key={d.id} className="hover:bg-stone-50 transition-colors duration-150">
            <td className="px-4 py-3 font-medium text-stone-900 max-w-sm">{d.title}</td>
            <td className="px-4 py-3 max-w-xs truncate">
              {d.link ? <a href={d.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">{d.link}</a> : <span className="text-stone-400">—</span>}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => publish(d.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors duration-150 cursor-pointer">
                  <CheckIcon className="h-4 w-4" /> Publier
                </button>
                <IconButton tone="rose" title="Supprimer" onClick={() => remove(d.id)}><TrashIcon className="h-4 w-4" /></IconButton>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
};

export default AdminScraping;

