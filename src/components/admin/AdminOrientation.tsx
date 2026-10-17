import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon,
  ArrowPathIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, MapPinIcon, EyeIcon,
  EyeSlashIcon, LightBulbIcon, BookOpenIcon, BuildingOffice2Icon, AcademicCapIcon,
  DocumentTextIcon, Squares2X2Icon, LinkIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select,
} from './ui';

/**
 * Story 10.1 : gestion des ressources d'orientation (guides, livres, organismes,
 * certifications). Écran custom plutôt qu'`AdminCRUD` générique : une fiche porte
 * beaucoup de texte (description, organisme, lien, lieu) qu'un tableau tronque.
 *
 * `location` = lieu de la formation ; il n'est exposé qu'aux abonnés premium côté
 * public (FR35), d'où le marquage explicite dans la liste et dans l'éditeur.
 */

type ResourceType = 'guide' | 'book' | 'company' | 'certification';

interface ResourceRow {
  id: number;
  title: string;
  type: ResourceType | string;
  category?: string | null;
  description?: string | null;
  provider?: string | null;
  link?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  isValidated: boolean;
  order: number;
}

const TYPES: { value: ResourceType; label: string; plural: string; icon: React.ElementType; tone: 'blue' | 'indigo' | 'gold' | 'green' }[] = [
  { value: 'guide', label: 'Guide', plural: 'Guides', icon: DocumentTextIcon, tone: 'blue' },
  { value: 'book', label: 'Livre', plural: 'Livres', icon: BookOpenIcon, tone: 'indigo' },
  { value: 'company', label: 'Organisme', plural: 'Organismes', icon: BuildingOffice2Icon, tone: 'gold' },
  { value: 'certification', label: 'Certification', plural: 'Certifications', icon: AcademicCapIcon, tone: 'green' },
];

const typeMeta = (type: string) => TYPES.find(t => t.value === type);

/** Domaine affiché à la place de l'URL brute ; l'URL complète reste en `title`. */
const hostOf = (link: string) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

type ResourceForm = {
  title: string; type: ResourceType; category: string; provider: string;
  description: string; link: string; location: string; imageUrl: string;
  order: string; isValidated: boolean;
};

const emptyForm: ResourceForm = {
  title: '', type: 'guide', category: '', provider: '',
  description: '', link: '', location: '', imageUrl: '',
  order: '0', isValidated: true,
};

const toForm = (r: ResourceRow): ResourceForm => ({
  title: r.title ?? '',
  type: (typeMeta(r.type)?.value ?? 'guide') as ResourceType,
  category: r.category ?? '',
  provider: r.provider ?? '',
  description: r.description ?? '',
  link: r.link ?? '',
  location: r.location ?? '',
  imageUrl: r.imageUrl ?? '',
  order: String(r.order ?? 0),
  isValidated: r.isValidated !== false,
});

type GroupBy = 'none' | 'type' | 'category';
const GROUPINGS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'Liste' },
  { value: 'type', label: 'Par type' },
  { value: 'category', label: 'Par domaine' },
];

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

/* ── Répartition par domaine : barres proportionnelles, cliquables ─────────── */
const CategoryBreakdown: React.FC<{
  rows: { category: string; count: number }[];
  total: number;
  selected: string;
  onSelect: (category: string) => void;
}> = ({ rows, total, selected, onSelect }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-lg font-semibold text-stone-800">Répartition par domaine</h2>
      <span className="text-xs text-stone-400">{rows.length} domaines · {total} ressources</span>
    </div>
    <div className="space-y-2">
      {rows.map(({ category, count }) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        const active = selected === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(active ? '' : category)}
            aria-pressed={active}
            title={active ? 'Retirer le filtre' : `Filtrer sur ${category}`}
            className={`w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              active ? 'bg-primary/10' : 'hover:bg-stone-50'
            }`}
          >
            <span className={`w-52 shrink-0 truncate text-sm ${active ? 'text-primary font-medium' : 'text-stone-700'}`}>
              {category}
            </span>
            <span className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
              <span
                className={`block h-full rounded-full transition-all duration-500 ${active ? 'bg-primary' : 'bg-gold-400'}`}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </span>
            <span className="w-20 shrink-0 text-right text-sm tabular-nums text-stone-600">
              {count} <span className="text-stone-400 text-xs">· {pct}%</span>
            </span>
          </button>
        );
      })}
    </div>
  </Card>
);

/* ── Fiche ressource : tout ce que porte l'enregistrement, rien de tronqué ── */
const ResourceCard: React.FC<{
  r: ResourceRow;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  busy?: boolean;
}> = ({ r, onEdit, onDelete, onToggle, busy }) => {
  const meta = typeMeta(r.type);
  const Icon = meta?.icon ?? LightBulbIcon;

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-card-hover hover:border-stone-300 ${r.isValidated ? '' : 'bg-stone-50/60'}`}>
      <div className="flex gap-4">
        {/* Vignette : image si elle existe, sinon pictogramme du type */}
        <div className="shrink-0">
          {r.imageUrl ? (
            <img src={r.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-stone-200" />
          ) : (
            <div className="h-12 w-12 rounded-xl grid place-items-center bg-stone-100 text-stone-500">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge tone={meta?.tone ?? 'slate'}><Icon className="h-3.5 w-3.5" /> {meta?.label ?? r.type}</Badge>
            {r.category && <Badge tone="slate">{r.category}</Badge>}
            {!r.isValidated && (
              <Badge tone="amber"><EyeSlashIcon className="h-3.5 w-3.5" /> Masquée du site</Badge>
            )}
          </div>

          <h3 className="font-display text-base font-semibold text-stone-800">{r.title}</h3>
          {r.provider && <p className="mt-0.5 text-sm text-stone-500">{r.provider}</p>}

          {r.description ? (
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{r.description}</p>
          ) : (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold-700">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" /> Aucune description
            </p>
          )}

          {/* Le lieu n'est visible que par les abonnés premium côté site (FR35). */}
          {r.location && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              <MapPinIcon className="h-3.5 w-3.5" /> {r.location}
              <span className="text-indigo-400 font-normal">· premium</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
            <span className="tabular-nums">#{r.id}</span>
            <span>· ordre {r.order}</span>
            {r.link ? (
              <a
                href={r.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-stone-400 hover:text-primary transition-colors duration-150"
                title={r.link}
              >
                <ArrowTopRightOnSquareIcon className="h-3 w-3" /> {hostOf(r.link)}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-gold-700">
                <LinkIcon className="h-3 w-3" /> sans lien
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center justify-start gap-1 shrink-0">
          <IconButton
            tone={r.isValidated ? 'green' : 'amber'}
            title={r.isValidated ? 'Masquer du site' : 'Publier sur le site'}
            onClick={onToggle}
            disabled={busy}
          >
            {r.isValidated ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
          </IconButton>
          <IconButton tone="blue" title="Modifier" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
          <IconButton tone="rose" title="Supprimer" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
        </div>
      </div>
    </Card>
  );
};

const AdminOrientation: React.FC = () => {
  const [items, setItems] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  // Filtres
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [onlyHidden, setOnlyHidden] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Édition
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ResourceForm>(key: K, value: ResourceForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetOrientation();
      const data = res?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? 'Impossible de charger les ressources d’orientation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && editorOpen) setEditorOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen]);

  /* ── Synthèse : sur le catalogue entier, pas sur le filtre ── */
  const stats = useMemo(() => {
    const categories = new Set<string>();
    let published = 0, withLocation = 0, withLink = 0;
    for (const r of items) {
      if (r.category) categories.add(r.category);
      if (r.isValidated) published++;
      if (r.location) withLocation++;
      if (r.link) withLink++;
    }
    return {
      categories: categories.size,
      published,
      hidden: items.length - published,
      withLocation,
      withoutLocation: items.length - withLocation,
      withoutLink: items.length - withLink,
      pctPublished: items.length ? Math.round((published / items.length) * 100) : 0,
      pctLocation: items.length ? Math.round((withLocation / items.length) * 100) : 0,
    };
  }, [items]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of items) map.set(r.type, (map.get(r.type) ?? 0) + 1);
    return map;
  }, [items]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of items) map.set(r.category || '— Sans domaine', (map.get(r.category || '— Sans domaine') ?? 0) + 1);
    return [...map.entries()]
      .map(([c, count]) => ({ category: c, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'fr'));
  }, [items]);

  /** Domaines déjà saisis : sert au filtre et aux suggestions de l'éditeur. */
  const categoryOptions = useMemo(
    () => [...new Set(items.map(r => r.category).filter((c): c is string => !!c))].sort((a, b) => a.localeCompare(b, 'fr')),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(r => {
      if (type && r.type !== type) return false;
      if (category && (r.category || '— Sans domaine') !== category) return false;
      if (onlyHidden && r.isValidated) return false;
      if (!q) return true;
      return [r.title, r.provider, r.description, r.category, r.location, r.link]
        .some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [items, query, type, category, onlyHidden]);

  const groups = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, ResourceRow[]>();
    for (const r of filtered) {
      const key = groupBy === 'type'
        ? (typeMeta(r.type)?.plural ?? r.type)
        : (r.category || '— Sans domaine');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    const order = groupBy === 'type' ? TYPES.map(t => t.plural) : null;
    return [...map.entries()].sort((a, b) => {
      if (order) {
        const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return b[1].length - a[1].length || a[0].localeCompare(b[0], 'fr');
    });
  }, [filtered, groupBy]);

  const activeFilters = [type, category, query.trim()].filter(Boolean).length + (onlyHidden ? 1 : 0);
  const resetFilters = () => { setQuery(''); setType(''); setCategory(''); setOnlyHidden(false); };

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const openCreate = () => {
    // Nouvelle fiche placée en fin de liste : l'ordre pilote l'affichage public.
    const nextOrder = items.reduce((max, r) => Math.max(max, r.order ?? 0), 0) + 10;
    setEditingId(null);
    setForm({ ...emptyForm, order: String(nextOrder) });
    setEditorOpen(true);
  };
  const openEdit = (r: ResourceRow) => { setEditingId(r.id); setForm(toForm(r)); setEditorOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return; }
    setSaving(true); setError('');
    const payload = {
      title: form.title.trim(),
      type: form.type,
      category: form.category.trim() || null,
      provider: form.provider.trim() || null,
      description: form.description.trim() || null,
      link: form.link.trim() || null,
      location: form.location.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      order: Number(form.order) || 0,
      isValidated: form.isValidated,
    };
    try {
      if (editingId !== null) await apiService.adminUpdateOrientation(editingId, payload);
      else await apiService.adminCreateOrientation(payload);
      setEditorOpen(false);
      flash(editingId !== null ? 'Ressource mise à jour.' : 'Ressource créée.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (r: ResourceRow) => {
    setBusyId(r.id); setError('');
    try {
      await apiService.adminUpdateOrientation(r.id, { isValidated: !r.isValidated });
      setItems(list => list.map(x => (x.id === r.id ? { ...x, isValidated: !r.isValidated } : x)));
      flash(r.isValidated ? `« ${r.title} » masquée du site.` : `« ${r.title} » publiée.`);
    } catch (e: any) {
      setError(e?.message ?? 'Modification impossible.');
    } finally { setBusyId(null); }
  };

  const handleDelete = async (r: ResourceRow) => {
    if (!confirm(`Supprimer « ${r.title} » ? Cette action est définitive.`)) return;
    try {
      await apiService.adminDeleteOrientation(r.id);
      flash('Ressource supprimée.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const selectCls = 'border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      <PageHeader
        title="Orientation"
        subtitle={`${items.length} ressource${items.length > 1 ? 's' : ''} · ${byType.size} type${byType.size > 1 ? 's' : ''} · ${stats.categories} domaine${stats.categories > 1 ? 's' : ''}`}
        actions={
          <>
            <IconButton title="Rafraîchir" onClick={load} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </IconButton>
            <PrimaryButton onClick={openCreate}><PlusIcon className="h-4 w-4" /> Ajouter</PrimaryButton>
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

      {/* ── Synthèse ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          label="Ressources"
          value={items.length}
          icon={LightBulbIcon}
          tone="primary"
          hint={`${byType.get('guide') ?? 0} guides · ${byType.get('certification') ?? 0} certifications`}
        />
        <StatCard
          label="Publiées"
          value={`${stats.pctPublished}%`}
          icon={EyeIcon}
          tone={stats.hidden === 0 ? 'teal' : 'rose'}
          hint={stats.hidden === 0 ? 'Tout le catalogue est en ligne' : `${stats.hidden} masquée${stats.hidden > 1 ? 's' : ''} du site`}
        />
        <StatCard
          label="Domaines"
          value={stats.categories}
          icon={Squares2X2Icon}
          tone="gold"
          hint={byCategory[0] ? `${byCategory[0].category} en tête (${byCategory[0].count})` : undefined}
        />
        <StatCard
          label="Lieu renseigné"
          value={`${stats.pctLocation}%`}
          icon={MapPinIcon}
          tone="indigo"
          hint={`${stats.withLocation} fiches avec lieu — visible des premium`}
        />
      </div>

      {/* ── Répartition par domaine ── */}
      {!loading && byCategory.length > 0 && (
        <div className="mb-6">
          <CategoryBreakdown rows={byCategory} total={items.length} selected={category} onSelect={setCategory} />
        </div>
      )}

      {/* ── Filtres ── */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un titre, un organisme, une description, un lieu…"
              aria-label="Rechercher une ressource"
              className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Segmented label="Regroupement" value={groupBy} onChange={setGroupBy} options={GROUPINGS} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Types en puces : quatre valeurs seulement, avec leur volume. */}
          <div className="inline-flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setType('')}
              aria-pressed={type === ''}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                type === '' ? 'bg-primary text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
              }`}
            >
              Tous les types <span className="tabular-nums text-xs opacity-70">({items.length})</span>
            </button>
            {TYPES.map(t => {
              const count = byType.get(t.value) ?? 0;
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(active ? '' : t.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    active ? 'bg-primary text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.plural}
                  <span className="tabular-nums text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filtrer par domaine" className={selectCls}>
            <option value="">Tous les domaines</option>
            {byCategory.map(c => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
          </select>

          <button
            type="button"
            onClick={() => setOnlyHidden(v => !v)}
            aria-pressed={onlyHidden}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              onlyHidden ? 'bg-gold-100 text-gold-800 border border-gold-300' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <EyeSlashIcon className="h-4 w-4" /> Masquées du site
            {stats.hidden > 0 && <span className="tabular-nums text-xs">({stats.hidden})</span>}
          </button>

          {activeFilters > 0 && (
            <button type="button" onClick={resetFilters}
              className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary transition-colors duration-150 cursor-pointer">
              <XMarkIcon className="h-4 w-4" /> Réinitialiser ({activeFilters})
            </button>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-stone-500">
        {filtered.length} ressource{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
        {filtered.length !== items.length && <span className="text-stone-400"> sur {items.length}</span>}
      </p>

      {/* ── Liste ── */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-24 rounded bg-stone-100" />
                <div className="h-4 w-1/2 rounded bg-stone-100" />
                <div className="h-3 w-2/3 rounded bg-stone-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <LightBulbIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? 'Aucune ressource' : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0
              ? 'Ajoutez une première ressource — ou lancez le seed du catalogue.'
              : 'Essayez d’élargir vos filtres.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {activeFilters > 0 && <SecondaryButton onClick={resetFilters}>Réinitialiser les filtres</SecondaryButton>}
            {items.length === 0 && <PrimaryButton onClick={openCreate}><PlusIcon className="h-4 w-4" /> Ajouter</PrimaryButton>}
          </div>
        </Card>
      ) : groups ? (
        <div className="space-y-6">
          {groups.map(([key, list]) => {
            const isCollapsed = collapsed[key];
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setCollapsed(c => ({ ...c, [key]: !c[key] }))}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center gap-2 mb-3 text-left cursor-pointer group"
                >
                  <ChevronRightIcon className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                  <h2 className="font-display text-lg font-semibold text-stone-800 group-hover:text-primary transition-colors duration-150">{key}</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 tabular-nums">{list.length}</span>
                  <span className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent ml-2" />
                </button>
                {!isCollapsed && (
                  <div className="space-y-3">
                    {list.map(r => (
                      <ResourceCard
                        key={`${key}-${r.id}`}
                        r={r}
                        busy={busyId === r.id}
                        onEdit={() => openEdit(r)}
                        onDelete={() => handleDelete(r)}
                        onToggle={() => handleToggle(r)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <ResourceCard
              key={r.id}
              r={r}
              busy={busyId === r.id}
              onEdit={() => openEdit(r)}
              onDelete={() => handleDelete(r)}
              onToggle={() => handleToggle(r)}
            />
          ))}
        </div>
      )}

      {/* ── Éditeur ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditorOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId !== null ? 'Modifier une ressource' : 'Ajouter une ressource'}
            className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full max-w-2xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-display text-xl font-semibold text-stone-800">
                {editingId !== null ? 'Modifier la ressource' : 'Ajouter une ressource'}
              </h2>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Field label="Titre" required>
                <TextInput value={form.title} onChange={e => set('title', e.target.value)} placeholder="Campus France — procédure « Études en France »" />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Type" required>
                  <Select value={form.type} onChange={e => set('type', e.target.value as ResourceType)}>
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </Field>
                <Field label="Domaine">
                  <TextInput
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    placeholder="Études à l’étranger"
                    list="admin-orientation-categories"
                  />
                </Field>
              </div>
              {/* Suggestions issues du catalogue : évite « Langues » / « langues » en doublon. */}
              <datalist id="admin-orientation-categories">
                {categoryOptions.map(c => <option key={c} value={c} />)}
              </datalist>

              <Field label="Organisme / éditeur">
                <TextInput value={form.provider} onChange={e => set('provider', e.target.value)} placeholder="Campus France" />
              </Field>

              <Field label="Description">
                <TextArea
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Ce que la ressource apporte concrètement, et quand s’en servir."
                />
              </Field>

              <Field label="Lien">
                <TextInput value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://…" />
              </Field>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400 mb-3">
                  Réservé aux abonnés premium
                </p>
                <Field label="Lieu de la formation">
                  <TextInput value={form.location} onChange={e => set('location', e.target.value)} placeholder="Goethe-Institut Lomé (Togo)" />
                </Field>
                <p className="mt-2 text-xs text-stone-400">
                  Seuls les abonnés premium voient ce champ sur le site. Ne le remplissez que
                  s’il est vérifiable — « En ligne » est une réponse valable.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Image (URL)">
                  <TextInput value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="Ordre d’affichage">
                  <TextInput
                    type="number"
                    value={form.order}
                    onChange={e => set('order', e.target.value)}
                    placeholder="0"
                  />
                </Field>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-stone-200 p-4 cursor-pointer hover:bg-stone-50 transition-colors duration-150">
                <input
                  type="checkbox"
                  checked={form.isValidated}
                  onChange={e => set('isValidated', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30 cursor-pointer"
                />
                <span>
                  <span className="block text-sm font-medium text-stone-700">Publier sur le site</span>
                  <span className="block text-xs text-stone-400">
                    Décoché, l’enregistrement reste visible ici mais disparaît de la page /orientation.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/60 rounded-b-2xl">
              <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !form.title.trim()}>
                <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrientation;
