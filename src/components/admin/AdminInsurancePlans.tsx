import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon, ArrowPathIcon,
  ShieldCheckIcon, AcademicCapIcon, PaperAirplaneIcon, GlobeAltIcon, ExclamationTriangleIcon,
  EyeIcon, EyeSlashIcon, PhotoIcon, XMarkIcon, LinkIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { useCountries } from '../../hooks/useCountries';
import {
  PageHeader, PrimaryButton, SecondaryButton, StatCard, IconButton, Badge,
  TableShell, EmptyRow, Modal, Field, TextInput, TextArea, Select, Card, BoolPill,
} from './ui';

/**
 * Écran d'administration des offres d'assurance (`InsurancePlan`).
 *
 * Une offre n'existe que par la page publique qu'elle alimente : `audience` n'est pas
 * une étiquette décorative mais le routage éditorial (general → /insurance,
 * student → StudentInsurance, travel → TravelInsurance). L'écran est donc construit
 * autour de trois questions : **quelle page est servie**, **pour quel pays**, et
 * **la fiche est-elle assez remplie pour que la carte publique tienne debout**.
 *
 * Deux pièges que le tableau rend visibles plutôt que de les laisser deviner :
 * - les valeurs de `coverageTypes` / `insuranceTypes` sont comparées **à l'identique**
 *   par les filtres publics : une graphie approximative rend l'offre introuvable ;
 * - sur /insurance, le tarif est affiché **dans le bandeau image** : une fiche sans
 *   visuel perd aussi son prix.
 */

/** Vocabulaire exact des filtres de /insurance (`Insurance.tsx`) — toute autre graphie sort des filtres. */
const KNOWN_INSURANCE_TYPES = [
  'Health Insurance', 'Travel Insurance', 'Travel Medical Insurance', 'Life Insurance',
  'Income Protection Insurance', 'Professional Liability Insurance', 'Business Insurance',
  'Property Insurance', 'Home Insurance', 'Renters Insurance', 'Student Health Insurance',
];

const KNOWN_COVERAGE_TYPES = [
  'Medical', 'Dental', 'Vision', 'Prescription Drugs', 'Emergency Medical',
  'Life', 'Critical Illness', 'Income Protection', 'Disability',
  'Building', 'Contents', 'Personal Liability', 'Natural Disasters',
  'Professional Liability', 'Errors & Omissions', 'Cyber Liability', 'Business Property',
  'Trip Cancellation', 'Lost Baggage', 'Travel Delay', 'Flight Accident',
  'Health', 'Accident', 'Liability', 'Travel', 'Personal Property',
];

type Tone = 'green' | 'indigo' | 'gold';

/**
 * Les trois publics et la page qu'ils alimentent.
 * `route` = chemin déclaré dans App.tsx ; `null` signale un composant public existant
 * mais **non branché** sur une route — les fiches concernées ne sont vues par personne.
 */
const AUDIENCES: {
  value: string; label: string; page: string; route: string | null;
  icon: React.ElementType; tone: Tone; reference: 'all' | 'study';
}[] = [
  { value: 'general', label: 'Grand public', page: 'Assurances', route: '/insurance', icon: ShieldCheckIcon, tone: 'green', reference: 'all' },
  { value: 'student', label: 'Étudiants', page: 'Assurance étudiante', route: null, icon: AcademicCapIcon, tone: 'indigo', reference: 'study' },
  { value: 'travel', label: 'Voyageurs', page: 'Assurance voyage', route: null, icon: PaperAirplaneIcon, tone: 'gold', reference: 'all' },
];

const audienceOf = (v: string) => AUDIENCES.find(a => a.value === v);
const audienceRank = (v: string) => {
  const i = AUDIENCES.findIndex(a => a.value === v);
  return i === -1 ? AUDIENCES.length : i;
};

interface Row {
  id: number;
  provider: string;
  country: string;
  audience: string;
  coverageTypes?: string[] | null;
  benefits?: string[] | null;
  insuranceTypes?: string[] | null;
  monthlyPremium?: string | null;
  coverage?: string | null;
  rating?: number | null;
  reviews?: number | null;
  image?: string | null;
  description?: string | null;
  isActive: boolean;
}

const asList = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]).map(String) : []);

/**
 * Ce qui manque pour que la carte publique soit présentable.
 * `insuranceTypes` et `image` ne comptent que pour /insurance : les deux autres pages
 * n'affichent ni famille de produit ni visuel.
 */
function missingOf(r: Row): string[] {
  const missing: string[] = [];
  if (!r.monthlyPremium?.trim()) missing.push('cotisation');
  if (!r.coverage?.trim()) missing.push('plafond');
  if (asList(r.coverageTypes).length === 0) missing.push('garanties');
  if (asList(r.benefits).length === 0) missing.push('avantages');
  if (!r.description?.trim()) missing.push('description');
  if (r.audience === 'general') {
    if (asList(r.insuranceTypes).length === 0) missing.push('famille de produit');
    if (!r.image?.trim()) missing.push('visuel');
  }
  return missing;
}

type FormState = {
  provider: string; audience: string; country: string; monthlyPremium: string; coverage: string;
  coverageTypes: string[]; benefits: string[]; insuranceTypes: string[];
  rating: string; reviews: string; image: string; description: string; isActive: boolean;
};

const EMPTY_FORM: FormState = {
  provider: '', audience: 'general', country: '', monthlyPremium: '', coverage: '',
  coverageTypes: [], benefits: [], insuranceTypes: [],
  rating: '', reviews: '', image: '', description: '', isActive: true,
};

/**
 * Éditeur de liste : chips retirables + suggestions issues du vocabulaire des filtres publics.
 * Cliquer une suggestion garantit la graphie exacte ; la saisie libre reste possible
 * pour les valeurs qu'aucun filtre n'utilise.
 */
const ChipPicker: React.FC<{
  values: string[];
  suggestions?: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}> = ({ values, suggestions = [], placeholder, onChange }) => {
  const [draft, setDraft] = useState('');

  const add = (value: string) => {
    const v = value.trim();
    if (v === '' || values.some(x => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
    setDraft('');
  };

  const remaining = suggestions.filter(s => !values.some(v => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map(v => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter(x => x !== v))}
                className="cursor-pointer text-primary/60 hover:text-primary"
                aria-label={`Retirer ${v}`}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <TextInput
        value={draft}
        placeholder={placeholder}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); }
        }}
        onBlur={() => add(draft)}
      />
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="cursor-pointer rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs text-stone-500 hover:border-primary/40 hover:text-primary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminInsurancePlans: React.FC = () => {
  const { countries, studyCountries, getContinentForCountry } = useCountries();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState<'' | 'visible' | 'hidden' | 'incomplete'>('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await apiService.adminGetInsurancePlans();
      setRows(res.data ?? res.plans ?? []);
    } catch {
      setRows([]);
      setError("Impossible de charger les offres — vérifiez que le backend répond.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Pays servis par au moins une offre visible, par public. */
  const coverageByAudience = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of AUDIENCES) map.set(a.value, new Set());
    for (const r of rows) {
      if (!r.isActive) continue;
      if (!map.has(r.audience)) map.set(r.audience, new Set());
      map.get(r.audience)!.add(r.country);
    }
    return map;
  }, [rows]);

  const coveredCountries = useMemo(
    () => new Set(rows.filter(r => r.isActive).map(r => r.country)),
    [rows]
  );

  /** Pays d'études annoncés à l'étudiant, mais sans aucune assurance étudiante visible. */
  const studyGaps = useMemo(
    () => studyCountries.filter(c => !(coverageByAudience.get('student')?.has(c))),
    [studyCountries, coverageByAudience]
  );

  const incompleteCount = useMemo(() => rows.filter(r => missingOf(r).length > 0).length, [rows]);
  const hiddenCount = useMemo(() => rows.filter(r => !r.isActive).length, [rows]);

  /** Offres rattachées à un pays absent du catalogue : invisibles derrière le filtre pays public. */
  const offCatalog = useMemo(
    () => (countries.length === 0 ? [] : rows.filter(r => !countries.includes(r.country))),
    [rows, countries]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter(r => !audienceFilter || r.audience === audienceFilter)
      .filter(r => !countryFilter || r.country === countryFilter)
      .filter(r =>
        stateFilter === '' ||
        (stateFilter === 'visible' && r.isActive) ||
        (stateFilter === 'hidden' && !r.isActive) ||
        (stateFilter === 'incomplete' && missingOf(r).length > 0)
      )
      .filter(r => !q || [
        r.provider, r.country, r.description ?? '', r.coverage ?? '', r.monthlyPremium ?? '',
        ...asList(r.coverageTypes), ...asList(r.benefits), ...asList(r.insuranceTypes),
      ].join(' ').toLowerCase().includes(q))
      .sort((a, b) =>
        a.country.localeCompare(b.country) ||
        audienceRank(a.audience) - audienceRank(b.audience) ||
        a.provider.localeCompare(b.provider)
      );
  }, [rows, search, audienceFilter, countryFilter, stateFilter]);

  /** Le tri est par pays : on matérialise la coupure plutôt que de répéter le pays ligne à ligne. */
  const groups = useMemo(() => {
    const out: { country: string; items: Row[] }[] = [];
    for (const r of filtered) {
      const last = out[out.length - 1];
      if (last && last.country === r.country) last.items.push(r);
      else out.push({ country: r.country, items: [r] });
    }
    return out;
  }, [filtered]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>(countries);
    for (const r of rows) set.add(r.country); // garde les pays hors catalogue éditables
    return [...set].sort();
  }, [countries, rows]);

  const openCreate = (preset?: Partial<FormState>) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, audience: audienceFilter || 'general', country: countryFilter || '', ...preset });
    setShowForm(true);
  };

  const openEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({
      provider: r.provider, audience: r.audience, country: r.country,
      monthlyPremium: r.monthlyPremium ?? '', coverage: r.coverage ?? '',
      coverageTypes: asList(r.coverageTypes), benefits: asList(r.benefits),
      insuranceTypes: asList(r.insuranceTypes),
      rating: r.rating == null ? '' : String(r.rating),
      reviews: r.reviews == null ? '' : String(r.reviews),
      image: r.image ?? '', description: r.description ?? '', isActive: r.isActive,
    });
    setShowForm(true);
  };

  const formValid = form.provider.trim() !== '' && form.country.trim() !== '' && form.audience !== '';

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    setError('');
    try {
      // Les listes partent en tableaux : le backend (lib/directory-input) accepte les deux
      // formes, mais le tableau évite toute ambiguïté sur les valeurs contenant une virgule.
      const payload = {
        provider: form.provider.trim(),
        audience: form.audience,
        country: form.country.trim(),
        monthlyPremium: form.monthlyPremium.trim(),
        coverage: form.coverage.trim(),
        coverageTypes: form.coverageTypes,
        benefits: form.benefits,
        insuranceTypes: form.insuranceTypes,
        rating: form.rating.trim(),
        reviews: form.reviews.trim(),
        image: form.image.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      };
      if (editingId !== null) await apiService.adminUpdateInsurancePlan(editingId, payload);
      else await apiService.adminCreateInsurancePlan(payload);
      setShowForm(false);
      await load();
    } catch {
      setError("Enregistrement refusé par le backend — l'assureur et le pays sont obligatoires.");
    } finally {
      setSaving(false);
    }
  };

  /** Bascule publiée/masquée : PUT partiel, les autres champs restent inchangés. */
  const toggleActive = async (r: Row) => {
    setBusyId(r.id);
    setError('');
    try {
      await apiService.adminUpdateInsurancePlan(r.id, { isActive: !r.isActive });
      setRows(prev => prev.map(x => (x.id === r.id ? { ...x, isActive: !r.isActive } : x)));
    } catch {
      setError("Changement de visibilité refusé par le backend.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (r: Row) => {
    if (!confirm(`Supprimer l'offre « ${r.provider} » (${r.country}) ?`)) return;
    try {
      await apiService.adminDeleteInsurancePlan(r.id);
      await load();
    } catch {
      setError('Suppression refusée par le backend.');
    }
  };

  const selectedAudience = audienceOf(form.audience);

  return (
    <div>
      <PageHeader
        title="Assurances"
        subtitle="Chaque offre alimente une page publique via son public cible. Le tarif et les garanties affichés ici sont ceux que verra le visiteur."
        actions={
          <>
            <SecondaryButton onClick={load} disabled={loading}>
              <span className="inline-flex items-center gap-2">
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </span>
            </SecondaryButton>
            <PrimaryButton onClick={() => openCreate()}>
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Offres"
          value={rows.length}
          icon={ShieldCheckIcon}
          tone="primary"
          hint={hiddenCount > 0 ? `${rows.length - hiddenCount} visible(s) · ${hiddenCount} masquée(s)` : 'Toutes visibles'}
        />
        <StatCard
          label="Pays servis"
          value={countries.length > 0 ? `${coveredCountries.size}/${countries.length}` : coveredCountries.size}
          icon={GlobeAltIcon}
          tone="gold"
          hint={[...coveredCountries].sort().join(', ') || 'Aucun pays servi'}
        />
        <StatCard
          label="Fiches incomplètes"
          value={incompleteCount}
          icon={ExclamationTriangleIcon}
          tone={incompleteCount > 0 ? 'rose' : 'default'}
          hint={incompleteCount > 0 ? 'Carte publique amputée' : 'Toutes les cartes sont complètes'}
        />
        <StatCard
          label="Hors catalogue pays"
          value={offCatalog.length}
          icon={ExclamationTriangleIcon}
          tone={offCatalog.length > 0 ? 'rose' : 'default'}
          hint={offCatalog.length > 0 ? 'Introuvables via le filtre pays' : 'Pays cohérents'}
        />
      </div>

      {/* Publics : à la fois lecture de la couverture et filtre du tableau. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {AUDIENCES.map(a => {
          const all = rows.filter(r => r.audience === a.value);
          const visible = all.filter(r => r.isActive).length;
          const reference = a.reference === 'study' ? studyCountries : countries;
          const covered = coverageByAudience.get(a.value)?.size ?? 0;
          const total = reference.length;
          const selected = audienceFilter === a.value;
          const Icon = a.icon;
          const toneRing: Record<Tone, string> = {
            green: 'ring-primary/40 bg-primary/5',
            indigo: 'ring-indigo-300 bg-indigo-50/60',
            gold: 'ring-gold-300 bg-gold-50/60',
          };
          const toneChip: Record<Tone, string> = {
            green: 'bg-primary/10 text-primary',
            indigo: 'bg-indigo-50 text-indigo-600',
            gold: 'bg-gold-100 text-gold-700',
          };
          return (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudienceFilter(selected ? '' : a.value)}
              aria-pressed={selected}
              className={`cursor-pointer rounded-2xl border border-stone-200/80 p-5 text-left shadow-card transition-all duration-200 hover:shadow-card-hover ${selected ? `ring-2 ${toneRing[a.tone]}` : 'bg-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{a.label}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-stone-800 truncate">{a.page}</p>
                </div>
                <div className={`shrink-0 h-9 w-9 rounded-full grid place-items-center ${toneChip[a.tone]}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>

              <p className="mt-3 text-sm text-stone-600 tabular-nums">
                <span className="font-display text-2xl font-semibold text-stone-800">{visible}</span>
                <span className="text-stone-400"> offre{visible > 1 ? 's' : ''} visible{visible > 1 ? 's' : ''}</span>
                {all.length !== visible && <span className="text-stone-400"> · {all.length - visible} masquée(s)</span>}
              </p>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{a.reference === 'study' ? "Pays d'études servis" : 'Pays servis'}</span>
                  <span className="tabular-nums">{covered}/{total || '—'}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-stone-100">
                  <div
                    className={`h-1.5 rounded-full ${a.tone === 'green' ? 'bg-primary' : a.tone === 'indigo' ? 'bg-indigo-400' : 'bg-gold-400'}`}
                    style={{ width: total > 0 ? `${Math.round((covered / total) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              {a.route ? (
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-stone-400">
                  <LinkIcon className="h-3 w-3" /> {a.route}
                </p>
              ) : (
                <p className="mt-3 inline-flex items-start gap-1 text-xs text-rose-600">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                  Page non branchée : ces offres ne sont visibles nulle part sur le site.
                </p>
              )}
            </button>
          );
        })}
      </div>

      {studyGaps.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3 text-sm text-gold-800">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="font-medium">Pays d'études sans assurance étudiante :</span>
          {studyGaps.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => openCreate({ audience: 'student', country: c })}
              className="cursor-pointer rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium hover:bg-white"
            >
              {c} +
            </button>
          ))}
        </div>
      )}

      {/* Filtres */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un assureur, une garantie, un avantage…"
              className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
            <option value="">Tous les pays servis</option>
            {[...coveredCountries].sort().map(c => (
              <option key={c} value={c}>{c} ({rows.filter(r => r.country === c).length})</option>
            ))}
          </Select>
          <Select value={stateFilter} onChange={e => setStateFilter(e.target.value as any)}>
            <option value="">Tous les états</option>
            <option value="visible">Visibles ({rows.length - hiddenCount})</option>
            <option value="hidden">Masquées ({hiddenCount})</option>
            <option value="incomplete">Fiches incomplètes ({incompleteCount})</option>
          </Select>
        </div>
        {(audienceFilter || countryFilter || stateFilter || search) && (
          <button
            type="button"
            onClick={() => { setAudienceFilter(''); setCountryFilter(''); setStateFilter(''); setSearch(''); }}
            className="mt-3 cursor-pointer text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
          >
            Réinitialiser les filtres
          </button>
        )}
      </Card>

      <TableShell
        head={<>
          <th>Offre</th>
          <th>Public</th>
          <th>Tarif</th>
          <th>Garanties</th>
          <th>Avantages</th>
          <th>Note</th>
          <th>État</th>
          <th className="text-right">Actions</th>
        </>}
      >
        {loading ? (
          <EmptyRow colSpan={8}>Chargement…</EmptyRow>
        ) : filtered.length === 0 ? (
          <EmptyRow colSpan={8}>
            {rows.length === 0
              ? 'Aucune offre — cliquez « Ajouter » pour commencer.'
              : 'Aucune offre ne correspond à ces filtres.'}
          </EmptyRow>
        ) : groups.map(group => (
          <React.Fragment key={group.country}>
            <tr className="bg-stone-50/80">
              <td colSpan={8} className="px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {getContinentForCountry(group.country)} {group.country}
                </span>
                <span className="ml-2 text-xs text-stone-400">
                  {group.items.length} offre{group.items.length > 1 ? 's' : ''}
                  {' · '}
                  {AUDIENCES
                    .map(a => ({ a, n: group.items.filter(r => r.audience === a.value).length }))
                    .filter(x => x.n > 0)
                    .map(x => `${x.n} ${x.a.label.toLowerCase()}`)
                    .join(' · ')}
                </span>
                {countries.length > 0 && !countries.includes(group.country) && (
                  <Badge tone="rose" className="ml-2">Hors catalogue pays</Badge>
                )}
              </td>
            </tr>

            {group.items.map(r => {
              const missing = missingOf(r);
              const aud = audienceOf(r.audience);
              const coverageTypes = asList(r.coverageTypes);
              const benefits = asList(r.benefits);
              const families = asList(r.insuranceTypes);
              return (
                <tr key={r.id} className={`align-top transition-colors duration-150 hover:bg-stone-50 ${r.isActive ? '' : 'opacity-60'}`}>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-stone-200"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                        />
                      ) : (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-stone-100 text-stone-300" title="Aucun visuel">
                          <PhotoIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-stone-800">{r.provider}</div>
                        {r.description
                          ? <p className="mt-0.5 max-w-sm text-xs text-stone-500 line-clamp-2">{r.description}</p>
                          : <p className="mt-0.5 text-xs italic text-stone-400">Sans description</p>}
                        {families.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {families.map(f => (
                              <span
                                key={f}
                                className={`rounded-full px-2 py-0.5 text-[11px] ${KNOWN_INSURANCE_TYPES.includes(f) ? 'bg-stone-100 text-stone-600' : 'bg-rose-50 text-rose-600'}`}
                                title={KNOWN_INSURANCE_TYPES.includes(f) ? undefined : 'Valeur absente du filtre « Insurance Type » : offre introuvable par ce filtre'}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* `whitespace-nowrap` : sans lui, « Grand public » et le nom de page
                      se replient sur trois lignes et gonflent la hauteur de ligne. */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge tone={aud?.tone === 'green' ? 'green' : aud?.tone === 'indigo' ? 'indigo' : 'gold'}>
                      {aud?.label ?? r.audience}
                    </Badge>
                    <p className="mt-1 text-[11px] text-stone-400">{aud?.page ?? '—'}</p>
                    {aud && !aud.route && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-rose-500" title="Le composant public existe mais aucune route ne le sert (App.tsx).">
                        <ExclamationTriangleIcon className="h-3 w-3" /> hors ligne
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.monthlyPremium
                      ? <div className="font-medium text-stone-800 tabular-nums">{r.monthlyPremium}<span className="text-xs font-normal text-stone-400"> /mois</span></div>
                      : <div className="text-xs italic text-stone-400">Sans tarif</div>}
                    <p className="mt-0.5 text-xs text-stone-500">{r.coverage || 'Plafond non renseigné'}</p>
                  </td>

                  <td className="px-4 py-3">
                    {coverageTypes.length === 0 ? (
                      <span className="text-xs italic text-stone-400">Aucune</span>
                    ) : (
                      <div className="flex max-w-[15rem] flex-wrap gap-1">
                        {coverageTypes.slice(0, 4).map(c => (
                          <span
                            key={c}
                            className={`rounded-full px-2 py-0.5 text-[11px] ${KNOWN_COVERAGE_TYPES.some(k => k.toLowerCase() === c.toLowerCase()) ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'}`}
                            title={KNOWN_COVERAGE_TYPES.some(k => k.toLowerCase() === c.toLowerCase()) ? undefined : 'Valeur absente du filtre « Coverage Type » public'}
                          >
                            {c}
                          </span>
                        ))}
                        {coverageTypes.length > 4 && (
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500" title={coverageTypes.slice(4).join(', ')}>
                            +{coverageTypes.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {benefits.length === 0 ? (
                      <span className="text-xs italic text-stone-400">Aucun</span>
                    ) : (
                      <ul className="max-w-[13rem] space-y-0.5 text-xs text-stone-600">
                        {benefits.slice(0, 2).map(b => <li key={b} className="truncate" title={b}>• {b}</li>)}
                        {benefits.length > 2 && (
                          <li className="text-stone-400" title={benefits.slice(2).join(', ')}>+{benefits.length - 2} autre(s)</li>
                        )}
                      </ul>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.rating != null ? (
                      <span className="text-sm text-stone-700 tabular-nums">
                        <span className="text-gold-500">★</span> {r.rating}
                        {r.reviews != null && <span className="text-xs text-stone-400"> ({r.reviews})</span>}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-300">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 min-w-[10rem]">
                    <BoolPill value={r.isActive} yes="Visible" no="Masquée" />
                    {missing.length > 0 && (
                      <p
                        className="mt-1 flex items-start gap-1 text-[11px] text-gold-700"
                        title={
                          missing.includes('visuel')
                            ? 'Sans visuel, la carte de /insurance n’affiche ni image ni tarif.'
                            : 'Ces champs manquent à la carte publique.'
                        }
                      >
                        <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                        Manque : {missing.join(', ')}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        tone={r.isActive ? 'amber' : 'green'}
                        title={r.isActive ? 'Masquer du site' : 'Publier sur le site'}
                        disabled={busyId === r.id}
                        onClick={() => toggleActive(r)}
                      >
                        {r.isActive ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </IconButton>
                      <IconButton tone="blue" title="Modifier" onClick={() => openEdit(r)}>
                        <PencilSquareIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(r)}>
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </React.Fragment>
        ))}
      </TableShell>

      {!loading && filtered.length > 0 && (
        <p className="mt-3 text-xs text-stone-400">
          {filtered.length} offre{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          {filtered.length !== rows.length && ` sur ${rows.length}`}.
          Les tarifs et plafonds sont indicatifs et se confirment auprès de l'assureur.
        </p>
      )}

      {showForm && (
        <Modal
          title={editingId !== null ? "Modifier l'offre" : 'Ajouter une offre'}
          onClose={() => setShowForm(false)}
          maxWidth="max-w-3xl"
          footer={
            <>
              <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !formValid}>
                <CheckIcon className="h-4 w-4" />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Field label="Assureur" required>
                <TextInput
                  value={form.provider}
                  onChange={e => setForm({ ...form, provider: e.target.value })}
                  placeholder="Ex. Global Care Plus"
                />
              </Field>
            </div>
            <Field label="Public cible" required>
              <Select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label} — {a.page}</option>)}
              </Select>
            </Field>
            <Field label="Pays" required>
              <Select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                <option value="">— Choisir —</option>
                {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>

          {selectedAudience && !selectedAudience.route && (
            <p className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
              La page « {selectedAudience.page} » n'a pas de route publique aujourd'hui : l'offre sera stockée mais invisible pour les visiteurs.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Cotisation mensuelle">
              <TextInput
                value={form.monthlyPremium}
                onChange={e => setForm({ ...form, monthlyPremium: e.target.value })}
                placeholder="Ex. €35 (devise comprise, « /month » ajouté par la page)"
              />
            </Field>
            <Field label="Plafond de couverture">
              <TextInput
                value={form.coverage}
                onChange={e => setForm({ ...form, coverage: e.target.value })}
                placeholder="Ex. Up to €2,500,000"
              />
            </Field>
          </div>

          <Field label="Garanties (filtre « Coverage Type » public)">
            <ChipPicker
              values={form.coverageTypes}
              suggestions={KNOWN_COVERAGE_TYPES}
              placeholder="Saisir puis Entrée, ou cliquer une suggestion"
              onChange={v => setForm({ ...form, coverageTypes: v })}
            />
          </Field>

          <Field label="Avantages (affichés en liste sur la carte)">
            <ChipPicker
              values={form.benefits}
              placeholder="Ex. Dental Coverage — saisir puis Entrée"
              onChange={v => setForm({ ...form, benefits: v })}
            />
          </Field>

          {form.audience === 'general' && (
            <Field label="Familles de produit (filtre « Insurance Type » de /insurance)">
              <ChipPicker
                values={form.insuranceTypes}
                suggestions={KNOWN_INSURANCE_TYPES}
                placeholder="Saisir puis Entrée, ou cliquer une suggestion"
                onChange={v => setForm({ ...form, insuranceTypes: v })}
              />
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Note (0-5)">
              <TextInput
                type="number" min={0} max={5} step={0.1}
                value={form.rating}
                onChange={e => setForm({ ...form, rating: e.target.value })}
                placeholder="4.7"
              />
            </Field>
            <Field label="Nombre d'avis">
              <TextInput
                type="number" min={0}
                value={form.reviews}
                onChange={e => setForm({ ...form, reviews: e.target.value })}
                placeholder="1240"
              />
            </Field>
            <Field label="Visible sur le site">
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
                />
                Publier l'offre
              </label>
            </Field>
          </div>

          <Field label="Image (URL)">
            <div className="flex gap-3">
              <TextInput
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
              />
              {form.image && (
                <img
                  src={form.image}
                  alt=""
                  className="h-10 w-16 shrink-0 rounded-lg object-cover ring-1 ring-stone-200"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              )}
            </div>
            {form.audience === 'general' && !form.image.trim() && (
              <p className="mt-1 text-xs text-gold-700">
                Sur /insurance, le tarif est affiché dans le bandeau image : sans visuel, la carte perd aussi son prix.
              </p>
            )}
          </Field>

          <Field label="Description">
            <TextArea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ce que couvre l'offre, pour qui, et les limites à connaître."
            />
          </Field>
        </Modal>
      )}
    </div>
  );
};

export default AdminInsurancePlans;
