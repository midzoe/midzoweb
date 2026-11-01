import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { SITE_LANGUAGES, SOURCE_LANG } from '../../i18n/languages';
import { Badge, Card, EmptyRow, PageHeader, PrimaryButton, SecondaryButton, TableShell, TextArea, TextInput } from './ui';

/**
 * Traductions du catalogue (DeepL) : état par langue, et relecture / correction à la main.
 * Une traduction corrigée ici devient « manuelle » : DeepL ne la remplace plus. « Rétablir
 * DeepL » la remet en traduction automatique.
 *
 * Les fiches sont saisies en français. Leur traduction se fait à l'enregistrement quand la clé
 * DeepL est sur le serveur ; sinon, en local : `npx tsx scripts/translate-catalog.ts`.
 */

interface LangStatus { lang: string; total: number; translated: number; missing: number; manual: number }
interface AutoStatus { enabled: boolean; monthlyCap: number; usedThisMonth: number }
interface Entry { id: number; lang: string; source: string; text: string; manual: boolean; via: string; updatedAt: string }

const LANG_LABEL: Record<string, string> = Object.fromEntries(SITE_LANGUAGES.map(l => [l.code, l.label]));
const TARGETS = SITE_LANGUAGES.filter(l => l.code !== SOURCE_LANG).map(l => l.code as string);

const AdminTranslations: React.FC = () => {
  const [status, setStatus] = useState<LangStatus[]>([]);
  const [auto, setAuto] = useState<AutoStatus | null>(null);
  const [lang, setLang] = useState<string>(TARGETS[0] ?? 'en');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [manualOnly, setManualOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const loadStatus = () =>
    apiService.adminGetTranslationStatus()
      .then(res => { setStatus(res.status ?? []); setAuto(res.auto ?? null); })
      .catch(() => setMessage({ tone: 'error', text: "Impossible de lire l'état des traductions." }));

  const loadEntries = () =>
    apiService.adminGetTranslationEntries({ lang, q: search, manual: manualOnly, page })
      .then(res => { setEntries(res.items ?? []); setTotal(res.total ?? 0); setPageSize(res.pageSize ?? 25); setDrafts({}); })
      .catch(() => setMessage({ tone: 'error', text: 'Impossible de charger les traductions.' }));

  useEffect(() => { loadStatus(); }, []);
  useEffect(() => { loadEntries(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [lang, search, manualOnly, page]);

  const save = async (entry: Entry) => {
    const text = (drafts[entry.id] ?? entry.text).trim();
    if (!text || text === entry.text) return;
    setBusy(entry.id);
    try {
      const res = await apiService.adminUpdateTranslation(entry.id, text);
      setEntries(list => list.map(e => (e.id === entry.id ? res.item : e)));
      setDrafts(d => { const { [entry.id]: _, ...rest } = d; return rest; });
      setMessage({ tone: 'ok', text: 'Traduction corrigée : elle ne sera plus remplacée par DeepL.' });
      loadStatus();
    } catch {
      setMessage({ tone: 'error', text: 'Enregistrement impossible.' });
    } finally {
      setBusy(null);
    }
  };

  const reset = async (entry: Entry) => {
    setBusy(entry.id);
    try {
      const res = await apiService.adminResetTranslation(entry.id);
      if (res.item) setEntries(list => list.map(e => (e.id === entry.id ? res.item : e)));
      else setEntries(list => list.filter(e => e.id !== entry.id));
      setMessage({
        tone: 'ok',
        text: res.item ? 'Version DeepL rétablie.' : 'Correction retirée : la version DeepL sera refaite au prochain passage du script.',
      });
      loadStatus();
    } catch {
      setMessage({ tone: 'error', text: 'Opération impossible.' });
    } finally {
      setBusy(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const missing = status.reduce((a, s) => a + s.missing, 0);

  return (
    <div>
      <PageHeader
        title="Traductions du catalogue"
        subtitle="Les fiches sont saisies en français ; DeepL les traduit pour le site. Relisez et corrigez ici : une correction n'est jamais écrasée."
      />

      {message && (
        <Card className={`mb-6 p-4 text-sm ${message.tone === 'ok' ? 'text-emerald-800 bg-emerald-50' : 'text-rose-800 bg-rose-50'}`}>{message.text}</Card>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <div className="space-y-3">
            {status.map(s => (
              <div key={s.lang} className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-stone-800">
                    {s.lang === SOURCE_LANG ? `${LANG_LABEL[s.lang]} (textes saisis dans une autre langue)` : LANG_LABEL[s.lang] ?? s.lang}
                  </p>
                  <p className="text-xs text-stone-500">{s.translated} / {s.total} textes traduits · {s.manual} corrigé(s) à la main</p>
                </div>
                {s.missing === 0 ? <Badge tone="green">À jour</Badge> : <Badge tone="amber">{s.missing} à traduire</Badge>}
              </div>
            ))}
            {!status.length && <p className="text-sm text-stone-500">Chargement…</p>}
          </div>
        </Card>
        <Card className="p-6 text-sm text-stone-600">
          <p className="font-medium text-stone-800">Traduction à l'enregistrement</p>
          {auto?.enabled ? (
            <p className="mt-2">
              Active : chaque fiche enregistrée est traduite. Ce mois-ci : {auto.usedThisMonth.toLocaleString('fr-FR')} / {auto.monthlyCap.toLocaleString('fr-FR')} caractères.
            </p>
          ) : (
            <p className="mt-2">
              Désactivée (clé DeepL en local). {missing > 0 ? 'Pour traduire ce qui manque' : 'Après des ajouts'}, lancer dans midzobackend :{' '}
              <code className="rounded bg-stone-100 px-1">npx tsx scripts/translate-catalog.ts</code>
            </p>
          )}
        </Card>
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-stone-200 p-0.5">
            {SITE_LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLang(l.code); setPage(1); }}
                className={`rounded-md px-3 py-1.5 text-sm ${lang === l.code ? 'bg-primary text-white' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={e => { e.preventDefault(); setSearch(query.trim()); setPage(1); }}
          >
            <TextInput value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un texte (français ou traduction)…" className="min-w-[14rem] flex-1" />
            <PrimaryButton type="submit"><MagnifyingGlassIcon className="h-4 w-4" />Rechercher</PrimaryButton>
          </form>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={manualOnly} onChange={e => { setManualOnly(e.target.checked); setPage(1); }} />
            Corrigées à la main seulement
          </label>
        </div>
      </Card>

      <TableShell head={<><th className="w-[42%]">Texte d'origine</th><th>Traduction ({LANG_LABEL[lang]})</th><th className="text-right">Actions</th></>}>
        {entries.length === 0 && <EmptyRow colSpan={3}>Aucune traduction trouvée.</EmptyRow>}
        {entries.map(entry => {
          const draft = drafts[entry.id] ?? entry.text;
          const dirty = draft.trim() !== entry.text;
          return (
            <tr key={entry.id} className="align-top">
              <td className="px-4 py-3 text-stone-600 whitespace-pre-line">{entry.source}</td>
              <td className="px-4 py-3">
                <TextArea
                  value={draft}
                  rows={Math.min(8, Math.max(2, Math.ceil(draft.length / 70)))}
                  onChange={e => setDrafts(d => ({ ...d, [entry.id]: e.target.value }))}
                />
                <div className="mt-1 flex gap-2">
                  {entry.manual ? <Badge tone="gold">Corrigée à la main</Badge> : <Badge tone="slate">DeepL</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-col items-end gap-2">
                  <PrimaryButton onClick={() => save(entry)} disabled={!dirty || busy === entry.id}>Enregistrer</PrimaryButton>
                  {entry.manual && (
                    <SecondaryButton onClick={() => reset(entry)} disabled={busy === entry.id}>Rétablir DeepL</SecondaryButton>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </TableShell>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm text-stone-600">
          <SecondaryButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Précédent</SecondaryButton>
          <span>Page {page} / {pages} · {total} textes</span>
          <SecondaryButton onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>Suivant</SecondaryButton>
        </div>
      )}
    </div>
  );
};

export default AdminTranslations;
