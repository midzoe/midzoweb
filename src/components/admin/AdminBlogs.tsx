import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiService } from '../../services/api';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, EyeIcon, MagnifyingGlassIcon,
  PhotoIcon, DocumentDuplicateIcon, XMarkIcon, ArrowPathIcon, DocumentTextIcon, LinkIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, PrimaryButton, SecondaryButton, Card, IconButton, Badge, Field, TextInput, TextArea, Select } from './ui';
// Moteur de rendu partagé avec la page publique : l'aperçu ne peut pas diverger du site.
import ArticleBody from '../news/ArticleBody';

const CATEGORIES = ['Études', 'Tourisme', 'Visa', 'Culture', 'Conseils', 'Témoignage'];

/** Mêmes teintes que `BlogList` / `BlogArticle` — une catégorie garde sa couleur partout. */
const PREVIEW_CATEGORY_COLORS: Record<string, string> = {
  'Études': 'bg-primary text-white',
  'Tourisme': 'bg-teal-600 text-white',
  'Visa': 'bg-blue-600 text-white',
  'Culture': 'bg-purple-600 text-white',
  'Conseils': 'bg-secondary text-white',
  'Témoignage': 'bg-amber-600 text-white',
};
const previewCategoryColor = (c?: string) => PREVIEW_CATEGORY_COLORS[c ?? ''] ?? 'bg-gray-600 text-white';

interface BlogRow {
  id: number;
  title: string;
  slug?: string | null;
  category?: string | null;
  author?: string | null;
  image?: string | null;
  excerpt?: string | null;
  body?: string | null;
  published_at?: string | null;
  is_published?: boolean;
}

type BlogForm = {
  title: string; slug: string; category: string; author: string;
  image: string; excerpt: string; body: string;
  published_at: string; is_published: boolean;
};

const emptyForm: BlogForm = {
  title: '', slug: '', category: '', author: 'Équipe Midzoe',
  image: '', excerpt: '', body: '',
  published_at: new Date().toISOString().slice(0, 10), is_published: false,
};

const toForm = (b: BlogRow): BlogForm => ({
  title: b.title ?? '',
  slug: b.slug ?? '',
  category: b.category ?? '',
  author: b.author ?? '',
  image: b.image ?? '',
  excerpt: b.excerpt ?? '',
  body: b.body ?? '',
  published_at: (b.published_at ?? '').slice(0, 10),
  is_published: !!b.is_published,
});

/** Slug lisible et stable : accents dépliés, ponctuation retirée, tirets simples. */
export function slugify(title: string): string {
  return title
    // U+0300–U+036F = diacritiques combinants. Construit depuis une chaîne ASCII :
    // un littéral d'expression régulière contiendrait des caractères invisibles,
    // fragiles au moindre ré-encodage du fichier (cf. accents déjà corrompus ici).
    .normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .replace(/['’]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

type PreviewMode = 'article' | 'card';
const PREVIEW_MODES: { value: PreviewMode; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'card', label: 'Carte' },
];

/* ── Aperçu : l'article en lecture, ou sa vignette dans la liste publique ── */
const BlogPreview: React.FC<{ form: BlogForm; mode: PreviewMode; onEdit?: () => void }> = ({ form, mode, onEdit }) => {
  const words = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));

  if (mode === 'card') {
    return (
      <div className="max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-white shadow-md">
        <div className="relative h-44">
          <Thumb src={form.image} alt={form.title || 'Aperçu'} className="w-full h-full" />
          {form.category && (
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${previewCategoryColor(form.category)}`}>
              {form.category}
            </span>
          )}
        </div>
        <div className="p-5">
          <h2 className="text-base font-bold text-gray-900 line-clamp-2">{form.title || 'Titre de l’article'}</h2>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{form.excerpt || 'L’extrait apparaîtra ici.'}</p>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
            {form.author && <span>Par {form.author}</span>}
            {form.author && form.published_at && <span aria-hidden="true"> · </span>}
            {form.published_at && <span>{formatDate(form.published_at)}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-2xl overflow-hidden ring-1 ring-stone-200">
      <div className="relative h-56">
        <Thumb src={form.image} alt={form.title || 'Aperçu'} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {form.category && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${previewCategoryColor(form.category)}`}>
            {form.category}
          </span>
        )}
      </div>

      <div className="px-7 py-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
          {form.author && <span>Par {form.author}</span>}
          {form.published_at && <><span aria-hidden="true">·</span><span>{formatDate(form.published_at)}</span></>}
          {words > 0 && <><span aria-hidden="true">·</span><span>{minutes} min de lecture</span></>}
          {!form.is_published && (
            <><span aria-hidden="true">·</span><span className="text-amber-600 font-medium">Brouillon — non visible du public</span></>
          )}
        </div>

        <h1 className="font-display text-3xl leading-tight font-semibold text-gray-900 mb-4">
          {form.title || <span className="text-gray-300">Titre de l’article</span>}
        </h1>

        {form.excerpt ? (
          <p className="text-lg leading-relaxed text-gray-600 mb-6 pb-6 border-b border-gray-100">{form.excerpt}</p>
        ) : (
          <p className="text-lg text-gray-300 mb-6 pb-6 border-b border-gray-100">L’extrait apparaîtra ici.</p>
        )}

        {form.body.trim() ? (
          <ArticleBody body={form.body} className="max-w-[68ch]" />
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 px-5 py-8 text-center">
            <DocumentTextIcon className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-3 font-display text-base text-stone-700">Cet article n’a pas encore de contenu</p>
            <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
              Rédigez-le dans le champ « Contenu de l’article » : le rendu s’affiche ici au fil de la frappe.
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
      </div>
    </article>
  );
};

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

const AdminBlogs: React.FC = () => {
  const [items, setItems] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('article');

  const [previewing, setPreviewing] = useState<BlogRow | null>(null);

  const set = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) => setForm(f => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetBlogs(1, 100);
      const data = res.data ?? res.blogs ?? res.results ?? res.items ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      // Le catalogue vit en base : une panne doit se voir, pas être masquée par le mock local.
      setItems([]);
      setError(e?.message ?? 'Impossible de charger les articles de blog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
    return items.filter(b => {
      if (category && b.category !== category) return false;
      if (status === 'published' && !b.is_published) return false;
      if (status === 'draft' && b.is_published) return false;
      if (!q) return true;
      return [b.title, b.excerpt, b.author, b.slug].some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [items, query, category, status]);

  const counts = useMemo(() => ({
    published: items.filter(b => b.is_published).length,
    draft: items.filter(b => !b.is_published).length,
  }), [items]);

  const usedCategories = useMemo(
    () => Array.from(new Set(items.map(b => b.category).filter(Boolean) as string[])).sort(),
    [items],
  );

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setSlugTouched(false); setEditorOpen(true); };
  // Sur un article existant, le slug est une URL déjà publique : on ne la régénère jamais tout seul.
  const openEdit = (b: BlogRow) => { setEditingId(b.id); setForm(toForm(b)); setSlugTouched(true); setEditorOpen(true); };
  const openDuplicate = (b: BlogRow) => {
    setEditingId(null);
    const title = `${b.title} (copie)`;
    setForm({ ...toForm(b), title, slug: slugify(title), is_published: false, published_at: new Date().toISOString().slice(0, 10) });
    setSlugTouched(false);
    setEditorOpen(true);
  };

  /** Tant que l'auteur n'a pas repris la main sur le slug, il suit le titre. */
  const onTitleChange = (title: string) =>
    setForm(f => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return; }
    setSaving(true); setError('');
    const payload = { ...form, slug: form.slug.trim() || slugify(form.title) };
    try {
      if (editingId !== null) await apiService.adminUpdateBlog(editingId, payload);
      else await apiService.adminCreateBlog(payload);
      setEditorOpen(false);
      flash(editingId !== null ? 'Article mis à jour.' : 'Article créé.');
      await load();
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      // Le backend renvoie 409 « Slug already exists » : le dire clairement plutôt qu'« erreur ».
      setError(/409|slug already exists/i.test(msg)
        ? `Le slug « ${payload.slug} » est déjà pris par un autre article — modifiez-le.`
        : msg || 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const togglePublish = async (b: BlogRow) => {
    const next = !b.is_published;
    setItems(prev => prev.map(i => (i.id === b.id ? { ...i, is_published: next } : i)));
    try {
      await apiService.adminUpdateBlog(b.id, { is_published: next });
    } catch (e: any) {
      setItems(prev => prev.map(i => (i.id === b.id ? { ...i, is_published: !next } : i)));
      setError(e?.message ?? 'Changement de statut impossible.');
    }
  };

  const handleDelete = async (b: BlogRow) => {
    if (!confirm(`Supprimer « ${b.title} » ?`)) return;
    try {
      await apiService.adminDeleteBlog(b.id);
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
        title="Blogs"
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

      <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un titre, un extrait, un auteur, un slug…"
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
          <DocumentTextIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? 'Aucun article de blog' : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0 ? 'Rédigez votre premier article et prévisualisez-le avant publication.' : 'Essayez d’élargir vos filtres.'}
          </p>
          {items.length === 0 && (
            <div className="mt-5 flex justify-center">
              <PrimaryButton onClick={openCreate}><PlusIcon className="h-4 w-4" /> Nouvel article</PrimaryButton>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const words = (b.body ?? '').trim() ? (b.body ?? '').trim().split(/\s+/).length : 0;
            return (
              <Card key={b.id} className="p-4 transition-all duration-200 hover:shadow-card-hover hover:border-stone-300">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Thumb src={b.image} alt={b.title} className="h-20 w-full sm:w-32 shrink-0 rounded-xl" />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {b.category && <Badge tone="gold">{b.category}</Badge>}
                      <button
                        type="button"
                        onClick={() => togglePublish(b)}
                        title={b.is_published ? 'Dépublier' : 'Publier'}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                          b.is_published ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${b.is_published ? 'bg-primary' : 'bg-stone-400'}`} />
                        {b.is_published ? 'En ligne' : 'Brouillon'}
                      </button>
                      <span className="text-xs text-stone-400">{formatDate(b.published_at)}</span>
                      <span className="text-xs text-stone-400">
                        {words > 0 ? `${words} mots` : 'sans contenu'}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold text-stone-800 truncate">{b.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-stone-400 truncate">
                      <LinkIcon className="h-3 w-3 shrink-0" />
                      /blog/{b.slug || b.id}
                      {b.author && <span className="ml-2 text-stone-400">· {b.author}</span>}
                    </p>
                    {b.excerpt && <p className="mt-1 text-sm text-stone-500 line-clamp-2">{b.excerpt}</p>}
                  </div>

                  <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0">
                    <IconButton title="Lire l’article" onClick={() => { setPreviewMode('article'); setPreviewing(b); }}><EyeIcon className="h-4 w-4" /></IconButton>
                    <IconButton tone="blue" title="Modifier" onClick={() => openEdit(b)}><PencilSquareIcon className="h-4 w-4" /></IconButton>
                    <IconButton title="Dupliquer" onClick={() => openDuplicate(b)}><DocumentDuplicateIcon className="h-4 w-4" /></IconButton>
                    <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(b)}><TrashIcon className="h-4 w-4" /></IconButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Éditeur : formulaire + aperçu live ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditorOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId !== null ? 'Modifier un article' : 'Nouvel article'}
            className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full max-w-5xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-800">
                  {editingId !== null ? 'Modifier l’article' : 'Nouvel article'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">L’aperçu reproduit le rendu de la page publique.</p>
              </div>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 overflow-y-auto grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
              <div className="p-6 space-y-4">
                <Field label="Titre" required>
                  <TextInput value={form.title} onChange={e => onTitleChange(e.target.value)} placeholder="Comment obtenir une bourse pour étudier en France" />
                </Field>

                <Field label="Slug (URL publique)">
                  <TextInput
                    value={form.slug}
                    onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }}
                    placeholder="bourse-etudier-france-2026"
                  />
                  <p className="mt-1.5 text-xs text-stone-400">
                    L’article sera lisible sur <span className="text-stone-500">/blog/{form.slug || '…'}</span>
                    {!slugTouched && form.slug && ' — dérivé du titre, modifiable.'}
                  </p>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Catégorie">
                    <Select value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">— Choisir —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                  <Field label="Auteur">
                    <TextInput value={form.author} onChange={e => set('author', e.target.value)} />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Date de publication">
                    <TextInput type="date" value={form.published_at} onChange={e => set('published_at', e.target.value)} />
                  </Field>
                  <Field label="Image (URL)">
                    <TextInput value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" />
                  </Field>
                </div>

                <Field label="Extrait">
                  <TextArea rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
                    placeholder="Le résumé affiché dans la liste du blog et en chapeau de l’article." />
                </Field>

                <Field label="Contenu de l’article">
                  <TextArea
                    rows={14}
                    value={form.body}
                    onChange={e => set('body', e.target.value)}
                    placeholder={'Rédigez l’article ici.\n\nUne ligne vide crée un paragraphe.\n\n## Un sous-titre\n\n- un point de liste\n1. ou une étape numérotée'}
                  />
                  <p className="mt-1.5 text-xs text-stone-400">
                    Ligne vide = paragraphe · <code className="text-stone-500">## </code> = sous-titre ·
                    <code className="text-stone-500"> - </code> = liste · <code className="text-stone-500">1. </code> = liste numérotée.
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
                    <span className="block text-xs text-stone-400">Décoché, l’article reste en brouillon et renvoie une 404 au public.</span>
                  </span>
                </label>
              </div>

              <div className="p-6 bg-stone-50/70">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Aperçu</span>
                  <Segmented label="Format d’aperçu" value={previewMode} onChange={setPreviewMode} options={PREVIEW_MODES} />
                </div>
                <BlogPreview form={form} mode={previewMode} />
                <p className="mt-4 text-xs text-stone-400 leading-relaxed">
                  « Article » = la page <span className="text-stone-500">/blog/{form.slug || '…'}</span>.
                  « Carte » = la vignette dans la liste du blog.
                </p>
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
                <Segmented label="Format d’aperçu" value={previewMode} onChange={setPreviewMode} options={PREVIEW_MODES} />
                <IconButton onClick={() => setPreviewing(null)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/70">
              <BlogPreview
                form={toForm(previewing)}
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

export default AdminBlogs;
