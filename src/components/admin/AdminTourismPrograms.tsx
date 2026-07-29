import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon,
  ArrowPathIcon, ChevronRightIcon, MapPinIcon, MapIcon, TruckIcon, PhotoIcon,
  EyeIcon, EyeSlashIcon, GlobeAmericasIcon, TrophyIcon, BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select,
} from './ui';

/**
 * Story 6.1 : programmes tourisme à destination fixe.
 *
 * Écran custom plutôt qu'`AdminCRUD` générique : une fiche porte un itinéraire, un
 * descriptif et une logistique de transport qu'un tableau tronque — or c'est précisément
 * ce qu'il faut relire avant de publier.
 *
 * Les deux sous-catégories ne sont pas décoratives : le site n'affiche les programmes que
 * sur `/services/tourism-safari` (safari) et `/services/tourism-sports` (sport). Une fiche
 * rangée ailleurs n'apparaîtrait nulle part.
 *
 * `country` reprend `TourismCountry.name` (anglais) : c'est la clé qui relie un programme
 * à sa fiche pays.
 */

const SUBCATEGORIES: { value: string; label: string; plural: string; icon: React.ElementType; tone: 'gold' | 'indigo' }[] = [
  { value: 'safari', label: 'Safari', plural: 'Safaris', icon: GlobeAmericasIcon, tone: 'gold' },
  { value: 'sport', label: 'Sport', plural: 'Sports', icon: TrophyIcon, tone: 'indigo' },
];

const subMeta = (value: string) => SUBCATEGORIES.find(s => s.value === value);

const CURRENCIES = ['EUR', 'USD', 'XOF', 'MAD', 'ZAR', 'KES', 'AED', 'THB', 'TRY', 'GBP'];

interface ProgramRow {
  id: number;
  title: string;
  subcategory: string;
  country: string;
  city?: string | null;
  description?: string | null;
  itinerary?: string | null;
  transport?: string | null;
  price?: number | null;
  currency?: string | null;
  images?: string[] | null;
  isValidated: boolean;
}

type ProgramForm = {
  title: string; subcategory: string; country: string; city: string;
  description: string; itinerary: string; transport: string;
  price: string; currency: string; images: string; isValidated: boolean;
};

const emptyForm: ProgramForm = {
  title: '', subcategory: 'safari', country: '', city: '',
  description: '', itinerary: '', transport: '',
  price: '', currency: 'EUR', images: '', isValidated: false,
};

/** Les images sont un tableau JSON en base ; l'éditeur les manipule en une URL par ligne. */
const imagesOf = (r: ProgramRow): string[] => (Array.isArray(r.images) ? r.images.filter(Boolean) : []);

const toForm = (r: ProgramRow): ProgramForm => ({
  title: r.title ?? '',
  subcategory: subMeta(r.subcategory)?.value ?? 'safari',
  country: r.country ?? '',
  city: r.city ?? '',
  description: r.description ?? '',
  itinerary: r.itinerary ?? '',
  transport: r.transport ?? '',
  price: r.price != null ? String(r.price) : '',
  currency: r.currency ?? 'EUR',
  images: imagesOf(r).join('\n'),
  isValidated: r.isValidated === true,
});

const formatPrice = (price: number, currency?: string | null) =>
  `${new Intl.NumberFormat('fr-FR').format(price)} ${currency ?? 'EUR'}`;

type GroupBy = 'none' | 'subcategory' | 'country';
const GROUPINGS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'Liste' },
  { value: 'subcategory', label: 'Par catégorie' },
  { value: 'country', label: 'Par pays' },
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

/* ── Répartition par pays : barres proportionnelles, cliquables ─────────────── */
const CountryBreakdown: React.FC<{
  rows: { country: string; count: number }[];
  total: number;
  selected: string;
  onSelect: (country: string) => void;
}> = ({ rows, total, selected, onSelect }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-lg font-semibold text-stone-800">Répartition par destination</h2>
      <span className="text-xs text-stone-400">{rows.length} pays · {total} programmes</span>
    </div>
    <div className="space-y-2">
      {rows.map(({ country, count }) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        const active = selected === country;
        return (
          <button
            key={country}
            type="button"
            onClick={() => onSelect(active ? '' : country)}
            aria-pressed={active}
            title={active ? 'Retirer le filtre' : `Filtrer sur ${country}`}
            className={`w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              active ? 'bg-primary/10' : 'hover:bg-stone-50'
            }`}
          >
            <span className={`w-44 shrink-0 truncate text-sm ${active ? 'text-primary font-medium' : 'text-stone-700'}`}>
              {country}
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

/* ── Fiche programme : itinéraire et logistique visibles sans ouvrir l'éditeur ─ */
const ProgramCard: React.FC<{
  p: ProgramRow;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  busy?: boolean;
}> = ({ p, onEdit, onDelete, onToggle, busy }) => {
  const meta = subMeta(p.subcategory);
  const Icon = meta?.icon ?? GlobeAmericasIcon;
  const cover = imagesOf(p)[0];

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-card-hover hover:border-stone-300 ${p.isValidated ? '' : 'bg-stone-50/60'}`}>
      <div className="flex gap-4">
        <div className="shrink-0">
          {cover ? (
            <img src={cover} alt="" className="h-24 w-32 rounded-xl object-cover border border-stone-200" />
          ) : (
            <div className="h-24 w-32 rounded-xl grid place-items-center bg-stone-100 text-stone-400">
              <PhotoIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge tone={meta?.tone ?? 'slate'}><Icon className="h-3.5 w-3.5" /> {meta?.label ?? p.subcategory}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
              <MapPinIcon className="h-3.5 w-3.5" /> {[p.city, p.country].filter(Boolean).join(', ')}
            </span>
            {p.price != null ? (
              <Badge tone="green"><BanknotesIcon className="h-3.5 w-3.5" /> dès {formatPrice(p.price, p.currency)}</Badge>
            ) : (
              <Badge tone="amber"><ExclamationTriangleIcon className="h-3.5 w-3.5" /> Prix à définir</Badge>
            )}
            {!p.isValidated && (
              <Badge tone="slate"><EyeSlashIcon className="h-3.5 w-3.5" /> Proposition — hors ligne</Badge>
            )}
          </div>

          <h3 className="font-display text-base font-semibold text-stone-800">{p.title}</h3>

          {p.description && <p className="mt-2 text-sm text-stone-600 leading-relaxed">{p.description}</p>}

          {p.itinerary && (
            <div className="mt-3 rounded-lg bg-stone-50 border border-stone-200/70 px-3 py-2">
              <p className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <MapIcon className="h-4 w-4 shrink-0 text-stone-400 mt-px" />
                <span><span className="font-medium text-stone-700">Itinéraire — </span>{p.itinerary}</span>
              </p>
            </div>
          )}

          {p.transport && (
            <p className="mt-2 flex items-start gap-2 text-xs text-stone-500 leading-relaxed">
              <TruckIcon className="h-4 w-4 shrink-0 text-stone-400 mt-px" />
              <span>{p.transport}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
            <span className="tabular-nums">#{p.id}</span>
            <span>· {imagesOf(p).length} image{imagesOf(p).length > 1 ? 's' : ''}</span>
            {!p.description && <span className="text-gold-700">· sans description</span>}
          </div>
        </div>

        <div className="flex sm:flex-col items-center justify-start gap-1 shrink-0">
          <IconButton
            tone={p.isValidated ? 'green' : 'amber'}
            title={p.isValidated ? 'Retirer du site' : 'Publier sur le site'}
            onClick={onToggle}
            disabled={busy}
          >
            {p.isValidated ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
          </IconButton>
          <IconButton tone="blue" title="Modifier" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
          <IconButton tone="rose" title="Supprimer" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
        </div>
      </div>
    </Card>
  );
};

const AdminTourismPrograms: React.FC = () => {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  // Filtres
  const [query, setQuery] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [country, setCountry] = useState('');
  const [onlyDraft, setOnlyDraft] = useState(false);
  const [onlyNoPrice, setOnlyNoPrice] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Édition
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProgramForm>(key: K, value: ProgramForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetTourismPrograms(1, 200);
      const data = res?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? 'Impossible de charger les programmes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pays de tourisme : ils servent de suggestions pour que `country` reste aligné
  // sur les fiches pays. L'échec est silencieux — l'écran fonctionne sans.
  useEffect(() => {
    apiService.adminGetTourismCountries()
      .then((res: any) => {
        const list = (res?.data ?? []).map((c: any) => c.name).filter(Boolean);
        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && editorOpen) setEditorOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen]);

  /* ── Synthèse : sur le catalogue entier, pas sur le filtre ── */
  const stats = useMemo(() => {
    const dest = new Set<string>();
    let published = 0, priced = 0, complete = 0;
    for (const p of items) {
      if (p.country) dest.add(p.country);
      if (p.isValidated) published++;
      if (p.price != null) priced++;
      if (p.description && p.itinerary && p.transport) complete++;
    }
    return {
      countries: dest.size,
      published,
      drafts: items.length - published,
      priced,
      noPrice: items.length - priced,
      complete,
      pctPublished: items.length ? Math.round((published / items.length) * 100) : 0,
      pctPriced: items.length ? Math.round((priced / items.length) * 100) : 0,
    };
  }, [items]);

  const bySub = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of items) map.set(p.subcategory, (map.get(p.subcategory) ?? 0) + 1);
    return map;
  }, [items]);

  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of items) map.set(p.country || '—', (map.get(p.country || '—') ?? 0) + 1);
    return [...map.entries()]
      .map(([c, count]) => ({ country: c, count }))
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country, 'fr'));
  }, [items]);

  /** Suggestions de pays : ceux de la base tourisme + ceux déjà utilisés ici. */
  const countryOptions = useMemo(
    () => [...new Set([...countries, ...items.map(p => p.country).filter(Boolean)])].sort((a, b) => a.localeCompare(b, 'fr')),
    [countries, items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(p => {
      if (subcategory && p.subcategory !== subcategory) return false;
      if (country && (p.country || '—') !== country) return false;
      if (onlyDraft && p.isValidated) return false;
      if (onlyNoPrice && p.price != null) return false;
      if (!q) return true;
      return [p.title, p.country, p.city, p.description, p.itinerary, p.transport]
        .some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [items, query, subcategory, country, onlyDraft, onlyNoPrice]);

  const groups = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, ProgramRow[]>();
    for (const p of filtered) {
      const key = groupBy === 'subcategory'
        ? (subMeta(p.subcategory)?.plural ?? p.subcategory)
        : (p.country || '—');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    const order = groupBy === 'subcategory' ? SUBCATEGORIES.map(s => s.plural) : null;
    return [...map.entries()].sort((a, b) => {
      if (order) {
        const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return b[1].length - a[1].length || a[0].localeCompare(b[0], 'fr');
    });
  }, [filtered, groupBy]);

  const activeFilters = [subcategory, country, query.trim()].filter(Boolean).length
    + (onlyDraft ? 1 : 0) + (onlyNoPrice ? 1 : 0);
  const resetFilters = () => {
    setQuery(''); setSubcategory(''); setCountry(''); setOnlyDraft(false); setOnlyNoPrice(false);
  };

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, subcategory: subcategory || 'safari', country: country && country !== '—' ? country : '' });
    setEditorOpen(true);
  };
  const openEdit = (p: ProgramRow) => { setEditingId(p.id); setForm(toForm(p)); setEditorOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.country.trim()) {
      setError('Le titre et le pays de destination sont obligatoires.');
      return;
    }
    setSaving(true); setError('');
    const payload = {
      title: form.title.trim(),
      subcategory: form.subcategory,
      country: form.country.trim(),
      city: form.city.trim() || null,
      description: form.description.trim() || null,
      itinerary: form.itinerary.trim() || null,
      transport: form.transport.trim() || null,
      price: form.price.trim() ? Number(form.price) : null,
      currency: form.currency || 'EUR',
      images: form.images.split('\n').map(u => u.trim()).filter(Boolean),
      isValidated: form.isValidated,
    };
    try {
      if (editingId !== null) await apiService.adminUpdateTourismProgram(editingId, payload);
      else await apiService.adminCreateTourismProgram(payload);
      setEditorOpen(false);
      flash(editingId !== null ? 'Programme mis à jour.' : 'Programme créé.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (p: ProgramRow) => {
    // Publier sans prix est possible — le site masque simplement la ligne tarif —
    // mais c'est rarement voulu : on le signale avant.
    if (!p.isValidated && p.price == null &&
      !confirm(`« ${p.title} » n’a pas de prix. Publier quand même ?`)) return;
    setBusyId(p.id); setError('');
    try {
      await apiService.adminUpdateTourismProgram(p.id, { isValidated: !p.isValidated });
      setItems(list => list.map(x => (x.id === p.id ? { ...x, isValidated: !p.isValidated } : x)));
      flash(p.isValidated ? `« ${p.title} » retiré du site.` : `« ${p.title} » publié.`);
    } catch (e: any) {
      setError(e?.message ?? 'Modification impossible.');
    } finally { setBusyId(null); }
  };

  const handleDelete = async (p: ProgramRow) => {
    if (!confirm(`Supprimer « ${p.title} » ? Cette action est définitive.`)) return;
    try {
      await apiService.adminDeleteTourismProgram(p.id);
      flash('Programme supprimé.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const selectCls = 'border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      <PageHeader
        title="Programmes tourisme"
        subtitle={`${items.length} programme${items.length > 1 ? 's' : ''} · ${stats.countries} destination${stats.countries > 1 ? 's' : ''} · ${stats.published} en ligne`}
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

      {/* Les programmes seedés sont des propositions : le rappeler évite de croire
          que le site affiche déjà ce catalogue. */}
      {!loading && stats.noPrice > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold-300 bg-gold-100/60 px-4 py-3 text-sm text-gold-800">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
          <span>
            <strong>{stats.noPrice} programme{stats.noPrice > 1 ? 's' : ''} sans prix.</strong>{' '}
            Les itinéraires et la logistique sont documentés, mais le tarif reste votre décision
            commerciale : renseignez-le, puis publiez avec l’icône œil.
          </span>
        </div>
      )}

      {/* ── Synthèse ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          label="Programmes"
          value={items.length}
          icon={GlobeAmericasIcon}
          tone="primary"
          hint={`${bySub.get('safari') ?? 0} safaris · ${bySub.get('sport') ?? 0} sports`}
        />
        <StatCard
          label="En ligne"
          value={`${stats.pctPublished}%`}
          icon={EyeIcon}
          tone={stats.drafts === 0 ? 'teal' : 'rose'}
          hint={stats.drafts === 0 ? 'Tout le catalogue est publié' : `${stats.drafts} proposition${stats.drafts > 1 ? 's' : ''} hors ligne`}
        />
        <StatCard
          label="Destinations"
          value={stats.countries}
          icon={MapPinIcon}
          tone="gold"
          hint={byCountry[0] ? `${byCountry[0].country} en tête (${byCountry[0].count})` : undefined}
        />
        <StatCard
          label="Prix renseigné"
          value={`${stats.pctPriced}%`}
          icon={BanknotesIcon}
          tone={stats.noPrice === 0 ? 'teal' : 'rose'}
          hint={stats.noPrice === 0 ? 'Catalogue tarifé' : `${stats.noPrice} à tarifer`}
        />
      </div>

      {/* ── Répartition par destination ── */}
      {!loading && byCountry.length > 0 && (
        <div className="mb-6">
          <CountryBreakdown rows={byCountry} total={items.length} selected={country} onSelect={setCountry} />
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
              placeholder="Rechercher un titre, une destination, une étape d’itinéraire…"
              aria-label="Rechercher un programme"
              className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Segmented label="Regroupement" value={groupBy} onChange={setGroupBy} options={GROUPINGS} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubcategory('')}
            aria-pressed={subcategory === ''}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              subcategory === '' ? 'bg-primary text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Tout <span className="tabular-nums text-xs opacity-70">({items.length})</span>
          </button>
          {SUBCATEGORIES.map(s => {
            const active = subcategory === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSubcategory(active ? '' : s.value)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  active ? 'bg-primary text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <s.icon className="h-4 w-4" /> {s.plural}
                <span className="tabular-nums text-xs opacity-70">({bySub.get(s.value) ?? 0})</span>
              </button>
            );
          })}

          <select value={country} onChange={e => setCountry(e.target.value)} aria-label="Filtrer par destination" className={selectCls}>
            <option value="">Toutes les destinations</option>
            {byCountry.map(c => <option key={c.country} value={c.country}>{c.country} ({c.count})</option>)}
          </select>

          <button
            type="button"
            onClick={() => setOnlyDraft(v => !v)}
            aria-pressed={onlyDraft}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              onlyDraft ? 'bg-gold-100 text-gold-800 border border-gold-300' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <EyeSlashIcon className="h-4 w-4" /> Hors ligne
            {stats.drafts > 0 && <span className="tabular-nums text-xs">({stats.drafts})</span>}
          </button>

          <button
            type="button"
            onClick={() => setOnlyNoPrice(v => !v)}
            aria-pressed={onlyNoPrice}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              onlyNoPrice ? 'bg-gold-100 text-gold-800 border border-gold-300' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <BanknotesIcon className="h-4 w-4" /> Sans prix
            {stats.noPrice > 0 && <span className="tabular-nums text-xs">({stats.noPrice})</span>}
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
        {filtered.length} programme{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
        {filtered.length !== items.length && <span className="text-stone-400"> sur {items.length}</span>}
      </p>

      {/* ── Liste ── */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse flex gap-4">
                <div className="h-24 w-32 rounded-xl bg-stone-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-stone-100" />
                  <div className="h-4 w-1/2 rounded bg-stone-100" />
                  <div className="h-3 w-2/3 rounded bg-stone-100" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <GlobeAmericasIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? 'Aucun programme' : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0
              ? 'Ajoutez un premier programme — ou lancez le seed du catalogue.'
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
                    {list.map(p => (
                      <ProgramCard
                        key={`${key}-${p.id}`}
                        p={p}
                        busy={busyId === p.id}
                        onEdit={() => openEdit(p)}
                        onDelete={() => handleDelete(p)}
                        onToggle={() => handleToggle(p)}
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
          {filtered.map(p => (
            <ProgramCard
              key={p.id}
              p={p}
              busy={busyId === p.id}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p)}
              onToggle={() => handleToggle(p)}
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
            aria-label={editingId !== null ? 'Modifier un programme' : 'Ajouter un programme'}
            className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full max-w-2xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-display text-xl font-semibold text-stone-800">
                {editingId !== null ? 'Modifier le programme' : 'Ajouter un programme'}
              </h2>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Field label="Titre" required>
                <TextInput value={form.title} onChange={e => set('title', e.target.value)} placeholder="Masai Mara & vallée du Rift" />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Catégorie" required>
                  <Select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}>
                    {SUBCATEGORIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </Field>
                <Field label="Ville / point de départ">
                  <TextInput value={form.city} onChange={e => set('city', e.target.value)} placeholder="Nairobi" />
                </Field>
              </div>
              <p className="-mt-2 text-xs text-stone-400">
                Le site n’affiche les programmes que sur les pages Safari et Sport : une autre
                catégorie n’apparaîtrait nulle part.
              </p>

              <Field label="Pays de destination" required>
                <TextInput
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  placeholder="Kenya"
                  list="admin-programs-countries"
                />
              </Field>
              {/* Suggestions issues des pays de tourisme : garde la clé alignée. */}
              <datalist id="admin-programs-countries">
                {countryOptions.map(c => <option key={c} value={c} />)}
              </datalist>

              <Field label="Description">
                <TextArea
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Ce que le voyageur vit, et la meilleure saison pour partir."
                />
              </Field>

              <Field label="Itinéraire">
                <TextArea
                  rows={3}
                  value={form.itinerary}
                  onChange={e => set('itinerary', e.target.value)}
                  placeholder="J1 Nairobi — J2 Lac Naivasha — J3-J5 Masai Mara…"
                />
              </Field>

              <Field label="Transport">
                <TextInput
                  value={form.transport}
                  onChange={e => set('transport', e.target.value)}
                  placeholder="Minibus 4x4 à toit ouvrant avec chauffeur-guide"
                />
              </Field>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400 mb-3">
                  Tarif affiché sur le site
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Prix « à partir de »">
                    <TextInput
                      type="number"
                      value={form.price}
                      onChange={e => set('price', e.target.value)}
                      placeholder="1600"
                    />
                  </Field>
                  <Field label="Devise">
                    <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  Laissé vide, aucun tarif n’apparaît sur la fiche publique. Précisez dans la
                  description ce que le prix couvre (vol international inclus ou non).
                </p>
              </div>

              <Field label="Images (une URL par ligne)">
                <TextArea
                  rows={3}
                  value={form.images}
                  onChange={e => set('images', e.target.value)}
                  placeholder={'https://…\nhttps://…'}
                />
              </Field>
              <p className="-mt-2 text-xs text-stone-400">
                La première image sert de visuel de couverture sur le site.
              </p>

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
                    Décoché, le programme reste une proposition visible ici seulement.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/60 rounded-b-2xl">
              <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !form.title.trim() || !form.country.trim()}>
                <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTourismPrograms;
