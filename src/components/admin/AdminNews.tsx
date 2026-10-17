import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiService } from '../../services/api';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, EyeIcon, MagnifyingGlassIcon,
  PhotoIcon, DocumentDuplicateIcon, XMarkIcon, ArrowPathIcon, LinkIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, PrimaryButton, SecondaryButton, Card, IconButton, Badge, Field, TextInput, TextArea, Select } from './ui';
// Rendu du corps partagé avec la page publique : l'aperçu ne doit pas diverger du site.
import ArticleBody from '../news/ArticleBody';

const CATEGORIES = ['Études', 'Tourisme', 'Visa', 'Professionnelle', 'Général', 'Events', 'Safari', 'Sports', 'Study'];

/**
 * Pastilles de catégorie de l'aperçu : elles doivent refléter le site public
 * (cf. `categoryColors` dans NewsSlider) — sinon l'aperçu ment sur le rendu final.
 */
const PREVIEW_CATEGORY_COLORS: Record<string, string> = {
  Events: 'bg-secondary text-white',
  Safari: 'bg-emerald-600 text-white',
  Sports: 'bg-blue-600 text-white',
  Study: 'bg-primary text-white',
  Business: 'bg-purple-600 text-white',
  Professional: 'bg-gray-600 text-white',
  Tourism: 'bg-teal-600 text-white',
};
const previewCategoryColor = (c?: string) => PREVIEW_CATEGORY_COLORS[c ?? ''] ?? 'bg-gray-600 text-white';

type Lang = 'en' | 'fr' | 'de';
const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
];

interface NewsRow {
  id: number;
  title: string;
  title_fr?: string | null;
  description?: string | null;
  description_fr?: string | null;
  body?: string | null;
  category?: string | null;
  image?: string | null;
  link?: string | null;
  published_at?: string | null;
  is_published?: boolean;
  translations?: { de?: { title?: string; description?: string } } | null;
}

type NewsForm = {
  title: string; title_fr: string; title_de: string;
  description: string; description_fr: string; description_de: string;
  body: string; category: string; image: string; link: string;
  date: string; is_published: boolean;
};

const emptyForm: NewsForm = {
  title: '', title_fr: '', title_de: '',
  description: '', description_fr: '', description_de: '',
  body: '', category: '', image: '', link: '',
  date: new Date().toISOString().slice(0, 10), is_published: false,
};

const toForm = (n: NewsRow): NewsForm => ({
  title: n.title ?? '',
  title_fr: n.title_fr ?? '',
  title_de: n.translations?.de?.title ?? '',
  description: n.description ?? '',
  description_fr: n.description_fr ?? '',
  description_de: n.translations?.de?.description ?? '',
  body: n.body ?? '',
  category: n.category ?? '',
  image: n.image ?? '',
  link: n.link ?? '',
  date: (n.published_at ?? '').slice(0, 10),
  is_published: !!n.is_published,
});

/** Repli sur l'anglais : c'est ce que fait `buildNews` côté site, l'aperçu doit en faire autant. */
const localized = (f: NewsForm, lang: Lang) => ({
  title: (lang === 'fr' ? f.title_fr : lang === 'de' ? f.title_de : f.title) || f.title,
  description: (lang === 'fr' ? f.description_fr : lang === 'de' ? f.description_de : f.description) || f.description,
});

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ── Vignette avec repli : une URL cassée ne doit pas laisser un carré vide ── */
const Thumb: React.FC<{ src?: string | null; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) {
    return (
      <div className={`grid place-items-center bg-stone-100 text-stone-300 ${className}`} role="img" aria-label={alt}>
        <PhotoIcon className="h-5 w-5" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`object-cover ${className}`} />;
};

/* ── Aperçu « lecture » : l'article tel qu'on le lit, en entier ──────────── */
const ArticleReader: React.FC<{ form: NewsForm; lang: Lang; onEdit?: () => void }> = ({ form, lang, onEdit }) => {
  const { title, description } = localized(form, lang);
  const readMore = { en: 'Read More', fr: 'Lire la suite', de: 'Mehr lesen' }[lang];
  const words = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <article className="bg-white rounded-2xl overflow-hidden ring-1 ring-stone-200">
      <div className="relative h-56">
        <Thumb src={form.image} alt={title || 'Aperçu'} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {form.category && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${previewCategoryColor(form.category)}`}>
            {form.category}
          </span>
        )}
      </div>

      <div className="px-7 py-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
          <span>{formatDate(form.date)}</span>
          {words > 0 && <><span aria-hidden="true">·</span><span>{minutes} min de lecture</span></>}
          {!form.is_published && (
            <><span aria-hidden="true">·</span><span className="text-amber-600 font-medium">Brouillon — non visible du public</span></>
          )}
        </div>

        {/* Titre et chapeau : la ligne éditoriale du site (serif + interlignage large). */}
        <h1 className="font-display text-3xl leading-tight font-semibold text-gray-900 mb-4">
          {title || <span className="text-gray-300">Titre de l’article</span>}
        </h1>

        {description ? (
          <p className="text-lg leading-relaxed text-gray-600 mb-6 pb-6 border-b border-gray-100">{description}</p>
        ) : (
          <p className="text-lg text-gray-300 mb-6 pb-6 border-b border-gray-100">Le chapeau de l’article apparaîtra ici.</p>
        )}

        {form.body.trim() ? (
          <ArticleBody body={form.body} className="max-w-[68ch]" />
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 px-5 py-8 text-center">
            <DocumentTextIcon className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-3 font-display text-base text-stone-700">Cet article n’a pas encore de corps de texte</p>
            <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
              Il ne contient qu’un titre et une accroche : c’est ce qui s’affiche dans le carrousel.
              Rédigez le contenu long dans « Contenu long » pour obtenir un article complet.
            </p>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-700 transition-colors duration-150 hover:bg-stone-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <PencilSquareIcon className="h-4 w-4" /> Rédiger l’article
              </button>
            )}
          </div>
        )}

        {form.link && (
          <div className="mt-8 pt-5 border-t border-gray-100">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {readMore} <span aria-hidden="true">→</span>
            </span>
            <span className="ml-2 text-xs text-gray-400">{form.link}</span>
          </div>
        )}
      </div>
    </article>
  );
};

/* ── Aperçu du rendu final : reproduit le site public (NewsSlider) ────────── */
const NewsPreview: React.FC<{ form: NewsForm; lang: Lang; mode: 'hero' | 'card' }> = ({ form, lang, mode }) => {
  const { title, description } = localized(form, lang);
  const readMore = { en: 'Read More', fr: 'Lire la Suite', de: 'Mehr Lesen' }[lang];

  if (mode === 'card') {
    return (
      <div className="max-w-[260px] mx-auto rounded-xl overflow-hidden shadow-md bg-white">
        <div className="relative h-32">
          <Thumb src={form.image} alt={title || 'Aperçu'} className="w-full h-full" />
          {form.category && (
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${previewCategoryColor(form.category)}`}>
                {form.category}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">{title || 'Titre de l’article'}</h4>
          <p className="text-xs text-gray-500 line-clamp-2">{description || 'La description apparaîtra ici.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl h-64">
      <Thumb src={form.image} alt={title || 'Aperçu'} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {form.category && (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${previewCategoryColor(form.category)}`}>
            {form.category}
          </span>
        )}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{title || 'Titre de l’article'}</h3>
        <p className="text-white/80 text-sm line-clamp-2 mb-3">{description || 'La description apparaîtra ici.'}</p>
        {form.link && <span className="inline-block text-secondary font-semibold text-sm">{readMore} →</span>}
      </div>
    </div>
  );
};

type PreviewMode = 'article' | 'hero' | 'card';
const PREVIEW_MODES: { value: PreviewMode; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'hero', label: 'À la une' },
  { value: 'card', label: 'Carte' },
];

/** Aiguillage unique : lecture complète, ou l'un des deux rendus du carrousel. */
const PreviewSurface: React.FC<{ form: NewsForm; lang: Lang; mode: PreviewMode; onEdit?: () => void }> = ({ form, lang, mode, onEdit }) =>
  mode === 'article'
    ? <ArticleReader form={form} lang={lang} onEdit={onEdit} />
    : <NewsPreview form={form} lang={lang} mode={mode} />;

/* ── Segmented control réutilisé pour la langue et le mode d'aperçu ───────── */
function Segmented<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string;
}) {
  return (
    <div className="inline-flex rounded-lg bg-stone-100 p-0.5" role="group" aria-label={label}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-3 py-1.5 text-xs font-medium rounded-[7px] transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            value === o.value ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const AdminNews: React.FC = () => {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filtres de liste
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Éditeur
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<Lang>('fr');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('article');

  // Aperçu seul (depuis la liste)
  const [previewing, setPreviewing] = useState<NewsRow | null>(null);

  const set = <K extends keyof NewsForm>(key: K, value: NewsForm[K]) => setForm(f => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetNews(1, 100);
      const data = res.data ?? res.news ?? res.results ?? res.items ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      // Le catalogue vit désormais en base : une panne doit se voir, pas être masquée par des données locales.
      setItems([]);
      setError(e?.message ?? 'Impossible de charger les actualités');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Échap ferme l'éditeur / l'aperçu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (previewing) setPreviewing(null);
      else if (editorOpen) setEditorOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen, previewing]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(n => {
      if (category && n.category !== category) return false;
      if (status === 'published' && !n.is_published) return false;
      if (status === 'draft' && n.is_published) return false;
      if (!q) return true;
      return [n.title, n.title_fr, n.description, n.description_fr]
        .some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [items, query, category, status]);

  const counts = useMemo(() => ({
    published: items.filter(n => n.is_published).length,
    draft: items.filter(n => !n.is_published).length,
  }), [items]);

  const usedCategories = useMemo(
    () => Array.from(new Set(items.map(n => n.category).filter(Boolean) as string[])).sort(),
    [items],
  );

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setLang('fr'); setEditorOpen(true); };
  const openEdit = (n: NewsRow) => { setEditingId(n.id); setForm(toForm(n)); setLang('fr'); setEditorOpen(true); };
  const openDuplicate = (n: NewsRow) => {
    setEditingId(null);
    setForm({ ...toForm(n), title: `${n.title} (copie)`, is_published: false, date: new Date().toISOString().slice(0, 10) });
    setLang('fr');
    setEditorOpen(true);
  };

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Le titre (EN) est obligatoire.'); return; }
    setSaving(true); setError('');
    try {
      if (editingId !== null) await apiService.adminUpdateNews(editingId, form);
      else await apiService.adminCreateNews(form);
      setEditorOpen(false);
      flash(editingId !== null ? 'Article mis à jour.' : 'Article créé.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  /** Bascule publié/brouillon sans ouvrir l'éditeur (PUT partiel : seul `is_published` part). */
  const togglePublish = async (n: NewsRow) => {
    const next = !n.is_published;
    setItems(prev => prev.map(i => (i.id === n.id ? { ...i, is_published: next } : i))); // optimiste
    try {
      await apiService.adminPublishNews(n.id, next);
    } catch (e: any) {
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, is_published: !next } : i))); // rollback
      setError(e?.message ?? 'Changement de statut impossible.');
    }
  };

  const handleDelete = async (n: NewsRow) => {
    if (!confirm(`Supprimer « ${n.title} » ?`)) return;
    try {
      await apiService.adminDeleteNews(n.id);
      flash('Article supprimé.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const statusOptions = [
    { value: 'all' as const, label: `Tous · ${items.length}` },
    { value: 'published' as const, label: `Publiés · ${counts.published}` },
    { value: 'draft' as const, label: `Brouillons · ${counts.draft}` },
  ];

  return (
    <div>
      <PageHeader
        title="Actualités"
        subtitle={`${items.length} article${items.length > 1 ? 's' : ''} · ${counts.published} en ligne · ${counts.draft} en brouillon`}
        actions={
          <>
            <IconButton title="Rafraîchir" onClick={load} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </IconButton>
            <PrimaryButton onClick={openCreate}><PlusIcon className="h-4 w-4" /> Nouvel article</PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Masquer l’erreur" className="cursor-pointer shrink-0"><XMarkIcon className="h-4 w-4" /></button>
        </div>
      )}
      {notice && <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">{notice}</div>}

      {/* Barre d'outils */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un titre, une description…"
            aria-label="Rechercher un article"
            className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Segmented label="Filtrer par statut" value={status} onChange={setStatus} options={statusOptions} />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          aria-label="Filtrer par catégorie"
          className="border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Toutes les catégories</option>
          {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Liste éditoriale */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <Card key={i} className="p-4">
              <div className="flex gap-4 animate-pulse">
                <div className="h-20 w-32 rounded-xl bg-stone-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/3 rounded bg-stone-100" />
                  <div className="h-3 w-full rounded bg-stone-100" />
                  <div className="h-3 w-1/3 rounded bg-stone-100" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <PhotoIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? 'Aucune actualité pour le moment' : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0 ? 'Créez votre premier article et prévisualisez son rendu avant publication.' : 'Essayez d’élargir vos filtres.'}
          </p>
          {items.length === 0 && (
            <div className="mt-5 flex justify-center">
              <PrimaryButton onClick={openCreate}><PlusIcon className="h-4 w-4" /> Nouvel article</PrimaryButton>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <Card key={n.id} className="p-4 transition-all duration-200 hover:shadow-card-hover hover:border-stone-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <Thumb src={n.image} alt={n.title} className="h-20 w-full sm:w-32 shrink-0 rounded-xl" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {n.category && <Badge tone="gold">{n.category}</Badge>}
                    <button
                      type="button"
                      onClick={() => togglePublish(n)}
                      title={n.is_published ? 'Dépublier' : 'Publier'}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        n.is_published
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${n.is_published ? 'bg-primary' : 'bg-stone-400'}`} />
                      {n.is_published ? 'En ligne' : 'Brouillon'}
                    </button>
                    <span className="text-xs text-stone-400">{formatDate(n.published_at)}</span>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-400" title={n.link}>
                        <LinkIcon className="h-3 w-3" /> lien
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base font-semibold text-stone-800 truncate">{n.title}</h3>
                  {n.title_fr && <p className="text-sm text-stone-500 truncate">{n.title_fr}</p>}
                  {(n.description_fr || n.description) && (
                    <p className="mt-1 text-sm text-stone-500 line-clamp-2">{n.description_fr || n.description}</p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0">
                  <IconButton title="Lire l’article" onClick={() => { setPreviewMode('article'); setPreviewing(n); }}><EyeIcon className="h-4 w-4" /></IconButton>
                  <IconButton tone="blue" title="Modifier" onClick={() => openEdit(n)}><PencilSquareIcon className="h-4 w-4" /></IconButton>
                  <IconButton title="Dupliquer" onClick={() => openDuplicate(n)}><DocumentDuplicateIcon className="h-4 w-4" /></IconButton>
                  <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(n)}><TrashIcon className="h-4 w-4" /></IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Éditeur plein écran : formulaire + aperçu live ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditorOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId !== null ? 'Modifier une actualité' : 'Nouvel article'}
            className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full max-w-5xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-800">
                  {editingId !== null ? 'Modifier l’article' : 'Nouvel article'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">L’aperçu reproduit le rendu du site public.</p>
              </div>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 overflow-y-auto grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
              {/* Formulaire */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Contenu</span>
                  <Segmented label="Langue éditée" value={lang} onChange={setLang} options={LANGS.map(l => ({ value: l.code, label: l.label }))} />
                </div>

                {/* Champs traduits : pilotés par l'onglet de langue, partagé avec l'aperçu. */}
                {lang === 'en' && (
                  <>
                    <Field label="Titre (EN)" required>
                      <TextInput value={form.title} onChange={e => set('title', e.target.value)} placeholder="Study Abroad — New Opportunities" />
                    </Field>
                    <Field label="Description (EN)">
                      <TextArea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
                    </Field>
                  </>
                )}
                {lang === 'fr' && (
                  <>
                    <Field label="Titre (FR)">
                      <TextInput value={form.title_fr} onChange={e => set('title_fr', e.target.value)} placeholder="Étudier à l’étranger — nouvelles opportunités" />
                    </Field>
                    <Field label="Description (FR)">
                      <TextArea rows={3} value={form.description_fr} onChange={e => set('description_fr', e.target.value)} />
                    </Field>
                    {!form.title && (
                      <p className="text-xs text-amber-600">Le titre anglais est obligatoire — renseignez-le dans l’onglet EN.</p>
                    )}
                  </>
                )}
                {lang === 'de' && (
                  <>
                    <Field label="Titre (DE)">
                      <TextInput value={form.title_de} onChange={e => set('title_de', e.target.value)} />
                    </Field>
                    <Field label="Description (DE)">
                      <TextArea rows={3} value={form.description_de} onChange={e => set('description_de', e.target.value)} />
                    </Field>
                    <p className="text-xs text-stone-400">L’allemand est stocké dans les traductions ; à défaut, le site affiche l’anglais.</p>
                  </>
                )}

                <div className="pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Réglages</div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Catégorie">
                    <Select value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">— Choisir —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                  <Field label="Date de publication">
                    <TextInput type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                  </Field>
                </div>

                <Field label="Image (URL)">
                  <TextInput value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="Lien « Lire la suite »">
                  <TextInput value={form.link} onChange={e => set('link', e.target.value)} placeholder="/actualites/mon-article" />
                </Field>
                <Field label="Contenu de l’article">
                  <TextArea
                    rows={10}
                    value={form.body}
                    onChange={e => set('body', e.target.value)}
                    placeholder={'Rédigez l’article ici.\n\nUne ligne vide crée un paragraphe.\n\n## Un sous-titre\n\n- un point de liste\n- un autre'}
                  />
                  <p className="mt-1.5 text-xs text-stone-400">
                    Ligne vide = nouveau paragraphe · <code className="text-stone-500">## </code> = sous-titre ·
                    <code className="text-stone-500"> - </code> = liste. Le rendu est visible à droite.
                  </p>
                </Field>

                <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => set('is_published', e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40 cursor-pointer"
                  />
                  <span className="text-sm text-stone-700">
                    Publier sur le site
                    <span className="block text-xs text-stone-400">Décoché, l’article reste en brouillon et n’est pas visible du public.</span>
                  </span>
                </label>
              </div>

              {/* Aperçu live */}
              <div className="p-6 bg-stone-50/70">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Aperçu · {lang.toUpperCase()}</span>
                  <Segmented label="Format d’aperçu" value={previewMode} onChange={setPreviewMode} options={PREVIEW_MODES} />
                </div>
                <div>
                  <PreviewSurface form={form} lang={lang} mode={previewMode} />
                  <p className="mt-4 text-xs text-stone-400 leading-relaxed">
                    « Article » = la page de lecture complète. « À la une » = bandeau principal du carrousel d’accueil.
                    « Carte » = vignette de la grille sous le carrousel.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/60 rounded-b-2xl">
              <span className="text-xs text-stone-400">
                {form.is_published ? 'Sera visible immédiatement sur le site.' : 'Sera enregistré comme brouillon.'}
              </span>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
                <PrimaryButton onClick={handleSave} disabled={saving || !form.title.trim()}>
                  <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Aperçu seul (depuis la liste) ── */}
      {previewing && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewing(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu de l’article"
            className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full max-w-3xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-stone-200">
              <h2 className="font-display text-xl font-semibold text-stone-800">Aperçu du rendu</h2>
              <div className="flex items-center gap-2">
                <Segmented label="Langue" value={lang} onChange={setLang} options={LANGS.map(l => ({ value: l.code, label: l.label }))} />
                <Segmented label="Format d’aperçu" value={previewMode} onChange={setPreviewMode} options={PREVIEW_MODES} />
                <IconButton onClick={() => setPreviewing(null)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/70">
              <PreviewSurface
                form={toForm(previewing)}
                lang={lang}
                mode={previewMode}
                onEdit={() => { const row = previewing; setPreviewing(null); openEdit(row); }}
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/60 rounded-b-2xl">
              <SecondaryButton onClick={() => setPreviewing(null)}>Fermer</SecondaryButton>
              <PrimaryButton onClick={() => { const row = previewing; setPreviewing(null); openEdit(row); }}>
                <PencilSquareIcon className="h-4 w-4" /> Modifier
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
