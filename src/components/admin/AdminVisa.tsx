import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon,
  CheckCircleIcon, EyeSlashIcon, ExclamationTriangleIcon, DocumentTextIcon,
  BuildingLibraryIcon, XMarkIcon, ChevronRightIcon, GlobeAltIcon, LinkIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select, Modal, TableShell, EmptyRow,
} from './ui';
import { AFRICAN_COUNTRIES, africanCountryLabel } from '../../data/africanCountries';

/**
 * Fiches visa — stories 4.7 et 4.9.
 *
 * Une fiche répond à « je pars de X (Afrique) pour Y (pays d'études), que dois-je
 * savoir et fournir pour obtenir le visa ? » : dossier obligatoire, conditions
 * personnelles à prouver, procédure de dépôt, motifs de refus.
 *
 * 4.9 — le catalogue compte ~280 fiches (14 destinations × 20 origines) dont le
 * contenu est piloté par la DESTINATION : une grille de cartes affichait 20 pavés
 * quasi identiques par pays et rendait la navigation impossible. L'écran est donc
 * organisé en deux temps : on choisit une destination à gauche, on lit ses origines
 * dans une table dense à droite. Les actions groupées existent parce que publier ou
 * corriger 20 fiches une par une n'est pas tenable.
 *
 * Une fiche non publiée reste invisible côté site (gate 9.2 / FR37).
 */

const VISA_TYPES = ['Étudiant', 'Tourisme', 'Travail', 'Transit', 'Long séjour'];
const ENTRIES_TYPES = ['Entrée simple', 'Entrées multiples', 'Double entrée'];
const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'CNY', 'SEK', 'MAD', 'XOF', 'XAF'];

/** Mission proposée en surcharge : on montre où elle se trouve, pas seulement son nom. */
interface EmbassyOption {
  id: number;
  name: string;
  country: string;
  hostCountry?: string | null;
  city?: string | null;
  coveredCountries?: string[] | null;
  isValidated?: boolean;
}

interface VisaRow {
  id: number;
  originCountry: string;
  destinationCountry: string;
  visaType: string;
  visaRequired: boolean;
  embassyId?: number | null;
  embassy?: { id: number; name: string; country: string; location?: string | null } | null;

  processingTime?: string | null;
  cost?: number | null;
  currency?: string | null;
  visaValidity?: string | null;
  entriesType?: string | null;
  maxStay?: string | null;

  documentsRequired?: string[] | null;
  passportValidity?: string | null;
  photoSpec?: string | null;
  applicationFormUrl?: string | null;

  fundsAmount?: string | null;
  proofOfFunds?: string | null;
  accommodationProof?: string | null;
  insuranceRequired?: boolean;
  insuranceMinCoverage?: string | null;
  languageRequirement?: string | null;
  admissionLetterRequired?: boolean;
  guarantorRequired?: boolean;
  criminalRecordRequired?: boolean;
  medicalExamRequired?: boolean;
  vaccinations?: string | null;
  returnTicketRequired?: boolean;

  whereToApply?: string | null;
  appointmentUrl?: string | null;
  biometricsRequired?: boolean;
  interviewRequired?: boolean;
  applicationSteps?: string[] | null;

  commonRefusalReasons?: string[] | null;
  notes?: string | null;
  officialSourceUrl?: string | null;
  lastVerifiedAt?: string | null;
  isValidated?: boolean;
  updatedAt?: string;
}

type Form = {
  origin_country: string; destination_country: string; visa_type: string;
  visa_required: boolean; embassy_id: string;
  processing_time: string; cost: string; currency: string; visa_validity: string;
  entries_type: string; max_stay: string;
  documents_required: string[]; passport_validity: string; photo_spec: string;
  application_form_url: string;
  funds_amount: string; proof_of_funds: string; accommodation_proof: string;
  insurance_required: boolean; insurance_min_coverage: string; language_requirement: string;
  admission_letter_required: boolean; guarantor_required: boolean;
  criminal_record_required: boolean; medical_exam_required: boolean; vaccinations: string;
  return_ticket_required: boolean;
  where_to_apply: string; appointment_url: string; biometrics_required: boolean;
  interview_required: boolean; application_steps: string[];
  common_refusal_reasons: string[]; notes: string; official_source_url: string;
  last_verified_at: string; is_validated: boolean;
};

const emptyForm: Form = {
  origin_country: '', destination_country: '', visa_type: 'Étudiant',
  visa_required: true, embassy_id: '',
  processing_time: '', cost: '', currency: 'EUR', visa_validity: '',
  entries_type: '', max_stay: '',
  documents_required: [], passport_validity: '', photo_spec: '', application_form_url: '',
  funds_amount: '', proof_of_funds: '', accommodation_proof: '',
  insurance_required: false, insurance_min_coverage: '', language_requirement: '',
  admission_letter_required: false, guarantor_required: false,
  criminal_record_required: false, medical_exam_required: false, vaccinations: '',
  return_ticket_required: false,
  where_to_apply: '', appointment_url: '', biometrics_required: false,
  interview_required: false, application_steps: [],
  common_refusal_reasons: [], notes: '', official_source_url: '',
  last_verified_at: '', is_validated: false,
};

const arr = (v?: string[] | null) => (Array.isArray(v) ? v.filter(Boolean) : []);
const str = (v?: string | number | null) => (v === null || v === undefined ? '' : String(v).trim());

const toForm = (v: VisaRow): Form => ({
  origin_country: str(v.originCountry), destination_country: str(v.destinationCountry),
  visa_type: str(v.visaType) || 'Étudiant', visa_required: v.visaRequired !== false,
  embassy_id: v.embassyId ? String(v.embassyId) : '',
  processing_time: str(v.processingTime), cost: str(v.cost), currency: str(v.currency) || 'EUR',
  visa_validity: str(v.visaValidity), entries_type: str(v.entriesType), max_stay: str(v.maxStay),
  documents_required: arr(v.documentsRequired), passport_validity: str(v.passportValidity),
  photo_spec: str(v.photoSpec), application_form_url: str(v.applicationFormUrl),
  funds_amount: str(v.fundsAmount), proof_of_funds: str(v.proofOfFunds),
  accommodation_proof: str(v.accommodationProof), insurance_required: !!v.insuranceRequired,
  insurance_min_coverage: str(v.insuranceMinCoverage), language_requirement: str(v.languageRequirement),
  admission_letter_required: !!v.admissionLetterRequired, guarantor_required: !!v.guarantorRequired,
  criminal_record_required: !!v.criminalRecordRequired, medical_exam_required: !!v.medicalExamRequired,
  vaccinations: str(v.vaccinations), return_ticket_required: !!v.returnTicketRequired,
  where_to_apply: str(v.whereToApply), appointment_url: str(v.appointmentUrl),
  biometrics_required: !!v.biometricsRequired, interview_required: !!v.interviewRequired,
  application_steps: arr(v.applicationSteps),
  common_refusal_reasons: arr(v.commonRefusalReasons), notes: str(v.notes),
  official_source_url: str(v.officialSourceUrl),
  last_verified_at: v.lastVerifiedAt ? v.lastVerifiedAt.slice(0, 10) : '',
  is_validated: !!v.isValidated,
});

/**
 * Complétude d'une fiche : les 12 informations sans lesquelles un demandeur reste
 * dans le flou. Une fiche « visa non requis » n'a pas de dossier à constituer.
 */
const CHECKLIST: { label: string; filled: (v: VisaRow) => boolean }[] = [
  { label: 'Délai de traitement', filled: v => !!str(v.processingTime) },
  { label: 'Frais', filled: v => v.cost !== null && v.cost !== undefined },
  { label: 'Validité du visa', filled: v => !!str(v.visaValidity) },
  { label: 'Durée de séjour', filled: v => !!str(v.maxStay) },
  { label: 'Documents requis', filled: v => arr(v.documentsRequired).length > 0 },
  { label: 'Validité du passeport', filled: v => !!str(v.passportValidity) },
  { label: 'Ressources à prouver', filled: v => !!str(v.fundsAmount) || !!str(v.proofOfFunds) },
  { label: 'Hébergement', filled: v => !!str(v.accommodationProof) },
  { label: 'Où déposer', filled: v => !!str(v.whereToApply) },
  { label: 'Étapes', filled: v => arr(v.applicationSteps).length > 0 },
  { label: 'Motifs de refus', filled: v => arr(v.commonRefusalReasons).length > 0 },
  { label: 'Source officielle', filled: v => !!str(v.officialSourceUrl) },
];

const checklistFor = (v: VisaRow) =>
  v.visaRequired === false
    ? CHECKLIST.filter(f => ['Durée de séjour', 'Validité du passeport', 'Source officielle'].includes(f.label))
    : CHECKLIST;

const missingFields = (v: VisaRow) => checklistFor(v).filter(f => !f.filled(v)).map(f => f.label);
const completeness = (v: VisaRow) => {
  const list = checklistFor(v);
  return Math.round((list.filter(f => f.filled(v)).length / list.length) * 100);
};

/* ── Saisie d'une liste (documents, étapes, motifs de refus) en étiquettes ──── */
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

/** Case à cocher « la personne doit fournir / passer par … ». */
const CheckRow: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, hint, checked, onChange }) => (
  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-stone-200 px-3 py-2.5 transition-colors duration-150 hover:bg-stone-50">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
    />
    <span className="min-w-0">
      <span className="block text-sm text-stone-700">{label}</span>
      {hint && <span className="block text-[11px] text-stone-400">{hint}</span>}
    </span>
  </label>
);

/** Section du formulaire, pour que 30 champs restent lisibles. */
const FormSection: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({
  title, hint, children,
}) => (
  <section className="rounded-xl border border-stone-200 p-4">
    <h3 className="font-display text-sm font-semibold text-stone-800">{title}</h3>
    {hint && <p className="mt-0.5 mb-3 text-[11px] text-stone-400">{hint}</p>}
    <div className={hint ? '' : 'mt-3'}>{children}</div>
  </section>
);

/** Barre de complétude compacte, lisible d'un coup d'œil dans une ligne de table. */
const CompletenessBar: React.FC<{ value: number; title?: string }> = ({ value, title }) => (
  <span className="flex items-center gap-2" title={title}>
    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100">
      <span
        className={`block h-full rounded-full transition-all duration-500 ${
          value === 100 ? 'bg-primary' : value >= 60 ? 'bg-gold-400' : 'bg-rose-300'
        }`}
        style={{ width: `${Math.max(value, 3)}%` }}
      />
    </span>
    <span className="text-xs tabular-nums text-stone-500">{value}%</span>
  </span>
);

/** Donnée clé, format compact — label au-dessus, valeur en dessous. */
const Fact: React.FC<{ label: string; value?: string | null; strong?: boolean }> = ({
  label, value, strong,
}) => (
  <div className="min-w-0">
    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-stone-400">{label}</p>
    {/* Deux lignes maximum : certaines valeurs sont des phrases entières et
        repoussaient la table sous la ligne de flottaison. Le texte complet
        reste accessible en infobulle.
        Style en ligne plutôt que `line-clamp-2` : l'utilitaire dépend d'un plugin
        Tailwind qui n'était pas servi par le serveur de développement. */}
    <p
      title={value ?? undefined}
      style={{
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
      }}
      className={`text-sm leading-snug ${
        value ? (strong ? 'font-medium text-stone-800' : 'text-stone-700') : 'text-stone-300'
      }`}
    >
      {value || 'Non renseigné'}
    </p>
  </div>
);

const Chips: React.FC<{ label: string; items: string[]; ordered?: boolean }> = ({
  label, items, ordered,
}) => {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-stone-400">
        {label} <span className="text-stone-300">({items.length})</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((v, i) => (
          <span key={`${v}-${i}`} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">
            {ordered ? `${i + 1}. ` : ''}{v}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Contenu commun à une destination, affiché UNE fois.
 *
 * Les 20 fiches d'un pays portent le même dossier, les mêmes ressources exigées,
 * les mêmes délais : les répéter dans 20 lignes de table masquait l'information
 * utile et débordait de l'écran. On les sort ici, en entier, et la table ne garde
 * que ce qui varie réellement d'un pays d'origine à l'autre.
 */
const DestinationSummary: React.FC<{
  label: string;
  rows: VisaRow[];
  onEditModel: () => void;
}> = ({ label, rows, onEditModel }) => {
  const [open, setOpen] = useState(false);
  const model = rows[0];
  if (!model) return null;

  // Les fiches d'une même destination sont censées être identiques ; si l'une a été
  // retouchée, mieux vaut le dire que de laisser croire que le résumé vaut pour toutes.
  const signature = (v: VisaRow) =>
    JSON.stringify([
      v.cost, v.currency, v.processingTime, v.visaValidity, v.maxStay,
      v.fundsAmount, v.languageRequirement, arr(v.documentsRequired), arr(v.applicationSteps),
    ]);
  const modelSignature = signature(model);
  const diverging = rows.filter(v => signature(v) !== modelSignature).length;

  const money = model.cost !== null && model.cost !== undefined
    ? `${model.cost} ${model.currency || 'EUR'}`
    : null;

  const obligations = [
    // La couverture d'assurance est une phrase entière : elle a sa place dans les
    // faits ci-dessus, pas dans une étiquette (« Assurance Assurance maladie… »).
    model.insuranceRequired && 'Assurance obligatoire',
    model.admissionLetterRequired && "Lettre d'admission",
    model.guarantorRequired && 'Garant',
    model.criminalRecordRequired && 'Casier judiciaire',
    model.medicalExamRequired && 'Visite médicale',
    model.returnTicketRequired && 'Billet retour',
    model.biometricsRequired && 'Biométrie',
    model.interviewRequired && 'Entretien',
  ].filter(Boolean) as string[];

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-stone-50/60 px-4 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
          Contenu commun aux {rows.length} fiches {label}
        </p>
        <div className="flex items-center gap-2">
          {diverging > 0 && (
            <Badge tone="amber">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" />
              {diverging} fiche(s) au contenu différent
            </Badge>
          )}
          <button
            type="button"
            onClick={onEditModel}
            className="rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
          >
            Ouvrir une fiche
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-4 sm:grid-cols-3 xl:grid-cols-6">
        <Fact label="Frais" value={money} strong />
        <Fact label="Délai" value={model.processingTime} />
        <Fact label="Validité" value={model.visaValidity} />
        <Fact label="Séjour autorisé" value={model.maxStay} />
        <Fact label="Entrées" value={model.entriesType} />
        <Fact label="Ressources à prouver" value={model.fundsAmount || model.proofOfFunds} strong />
        <Fact label="Niveau de langue" value={model.languageRequirement} />
        <Fact label="Hébergement" value={model.accommodationProof} />
        <Fact label="Passeport" value={model.passportValidity} />
        <Fact label="Couverture d'assurance" value={model.insuranceMinCoverage} />
        <Fact label="Vaccins" value={model.vaccinations} />
        {/* Identique pour toute la destination sauf exception (France / Campus France) :
            sa place est ici, pas répétée dans 20 lignes de table. */}
        <Fact label="Où déposer" value={model.whereToApply} />
      </div>

      {obligations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-stone-100 px-4 py-3">
          {obligations.map(o => (
            <span key={o} className="rounded-md bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800">
              {o}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-stone-100 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-xs text-stone-500 transition-colors duration-150 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
        >
          <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
          {open ? 'Masquer le dossier et la procédure' : 'Voir le dossier, les étapes et les motifs de refus'}
        </button>

        {open && (
          <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
            <Chips label="Documents à fournir" items={arr(model.documentsRequired)} />
            <Chips label="Étapes de la demande" items={arr(model.applicationSteps)} ordered />
            <Chips label="Motifs de refus fréquents" items={arr(model.commonRefusalReasons)} />
            {model.notes && <p className="text-xs leading-relaxed text-stone-500">{model.notes}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 bg-stone-50/60 px-4 py-2.5 text-[11px]">
        {model.officialSourceUrl ? (
          <a
            href={model.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <LinkIcon className="h-3.5 w-3.5" /> Source officielle
          </a>
        ) : (
          <span className="text-stone-300">Aucune source officielle</span>
        )}
        <span className={model.lastVerifiedAt ? 'text-stone-500' : 'text-gold-700'}>
          {model.lastVerifiedAt
            ? `Vérifiée le ${new Date(model.lastVerifiedAt).toLocaleDateString('fr-FR')}`
            : 'Jamais vérifiée — confirmez les montants avant publication'}
        </span>
      </div>
    </Card>
  );
};

/* ── Écran ─────────────────────────────────────────────────────────────────── */
const AdminVisa: React.FC = () => {
  const [items, setItems] = useState<VisaRow[]>([]);
  const [destinations, setDestinations] = useState<{ value: string; label: string }[]>([]);
  const [embassies, setEmbassies] = useState<EmbassyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Navigation : une destination à la fois — c'est elle qui porte le contenu.
  const [activeDest, setActiveDest] = useState<string>('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [visas, study, emb] = await Promise.all([
        apiService.adminGetVisaRules(),
        apiService.adminGetStudyCountries(),
        // Route admin : la route publique ne renvoie que les missions vérifiées.
        apiService.adminGetEmbassies(1, 500),
      ]);
      setItems((visas?.data ?? []) as VisaRow[]);
      const countries = (study?.data ?? []) as { name: string; nameFr?: string | null }[];
      setDestinations(
        countries
          .map(c => ({ value: c.name, label: c.nameFr || c.name }))
          .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
      );
      setEmbassies((emb?.data ?? []) as EmbassyOption[]);
    } catch {
      setError("Chargement impossible. Vérifiez que l'API répond.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const destinationLabel = useCallback(
    (name: string) => destinations.find(d => d.value === name)?.label ?? name,
    [destinations],
  );

  /** Une destination = un groupe de fiches. Sert au rail de gauche et à ses compteurs. */
  const groups = useMemo(() => {
    const byDest = new Map<string, VisaRow[]>();
    items.forEach(v => {
      const list = byDest.get(v.destinationCountry) ?? [];
      list.push(v);
      byDest.set(v.destinationCountry, list);
    });
    return [...byDest.entries()]
      .map(([value, rows]) => ({
        value,
        label: destinationLabel(value),
        total: rows.length,
        published: rows.filter(r => r.isValidated).length,
        completeness: Math.round(rows.reduce((s, r) => s + completeness(r), 0) / rows.length),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }, [items, destinationLabel]);

  // À l'arrivée, on ouvre la première destination : un écran vide n'aide personne.
  useEffect(() => {
    if (!activeDest && groups.length > 0) setActiveDest(groups[0].value);
  }, [groups, activeDest]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter(v => {
        if (activeDest && v.destinationCountry !== activeDest) return false;
        if (typeFilter && v.visaType !== typeFilter) return false;
        if (statusFilter === 'published' && !v.isValidated) return false;
        if (statusFilter === 'draft' && v.isValidated) return false;
        if (!q) return true;
        return [africanCountryLabel(v.originCountry), v.originCountry, v.visaType]
          .some(s => s.toLowerCase().includes(q));
      })
      .sort((a, b) =>
        africanCountryLabel(a.originCountry).localeCompare(africanCountryLabel(b.originCountry), 'fr'),
      );
  }, [items, activeDest, typeFilter, statusFilter, search]);

  // Changer de destination ou de filtre invalide la sélection : on ne veut pas
  // agir sur des lignes qui ne sont plus à l'écran.
  useEffect(() => { setSelected(new Set()); }, [activeDest, typeFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter(v => v.isValidated).length,
    destinations: new Set(items.map(v => v.destinationCountry)).size,
    incomplete: items.filter(v => completeness(v) < 100).length,
  }), [items]);

  const activeGroup = groups.find(g => g.value === activeDest);

  /** État des missions de la destination affichée : combien sont vérifiées. */
  const missionsStatus = useMemo(() => {
    const pool = embassies.filter(e => e.country === activeDest);
    return { total: pool.length, verified: pool.filter(e => e.isValidated).length };
  }, [embassies, activeDest]);
  const allShownSelected = rows.length > 0 && rows.every(r => selected.has(r.id));

  const toggleAll = () =>
    setSelected(allShownSelected ? new Set() : new Set(rows.map(r => r.id)));

  const toggleOne = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, destination_country: activeDest });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (v: VisaRow) => {
    setEditingId(v.id);
    setForm(toForm(v));
    setFormError('');
    setShowForm(true);
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.origin_country || !form.destination_country) {
      setFormError("Le pays d'origine et le pays de destination sont obligatoires.");
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) await apiService.adminUpdateVisaRule(editingId, form);
      else await apiService.adminCreateVisaRule(form);
      setShowForm(false);
      await load();
    } catch (e: any) {
      setFormError(e?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  /** Publier / dépublier une sélection : 20 fiches par destination, une par une n'est pas tenable. */
  const bulkPublish = async (value: boolean) => {
    const targets = rows.filter(r => selected.has(r.id) && !!r.isValidated !== value);
    if (targets.length === 0) return;
    const verb = value ? 'Publier' : 'Dépublier';
    if (!window.confirm(`${verb} ${targets.length} fiche(s) ?`)) return;
    setBusy(true);
    try {
      for (const t of targets) {
        await apiService.adminUpdateVisaRule(t.id, { is_validated: value });
      }
      setSelected(new Set());
      await load();
    } catch {
      setError('Action groupée interrompue — relancez.');
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = async () => {
    const targets = rows.filter(r => selected.has(r.id));
    if (targets.length === 0) return;
    if (!window.confirm(`Supprimer définitivement ${targets.length} fiche(s) ? Cette action est irréversible.`)) return;
    setBusy(true);
    try {
      for (const t of targets) await apiService.adminDeleteVisaRule(t.id);
      setSelected(new Set());
      await load();
    } catch {
      setError('Suppression groupée interrompue — relancez.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (v: VisaRow) => {
    const label = `${africanCountryLabel(v.originCountry)} → ${destinationLabel(v.destinationCountry)}`;
    if (!window.confirm(`Supprimer la fiche ${label} (${v.visaType}) ?`)) return;
    setBusy(true);
    try {
      await apiService.adminDeleteVisaRule(v.id);
      await load();
    } catch {
      setError('Suppression impossible.');
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (v: VisaRow) => {
    setBusy(true);
    try {
      await apiService.adminUpdateVisaRule(v.id, { is_validated: !v.isValidated });
      await load();
    } catch {
      setError('Publication impossible.');
    } finally {
      setBusy(false);
    }
  };

  /**
   * Mission compétente pour un couple, même règle que `EmbassyModel.findCompetent`
   * côté API : celle installée dans le pays d'origine d'abord, sinon celle qui
   * déclare le desservir. C'est la seule donnée réellement propre à chaque ligne.
   */
  const competentFor = useCallback((v: VisaRow) => {
    const pool = embassies.filter(e => e.country === v.destinationCountry);
    return (
      pool.find(e => e.hostCountry === v.originCountry) ??
      pool.find(e => (e.coveredCountries ?? []).includes(v.originCountry)) ??
      null
    );
  }, [embassies]);

  // Une mission ne représente que son propre pays (contrôlé côté API). On propose en
  // priorité celle installée dans le pays d'origine choisi : c'est celle qui sera
  // résolue automatiquement, la surcharge ne sert qu'aux cas particuliers.
  const embassyOptions = useMemo(() => {
    const sameCountry = embassies.filter(
      e => !form.destination_country || e.country === form.destination_country,
    );
    return [...sameCountry].sort((a, b) => {
      const aHere = a.hostCountry === form.origin_country ? 0 : 1;
      const bHere = b.hostCountry === form.origin_country ? 0 : 1;
      return aHere - bHere || (a.city ?? '').localeCompare(b.city ?? '', 'fr');
    });
  }, [embassies, form.destination_country, form.origin_country]);

  return (
    <div>
      <PageHeader
        title="Fiches Visa"
        subtitle="Ce qu'une personne partant d'Afrique doit savoir et fournir pour obtenir son visa. Le contenu dépend du pays de destination : choisissez-le à gauche, puis relisez ses pays d'origine."
        actions={
          <>
            <SecondaryButton onClick={load}>
              <ArrowPathIcon className="h-4 w-4" /> Actualiser
            </SecondaryButton>
            <PrimaryButton onClick={openCreate}>
              <PlusIcon className="h-4 w-4" /> Nouvelle fiche
            </PrimaryButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Fiches" value={stats.total} icon={DocumentTextIcon} />
        <StatCard label="Publiées" value={stats.published} icon={CheckCircleIcon} tone="primary" hint={`${stats.total - stats.published} brouillon(s)`} />
        <StatCard label="Destinations couvertes" value={`${stats.destinations}/${destinations.length}`} icon={BuildingLibraryIcon} tone="indigo" />
        <StatCard label="À compléter" value={stats.incomplete} icon={ExclamationTriangleIcon} tone="gold" />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[13.5rem_1fr]">
        {/* Rail des destinations : où l'on est, et ce qu'il reste à faire ailleurs. */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
            Destinations
          </p>

          {/* Sur mobile, le rail n'a pas la place : un select fait le même travail. */}
          <div className="lg:hidden">
            <Select value={activeDest} onChange={e => setActiveDest(e.target.value)}>
              {groups.map(g => (
                <option key={g.value} value={g.value}>
                  {g.label} — {g.published}/{g.total} publiées
                </option>
              ))}
            </Select>
          </div>

          <Card className="hidden overflow-hidden lg:block">
            <ul className="max-h-[32rem] divide-y divide-stone-100 overflow-y-auto">
              {loading && groups.length === 0 && (
                <li className="px-3 py-8 text-center text-xs text-stone-400">Chargement…</li>
              )}
              {groups.map(g => {
                const active = g.value === activeDest;
                return (
                  <li key={g.value}>
                    <button
                      type="button"
                      onClick={() => setActiveDest(g.value)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                        active ? 'bg-primary/10' : 'hover:bg-stone-50'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-8 w-0.5 shrink-0 rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${active ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
                          {g.label}
                        </span>
                        <span className="mt-1 flex items-center gap-2">
                          <CompletenessBar value={g.completeness} />
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={`block text-xs tabular-nums ${g.published === g.total ? 'text-primary' : 'text-stone-400'}`}>
                          {g.published}/{g.total}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>

        {/* Panneau : les origines de la destination choisie. */}
        <section className="min-w-0">
          <Card className="mb-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* `min-w-0` : sans lui, la largeur intrinsèque des listes déroulantes
                  écrase le champ de recherche jusqu'à le rendre inutilisable. */}
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrer par pays d'origine…"
                  className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="shrink-0 sm:w-44">
                <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">Tous les types</option>
                  {VISA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="shrink-0 sm:w-52">
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
                  <option value="all">Publiées et brouillons</option>
                  <option value="published">Publiées</option>
                  <option value="draft">Brouillons</option>
                </Select>
              </div>
            </div>
          </Card>

          {activeGroup && (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-stone-800">
                    <GlobeAltIcon className="h-5 w-5 text-gold-500" />
                    {activeGroup.label}
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    {activeGroup.total} pays d'origine · {activeGroup.published} publiée(s) ·
                    complétude moyenne {activeGroup.completeness}%
                  </p>
                </div>
                <SecondaryButton
                  onClick={() => { setSelected(new Set(rows.map(r => r.id))); }}
                  disabled={rows.length === 0}
                >
                  Sélectionner les {rows.length} fiches
                </SecondaryButton>
              </div>

              {/* Le contenu commun est montré ici, en entier, plutôt que répété
                  dans 20 lignes de table où il débordait de l'écran. */}
              <DestinationSummary
                label={activeGroup.label}
                rows={rows}
                onEditModel={() => rows[0] && openEdit(rows[0])}
              />

              {/* L'état des missions se dit une fois, pas sur chaque ligne. */}
              {missionsStatus.total > 0 && missionsStatus.verified < missionsStatus.total && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gold-300/70 bg-gold-50/60 px-4 py-2.5 text-xs text-gold-900">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                  {missionsStatus.verified === 0
                    ? `Aucune des ${missionsStatus.total} ambassades de cette destination n'est vérifiée : même publiée, une fiche n'affichera aucune adresse.`
                    : `${missionsStatus.total - missionsStatus.verified} ambassade(s) sur ${missionsStatus.total} restent à vérifier.`}
                  <a
                    href="/admin/embassies"
                    className="ml-auto font-medium underline underline-offset-2 hover:no-underline"
                  >
                    Ouvrir les ambassades
                  </a>
                </div>
              )}
            </>
          )}

          {/* Barre d'actions groupées : n'apparaît qu'avec une sélection. */}
          {selected.size > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
              <span className="text-sm font-medium text-stone-700">
                {selected.size} fiche(s) sélectionnée(s)
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => bulkPublish(true)}
                disabled={busy}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 cursor-pointer"
              >
                {busy ? 'En cours…' : 'Publier'}
              </button>
              <button
                type="button"
                onClick={() => bulkPublish(false)}
                disabled={busy}
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 transition-colors duration-150 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 cursor-pointer"
              >
                Dépublier
              </button>
              <button
                type="button"
                onClick={bulkDelete}
                disabled={busy}
                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 cursor-pointer"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-lg px-2 py-2 text-xs text-stone-500 hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}

          <TableShell
            head={
              <>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allShownSelected}
                    onChange={toggleAll}
                    aria-label="Tout sélectionner"
                    className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
                  />
                </th>
                <th>Pays d'origine</th>
                {/* Seule donnée réellement propre à la ligne : le reste est commun
                    à la destination et se lit dans le résumé au-dessus. */}
                <th className="hidden md:table-cell">Ambassade compétente</th>
                <th className="hidden sm:table-cell">Complétude</th>
                <th>Statut</th>
                <th className="w-32 text-right">Actions</th>
              </>
            }
          >
            {loading ? (
              <EmptyRow colSpan={6}>Chargement…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6}>
                {items.length === 0
                  ? "Aucune fiche visa. Créez la première route — par exemple Togo → France, visa étudiant."
                  : 'Aucune fiche ne correspond à ces filtres.'}
              </EmptyRow>
            ) : (
              rows.map(v => {
                const pct = completeness(v);
                const missing = missingFields(v);
                return (
                  <tr
                    key={v.id}
                    onClick={() => openEdit(v)}
                    className={`cursor-pointer transition-colors duration-150 [&>td]:px-4 [&>td]:py-2.5 ${
                      selected.has(v.id) ? 'bg-primary/5' : 'hover:bg-stone-50'
                    }`}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(v.id)}
                        onChange={() => toggleOne(v.id)}
                        aria-label={`Sélectionner ${africanCountryLabel(v.originCountry)}`}
                        className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
                      />
                    </td>
                    <td>
                      {/* Bouton réel : la ligne entière est cliquable à la souris, mais
                          l'ouverture doit aussi être atteignable au clavier. */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openEdit(v); }}
                        className="flex items-center gap-1.5 whitespace-nowrap rounded font-medium text-stone-800 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                      >
                        {africanCountryLabel(v.originCountry)}
                        <ChevronRightIcon className="h-3.5 w-3.5 text-stone-300" />
                      </button>
                      {!v.visaRequired && (
                        <span className="block text-[11px] text-primary">sans visa</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell max-w-[18rem]">
                      {(() => {
                        const mission = competentFor(v);
                        if (mission) {
                          const abroad = mission.hostCountry && mission.hostCountry !== v.originCountry;
                          return (
                            <span className="block truncate" title={mission.name}>
                              <span className="text-stone-700">{mission.city || mission.name}</span>
                              {abroad && (
                                <span className="ml-1.5 rounded bg-gold-100 px-1.5 py-0.5 text-[10px] font-medium text-gold-800">
                                  à l'étranger
                                </span>
                              )}
                              {/* Pastille plutôt que le mot répété sur 20 lignes ;
                                  l'alerte globale est portée par le bandeau au-dessus. */}
                              {!mission.isValidated && (
                                <span
                                  aria-label="Mission non vérifiée"
                                  title="Mission non vérifiée — invisible sur le site"
                                  className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold-400 align-middle"
                                />
                              )}
                            </span>
                          );
                        }
                        // Catalogue des missions incomplet : on retombe sur l'indication
                        // générique de la fiche plutôt que d'afficher un tiret muet.
                        return (
                          <span className="block truncate text-stone-400" title={v.whereToApply ?? undefined}>
                            {v.whereToApply || 'À renseigner'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="hidden sm:table-cell">
                      <CompletenessBar
                        value={pct}
                        title={missing.length ? `Manque : ${missing.join(', ')}` : 'Fiche complète'}
                      />
                    </td>
                    <td>
                      {v.isValidated ? (
                        <Badge tone="green"><CheckCircleIcon className="h-3.5 w-3.5" /> Publiée</Badge>
                      ) : (
                        <Badge tone="amber"><EyeSlashIcon className="h-3.5 w-3.5" /> Brouillon</Badge>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => togglePublished(v)}
                          disabled={busy}
                          title={v.isValidated ? 'Dépublier' : 'Publier'}
                          className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40 ${
                            v.isValidated ? 'text-stone-500 hover:bg-stone-100' : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {v.isValidated ? 'Retirer' : 'Publier'}
                        </button>
                        <IconButton tone="blue" title="Modifier" onClick={() => openEdit(v)}>
                          <PencilSquareIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(v)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </TableShell>
        </section>
      </div>

      {showForm && (
        <Modal
          title={
            editingId
              ? `${africanCountryLabel(form.origin_country)} → ${destinationLabel(form.destination_country)}`
              : 'Nouvelle fiche visa'
          }
          onClose={() => setShowForm(false)}
          maxWidth="max-w-3xl"
          footer={
            <>
              <SecondaryButton onClick={() => setShowForm(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {formError}
            </div>
          )}

          <FormSection title="La route" hint="Origine parmi les 54 pays d'Afrique, destination parmi les pays de la partie « études ». Une même route peut porter une fiche par type de visa.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pays d'origine" required>
                <Select value={form.origin_country} onChange={e => set('origin_country', e.target.value)}>
                  <option value="">— Choisir —</option>
                  {AFRICAN_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Pays de destination" required>
                <Select
                  value={form.destination_country}
                  onChange={e => { set('destination_country', e.target.value); set('embassy_id', ''); }}
                >
                  <option value="">— Choisir —</option>
                  {destinations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </Select>
              </Field>
              <Field label="Type de visa" required>
                <Select value={form.visa_type} onChange={e => set('visa_type', e.target.value)}>
                  {VISA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Ambassade (surcharge facultative)">
                <Select value={form.embassy_id} onChange={e => set('embassy_id', e.target.value)}>
                  <option value="">— Résolution automatique —</option>
                  {embassyOptions.map(e => (
                    <option key={e.id} value={String(e.id)}>
                      {e.city ? `${e.city} — ${e.name}` : e.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-3">
              <CheckRow
                label="Un visa est requis pour cette route"
                hint="Décochez si le passeport du pays d'origine permet l'entrée sans visa."
                checked={form.visa_required}
                onChange={v => set('visa_required', v)}
              />
            </div>
          </FormSection>

          <FormSection title="Coûts & délais" hint="Ce que la demande coûte et combien de temps elle prend.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Frais de dossier">
                <div className="flex gap-2">
                  <TextInput
                    type="number" min="0" step="1"
                    value={form.cost}
                    onChange={e => set('cost', e.target.value)}
                    placeholder="80"
                  />
                  <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
              </Field>
              <Field label="Délai de traitement">
                <TextInput value={form.processing_time} onChange={e => set('processing_time', e.target.value)} placeholder="4 à 8 semaines" />
              </Field>
              <Field label="Validité du visa">
                <TextInput value={form.visa_validity} onChange={e => set('visa_validity', e.target.value)} placeholder="1 an renouvelable" />
              </Field>
              <Field label="Durée de séjour autorisée">
                <TextInput value={form.max_stay} onChange={e => set('max_stay', e.target.value)} placeholder="90 jours par semestre" />
              </Field>
              <Field label="Nombre d'entrées">
                <Select value={form.entries_type} onChange={e => set('entries_type', e.target.value)}>
                  <option value="">— Non précisé —</option>
                  {ENTRIES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Dossier obligatoire" hint="Les pièces sans lesquelles la demande n'est pas recevable.">
            <Field label="Documents à fournir">
              <TagInput
                value={form.documents_required}
                onChange={v => set('documents_required', v)}
                placeholder="Passeport, photos, formulaire… (Entrée pour valider)"
              />
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Validité exigée du passeport">
                <TextInput value={form.passport_validity} onChange={e => set('passport_validity', e.target.value)} placeholder="Valide 3 mois après le retour, 2 pages vierges" />
              </Field>
              <Field label="Format des photos">
                <TextInput value={form.photo_spec} onChange={e => set('photo_spec', e.target.value)} placeholder="35 × 45 mm, fond blanc, moins de 6 mois" />
              </Field>
              <Field label="Formulaire de demande (lien)">
                <TextInput type="url" value={form.application_form_url} onChange={e => set('application_form_url', e.target.value)} placeholder="https://…" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Conditions personnelles à prouver" hint="Ce que la personne doit démontrer sur sa propre situation : ressources, logement, santé, langue.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ressources exigées (montant)">
                <TextInput value={form.funds_amount} onChange={e => set('funds_amount', e.target.value)} placeholder="11 904 € sur compte bloqué" />
              </Field>
              <Field label="Forme du justificatif de ressources">
                <TextInput value={form.proof_of_funds} onChange={e => set('proof_of_funds', e.target.value)} placeholder="Relevés bancaires des 3 derniers mois" />
              </Field>
              <Field label="Justificatif d'hébergement">
                <TextInput value={form.accommodation_proof} onChange={e => set('accommodation_proof', e.target.value)} placeholder="Attestation de logement ou réservation" />
              </Field>
              <Field label="Niveau de langue exigé">
                <TextInput value={form.language_requirement} onChange={e => set('language_requirement', e.target.value)} placeholder="B2 (DELF, TCF) ou IELTS 6.0" />
              </Field>
              <Field label="Couverture d'assurance minimale">
                <TextInput value={form.insurance_min_coverage} onChange={e => set('insurance_min_coverage', e.target.value)} placeholder="30 000 €" />
              </Field>
              <Field label="Vaccins exigés">
                <TextInput value={form.vaccinations} onChange={e => set('vaccinations', e.target.value)} placeholder="Fièvre jaune" />
              </Field>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <CheckRow label="Assurance maladie obligatoire" checked={form.insurance_required} onChange={v => set('insurance_required', v)} />
              <CheckRow label="Lettre d'admission exigée" checked={form.admission_letter_required} onChange={v => set('admission_letter_required', v)} />
              <CheckRow label="Garant / prise en charge exigé" checked={form.guarantor_required} onChange={v => set('guarantor_required', v)} />
              <CheckRow label="Extrait de casier judiciaire" checked={form.criminal_record_required} onChange={v => set('criminal_record_required', v)} />
              <CheckRow label="Visite médicale" checked={form.medical_exam_required} onChange={v => set('medical_exam_required', v)} />
              <CheckRow label="Billet de retour exigé" checked={form.return_ticket_required} onChange={v => set('return_ticket_required', v)} />
            </div>
          </FormSection>

          <FormSection title="Procédure de dépôt" hint="Où et comment déposer le dossier.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Où déposer la demande">
                <TextInput value={form.where_to_apply} onChange={e => set('where_to_apply', e.target.value)} placeholder="VFS Global Lomé / TLScontact / ambassade" />
              </Field>
              <Field label="Prise de rendez-vous (lien)">
                <TextInput type="url" value={form.appointment_url} onChange={e => set('appointment_url', e.target.value)} placeholder="https://…" />
              </Field>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <CheckRow label="Biométrie (empreintes) à fournir" checked={form.biometrics_required} onChange={v => set('biometrics_required', v)} />
              <CheckRow label="Entretien obligatoire" checked={form.interview_required} onChange={v => set('interview_required', v)} />
            </div>
            <div className="mt-4">
              <Field label="Étapes de la demande, dans l'ordre">
                <TagInput
                  value={form.application_steps}
                  onChange={v => set('application_steps', v)}
                  placeholder="Créer le compte, payer les frais, prendre rendez-vous…"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="À savoir" hint="Ce qui fait la différence entre un dossier accepté et un dossier refusé.">
            <Field label="Motifs de refus fréquents">
              <TagInput
                value={form.common_refusal_reasons}
                onChange={v => set('common_refusal_reasons', v)}
                placeholder="Ressources insuffisantes, projet d'études incohérent…"
              />
            </Field>
            <div className="mt-4">
              <Field label="Notes complémentaires">
                <TextArea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Particularités locales, pièges à éviter…" />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Source officielle (lien)">
                <TextInput type="url" value={form.official_source_url} onChange={e => set('official_source_url', e.target.value)} placeholder="https://france-visas.gouv.fr" />
              </Field>
              <Field label="Dernière vérification">
                <TextInput type="date" value={form.last_verified_at} onChange={e => set('last_verified_at', e.target.value)} />
              </Field>
            </div>
            <div className="mt-4">
              <CheckRow
                label="Publier la fiche sur le site"
                hint="Tant que la case est décochée, la fiche reste invisible pour les visiteurs."
                checked={form.is_validated}
                onChange={v => set('is_validated', v)}
              />
            </div>
          </FormSection>
        </Modal>
      )}
    </div>
  );
};

export default AdminVisa;
