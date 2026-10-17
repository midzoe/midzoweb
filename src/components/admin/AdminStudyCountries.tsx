import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowPathIcon,
  MagnifyingGlassIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, AcademicCapIcon, SparklesIcon,
  BanknotesIcon, HomeModernIcon, IdentificationIcon, LanguageIcon, ClockIcon,
  ChevronRightIcon, CheckCircleIcon, EyeSlashIcon, ExclamationTriangleIcon, TrophyIcon,
  ClipboardDocumentCheckIcon, BuildingLibraryIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Modal,
} from './ui';

/**
 * Story 9.6 — Pays d'étude.
 * La fiche pays porte 20 champs (frais, coût de la vie, visa, bourses, filières,
 * top universités…) : cet écran les expose tous, mesure la complétude de chaque
 * fiche et signale les pays du catalogue universités qui n'ont pas encore de fiche.
 * Les brouillons IA (source « ai:… », isValidated=false) restent invisibles côté
 * site tant qu'ils ne sont pas validés (gate 9.2 / FR37).
 */

interface StudyCountryRow {
  id: number;
  name: string;
  nameFr?: string | null;
  region?: string | null;
  capital?: string | null;
  flag?: string | null;
  image?: string | null;
  description?: string | null;
  languageInstruction?: string[] | null;
  tuitionRange?: string | null;
  livingCost?: string | null;
  visaDifficulty?: string | null;
  scholarshipAvailable?: boolean;
  popularScholarships?: string[] | null;
  popularPrograms?: string[] | null;
  admissionRequirements?: string[] | null;
  topUniversities?: string[] | null;
  processingTimeVisa?: string | null;
  studyAvailable?: boolean;
  isValidated?: boolean;
  source?: string | null;
  updatedAt?: string;
}

type Form = {
  name: string; nameFr: string; region: string; capital: string; flag: string; image: string;
  description: string; tuitionRange: string; livingCost: string; visaDifficulty: string;
  processingTimeVisa: string;
  languageInstruction: string[]; popularScholarships: string[]; popularPrograms: string[];
  admissionRequirements: string[]; topUniversities: string[];
  scholarshipAvailable: boolean; studyAvailable: boolean; isValidated: boolean;
};

const emptyForm: Form = {
  name: '', nameFr: '', region: '', capital: '', flag: '', image: '',
  description: '', tuitionRange: '', livingCost: '', visaDifficulty: '',
  processingTimeVisa: '',
  languageInstruction: [], popularScholarships: [], popularPrograms: [],
  admissionRequirements: [], topUniversities: [],
  scholarshipAvailable: false, studyAvailable: true, isValidated: false,
};

const arr = (v?: string[] | null) => (Array.isArray(v) ? v.filter(Boolean) : []);
const str = (v?: string | null) => (v ?? '').trim();

const toForm = (c: StudyCountryRow): Form => ({
  name: str(c.name), nameFr: str(c.nameFr), region: str(c.region), capital: str(c.capital),
  flag: str(c.flag), image: str(c.image), description: str(c.description),
  tuitionRange: str(c.tuitionRange), livingCost: str(c.livingCost),
  visaDifficulty: str(c.visaDifficulty), processingTimeVisa: str(c.processingTimeVisa),
  languageInstruction: arr(c.languageInstruction), popularScholarships: arr(c.popularScholarships),
  popularPrograms: arr(c.popularPrograms), admissionRequirements: arr(c.admissionRequirements),
  topUniversities: arr(c.topUniversities),
  scholarshipAvailable: !!c.scholarshipAvailable,
  studyAvailable: c.studyAvailable !== false,
  isValidated: !!c.isValidated,
});

/**
 * Complétude d'une fiche : les 14 champs qui font une page pays digne d'être publiée.
 * Sert à la fois au pourcentage affiché et à la liste des champs manquants.
 */
const CHECKLIST: { label: string; filled: (c: StudyCountryRow) => boolean }[] = [
  { label: 'Nom FR', filled: c => !!str(c.nameFr) },
  { label: 'Région', filled: c => !!str(c.region) },
  { label: 'Capitale', filled: c => !!str(c.capital) },
  { label: 'Drapeau', filled: c => !!str(c.flag) },
  { label: 'Image', filled: c => !!str(c.image) },
  { label: 'Description', filled: c => !!str(c.description) },
  { label: 'Langues', filled: c => arr(c.languageInstruction).length > 0 },
  { label: 'Frais de scolarité', filled: c => !!str(c.tuitionRange) },
  { label: 'Coût de la vie', filled: c => !!str(c.livingCost) },
  { label: 'Difficulté visa', filled: c => !!str(c.visaDifficulty) },
  { label: 'Délai visa', filled: c => !!str(c.processingTimeVisa) },
  { label: 'Filières', filled: c => arr(c.popularPrograms).length > 0 },
  { label: "Conditions d'admission", filled: c => arr(c.admissionRequirements).length > 0 },
  { label: 'Top universités', filled: c => arr(c.topUniversities).length > 0 },
];

const missingFields = (c: StudyCountryRow) => CHECKLIST.filter(f => !f.filled(c)).map(f => f.label);
const completeness = (c: StudyCountryRow) =>
  Math.round((CHECKLIST.filter(f => f.filled(c)).length / CHECKLIST.length) * 100);

/** « Faible / Modéré / Difficile » → couleur. Tolère les variantes de saisie. */
const visaTone = (v?: string | null): 'green' | 'amber' | 'rose' | 'slate' => {
  const s = (v ?? '').toLowerCase();
  if (!s) return 'slate';
  if (/faible|facile|easy/.test(s)) return 'green';
  if (/mod|moyen|medium/.test(s)) return 'amber';
  if (/diff|élev|eleve|hard/.test(s)) return 'rose';
  return 'slate';
};

const isAiDraft = (c: StudyCountryRow) => (c.source ?? '').startsWith('ai:');

/* ── Saisie d'une liste (langues, bourses, filières…) sous forme d'étiquettes ── */
const TagInput: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) { setDraft(''); return; }
    onChange([...value, v]);
    setDraft('');
  };

  return (
    <div className="rounded-lg border border-stone-300 bg-white px-2 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((v, i) => (
            <span key={`${v}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-stone-100 pl-2 pr-1 py-0.5 text-xs text-stone-700">
              {v}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Retirer ${v}`}
                className="grid h-4 w-4 place-items-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        // Entrée ou virgule valide l'étiquette ; Retour arrière sur champ vide retire la dernière.
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={placeholder ?? 'Saisir puis Entrée…'}
        className="w-full bg-transparent px-1 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
      />
    </div>
  );
};

/* ── Donnée clé d'une fiche (frais, coût de la vie, visa…) ─────────────────── */
const FACT_TONES: Record<string, string> = {
  green: 'text-primary',
  amber: 'text-gold-700',
  rose: 'text-rose-600',
  slate: 'text-stone-700',
};

const Fact: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | null;
  tone?: keyof typeof FACT_TONES;
}> = ({ icon: Icon, label, value, tone = 'slate' }) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" />
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-stone-400">{label}</p>
      <p className={`text-sm ${value ? FACT_TONES[tone] : 'text-stone-300'}`}>{value || 'Non renseigné'}</p>
    </div>
  </div>
);

/** Petite liste dépliée (filières, conditions, top universités). */
const Chips: React.FC<{ icon: React.ElementType; label: string; items: string[] }> = ({
  icon: Icon, label, items,
}) => {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-stone-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((v, i) => (
          <span key={`${v}-${i}`} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">{v}</span>
        ))}
      </div>
    </div>
  );
};

/* ── Fiche pays ────────────────────────────────────────────────────────────── */
const CountryCard: React.FC<{
  c: StudyCountryRow;
  universities: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleValidated: () => void;
  busy: boolean;
}> = ({ c, universities, onEdit, onDelete, onToggleValidated, busy }) => {
  const [open, setOpen] = useState(false);
  const pct = completeness(c);
  const missing = missingFields(c);
  const languages = arr(c.languageInstruction);
  const validated = !!c.isValidated;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-stone-300">
      {/* Bandeau : l'image de la fiche, telle qu'elle sera vue côté site. */}
      <div className="relative h-24 bg-stone-100">
        {c.image ? (
          <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-stone-300">
            <PhotoIcon className="h-6 w-6" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/55 to-stone-900/5" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
          <div className="flex items-end gap-2.5 min-w-0">
            <span className="text-3xl leading-none drop-shadow-sm">{c.flag || '🏳️'}</span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold leading-tight text-white truncate">
                {c.nameFr || c.name}
              </h3>
              <p className="text-[11px] text-white/70 truncate">
                {c.nameFr && c.nameFr !== c.name ? `${c.name} · ` : ''}{c.capital || 'capitale ?'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {c.region && <Badge tone="slate" className="bg-white/85">{c.region}</Badge>}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {validated ? (
            <Badge tone="green"><CheckCircleIcon className="h-3.5 w-3.5" /> Publié</Badge>
          ) : (
            <Badge tone="amber"><EyeSlashIcon className="h-3.5 w-3.5" /> Brouillon — invisible sur le site</Badge>
          )}
          {isAiDraft(c) && <Badge tone="indigo"><SparklesIcon className="h-3.5 w-3.5" /> Généré par IA</Badge>}
          {c.studyAvailable === false && <Badge tone="rose">Études fermées</Badge>}
          <Badge tone={universities > 0 ? 'blue' : 'slate'}>
            <BuildingLibraryIcon className="h-3.5 w-3.5" />
            {universities} université{universities > 1 ? 's' : ''}
          </Badge>
          {c.scholarshipAvailable && (
            <Badge tone="gold"><TrophyIcon className="h-3.5 w-3.5" /> Bourses</Badge>
          )}
        </div>

        {c.description ? (
          <p className="mb-4 text-sm leading-relaxed text-stone-500 line-clamp-2">{c.description}</p>
        ) : (
          <p className="mb-4 text-sm italic text-stone-300">Aucune description — la page pays sera vide côté site.</p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4">
          <Fact icon={BanknotesIcon} label="Frais de scolarité" value={c.tuitionRange} />
          <Fact icon={HomeModernIcon} label="Coût de la vie" value={c.livingCost} />
          <Fact icon={IdentificationIcon} label="Difficulté visa" value={c.visaDifficulty} tone={visaTone(c.visaDifficulty)} />
          <Fact icon={ClockIcon} label="Délai visa" value={c.processingTimeVisa} />
        </div>

        {languages.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <LanguageIcon className="h-4 w-4 text-stone-300" />
            {languages.map(l => (
              <span key={l} className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">{l}</span>
            ))}
          </div>
        )}

        {/* Complétude : ce qu'il reste à renseigner avant publication. */}
        <div className="mt-4 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <span
                className={`block h-full rounded-full transition-all duration-500 ${
                  pct === 100 ? 'bg-primary' : pct >= 60 ? 'bg-gold-400' : 'bg-rose-300'
                }`}
                style={{ width: `${Math.max(pct, 3)}%` }}
              />
            </span>
            <span className="shrink-0 text-xs tabular-nums text-stone-500">{pct}% complet</span>
          </div>
          {missing.length > 0 && (
            <p className="mt-1.5 text-[11px] text-stone-400">
              Manque : <span className="text-gold-700">{missing.join(', ')}</span>
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-primary transition-colors duration-150 cursor-pointer"
          >
            <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            {open ? 'Masquer le détail' : 'Voir le détail de la fiche'}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleValidated}
              disabled={busy}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer disabled:opacity-40 ${
                validated
                  ? 'text-stone-500 hover:bg-stone-100'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {validated ? 'Dépublier' : 'Publier'}
            </button>
            <IconButton tone="blue" title="Modifier" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
            <IconButton tone="rose" title="Supprimer" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
          </div>
        </div>

        {open && (
          <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
            <Chips icon={AcademicCapIcon} label="Filières populaires" items={arr(c.popularPrograms)} />
            <Chips icon={ClipboardDocumentCheckIcon} label="Conditions d'admission" items={arr(c.admissionRequirements)} />
            <Chips icon={TrophyIcon} label="Bourses" items={arr(c.popularScholarships)} />
            <Chips icon={BuildingLibraryIcon} label="Top universités" items={arr(c.topUniversities)} />
            {c.updatedAt && (
              <p className="text-[11px] text-stone-300">
                Mise à jour le {new Date(c.updatedAt).toLocaleDateString('fr-FR')}
                {c.source ? ` · source ${c.source}` : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const AdminStudyCountries: React.FC = () => {
  const [items, setItems] = useState<StudyCountryRow[]>([]);
  const [uniByCountry, setUniByCountry] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  // Filtres
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  // Édition
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Génération IA
  const [aiOpen, setAiOpen] = useState(false);
  const [aiName, setAiName] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm(f => ({ ...f, [key]: value }));
  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetStudyCountries();
      const data = res.data ?? res.items ?? res.results ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? "Impossible de charger les pays d'étude.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Les universités portent leur pays en clair (colonne `country`, en anglais) :
   * on rapproche par nom pour savoir ce que chaque fiche pays couvre réellement.
   * Échec silencieux : le compteur n'est qu'un enrichissement de l'écran.
   */
  const loadUniversities = useCallback(async () => {
    try {
      const res = await apiService.adminGetUniversities(1, 500);
      const data = res.data ?? res.items ?? res.results ?? [];
      const map: Record<string, number> = {};
      for (const u of Array.isArray(data) ? data : []) {
        const key = str(u?.country).toLowerCase();
        if (key) map[key] = (map[key] ?? 0) + 1;
      }
      setUniByCountry(map);
    } catch {
      setUniByCountry({});
    }
  }, []);

  useEffect(() => { load(); loadUniversities(); }, [load, loadUniversities]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (editorOpen) setEditorOpen(false);
      else if (aiOpen) setAiOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen, aiOpen]);

  const uniCount = useCallback(
    (c: StudyCountryRow) => uniByCountry[str(c.name).toLowerCase()] ?? uniByCountry[str(c.nameFr).toLowerCase()] ?? 0,
    [uniByCountry],
  );

  /* ── Synthèse (sur le catalogue entier, pas sur le filtre) ── */
  const stats = useMemo(() => {
    const published = items.filter(c => c.isValidated).length;
    const drafts = items.length - published;
    const ai = items.filter(isAiDraft).length;
    const linked = items.reduce((n, c) => n + uniCount(c), 0);
    const avg = items.length
      ? Math.round(items.reduce((n, c) => n + completeness(c), 0) / items.length)
      : 0;
    const incomplete = items.filter(c => completeness(c) < 100).length;
    return { published, drafts, ai, linked, avg, incomplete };
  }, [items, uniCount]);

  const regions = useMemo(
    () => [...new Set(items.map(c => str(c.region)).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  /** Pays présents au catalogue universités mais sans fiche pays : trous à combler. */
  const orphanCountries = useMemo(() => {
    const known = new Set(items.flatMap(c => [str(c.name).toLowerCase(), str(c.nameFr).toLowerCase()]).filter(Boolean));
    return Object.entries(uniByCountry)
      .filter(([key]) => !known.has(key))
      .sort((a, b) => b[1] - a[1]);
  }, [items, uniByCountry]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(c => {
      if (region && str(c.region) !== region) return false;
      if (status === 'published' && !c.isValidated) return false;
      if (status === 'draft' && c.isValidated) return false;
      if (onlyIncomplete && completeness(c) === 100) return false;
      if (!q) return true;
      return (
        [c.name, c.nameFr, c.region, c.capital, c.description, c.tuitionRange].some(v =>
          str(v).toLowerCase().includes(q),
        ) ||
        [...arr(c.languageInstruction), ...arr(c.popularPrograms), ...arr(c.topUniversities)].some(v =>
          v.toLowerCase().includes(q),
        )
      );
    });
  }, [items, query, region, status, onlyIncomplete]);

  const activeFilters = [region, query.trim()].filter(Boolean).length + (status !== 'all' ? 1 : 0) + (onlyIncomplete ? 1 : 0);
  const resetFilters = () => { setQuery(''); setRegion(''); setStatus('all'); setOnlyIncomplete(false); };

  const openCreate = (name = '') => {
    setEditingId(null);
    setForm({ ...emptyForm, name });
    setEditorOpen(true);
  };
  const openEdit = (c: StudyCountryRow) => { setEditingId(c.id); setForm(toForm(c)); setEditorOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Le nom du pays est obligatoire.'); return; }
    setSaving(true); setError('');
    try {
      if (editingId !== null) await apiService.adminUpdateStudyCountry(editingId, form);
      else await apiService.adminCreateStudyCountry(form);
      setEditorOpen(false);
      flash(editingId !== null ? 'Fiche pays mise à jour.' : 'Fiche pays créée.');
      await load();
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      setError(/409|already exists/i.test(msg)
        ? `Une fiche « ${form.name} » existe déjà.`
        : msg || 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: StudyCountryRow) => {
    if (!confirm(`Supprimer la fiche « ${c.nameFr || c.name} » ?`)) return;
    try {
      await apiService.adminDeleteStudyCountry(c.id);
      flash('Fiche supprimée.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  // Le PUT ignore les champs absents : on n'envoie que l'état de publication.
  const toggleValidated = async (c: StudyCountryRow) => {
    setBusyId(c.id); setError('');
    try {
      await apiService.adminUpdateStudyCountry(c.id, { isValidated: !c.isValidated });
      setItems(list => list.map(x => (x.id === c.id ? { ...x, isValidated: !c.isValidated } : x)));
      flash(c.isValidated ? `« ${c.nameFr || c.name} » retirée du site.` : `« ${c.nameFr || c.name} » publiée.`);
    } catch (e: any) {
      setError(e?.message ?? 'Mise à jour impossible.');
    } finally { setBusyId(null); }
  };

  const handleEnrich = async () => {
    const name = aiName.trim();
    if (!name) return;
    setAiBusy(true); setError('');
    try {
      await apiService.adminEnrichStudyCountry(name);
      setAiOpen(false); setAiName('');
      flash(`Brouillon généré pour « ${name} » — à relire puis publier.`);
      await load();
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      setError(
        /503|not configured/i.test(msg)
          ? "La génération IA n'est pas configurée sur le serveur (ANTHROPIC_API_KEY manquante)."
          : /409|already exists/i.test(msg)
            ? `Une fiche « ${name} » existe déjà.`
            : msg || 'Génération impossible.',
      );
    } finally { setAiBusy(false); }
  };

  const selectCls = 'border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      <PageHeader
        title="Pays d'étude"
        subtitle={`${items.length} fiche${items.length > 1 ? 's' : ''} · ${stats.published} publiée${stats.published > 1 ? 's' : ''} · ${regions.length} région${regions.length > 1 ? 's' : ''}`}
        actions={
          <>
            <IconButton title="Rafraîchir" onClick={() => { load(); loadUniversities(); }} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </IconButton>
            <SecondaryButton onClick={() => setAiOpen(true)}>
              <span className="inline-flex items-center gap-2"><SparklesIcon className="h-4 w-4" /> Générer par IA</span>
            </SecondaryButton>
            <PrimaryButton onClick={() => openCreate()}><PlusIcon className="h-4 w-4" /> Ajouter</PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Masquer l’erreur" className="shrink-0 cursor-pointer">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      {notice && <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">{notice}</div>}

      {/* ── Synthèse ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Fiches pays" value={items.length} icon={GlobeEuropeAfricaIcon} tone="primary"
          hint={regions.length ? `${regions.length} régions couvertes` : undefined}
        />
        <StatCard
          label="Publiées sur le site" value={stats.published} icon={CheckCircleIcon}
          tone={stats.drafts === 0 ? 'teal' : 'gold'}
          hint={stats.drafts === 0 ? 'Aucun brouillon en attente' : `${stats.drafts} brouillon${stats.drafts > 1 ? 's' : ''} à relire${stats.ai ? ` · ${stats.ai} IA` : ''}`}
        />
        <StatCard
          label="Universités rattachées" value={stats.linked} icon={BuildingLibraryIcon} tone="indigo"
          hint={orphanCountries.length ? `${orphanCountries.length} pays sans fiche` : 'Catalogue entièrement couvert'}
        />
        <StatCard
          label="Complétude moyenne" value={`${stats.avg}%`} icon={ClipboardDocumentCheckIcon}
          tone={stats.incomplete === 0 ? 'teal' : 'rose'}
          hint={stats.incomplete === 0 ? 'Toutes les fiches sont complètes' : `${stats.incomplete} fiche${stats.incomplete > 1 ? 's' : ''} incomplète${stats.incomplete > 1 ? 's' : ''}`}
        />
      </div>

      {/* ── Trous du catalogue : des universités sans fiche pays ── */}
      {!loading && orphanCountries.length > 0 && (
        <Card className="mb-6 p-5">
          <div className="mb-3 flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-800">Pays sans fiche</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Ces pays ont des universités au catalogue mais aucune fiche pays — cliquez pour en générer une par IA.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {orphanCountries.map(([name, count]) => (
              <button
                key={name}
                type="button"
                onClick={() => { setAiName(name.replace(/\b\w/g, m => m.toUpperCase())); setAiOpen(true); }}
                title={`Générer la fiche de ${name}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold-300 bg-gold-100/60 px-3 py-1.5 text-sm text-gold-800 transition-colors duration-150 hover:bg-gold-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                <span className="capitalize">{name}</span>
                <span className="tabular-nums text-xs text-gold-600">· {count} univ.</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Filtres ── */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un pays, une capitale, une filière, une université…"
            aria-label="Rechercher un pays d'étude"
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={region} onChange={e => setRegion(e.target.value)} aria-label="Filtrer par région" className={selectCls}>
            <option value="">Toutes les régions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={status}
            onChange={e => setStatus(e.target.value as typeof status)}
            aria-label="Filtrer par statut de publication"
            className={selectCls}
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées ({stats.published})</option>
            <option value="draft">Brouillons ({stats.drafts})</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyIncomplete(v => !v)}
            aria-pressed={onlyIncomplete}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              onlyIncomplete ? 'border border-gold-300 bg-gold-100 text-gold-800' : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4" /> Fiches incomplètes
            {stats.incomplete > 0 && <span className="text-xs tabular-nums">({stats.incomplete})</span>}
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
        {filtered.length} fiche{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
        {filtered.length !== items.length && <span className="text-stone-400"> sur {items.length}</span>}
      </p>

      {/* ── Fiches ── */}
      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="h-24 animate-pulse bg-stone-100" />
              <div className="animate-pulse space-y-2 p-4">
                <div className="h-3 w-24 rounded bg-stone-100" />
                <div className="h-4 w-2/3 rounded bg-stone-100" />
                <div className="h-3 w-1/2 rounded bg-stone-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <GlobeAltIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? "Aucun pays d'étude" : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0
              ? 'Créez une fiche à la main, ou laissez l’IA en rédiger un brouillon.'
              : 'Essayez d’élargir vos filtres.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {activeFilters > 0
              ? <SecondaryButton onClick={resetFilters}>Réinitialiser les filtres</SecondaryButton>
              : <PrimaryButton onClick={() => openCreate()}><PlusIcon className="h-4 w-4" /> Ajouter un pays</PrimaryButton>}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map(c => (
            <CountryCard
              key={c.id}
              c={c}
              universities={uniCount(c)}
              busy={busyId === c.id}
              onEdit={() => openEdit(c)}
              onDelete={() => handleDelete(c)}
              onToggleValidated={() => toggleValidated(c)}
            />
          ))}
        </div>
      )}

      {/* ── Éditeur complet ── */}
      {editorOpen && (
        <Modal
          title={editingId !== null ? 'Modifier la fiche pays' : 'Ajouter un pays d’étude'}
          onClose={() => setEditorOpen(false)}
          maxWidth="max-w-3xl"
          footer={
            <>
              <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !form.name.trim()}>
                <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          {/* Identité */}
          <div className="grid gap-4 sm:grid-cols-[5rem_1fr_1fr]">
            <Field label="Drapeau">
              <TextInput value={form.flag} onChange={e => set('flag', e.target.value)} placeholder="🇫🇷" />
            </Field>
            <Field label="Nom (anglais)" required>
              <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Germany" />
            </Field>
            <Field label="Nom (français)">
              <TextInput value={form.nameFr} onChange={e => set('nameFr', e.target.value)} placeholder="Allemagne" />
            </Field>
          </div>
          <p className="-mt-2 text-xs text-stone-400">
            Le nom anglais sert de clé de rapprochement avec le catalogue des universités : gardez-le identique à celui des fiches universités.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Région">
              <TextInput value={form.region} onChange={e => set('region', e.target.value)} placeholder="Europe" list="admin-sc-regions" />
            </Field>
            <Field label="Capitale">
              <TextInput value={form.capital} onChange={e => set('capital', e.target.value)} placeholder="Berlin" />
            </Field>
          </div>
          <datalist id="admin-sc-regions">{regions.map(r => <option key={r} value={r} />)}</datalist>

          <Field label="Image de couverture (URL)">
            <TextInput value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://images.unsplash.com/…" />
          </Field>
          {form.image && (
            <img src={form.image} alt="" className="h-28 w-full rounded-lg border border-stone-200 object-cover" />
          )}

          <Field label="Description">
            <TextArea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="2-3 phrases sur les études dans ce pays, telles qu'elles apparaîtront sur le site."
            />
          </Field>

          {/* Coûts & visa */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Budget & visa</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Frais de scolarité">
                <TextInput value={form.tuitionRange} onChange={e => set('tuitionRange', e.target.value)} placeholder="835€ – 4 000€/an" />
              </Field>
              <Field label="Coût de la vie">
                <TextInput value={form.livingCost} onChange={e => set('livingCost', e.target.value)} placeholder="800€ – 1 200€/mois" />
              </Field>
              <Field label="Difficulté du visa">
                <TextInput value={form.visaDifficulty} onChange={e => set('visaDifficulty', e.target.value)} placeholder="Faible / Modéré / Difficile" list="admin-sc-visa" />
              </Field>
              <Field label="Délai de traitement du visa">
                <TextInput value={form.processingTimeVisa} onChange={e => set('processingTimeVisa', e.target.value)} placeholder="3-6 semaines" />
              </Field>
            </div>
            <datalist id="admin-sc-visa">
              <option value="Faible" /><option value="Modéré" /><option value="Difficile" />
            </datalist>
            <p className="mt-3 text-xs text-stone-400">
              Ces montants s'affichent tels quels : indiquez la devise et la période (an / mois).
            </p>
          </div>

          {/* Contenu académique */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Contenu de la fiche</p>
            <Field label="Langues d'enseignement">
              <TagInput value={form.languageInstruction} onChange={v => set('languageInstruction', v)} placeholder="Français, Anglais…" />
            </Field>
            <Field label="Filières populaires">
              <TagInput value={form.popularPrograms} onChange={v => set('popularPrograms', v)} placeholder="Ingénierie, Médecine…" />
            </Field>
            <Field label="Conditions d'admission">
              <TagInput value={form.admissionRequirements} onChange={v => set('admissionRequirements', v)} placeholder="Baccalauréat, IELTS…" />
            </Field>
            <Field label="Top universités">
              <TagInput value={form.topUniversities} onChange={v => set('topUniversities', v)} placeholder="KU Leuven, ULB…" />
            </Field>

            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.scholarshipAvailable}
                onChange={e => set('scholarshipAvailable', e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
              />
              <span className="text-sm text-stone-600">Des bourses existent pour ce pays</span>
            </label>
            {form.scholarshipAvailable && (
              <Field label="Bourses notables">
                <TagInput value={form.popularScholarships} onChange={v => set('popularScholarships', v)} placeholder="Erasmus+, DAAD…" />
              </Field>
            )}
            <p className="text-xs text-stone-400">
              Chaque valeur se valide avec Entrée ou une virgule ; Retour arrière retire la dernière.
            </p>
          </div>

          {/* Publication */}
          <div className="rounded-xl border border-stone-200 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Publication</p>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={form.isValidated}
                onChange={e => set('isValidated', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
              />
              <span className="text-sm text-stone-600">
                Fiche validée — <span className="text-stone-400">tant que la case est décochée, le pays reste invisible côté site.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={form.studyAvailable}
                onChange={e => set('studyAvailable', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
              />
              <span className="text-sm text-stone-600">
                Destination d'études ouverte <span className="text-stone-400">(décochez pour signaler une destination fermée).</span>
              </span>
            </label>
          </div>
        </Modal>
      )}

      {/* ── Génération IA ── */}
      {aiOpen && (
        <Modal
          title="Générer une fiche par IA"
          onClose={() => setAiOpen(false)}
          footer={
            <>
              <SecondaryButton onClick={() => setAiOpen(false)} disabled={aiBusy}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleEnrich} disabled={aiBusy || !aiName.trim()}>
                <SparklesIcon className="h-4 w-4" />{aiBusy ? 'Génération…' : 'Générer le brouillon'}
              </PrimaryButton>
            </>
          }
        >
          <Field label="Nom du pays" required>
            <TextInput
              value={aiName}
              onChange={e => setAiName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && aiName.trim() && !aiBusy) handleEnrich(); }}
              placeholder="Portugal"
              autoFocus
            />
          </Field>
          <p className="text-sm text-stone-500">
            L'IA rédige la fiche (région, capitale, frais, coût de la vie, visa, bourses, filières,
            top universités) et l'enregistre <strong>en brouillon</strong>. Rien n'apparaît sur le site
            avant votre relecture et publication.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default AdminStudyCountries;
