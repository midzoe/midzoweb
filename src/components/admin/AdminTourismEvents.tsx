import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowPathIcon,
  MagnifyingGlassIcon, CalendarDaysIcon, GlobeAltIcon, EyeIcon, EyeSlashIcon,
  ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon,
  TicketIcon, UserGroupIcon, BanknotesIcon, ClockIcon, CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select,
} from './ui';

/**
 * Story 6.2 → 6.8 : programmation annuelle des événements tourisme.
 *
 * L'écran ne liste plus des événements en vrac : il montre, **pays de tourisme par
 * pays de tourisme**, ce qui est programmé pour l'année face à un objectif réglable
 * (3 par défaut, story 6.8). Un pays sous l'objectif est signalé, avec le bouton qui
 * pré-remplit pays + année — c'est l'écran de décision, pas un formulaire de saisie.
 *
 * `TourismEvent.country` reprend `TourismCountry.name` (anglais) : c'est la clé du plan.
 */

const SETTING_QUOTA = 'tourism.events_required_per_country_per_year';

const SUBCATEGORIES = [
  'Safari', 'Sport', 'Festival', 'Musique', 'Culture',
  'Gastronomie', 'Plage & détente', 'Nature', 'Religieux', 'Business',
];

const AUDIENCES = ['Grand public', 'Familles', 'Jeunes actifs', 'Groupes', 'Diaspora', 'Entreprises'];
const OFFER_ITEMS = ['Vol', 'Hébergement', 'Transferts', 'Billetterie', 'Guide', 'Repas', 'Assurance'];
const STATUSES: { value: string; label: string; tone: 'slate' | 'gold' | 'green' }[] = [
  { value: 'proposed', label: 'Proposition', tone: 'gold' },
  { value: 'upcoming', label: 'Confirmé', tone: 'green' },
  { value: 'past', label: 'Passé', tone: 'slate' },
];
const CURRENCIES = ['EUR', 'USD', 'MAD', 'XOF', 'ZAR', 'KES', 'AED', 'THB', 'TRY'];

/** Teinte par sous-catégorie : on lit la composition d'une année d'un coup d'œil. */
const SUB_ACCENT: Record<string, { rail: string; chip: string; dot: string }> = {
  Safari:            { rail: 'bg-amber-400',   chip: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-500' },
  Sport:             { rail: 'bg-indigo-400',  chip: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' },
  Festival:          { rail: 'bg-rose-400',    chip: 'bg-rose-50 text-rose-700',     dot: 'bg-rose-500' },
  Musique:           { rail: 'bg-fuchsia-400', chip: 'bg-fuchsia-50 text-fuchsia-700', dot: 'bg-fuchsia-500' },
  Culture:           { rail: 'bg-teal-400',    chip: 'bg-teal-50 text-teal-700',     dot: 'bg-teal-500' },
  Gastronomie:       { rail: 'bg-orange-400',  chip: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  'Plage & détente': { rail: 'bg-sky-400',     chip: 'bg-sky-50 text-sky-700',       dot: 'bg-sky-500' },
  Nature:            { rail: 'bg-emerald-400', chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Religieux:         { rail: 'bg-violet-400',  chip: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
  Business:          { rail: 'bg-slate-400',   chip: 'bg-slate-100 text-slate-700',  dot: 'bg-slate-500' },
};
const accentOf = (sub?: string | null) =>
  (sub && SUB_ACCENT[sub]) || { rail: 'bg-stone-300', chip: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' };

interface EventRow {
  id: number;
  title: string;
  description?: string | null;
  country?: string | null;
  city?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  link?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
  subcategory?: string | null;
  year?: number | null;
  datesConfirmed?: boolean;
  priceFrom?: number | null;
  currency?: string | null;
  capacity?: number | null;
  audience?: string | null;
  offerIncludes?: string[] | null;
  highlights?: string[] | null;
  internalNotes?: string | null;
}

interface CountryRow { id: number; name: string; nameFr?: string | null; region?: string | null; isValidated?: boolean }

type EventForm = {
  title: string; country: string; city: string; location: string; subcategory: string;
  year: string; startDate: string; endDate: string; datesConfirmed: boolean;
  description: string; highlights: string; internalNotes: string;
  priceFrom: string; currency: string; capacity: string; audience: string;
  offerIncludes: string[]; link: string; imageUrl: string;
  status: string; isPublished: boolean;
};

const emptyForm = (year: number): EventForm => ({
  title: '', country: '', city: '', location: '', subcategory: '',
  year: String(year), startDate: '', endDate: '', datesConfirmed: false,
  description: '', highlights: '', internalNotes: '',
  priceFrom: '', currency: 'EUR', capacity: '', audience: '',
  offerIncludes: [], link: '', imageUrl: '',
  // Un événement naît comme proposition à arbitrer, pas comme engagement publié.
  status: 'proposed', isPublished: false,
});

const dateInput = (v?: string | null) => (v ? String(v).slice(0, 10) : '');

const toForm = (e: EventRow, fallbackYear: number): EventForm => ({
  title: e.title ?? '', country: e.country ?? '', city: e.city ?? '', location: e.location ?? '',
  subcategory: e.subcategory ?? '', year: String(e.year ?? fallbackYear),
  startDate: dateInput(e.startDate), endDate: dateInput(e.endDate),
  datesConfirmed: !!e.datesConfirmed,
  description: e.description ?? '', highlights: (e.highlights ?? []).join(', '),
  internalNotes: e.internalNotes ?? '',
  priceFrom: e.priceFrom != null ? String(e.priceFrom) : '', currency: e.currency ?? 'EUR',
  capacity: e.capacity != null ? String(e.capacity) : '', audience: e.audience ?? '',
  offerIncludes: e.offerIncludes ?? [], link: e.link ?? '', imageUrl: e.imageUrl ?? '',
  status: e.status ?? 'proposed', isPublished: !!e.isPublished,
});

const toPayload = (f: EventForm) => ({
  title: f.title.trim(),
  country: f.country.trim(),
  city: f.city.trim(),
  location: f.location.trim(),
  subcategory: f.subcategory.trim(),
  year: f.year.trim() === '' ? null : Number(f.year),
  startDate: f.startDate || null,
  endDate: f.endDate || null,
  datesConfirmed: f.datesConfirmed,
  description: f.description.trim(),
  highlights: f.highlights.split(',').map(s => s.trim()).filter(Boolean),
  internalNotes: f.internalNotes.trim(),
  priceFrom: f.priceFrom.trim() === '' ? null : Number(f.priceFrom),
  currency: f.currency,
  capacity: f.capacity.trim() === '' ? null : Number(f.capacity),
  audience: f.audience.trim(),
  offerIncludes: f.offerIncludes,
  link: f.link.trim(),
  imageUrl: f.imageUrl.trim(),
  status: f.status,
  isPublished: f.isPublished,
});

const MONTHS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** « 12 – 18 juin » ou « juin » quand seul le mois est connu. */
const formatWindow = (e: EventRow) => {
  if (!e.startDate) return null;
  const s = new Date(e.startDate);
  const end = e.endDate ? new Date(e.endDate) : null;
  const sTxt = `${s.getDate()} ${MONTHS[s.getMonth()]}`;
  if (!end) return sTxt;
  return s.getMonth() === end.getMonth()
    ? `${s.getDate()} – ${end.getDate()} ${MONTHS[end.getMonth()]}`
    : `${sTxt} – ${end.getDate()} ${MONTHS[end.getMonth()]}`;
};

const formatPrice = (e: EventRow) => {
  if (e.priceFrom == null) return null;
  const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(e.priceFrom);
  const symbol = e.currency === 'EUR' ? '€' : e.currency === 'USD' ? '$' : (e.currency ?? '');
  return `dès ${amount} ${symbol}`.trim();
};

/* ── Pastilles de progression vers l'objectif ─────────────────────────────── */
const QuotaDots: React.FC<{ done: number; target: number }> = ({ done, target }) => (
  <span className="inline-flex items-center gap-1" aria-hidden="true">
    {Array.from({ length: Math.max(target, done) }).map((_, i) => (
      <span
        key={i}
        className={`h-1.5 w-4 rounded-full transition-colors duration-300 ${
          i < done ? (done >= target ? 'bg-primary' : 'bg-gold-400') : 'bg-stone-200'
        }`}
      />
    ))}
  </span>
);

/* ── Sélecteur multiple ────────────────────────────────────────────────────── */
const ChipGroup: React.FC<{ options: string[]; selected: string[]; onToggle: (v: string) => void }> = ({
  options, selected, onToggle,
}) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(o => {
      const active = selected.includes(o);
      return (
        <button key={o} type="button" onClick={() => onToggle(o)} aria-pressed={active}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            active ? 'bg-primary text-white shadow-sm' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-300 hover:text-stone-800'
          }`}>
          {o}
        </button>
      );
    })}
  </div>
);

/* ── Ligne événement ───────────────────────────────────────────────────────── */
const EventRowView: React.FC<{
  e: EventRow;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}> = ({ e, onEdit, onDelete, onTogglePublish }) => {
  const accent = accentOf(e.subcategory);
  const window = formatWindow(e);
  const price = formatPrice(e);
  const status = STATUSES.find(s => s.value === e.status) ?? STATUSES[0];

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-all duration-200 hover:border-stone-300 hover:shadow-card sm:flex-row sm:items-start">
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${accent.rail}`} aria-hidden="true" />

      <div className="min-w-0 flex-1 pl-2">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {e.subcategory && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${accent.chip}`}>{e.subcategory}</span>
          )}
          <Badge tone={status.tone}>{status.label}</Badge>
          {e.isPublished ? (
            <Badge tone="green"><EyeIcon className="h-3.5 w-3.5" /> En ligne</Badge>
          ) : (
            <Badge tone="amber"><EyeSlashIcon className="h-3.5 w-3.5" /> Brouillon</Badge>
          )}
          {window && !e.datesConfirmed && (
            <span className="inline-flex items-center gap-1 text-xs text-rose-500">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" /> dates à confirmer
            </span>
          )}
          {e.datesConfirmed && (
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <CheckBadgeIcon className="h-3.5 w-3.5" /> dates confirmées
            </span>
          )}
        </div>

        <h4 className="font-display text-base font-semibold text-stone-800">{e.title}</h4>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          {window && <span className="inline-flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" />{window}</span>}
          {!window && <span className="text-stone-400">date à caler</span>}
          {(e.city || e.location) && <span>{[e.city, e.location].filter(Boolean).join(' · ')}</span>}
          {price && <span className="font-medium text-stone-700">{price}</span>}
          {e.capacity != null && <span className="inline-flex items-center gap-1"><UserGroupIcon className="h-3.5 w-3.5" />{e.capacity} places</span>}
          {e.audience && <span>{e.audience}</span>}
          {e.link && (
            <a href={e.link} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors duration-150">
              <ArrowTopRightOnSquareIcon className="h-3 w-3" /> source
            </a>
          )}
        </div>

        {!!e.offerIncludes?.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {e.offerIncludes.map(o => (
              <span key={o} className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{o}</span>
            ))}
          </div>
        )}

        {e.internalNotes && (
          <p className="mt-2 rounded-lg bg-gold-50 px-2.5 py-1.5 text-xs text-gold-800">
            <span className="font-medium">Note interne :</span> {e.internalNotes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
        <IconButton tone={e.isPublished ? 'slate' : 'green'} title={e.isPublished ? 'Dépublier' : 'Publier'} onClick={onTogglePublish}>
          {e.isPublished ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </IconButton>
        <IconButton tone="blue" title="Modifier" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
        <IconButton tone="rose" title="Supprimer" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
      </div>
    </div>
  );
};

const AdminTourismEvents: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [quota, setQuota] = useState(3);
  const [quotaDraft, setQuotaDraft] = useState('3');
  const [quotaSaving, setQuotaSaving] = useState(false);

  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [query, setQuery] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [onlyGaps, setOnlyGaps] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm(currentYear));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof EventForm>(key: K, value: EventForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [evRes, cRes, sRes] = await Promise.all([
        apiService.adminGetTourismEvents(1, 500),
        apiService.adminGetTourismCountries().catch(() => ({ data: [] })),
        apiService.adminGetSettings().catch(() => ({ data: {} })),
      ]);
      const ev = evRes.data ?? evRes.items ?? [];
      setEvents(Array.isArray(ev) ? ev : []);
      const cs = cRes.data ?? cRes.items ?? cRes.countries ?? [];
      setCountries(Array.isArray(cs) ? cs : []);
      const raw = parseInt(String((sRes.data ?? {})[SETTING_QUOTA] ?? '3'), 10);
      const q = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 100) : 3;
      setQuota(q);
      setQuotaDraft(String(q));
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape' && editorOpen) setEditorOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen]);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const saveQuota = async () => {
    const value = Math.min(Math.max(parseInt(quotaDraft, 10) || 0, 0), 100);
    setQuotaSaving(true);
    try {
      await apiService.adminUpdateSetting(SETTING_QUOTA, value);
      setQuota(value);
      setQuotaDraft(String(value));
      flash(`Objectif passé à ${value} événement${value > 1 ? 's' : ''} par pays et par an.`);
    } catch (e: any) {
      setError(e?.message ?? 'Réglage non enregistré.');
    } finally { setQuotaSaving(false); }
  };

  /** L'année d'un événement : celle saisie, sinon celle de sa date de début. */
  const yearOf = (e: EventRow) => e.year ?? (e.startDate ? new Date(e.startDate).getFullYear() : null);

  const yearEvents = useMemo(() => events.filter(e => yearOf(e) === year), [events, year]);

  const years = useMemo(() => {
    const set = new Set<number>([currentYear, currentYear + 1]);
    events.forEach(e => { const y = yearOf(e); if (y) set.add(y); });
    return [...set].sort((a, b) => a - b);
  }, [events, currentYear]);

  const matchesFilters = useCallback((e: EventRow) => {
    if (subcategory && e.subcategory !== subcategory) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [e.title, e.city, e.location, e.description, e.audience, e.subcategory]
      .some(v => (v ?? '').toLowerCase().includes(q));
  }, [subcategory, query]);

  /** Le plan : un bloc par pays de tourisme, même sans aucun événement. */
  const plan = useMemo(() => {
    const byCountry = new Map<string, EventRow[]>();
    for (const e of yearEvents) {
      const key = e.country ?? '';
      if (!byCountry.has(key)) byCountry.set(key, []);
      byCountry.get(key)!.push(e);
    }

    const rows = countries.map(c => {
      const all = byCountry.get(c.name) ?? [];
      return {
        country: c,
        all,
        shown: all.filter(matchesFilters),
        missing: Math.max(quota - all.length, 0),
      };
    });

    // Les pays les plus en retard d'abord : c'est là qu'il faut décider.
    rows.sort((a, b) => b.missing - a.missing || a.all.length - b.all.length || a.country.name.localeCompare(b.country.name));

    const known = new Set(countries.map(c => c.name));
    const orphans = yearEvents.filter(e => !e.country || !known.has(e.country)).filter(matchesFilters);

    return { rows, orphans };
  }, [countries, yearEvents, quota, matchesFilters]);

  const stats = useMemo(() => {
    const total = yearEvents.length;
    const published = yearEvents.filter(e => e.isPublished).length;
    const unconfirmed = yearEvents.filter(e => !e.datesConfirmed).length;
    const covered = plan.rows.filter(r => r.missing === 0).length;
    const missingTotal = plan.rows.reduce((s, r) => s + r.missing, 0);
    return { total, published, unconfirmed, covered, missingTotal };
  }, [yearEvents, plan]);

  const openCreate = (country?: string) => {
    setEditingId(null);
    setForm({ ...emptyForm(year), country: country ?? '' });
    setEditorOpen(true);
  };

  const openEdit = (e: EventRow) => {
    setEditingId(e.id);
    setForm(toForm(e, year));
    setEditorOpen(true);
  };

  const canSave = !!form.title.trim();

  const handleSave = async () => {
    if (!canSave) { setError('Le titre est obligatoire.'); return; }
    setSaving(true); setError('');
    try {
      const payload = toPayload(form);
      if (editingId !== null) await apiService.adminUpdateTourismEvent(editingId, payload);
      else await apiService.adminCreateTourismEvent(payload);
      setEditorOpen(false);
      flash(editingId !== null ? 'Événement mis à jour.' : 'Événement ajouté.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (e: EventRow) => {
    if (!confirm(`Supprimer « ${e.title} » ?`)) return;
    try {
      await apiService.adminDeleteTourismEvent(e.id);
      flash('Événement supprimé.');
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Suppression impossible.');
    }
  };

  const togglePublish = async (e: EventRow) => {
    try {
      await apiService.adminUpdateTourismEvent(e.id, { isPublished: !e.isPublished });
      flash(!e.isPublished ? 'Événement publié.' : 'Événement repassé en brouillon.');
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Mise à jour impossible.');
    }
  };

  const toggleOffer = (v: string) =>
    setForm(f => ({
      ...f,
      offerIncludes: f.offerIncludes.includes(v) ? f.offerIncludes.filter(x => x !== v) : [...f.offerIncludes, v],
    }));

  const selectCls = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 cursor-pointer transition-colors duration-150 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
  const visibleRows = onlyGaps ? plan.rows.filter(r => r.missing > 0) : plan.rows;

  return (
    <div>
      <PageHeader
        title="Événements tourisme"
        subtitle={`Plan ${year} · ${countries.length} pays de tourisme · ${stats.total} événement${stats.total > 1 ? 's' : ''} programmé${stats.total > 1 ? 's' : ''}`}
        actions={
          <>
            <IconButton title="Rafraîchir" onClick={load} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </IconButton>
            <PrimaryButton onClick={() => openCreate()}><PlusIcon className="h-4 w-4" /> Ajouter</PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Masquer l’erreur" className="shrink-0 cursor-pointer"><XMarkIcon className="h-4 w-4" /></button>
        </div>
      )}
      {notice && <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">{notice}</div>}

      {/* ── Année + objectif ── */}
      <Card className="mb-6 flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <IconButton title="Année précédente" onClick={() => setYear(y => y - 1)}><ChevronLeftIcon className="h-4 w-4" /></IconButton>
          <div className="text-center">
            <p className="font-display text-2xl font-semibold tabular-nums text-stone-800">{year}</p>
            <p className="text-xs text-stone-400">année de programmation</p>
          </div>
          <IconButton title="Année suivante" onClick={() => setYear(y => y + 1)}><ChevronRightIcon className="h-4 w-4" /></IconButton>

          {years.filter(y => y !== year).length > 0 && (
            <div className="ml-2 flex items-center gap-1">
              {years.filter(y => y !== year).map(y => (
                <button key={y} type="button" onClick={() => setYear(y)}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors duration-150 hover:bg-stone-200 cursor-pointer">
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="quota" className="text-sm text-stone-600">
            Objectif par pays et par an
          </label>
          <input
            id="quota"
            type="number"
            min={0}
            max={100}
            value={quotaDraft}
            onChange={e => setQuotaDraft(e.target.value)}
            className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-sm tabular-nums text-stone-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <SecondaryButton onClick={saveQuota} disabled={quotaSaving || String(quota) === quotaDraft.trim()}>
            {quotaSaving ? 'Enregistrement…' : 'Enregistrer l’objectif'}
          </SecondaryButton>
          <span className="text-xs text-stone-400">
            {stats.missingTotal === 0
              ? 'objectif atteint partout'
              : `${stats.missingTotal} événement${stats.missingTotal > 1 ? 's' : ''} à trouver`}
          </span>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Programmés en ${year}`} value={stats.total} icon={CalendarDaysIcon} tone="primary"
          hint={`objectif : ${quota * countries.length} sur l’année`} />
        <StatCard label="Pays à l’objectif" value={`${stats.covered}/${countries.length}`} icon={GlobeAltIcon}
          tone={stats.covered === countries.length ? 'teal' : 'gold'}
          hint={stats.missingTotal ? `${stats.missingTotal} à trouver` : 'plan complet'} />
        <StatCard label="En ligne" value={stats.published} icon={EyeIcon} tone="indigo"
          hint={`${stats.total - stats.published} en brouillon`} />
        <StatCard label="Dates à confirmer" value={stats.unconfirmed} icon={ClockIcon}
          tone={stats.unconfirmed ? 'rose' : 'teal'}
          hint={stats.unconfirmed ? 'à vérifier avant publication' : 'toutes les dates sont sûres'} />
      </div>

      {/* ── Filtres ── */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un événement, une ville, un public…"
            aria-label="Rechercher un événement"
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <select value={subcategory} onChange={e => setSubcategory(e.target.value)} aria-label="Filtrer par sous-catégorie" className={selectCls}>
          <option value="">Toutes les sous-catégories</option>
          {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button type="button" onClick={() => setOnlyGaps(v => !v)} aria-pressed={onlyGaps}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            onlyGaps ? 'border border-gold-300 bg-gold-100 text-gold-800' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
          }`}>
          <ExclamationTriangleIcon className="h-4 w-4" /> Pays sous l’objectif
          {stats.missingTotal > 0 && <span className="tabular-nums text-xs">({plan.rows.filter(r => r.missing > 0).length})</span>}
        </button>
      </div>

      {/* ── Plan par pays ── */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <Card key={i} className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-40 rounded bg-stone-100" />
                <div className="h-16 rounded bg-stone-50" />
              </div>
            </Card>
          ))}
        </div>
      ) : countries.length === 0 ? (
        <Card className="py-20 text-center">
          <GlobeAltIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">Aucun pays de tourisme</p>
          <p className="mt-1 text-sm text-stone-500">
            Le plan se construit sur les pays de tourisme : commencez par en créer dans « Pays tourisme ».
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleRows.map(({ country, all, shown, missing }) => (
            <Card key={country.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 bg-stone-50/60 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-stone-800">
                    {country.nameFr || country.name}
                    {country.region && <span className="ml-2 text-xs font-normal text-stone-400">{country.region}</span>}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <QuotaDots done={all.length} target={quota} />
                    <span className={`text-xs tabular-nums ${missing === 0 ? 'text-primary' : 'text-gold-700'}`}>
                      {all.length}/{quota}
                      {missing > 0 && ` — il manque ${missing} événement${missing > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
                <SecondaryButton onClick={() => openCreate(country.name)}>
                  + Proposer un événement
                </SecondaryButton>
              </div>

              <div className="space-y-3 p-5">
                {all.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">
                    Rien de programmé en {year} pour ce pays.
                  </p>
                ) : shown.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">
                    {all.length} événement{all.length > 1 ? 's' : ''} masqué{all.length > 1 ? 's' : ''} par les filtres.
                  </p>
                ) : (
                  shown.map(e => (
                    <EventRowView key={e.id} e={e}
                      onEdit={() => openEdit(e)}
                      onDelete={() => handleDelete(e)}
                      onTogglePublish={() => togglePublish(e)} />
                  ))
                )}
              </div>
            </Card>
          ))}

          {plan.orphans.length > 0 && (
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gold-200 bg-gold-50 px-5 py-3 text-sm text-gold-800">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="font-medium">À rattacher</span>
                <span className="text-gold-700">
                  — {plan.orphans.length} événement{plan.orphans.length > 1 ? 's' : ''} sans pays de tourisme reconnu : ils ne comptent dans aucun plan.
                </span>
              </div>
              <div className="space-y-3 p-5">
                {plan.orphans.map(e => (
                  <EventRowView key={e.id} e={e}
                    onEdit={() => openEdit(e)}
                    onDelete={() => handleDelete(e)}
                    onTogglePublish={() => togglePublish(e)} />
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Éditeur ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm" onClick={() => setEditorOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId !== null ? 'Modifier un événement' : 'Proposer un événement'}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-stone-900/5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-800">
                  {editingId !== null ? 'Modifier l’événement' : 'Proposer un événement'}
                </h2>
                <p className="mt-0.5 text-xs text-stone-400">
                  {form.country || 'pays à choisir'} · plan {form.year || year}
                </p>
              </div>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <Field label="Titre" required>
                <TextInput value={form.title} onChange={e => set('title', e.target.value)} placeholder="Festival Gnaoua d’Essaouira" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Pays">
                  <Select value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="">— Choisir —</option>
                    {countries.map(c => <option key={c.id} value={c.name}>{c.nameFr || c.name}</option>)}
                  </Select>
                </Field>
                <Field label="Ville">
                  <TextInput value={form.city} onChange={e => set('city', e.target.value)} placeholder="Essaouira" />
                </Field>
                <Field label="Lieu précis">
                  <TextInput value={form.location} onChange={e => set('location', e.target.value)} placeholder="Place Moulay Hassan" />
                </Field>
              </div>

              <Field label="Sous-catégorie">
                <ChipGroup options={SUBCATEGORIES} selected={form.subcategory ? [form.subcategory] : []}
                  onToggle={v => set('subcategory', form.subcategory === v ? '' : v)} />
              </Field>

              <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">Quand</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Année du plan">
                    <TextInput type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder={String(year)} />
                  </Field>
                  <Field label="Début">
                    <TextInput type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                  </Field>
                  <Field label="Fin">
                    <TextInput type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                  </Field>
                </div>
                <label className={`flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                  form.datesConfirmed ? 'border-primary/30 bg-primary/5 text-stone-800' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                }`}>
                  <input type="checkbox" checked={form.datesConfirmed} onChange={e => set('datesConfirmed', e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
                  <CheckBadgeIcon className={`h-4 w-4 ${form.datesConfirmed ? 'text-primary' : 'text-stone-400'}`} />
                  Dates confirmées par une source officielle
                </label>
                <p className="text-xs text-stone-400">
                  Une date reprise de l’édition précédente n’est pas une date confirmée. Laissez décoché tant que
                  l’organisateur n’a pas publié le calendrier.
                </p>
              </div>

              <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                  <TicketIcon className="h-4 w-4" /> L’offre
                </p>
                <div className="grid gap-4 sm:grid-cols-4">
                  <Field label="À partir de">
                    <TextInput type="number" min={0} value={form.priceFrom} onChange={e => set('priceFrom', e.target.value)} placeholder="890" />
                  </Field>
                  <Field label="Devise">
                    <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                  <Field label="Places">
                    <TextInput type="number" min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="25" />
                  </Field>
                  <Field label="Public visé">
                    <Select value={form.audience} onChange={e => set('audience', e.target.value)}>
                      <option value="">— Choisir —</option>
                      {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                    </Select>
                  </Field>
                </div>
                <Field label="Ce que le forfait comprend">
                  <ChipGroup options={OFFER_ITEMS} selected={form.offerIncludes} onToggle={toggleOffer} />
                </Field>
              </div>

              <Field label="Description publique">
                <TextArea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Trois jours de musique gnaoua et de fusion, dans la médina classée au patrimoine mondial." />
              </Field>

              <Field label="Points forts (séparés par des virgules)">
                <TextInput value={form.highlights} onChange={e => set('highlights', e.target.value)}
                  placeholder="Concerts gratuits, médina classée, vols directs depuis Dakar" />
              </Field>

              <Field label="Note interne (jamais publiée)">
                <TextArea rows={2} value={form.internalNotes} onChange={e => set('internalNotes', e.target.value)}
                  placeholder="Vérifier les dates 2027 en janvier ; hôtel partenaire à relancer." />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Lien source / billetterie">
                  <TextInput value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="Image (URL)">
                  <TextInput value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…/photo.jpg" />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Statut">
                  <Select value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </Field>
                <div className="flex items-end">
                  <label className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                    form.isPublished ? 'border-primary/30 bg-primary/5 text-stone-800' : 'border-gold-300 bg-gold-50 text-gold-800'
                  }`}>
                    <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
                    {form.isPublished
                      ? <><EyeIcon className="h-4 w-4 text-primary" /> Visible sur le site</>
                      : <><EyeSlashIcon className="h-4 w-4 text-gold-700" /> Brouillon — invisible</>}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-stone-200 bg-stone-50/60 px-6 py-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
                <BanknotesIcon className="h-4 w-4" /> Le prix affiché côté site est un prix d’appel.
              </span>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
                <PrimaryButton onClick={handleSave} disabled={saving || !canSave}>
                  <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTourismEvents;
