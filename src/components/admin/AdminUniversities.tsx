import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiService } from '../../services/api';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon, XMarkIcon,
  ArrowPathIcon, ChevronRightIcon, AcademicCapIcon, GlobeAltIcon, BuildingLibraryIcon,
  LanguageIcon, ExclamationTriangleIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge, Field, TextInput, Select } from './ui';
import { SECTORS, OTHER_SECTOR, sectorOf, sectorsOfPrograms } from './universitySectors';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVELS = ['Bachelor', 'Master'];

interface Program { id: number; name: string; level: string }

/**
 * La route admin renvoie l'objet Prisma tel quel (pas de formateur snake_case,
 * contrairement à News/Blog) : les champs restent en camelCase.
 */
interface UniversityRow {
  id: number;
  name: string;
  city: string;
  country: string;
  website?: string | null;
  applicationUrl?: string | null;
  specialty?: string | null;
  requiredLanguage?: string | null;
  requiredLanguageLevel?: string | null;
  // Story 5.13 : profil d'admission.
  minimumGrade?: string | null;
  admissionRequirements?: string | null;
  programs?: Program[];
}

type UniversityForm = {
  name: string; city: string; country: string; website: string;
  applicationUrl: string; specialty: string;
  requiredLanguage: string; requiredLanguageLevel: string;
  minimumGrade: string; admissionRequirements: string;
};

const emptyForm: UniversityForm = {
  name: '', city: '', country: '', website: '',
  applicationUrl: '', specialty: '', requiredLanguage: '', requiredLanguageLevel: '',
  minimumGrade: '', admissionRequirements: '',
};

const toForm = (u: UniversityRow): UniversityForm => ({
  name: u.name ?? '', city: u.city ?? '', country: u.country ?? '',
  website: u.website ?? '', applicationUrl: u.applicationUrl ?? '',
  specialty: u.specialty ?? '',
  requiredLanguage: u.requiredLanguage ?? '', requiredLanguageLevel: u.requiredLanguageLevel ?? '',
  minimumGrade: u.minimumGrade ?? '', admissionRequirements: u.admissionRequirements ?? '',
});

/** Une université a des conditions dès que la langue **et** le niveau sont posés. */
const hasConditions = (u: UniversityRow) => !!(u.requiredLanguage && u.requiredLanguageLevel);

type GroupBy = 'none' | 'country' | 'sector' | 'level';
const GROUPINGS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'Liste' },
  { value: 'country', label: 'Par pays' },
  { value: 'sector', label: 'Par secteur' },
  { value: 'level', label: 'Par niveau' },
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

/* ── Répartition par pays : barres proportionnelles, cliquables pour filtrer ── */
const CountryBreakdown: React.FC<{
  rows: { country: string; count: number }[];
  total: number;
  selected: string;
  onSelect: (country: string) => void;
}> = ({ rows, total, selected, onSelect }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-lg font-semibold text-stone-800">Répartition par pays</h2>
      <span className="text-xs text-stone-400">{rows.length} pays · {total} universités</span>
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
            <span className={`w-40 shrink-0 truncate text-sm ${active ? 'text-primary font-medium' : 'text-stone-700'}`}>
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

/* ── Ligne université : nom, lieu, conditions, filières ────────────────────── */
const UniversityCard: React.FC<{
  u: UniversityRow;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ u, onEdit, onDelete }) => {
  const programs = u.programs ?? [];
  const bachelors = programs.filter(p => p.level === 'Bachelor').length;
  const masters = programs.filter(p => p.level === 'Master').length;
  const sectors = sectorsOfPrograms(programs);
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-4 transition-all duration-200 hover:shadow-card-hover hover:border-stone-300">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge tone="slate">{u.country}</Badge>
            <span className="text-xs text-stone-500">{u.city}</span>
            {hasConditions(u) ? (
              <Badge tone="green">
                <LanguageIcon className="h-3.5 w-3.5" /> {u.requiredLanguage} · {u.requiredLanguageLevel}
              </Badge>
            ) : (
              <Badge tone="amber">
                <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                {u.requiredLanguage ? 'Niveau manquant' : u.requiredLanguageLevel ? 'Langue manquante' : 'Conditions non renseignées'}
              </Badge>
            )}
          </div>

          <h3 className="font-display text-base font-semibold text-stone-800">{u.name}</h3>
          {u.specialty && <p className="mt-1 text-sm text-stone-500 line-clamp-2">{u.specialty}</p>}

          {/* Profil d'admission (story 5.13) : ce qu'un candidat doit atteindre. */}
          {(u.minimumGrade || u.admissionRequirements) && (
            <div className="mt-2 flex flex-wrap items-start gap-2">
              {u.minimumGrade && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  <AcademicCapIcon className="h-3.5 w-3.5" /> {u.minimumGrade}
                </span>
              )}
              {u.admissionRequirements && (
                <span className="text-xs text-stone-500">{u.admissionRequirements}</span>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
            <span>{programs.length} filière{programs.length > 1 ? 's' : ''}</span>
            {bachelors > 0 && <span>· {bachelors} Bachelor</span>}
            {masters > 0 && <span>· {masters} Master</span>}
            {u.website && (
              <a href={u.website} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-stone-400 hover:text-primary transition-colors duration-150">
                <ArrowTopRightOnSquareIcon className="h-3 w-3" /> site
              </a>
            )}
            {u.applicationUrl && (
              <a href={u.applicationUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-stone-400 hover:text-primary transition-colors duration-150">
                <ArrowTopRightOnSquareIcon className="h-3 w-3" /> candidature
              </a>
            )}
          </div>

          {sectors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sectors.map(s => (
                <span key={s} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">{s}</span>
              ))}
            </div>
          )}

          {programs.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="mt-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-primary transition-colors duration-150 cursor-pointer"
              >
                <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                {open ? 'Masquer' : 'Voir'} les filières
              </button>
              {open && (
                <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  {programs.map(p => (
                    <div key={p.id} className="flex items-baseline gap-2 text-xs">
                      <span className={`shrink-0 rounded px-1.5 py-0.5 font-medium ${
                        p.level === 'Master' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-700'
                      }`}>{p.level}</span>
                      <span className="text-stone-600 truncate">{p.name}</span>
                      <span className="ml-auto text-stone-300 truncate">{sectorOf(p.name)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0">
          <IconButton tone="blue" title="Modifier" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
          <IconButton tone="rose" title="Supprimer" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
        </div>
      </div>
    </Card>
  );
};

const AdminUniversities: React.FC = () => {
  const [items, setItems] = useState<UniversityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filtres
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [level, setLevel] = useState('');
  const [cefr, setCefr] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Édition
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UniversityForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof UniversityForm>(key: K, value: UniversityForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // La route admin ignore page/limit et renvoie tout le catalogue, filières incluses.
      const res = await apiService.adminGetUniversities(1, 500);
      const data = res.data ?? res.items ?? res.results ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? 'Impossible de charger les universités');
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

  /* ── Synthèse : calculée sur le catalogue entier, pas sur le filtre ── */
  const stats = useMemo(() => {
    const countries = new Set<string>();
    const cities = new Set<string>();
    const programNames = new Set<string>();
    let withConditions = 0;
    for (const u of items) {
      if (u.country) countries.add(u.country);
      if (u.city) cities.add(`${u.country}|${u.city}`);
      for (const p of u.programs ?? []) programNames.add(p.name);
      if (hasConditions(u)) withConditions++;
    }
    return {
      countries: countries.size,
      cities: cities.size,
      programs: programNames.size,
      withConditions,
      missing: items.length - withConditions,
      pct: items.length ? Math.round((withConditions / items.length) * 100) : 0,
    };
  }, [items]);

  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of items) map.set(u.country, (map.get(u.country) ?? 0) + 1);
    return [...map.entries()]
      .map(([c, count]) => ({ country: c, count }))
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
  }, [items]);

  const countryOptions = useMemo(() => byCountry.map(r => r.country), [byCountry]);

  /** Villes proposées : restreintes au pays choisi, sinon toutes. */
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of items) if (!country || u.country === country) if (u.city) set.add(u.city);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items, country]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(u => {
      if (country && u.country !== country) return false;
      if (city && u.city !== city) return false;
      if (cefr && u.requiredLanguageLevel !== cefr) return false;
      if (onlyMissing && hasConditions(u)) return false;

      const programs = u.programs ?? [];
      if (level && !programs.some(p => p.level === level)) return false;
      // Le secteur d'une université est celui d'au moins une de ses filières.
      if (sector && !programs.some(p => sectorOf(p.name) === sector)) return false;

      if (!q) return true;
      return (
        [u.name, u.city, u.country, u.specialty, u.requiredLanguage].some(v => (v ?? '').toLowerCase().includes(q)) ||
        programs.some(p => p.name.toLowerCase().includes(q))
      );
    });
  }, [items, query, country, city, sector, level, cefr, onlyMissing]);

  /**
   * Regroupement. Par secteur ou par niveau, une université figure dans **chaque**
   * groupe qu'elle couvre : la somme des groupes dépasse donc le total, et c'est
   * annoncé dans l'en-tête de la vue.
   */
  const groups = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, UniversityRow[]>();
    const push = (key: string, u: UniversityRow) => {
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    };

    for (const u of filtered) {
      const programs = u.programs ?? [];
      if (groupBy === 'country') push(u.country || '—', u);
      else if (groupBy === 'sector') {
        const found = sectorsOfPrograms(programs);
        if (found.length) found.forEach(s => push(s, u));
        else push(OTHER_SECTOR, u);
      } else {
        const found = [...new Set(programs.map(p => p.level))];
        if (found.length) found.forEach(l => push(l, u));
        else push('Sans filière', u);
      }
    }

    const order = groupBy === 'sector' ? SECTORS : groupBy === 'level' ? [...LEVELS, 'Sans filière'] : null;
    return [...map.entries()]
      .sort((a, b) => {
        if (order) {
          const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
          if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        }
        return b[1].length - a[1].length || a[0].localeCompare(b[0]);
      });
  }, [filtered, groupBy]);

  const activeFilters = [country, city, sector, level, cefr, query.trim()].filter(Boolean).length + (onlyMissing ? 1 : 0);
  const resetFilters = () => {
    setQuery(''); setCountry(''); setCity(''); setSector(''); setLevel(''); setCefr(''); setOnlyMissing(false);
  };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setEditorOpen(true); };
  const openEdit = (u: UniversityRow) => { setEditingId(u.id); setForm(toForm(u)); setEditorOpen(true); };

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim() || !form.country.trim()) {
      setError('Le nom, la ville et le pays sont obligatoires.');
      return;
    }
    setSaving(true); setError('');
    try {
      if (editingId !== null) await apiService.adminUpdateUniversity(editingId, form);
      else await apiService.adminCreateUniversity(form);
      setEditorOpen(false);
      flash(editingId !== null ? 'Université mise à jour.' : 'Université créée.');
      await load();
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      setError(/409|already exists/i.test(msg)
        ? `Une université nommée « ${form.name} » existe déjà.`
        : msg || 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (u: UniversityRow) => {
    if (!confirm(`Supprimer « ${u.name} » ? Ses filières seront supprimées avec elle.`)) return;
    try {
      await apiService.adminDeleteUniversity(u.id);
      flash('Université supprimée.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const selectCls = 'border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      <PageHeader
        title="Universités"
        subtitle={`${items.length} université${items.length > 1 ? 's' : ''} · ${stats.countries} pays · ${stats.cities} villes`}
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
        <StatCard label="Universités" value={items.length} icon={AcademicCapIcon} tone="primary" hint={`${stats.programs} filières distinctes`} />
        <StatCard label="Pays couverts" value={stats.countries} icon={GlobeAltIcon} tone="gold" hint={byCountry[0] ? `${byCountry[0].country} en tête (${byCountry[0].count})` : undefined} />
        <StatCard label="Villes" value={stats.cities} icon={BuildingLibraryIcon} tone="indigo" />
        <StatCard
          label="Conditions renseignées"
          value={`${stats.pct}%`}
          icon={LanguageIcon}
          tone={stats.missing === 0 ? 'teal' : 'rose'}
          hint={stats.missing === 0 ? 'Catalogue complet' : `${stats.missing} sans langue ou niveau`}
        />
      </div>

      {/* ── Répartition par pays ── */}
      {!loading && byCountry.length > 0 && (
        <div className="mb-6">
          <CountryBreakdown rows={byCountry} total={items.length} selected={country} onSelect={c => { setCountry(c); setCity(''); }} />
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
              placeholder="Rechercher un nom, une ville, une spécialité, une filière…"
              aria-label="Rechercher une université"
              className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Segmented label="Regroupement" value={groupBy} onChange={setGroupBy} options={GROUPINGS} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={country} onChange={e => { setCountry(e.target.value); setCity(''); }} aria-label="Filtrer par pays" className={selectCls}>
            <option value="">Tous les pays</option>
            {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={city} onChange={e => setCity(e.target.value)} aria-label="Filtrer par ville" className={selectCls}>
            <option value="">Toutes les villes</option>
            {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={sector} onChange={e => setSector(e.target.value)} aria-label="Filtrer par secteur" className={selectCls}>
            <option value="">Tous les secteurs</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={level} onChange={e => setLevel(e.target.value)} aria-label="Filtrer par niveau" className={selectCls}>
            <option value="">Tous les niveaux</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={cefr} onChange={e => setCefr(e.target.value)} aria-label="Filtrer par niveau de langue requis" className={selectCls}>
            <option value="">Tout niveau de langue</option>
            {CEFR.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            type="button"
            onClick={() => setOnlyMissing(v => !v)}
            aria-pressed={onlyMissing}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              onlyMissing ? 'bg-gold-100 text-gold-800 border border-gold-300' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4" /> Conditions manquantes
            {stats.missing > 0 && <span className="tabular-nums text-xs">({stats.missing})</span>}
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
        {filtered.length} université{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
        {filtered.length !== items.length && <span className="text-stone-400"> sur {items.length}</span>}
        {(groupBy === 'sector' || groupBy === 'level') && (
          <span className="text-stone-400">
            {' '}— une université couvrant plusieurs {groupBy === 'sector' ? 'secteurs' : 'niveaux'} apparaît dans chaque groupe.
          </span>
        )}
      </p>

      {/* ── Liste ── */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-24 rounded bg-stone-100" />
                <div className="h-4 w-1/2 rounded bg-stone-100" />
                <div className="h-3 w-1/3 rounded bg-stone-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <AcademicCapIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? 'Aucune université' : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0 ? 'Ajoutez votre première université au catalogue.' : 'Essayez d’élargir vos filtres.'}
          </p>
          {activeFilters > 0 && (
            <div className="mt-5 flex justify-center">
              <SecondaryButton onClick={resetFilters}>Réinitialiser les filtres</SecondaryButton>
            </div>
          )}
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
                    {list.map(u => (
                      <UniversityCard key={`${key}-${u.id}`} u={u} onEdit={() => openEdit(u)} onDelete={() => handleDelete(u)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <UniversityCard key={u.id} u={u} onEdit={() => openEdit(u)} onDelete={() => handleDelete(u)} />
          ))}
        </div>
      )}

      {/* ── Éditeur ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditorOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId !== null ? 'Modifier une université' : 'Ajouter une université'}
            className="bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full max-w-2xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-display text-xl font-semibold text-stone-800">
                {editingId !== null ? 'Modifier l’université' : 'Ajouter une université'}
              </h2>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Field label="Nom de l’université" required>
                <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Freie Universität Berlin" />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Ville" required>
                  <TextInput value={form.city} onChange={e => set('city', e.target.value)} placeholder="Berlin" list="admin-univ-cities" />
                </Field>
                <Field label="Pays" required>
                  <TextInput value={form.country} onChange={e => set('country', e.target.value)} placeholder="Germany" list="admin-univ-countries" />
                </Field>
              </div>
              {/* Suggestions issues du catalogue : évite « Germany » / « Allemagne » en doublon. */}
              <datalist id="admin-univ-countries">{countryOptions.map(c => <option key={c} value={c} />)}</datalist>
              <datalist id="admin-univ-cities">{cityOptions.map(c => <option key={c} value={c} />)}</datalist>

              <Field label="Spécialité">
                <TextInput value={form.specialty} onChange={e => set('specialty', e.target.value)} placeholder="Excellence en sciences sociales" />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Site web">
                  <TextInput value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="URL de candidature">
                  <TextInput value={form.applicationUrl} onChange={e => set('applicationUrl', e.target.value)} placeholder="https://…" />
                </Field>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400 mb-3">
                  Conditions d’admission
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Langue requise">
                    <TextInput value={form.requiredLanguage} onChange={e => set('requiredLanguage', e.target.value)} placeholder="Allemand" />
                  </Field>
                  <Field label="Niveau requis (CEFR)">
                    <Select value={form.requiredLanguageLevel} onChange={e => set('requiredLanguageLevel', e.target.value)}>
                      <option value="">— Non renseigné —</option>
                      {CEFR.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                </div>
                <p className="mt-3 text-xs text-stone-400">
                  Ces deux champs sont comparés au profil de l’étudiant côté site.
                  Renseignez-les ensemble : l’un sans l’autre n’est pas exploitable.
                </p>

                <div className="mt-4 pt-4 border-t border-stone-200 grid sm:grid-cols-2 gap-4">
                  <Field label="Note / moyenne minimale">
                    <TextInput
                      value={form.minimumGrade}
                      onChange={e => set('minimumGrade', e.target.value)}
                      placeholder="Mention Bien (14/20)"
                    />
                  </Field>
                  <Field label="Sélection">
                    <TextInput
                      value={form.admissionRequirements}
                      onChange={e => set('admissionRequirements', e.target.value)}
                      placeholder="Dossier + entretien"
                    />
                  </Field>
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  La note se saisit dans le système du pays (mention au bac /20, GPA /4.0,
                  A-levels, Numerus Clausus, score Gaokao…) : un même chiffre n’a pas le
                  même sens d’un pays à l’autre.
                </p>
              </div>

              {editingId !== null && (
                <p className="text-xs text-stone-400">
                  Les filières (Bachelor / Master) ne se modifient pas depuis cet écran.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/60 rounded-b-2xl">
              <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !form.name.trim() || !form.city.trim() || !form.country.trim()}>
                <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversities;
