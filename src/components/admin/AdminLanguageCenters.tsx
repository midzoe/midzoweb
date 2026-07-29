import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowPathIcon,
  MagnifyingGlassIcon, LanguageIcon, GlobeAltIcon, SparklesIcon,
  ArrowTopRightOnSquareIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, AcademicCapIcon,
  HomeModernIcon, IdentificationIcon, ExclamationTriangleIcon, Squares2X2Icon,
  TableCellsIcon, BanknotesIcon, ClockIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select,
} from './ui';

/**
 * Story 5.4 → 5.14 : gestion des centres de langue.
 *
 * Le `country` d'un centre reprend le vocabulaire du **catalogue universités**
 * (« Germany », « France »…) : c'est ce qui permet à un étudiant recalé sur l'exigence
 * de langue d'une université d'atterrir sur les centres du bon pays (5.3 → 5.8). Le
 * sélecteur de pays et les suggestions de villes sont donc alimentés par les
 * universités en base, et l'écran signale les pays d'études encore sans centre.
 */

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const COURSE_TYPES = [
  'Intensif', 'Semi-intensif', 'Standard', 'Cours du soir', 'Week-end',
  'En ligne', 'Cours particuliers', 'Préparation examen', 'Langue de spécialité', 'Année préparatoire',
];
const EXAMS = [
  'TestDaF', 'DSH', 'telc', 'Goethe-Zertifikat', 'ÖSD',
  'IELTS', 'TOEFL', 'Cambridge', 'Duolingo English Test',
  'DELF', 'DALF', 'TCF', 'TEF',
  'DELE', 'SIELE', 'CILS', 'CELI',
  'CNaVT', 'NT2', 'CAPLE', 'CELPE-Bras', 'HSK', 'TISUS', 'Swedex',
];
const LANGUAGES = [
  'Allemand', 'Anglais', 'Français', 'Espagnol', 'Italien',
  'Néerlandais', 'Portugais', 'Suédois', 'Chinois', 'Arabe',
];
const PRICE_UNITS = ['semaine', 'mois', 'cours', 'heure', 'session'];
const CURRENCIES = ['EUR', 'CHF', 'GBP', 'USD', 'CAD', 'SEK', 'CNY', 'MAD', 'XOF'];

/** Chaque langue porte sa teinte : on repère un bloc linguistique d'un coup d'œil. */
const LANG_ACCENT: Record<string, { rail: string; chip: string; dot: string }> = {
  Allemand:    { rail: 'bg-gold-400',    chip: 'bg-gold-100 text-gold-800',       dot: 'bg-gold-500' },
  Anglais:     { rail: 'bg-indigo-400',  chip: 'bg-indigo-50 text-indigo-700',    dot: 'bg-indigo-500' },
  Français:    { rail: 'bg-blue-400',    chip: 'bg-blue-50 text-blue-700',        dot: 'bg-blue-500' },
  Espagnol:    { rail: 'bg-rose-400',    chip: 'bg-rose-50 text-rose-700',        dot: 'bg-rose-500' },
  Italien:     { rail: 'bg-teal-400',    chip: 'bg-teal-50 text-teal-700',        dot: 'bg-teal-500' },
  Néerlandais: { rail: 'bg-orange-400',  chip: 'bg-orange-50 text-orange-700',    dot: 'bg-orange-500' },
  Portugais:   { rail: 'bg-emerald-400', chip: 'bg-emerald-50 text-emerald-700',  dot: 'bg-emerald-500' },
  Suédois:     { rail: 'bg-sky-400',     chip: 'bg-sky-50 text-sky-700',          dot: 'bg-sky-500' },
  Chinois:     { rail: 'bg-red-400',     chip: 'bg-red-50 text-red-700',          dot: 'bg-red-500' },
};
const accentOf = (language: string) =>
  LANG_ACCENT[language] ?? { rail: 'bg-stone-300', chip: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' };

/** Pays en français pour l'affichage ; la valeur stockée reste l'anglais du catalogue. */
const COUNTRY_FR: Record<string, string> = {
  Germany: 'Allemagne', France: 'France', 'United Kingdom': 'Royaume-Uni',
  'United States': 'États-Unis', Canada: 'Canada', Netherlands: 'Pays-Bas',
  Spain: 'Espagne', Italy: 'Italie', Switzerland: 'Suisse', Sweden: 'Suède',
  Portugal: 'Portugal', China: 'Chine', Belgium: 'Belgique', Luxembourg: 'Luxembourg',
  Morocco: 'Maroc', Senegal: 'Sénégal', Austria: 'Autriche', Ireland: 'Irlande',
};
const countryLabel = (c: string) => COUNTRY_FR[c] ?? c;

interface CenterRow {
  id: number;
  name: string;
  country: string;
  city?: string | null;
  language: string;
  levels?: string | null;
  link?: string | null;
  description?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  registrationUrl?: string | null;
  image?: string | null;
  levelsOffered?: string[] | null;
  courseTypes?: string[] | null;
  examsPrepared?: string[] | null;
  accreditations?: string[] | null;
  universityPartners?: string[] | null;
  priceFrom?: number | null;
  priceUnit?: string | null;
  currency?: string | null;
  weeklyHours?: number | null;
  classSize?: number | null;
  startDates?: string | null;
  offersVisaSupport?: boolean;
  offersAccommodation?: boolean;
  offersPathway?: boolean;
  isPartner: boolean;
  /**
   * Absent tant que le backend hébergé n'a pas été redéployé avec la fiche détaillée :
   * on ne traite comme brouillon que le `false` explicite, jamais l'absence de champ.
   */
  isValidated?: boolean;
}

const isDraft = (c: CenterRow) => c.isValidated === false;

type CenterForm = {
  name: string; country: string; city: string; address: string; language: string;
  description: string; link: string; registrationUrl: string; email: string; phone: string; image: string;
  levelsOffered: string[]; courseTypes: string[]; examsPrepared: string[];
  accreditations: string; universityPartners: string[];
  priceFrom: string; priceUnit: string; currency: string;
  weeklyHours: string; classSize: string; startDates: string;
  offersVisaSupport: boolean; offersAccommodation: boolean; offersPathway: boolean;
  isPartner: boolean; isValidated: boolean;
};

const emptyForm: CenterForm = {
  name: '', country: '', city: '', address: '', language: '',
  description: '', link: '', registrationUrl: '', email: '', phone: '', image: '',
  levelsOffered: [], courseTypes: [], examsPrepared: [],
  accreditations: '', universityPartners: [],
  priceFrom: '', priceUnit: 'semaine', currency: 'EUR',
  weeklyHours: '', classSize: '', startDates: '',
  offersVisaSupport: false, offersAccommodation: false, offersPathway: false,
  // Une fiche créée à la main est publiée par défaut : l'admin la crée pour qu'elle serve.
  isPartner: false, isValidated: true,
};

const toForm = (c: CenterRow): CenterForm => ({
  name: c.name ?? '', country: c.country ?? '', city: c.city ?? '', address: c.address ?? '',
  language: c.language ?? '', description: c.description ?? '', link: c.link ?? '',
  registrationUrl: c.registrationUrl ?? '', email: c.email ?? '', phone: c.phone ?? '', image: c.image ?? '',
  levelsOffered: c.levelsOffered ?? [], courseTypes: c.courseTypes ?? [], examsPrepared: c.examsPrepared ?? [],
  accreditations: (c.accreditations ?? []).join(', '), universityPartners: c.universityPartners ?? [],
  priceFrom: c.priceFrom != null ? String(c.priceFrom) : '',
  priceUnit: c.priceUnit ?? 'semaine', currency: c.currency ?? 'EUR',
  weeklyHours: c.weeklyHours != null ? String(c.weeklyHours) : '',
  classSize: c.classSize != null ? String(c.classSize) : '',
  startDates: c.startDates ?? '',
  offersVisaSupport: !!c.offersVisaSupport, offersAccommodation: !!c.offersAccommodation,
  offersPathway: !!c.offersPathway, isPartner: !!c.isPartner, isValidated: c.isValidated !== false,
});

const toPayload = (f: CenterForm) => ({
  name: f.name.trim(),
  country: f.country.trim(),
  city: f.city.trim(),
  address: f.address.trim(),
  language: f.language.trim(),
  description: f.description.trim(),
  link: f.link.trim(),
  registrationUrl: f.registrationUrl.trim(),
  email: f.email.trim(),
  phone: f.phone.trim(),
  image: f.image.trim(),
  levelsOffered: f.levelsOffered,
  courseTypes: f.courseTypes,
  examsPrepared: f.examsPrepared,
  accreditations: f.accreditations.split(',').map(s => s.trim()).filter(Boolean),
  universityPartners: f.universityPartners,
  priceFrom: f.priceFrom.trim() === '' ? null : Number(f.priceFrom),
  priceUnit: f.priceUnit,
  currency: f.currency,
  weeklyHours: f.weeklyHours.trim() === '' ? null : Number(f.weeklyHours),
  classSize: f.classSize.trim() === '' ? null : Number(f.classSize),
  startDates: f.startDates.trim(),
  offersVisaSupport: f.offersVisaSupport,
  offersAccommodation: f.offersAccommodation,
  offersPathway: f.offersPathway,
  isPartner: f.isPartner,
  isValidated: f.isValidated,
});

const formatPrice = (c: CenterRow) => {
  if (c.priceFrom == null) return null;
  const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(c.priceFrom);
  const symbol = c.currency === 'EUR' ? '€' : c.currency === 'GBP' ? '£' : c.currency === 'USD' ? '$' : (c.currency ?? '');
  return { amount: `${amount} ${symbol}`.trim(), unit: c.priceUnit ? `/ ${c.priceUnit}` : '' };
};

/** Une fiche est « complète » quand elle porte de quoi décider : contact, contenu, tarif. */
const completeness = (c: CenterRow) => {
  const checks = [
    !!c.description, !!c.city, !!(c.link || c.registrationUrl),
    !!(c.levelsOffered?.length), !!(c.courseTypes?.length), !!(c.examsPrepared?.length),
    c.priceFrom != null, !!(c.email || c.phone),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

/* ── Jauge circulaire de complétude ────────────────────────────────────────── */
const CompletenessRing: React.FC<{ value: number; size?: number }> = ({ value, size = 34 }) => {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 75 ? 'text-primary' : value >= 40 ? 'text-gold-500' : 'text-rose-400';
  return (
    <span className="relative inline-grid place-items-center" title={`Fiche remplie à ${value}%`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="3" className="stroke-stone-100" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="3" strokeLinecap="round"
          className={`${tone} transition-all duration-500`} stroke="currentColor"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-stone-500">{value}</span>
      <span className="sr-only">Fiche remplie à {value} %</span>
    </span>
  );
};

/* ── Sélecteur multiple sous forme de pastilles ───────────────────────────── */
const ChipGroup: React.FC<{
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  scroll?: boolean;
}> = ({ options, selected, onToggle, scroll }) => (
  <div className={`flex flex-wrap gap-1.5 ${scroll ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>
    {options.map(o => {
      const active = selected.includes(o);
      return (
        <button
          key={o}
          type="button"
          onClick={() => onToggle(o)}
          aria-pressed={active}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            active
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-300 hover:text-stone-800'
          }`}
        >
          {o}
        </button>
      );
    })}
  </div>
);

/* ── Couverture : pays du catalogue universités et centres associés ────────── */
const CoveragePanel: React.FC<{
  rows: { country: string; universities: number; centers: number }[];
  selected: string;
  onSelect: (country: string) => void;
}> = ({ rows, selected, onSelect }) => {
  const gaps = rows.filter(r => r.universities > 0 && r.centers === 0).length;
  const max = Math.max(...rows.map(r => r.centers), 1);
  return (
    <Card className="p-6 h-full">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-lg font-semibold text-stone-800">Couverture par pays d’études</h2>
        <span className={`text-xs ${gaps ? 'text-rose-500' : 'text-primary'}`}>
          {gaps === 0 ? 'Tous les pays couverts' : `${gaps} pays sans centre`}
        </span>
      </div>
      <div className="space-y-1 max-h-[22rem] overflow-y-auto pr-1">
        {rows.map(({ country, universities, centers }) => {
          const active = selected === country;
          const pct = Math.round((centers / max) * 100);
          return (
            <button
              key={country}
              type="button"
              onClick={() => onSelect(active ? '' : country)}
              aria-pressed={active}
              title={active ? 'Retirer le filtre' : `Filtrer sur ${countryLabel(country)}`}
              className={`w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                active ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-stone-50'
              }`}
            >
              <span className={`w-32 shrink-0 truncate text-sm ${active ? 'text-primary font-semibold' : 'text-stone-700'}`}>
                {countryLabel(country)}
              </span>
              <span className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <span
                  className={`block h-full rounded-full transition-all duration-500 ${
                    centers === 0 ? 'bg-rose-300' : active ? 'bg-primary' : 'bg-gold-400'
                  }`}
                  style={{ width: `${Math.max(pct, centers === 0 ? 4 : 8)}%` }}
                />
              </span>
              <span className="w-32 shrink-0 text-right text-xs tabular-nums text-stone-500">
                {centers === 0 ? <span className="text-rose-500">aucun centre</span> : `${centers} centre${centers > 1 ? 's' : ''}`}
                <span className="text-stone-300"> · {universities} univ.</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

/* ── Répartition des langues enseignées ───────────────────────────────────── */
const LanguageMix: React.FC<{
  rows: { language: string; count: number }[];
  total: number;
  selected: string;
  onSelect: (language: string) => void;
}> = ({ rows, total, selected, onSelect }) => (
  <Card className="p-6 h-full">
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="font-display text-lg font-semibold text-stone-800">Langues enseignées</h2>
      <span className="text-xs text-stone-400">{rows.length} langues</span>
    </div>

    {/* Barre empilée : la composition du catalogue en une ligne. */}
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-stone-100 mb-5">
      {rows.map(r => (
        <span
          key={r.language}
          className={`${accentOf(r.language).dot} h-full transition-all duration-500`}
          style={{ width: `${(r.count / Math.max(total, 1)) * 100}%` }}
          title={`${r.language} : ${r.count}`}
        />
      ))}
    </div>

    <div className="space-y-1">
      {rows.map(r => {
        const active = selected === r.language;
        return (
          <button
            key={r.language}
            type="button"
            onClick={() => onSelect(active ? '' : r.language)}
            aria-pressed={active}
            className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              active ? 'bg-primary/10' : 'hover:bg-stone-50'
            }`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${accentOf(r.language).dot}`} />
            <span className={`flex-1 truncate text-sm ${active ? 'text-primary font-medium' : 'text-stone-700'}`}>
              {r.language}
            </span>
            <span className="text-xs tabular-nums text-stone-400">
              {r.count} <span className="text-stone-300">· {Math.round((r.count / Math.max(total, 1)) * 100)}%</span>
            </span>
          </button>
        );
      })}
    </div>
  </Card>
);

/* ── Services rendus, en pictogrammes ──────────────────────────────────────── */
const ServiceIcons: React.FC<{ c: CenterRow }> = ({ c }) => {
  const services = [
    { on: !!c.offersVisaSupport, Icon: IdentificationIcon, label: 'Lettre d’inscription pour le visa' },
    { on: !!c.offersAccommodation, Icon: HomeModernIcon, label: 'Aide au logement' },
    { on: !!c.offersPathway, Icon: AcademicCapIcon, label: 'Passerelle universitaire' },
  ].filter(s => s.on);
  if (services.length === 0) return null;
  return (
    <div className="flex items-center gap-1">
      {services.map(({ Icon, label }) => (
        <span key={label} title={label}
          className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </span>
      ))}
    </div>
  );
};

/* ── Fiche centre (vue cartes) ─────────────────────────────────────────────── */
const CenterCard: React.FC<{ c: CenterRow; onEdit: () => void; onDelete: () => void; onTogglePublish: () => void }> = ({
  c, onEdit, onDelete, onTogglePublish,
}) => {
  const [open, setOpen] = useState(false);
  const price = formatPrice(c);
  const accent = accentOf(c.language);
  const draft = isDraft(c);

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-stone-300">
      {/* Rail coloré : la langue enseignée, lisible sans lire. */}
      <span className={`absolute inset-y-0 left-0 w-1 ${accent.rail}`} aria-hidden="true" />

      <div className="p-5 pl-6 flex flex-col sm:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${accent.chip}`}>{c.language}</span>
            <span className="text-xs text-stone-500">
              {countryLabel(c.country)}{c.city ? ` · ${c.city}` : ''}
            </span>
            {c.levels && (
              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-stone-600">
                {c.levels}
              </span>
            )}
            {c.isPartner && <Badge tone="green"><SparklesIcon className="h-3.5 w-3.5" /> Partenaire</Badge>}
            {draft && <Badge tone="amber"><EyeSlashIcon className="h-3.5 w-3.5" /> Brouillon</Badge>}
          </div>

          <h3 className="font-display text-lg font-semibold leading-snug text-stone-800">{c.name}</h3>
          {c.description && <p className="mt-1.5 text-sm leading-relaxed text-stone-500 line-clamp-2">{c.description}</p>}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(c.courseTypes ?? []).slice(0, 4).map(t => (
              <span key={t} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">{t}</span>
            ))}
            {(c.examsPrepared ?? []).slice(0, 4).map(e => (
              <span key={e} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">{e}</span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-400">
            {c.weeklyHours != null && (
              <span className="inline-flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{c.weeklyHours} h/sem.</span>
            )}
            {c.classSize != null && (
              <span className="inline-flex items-center gap-1"><UserGroupIcon className="h-3.5 w-3.5" />max {c.classSize}</span>
            )}
            {c.startDates && <span>{c.startDates}</span>}
            {c.link && (
              <a href={c.link} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors duration-150">
                <ArrowTopRightOnSquareIcon className="h-3 w-3" /> site
              </a>
            )}
            {c.registrationUrl && (
              <a href={c.registrationUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors duration-150">
                <ArrowTopRightOnSquareIcon className="h-3 w-3" /> inscription
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-primary transition-colors duration-150 cursor-pointer"
          >
            <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            {open ? 'Masquer le détail' : 'Voir le détail'}
          </button>

          {open && (
            <dl className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-1.5 border-t border-stone-100 pt-3 text-xs">
              {c.address && (<><dt className="text-stone-400">Adresse</dt><dd className="text-stone-600">{c.address}</dd></>)}
              {c.email && (<><dt className="text-stone-400">E-mail</dt><dd className="text-stone-600">{c.email}</dd></>)}
              {c.phone && (<><dt className="text-stone-400">Téléphone</dt><dd className="text-stone-600">{c.phone}</dd></>)}
              {!!c.levelsOffered?.length && (<><dt className="text-stone-400">Niveaux</dt><dd className="text-stone-600">{c.levelsOffered.join(' · ')}</dd></>)}
              {!!c.accreditations?.length && (<><dt className="text-stone-400">Accréditations</dt><dd className="text-stone-600">{c.accreditations.join(', ')}</dd></>)}
              {!!c.universityPartners?.length && (<><dt className="text-stone-400">Universités partenaires</dt><dd className="text-stone-600">{c.universityPartners.join(', ')}</dd></>)}
            </dl>
          )}
        </div>

        {/* Colonne droite : tarif, services, complétude, actions. */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 sm:w-44 shrink-0 sm:border-l sm:border-stone-100 sm:pl-5">
          <div className="text-right">
            {price ? (
              <>
                <p className="font-display text-xl font-semibold text-stone-800 tabular-nums leading-none">{price.amount}</p>
                <p className="mt-0.5 text-[11px] text-stone-400">{price.unit} · indicatif</p>
              </>
            ) : (
              <p className="text-xs text-stone-300">tarif à renseigner</p>
            )}
          </div>

          <ServiceIcons c={c} />

          <div className="flex items-center gap-2">
            <CompletenessRing value={completeness(c)} />
            <div className="flex items-center gap-1">
              <IconButton tone={draft ? 'green' : 'slate'} title={draft ? 'Publier' : 'Dépublier'} onClick={onTogglePublish}>
                {draft ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
              </IconButton>
              <IconButton tone="blue" title="Modifier" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
              <IconButton tone="rose" title="Supprimer" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

/* ── Vue tableau (dense, pour balayer le catalogue) ────────────────────────── */
const CenterTable: React.FC<{
  rows: CenterRow[];
  onEdit: (c: CenterRow) => void;
  onDelete: (c: CenterRow) => void;
  onTogglePublish: (c: CenterRow) => void;
}> = ({ rows, onEdit, onDelete, onTogglePublish }) => (
  <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50/70 text-left text-[11px] uppercase tracking-[0.12em] text-stone-400">
            <th className="px-4 py-3 font-medium">Centre</th>
            <th className="px-4 py-3 font-medium">Langue</th>
            <th className="px-4 py-3 font-medium">Pays / ville</th>
            <th className="px-4 py-3 font-medium">Niveaux</th>
            <th className="px-4 py-3 font-medium text-right">Tarif</th>
            <th className="px-4 py-3 font-medium">Services</th>
            <th className="px-4 py-3 font-medium">Fiche</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map(c => {
            const price = formatPrice(c);
            const accent = accentOf(c.language);
            const draft = isDraft(c);
            return (
              <tr key={c.id} className="transition-colors duration-150 hover:bg-stone-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-8 w-1 shrink-0 rounded-full ${accent.rail}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">{c.name}</p>
                      <p className="flex items-center gap-1.5 text-xs text-stone-400">
                        {c.isPartner && <span className="text-primary">Partenaire</span>}
                        {draft && <span className="text-gold-700">Brouillon</span>}
                        {!c.isPartner && !draft && <span className="text-stone-300">—</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${accent.chip}`}>{c.language}</span>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {countryLabel(c.country)}
                  {c.city && <span className="text-stone-400"> · {c.city}</span>}
                </td>
                <td className="px-4 py-3 tabular-nums text-stone-600">{c.levels ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {price ? (
                    <>
                      <span className="font-medium text-stone-800">{price.amount}</span>
                      <span className="text-xs text-stone-400"> {price.unit}</span>
                    </>
                  ) : <span className="text-stone-300">—</span>}
                </td>
                <td className="px-4 py-3"><ServiceIcons c={c} /></td>
                <td className="px-4 py-3"><CompletenessRing value={completeness(c)} size={28} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton tone={draft ? 'green' : 'slate'} title={draft ? 'Publier' : 'Dépublier'} onClick={() => onTogglePublish(c)}>
                      {draft ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                    </IconButton>
                    <IconButton tone="blue" title="Modifier" onClick={() => onEdit(c)}><PencilSquareIcon className="h-4 w-4" /></IconButton>
                    <IconButton tone="rose" title="Supprimer" onClick={() => onDelete(c)}><TrashIcon className="h-4 w-4" /></IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);

const AdminLanguageCenters: React.FC = () => {
  const [items, setItems] = useState<CenterRow[]>([]);
  const [universities, setUniversities] = useState<{ name: string; city: string; country: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filtres
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [courseType, setCourseType] = useState('');
  const [onlyPartners, setOnlyPartners] = useState(false);
  const [onlyDrafts, setOnlyDrafts] = useState(false);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [groupByCountry, setGroupByCountry] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Édition
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CenterForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [partnerQuery, setPartnerQuery] = useState('');

  const set = <K extends keyof CenterForm>(key: K, value: CenterForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const toggleIn = (key: 'levelsOffered' | 'courseTypes' | 'examsPrepared' | 'universityPartners', value: string) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [centersRes, uniRes] = await Promise.all([
        apiService.adminGetLanguageCenters(1, 500),
        // Le catalogue universités sert de référentiel de pays/villes (et de partenaires).
        apiService.adminGetUniversities(1, 500).catch(() => ({ data: [] })),
      ]);
      const centers = centersRes.data ?? centersRes.items ?? [];
      setItems(Array.isArray(centers) ? centers : []);
      const unis = uniRes.data ?? uniRes.items ?? [];
      setUniversities(Array.isArray(unis) ? unis : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? 'Impossible de charger les centres de langue');
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

  /* ── Référentiel pays / villes : universités d'abord, complété par les centres ── */
  const coverage = useMemo(() => {
    const map = new Map<string, { country: string; universities: number; centers: number }>();
    for (const u of universities) {
      const row = map.get(u.country) ?? { country: u.country, universities: 0, centers: 0 };
      row.universities++;
      map.set(u.country, row);
    }
    for (const c of items) {
      const row = map.get(c.country) ?? { country: c.country, universities: 0, centers: 0 };
      row.centers++;
      map.set(c.country, row);
    }
    return [...map.values()].sort((a, b) => b.centers - a.centers || b.universities - a.universities || a.country.localeCompare(b.country));
  }, [universities, items]);

  const countryOptions = useMemo(() => coverage.map(r => r.country), [coverage]);

  const languageMix = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of items) map.set(c.language, (map.get(c.language) ?? 0) + 1);
    return [...map.entries()]
      .map(([lang, count]) => ({ language: lang, count }))
      .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
  }, [items]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const u of universities) if (!country || u.country === country) if (u.city) cities.add(u.city);
    for (const c of items) if (!country || c.country === country) if (c.city) cities.add(c.city);
    return [...cities].sort((a, b) => a.localeCompare(b));
  }, [universities, items, country]);

  /** Villes proposées dans l'éditeur : celles du pays saisi dans le formulaire. */
  const formCityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const u of universities) if (!form.country || u.country === form.country) if (u.city) cities.add(u.city);
    for (const c of items) if (!form.country || c.country === form.country) if (c.city) cities.add(c.city);
    return [...cities].sort((a, b) => a.localeCompare(b));
  }, [universities, items, form.country]);

  /** Universités candidates au partenariat : celles du pays du centre. */
  const partnerCandidates = useMemo(() => {
    const q = partnerQuery.trim().toLowerCase();
    return universities
      .filter(u => !form.country || u.country === form.country)
      .filter(u => !q || u.name.toLowerCase().includes(q) || (u.city ?? '').toLowerCase().includes(q))
      .map(u => u.name)
      .sort((a, b) => a.localeCompare(b));
  }, [universities, form.country, partnerQuery]);

  const languageOptions = useMemo(() => {
    const langs = new Set<string>(LANGUAGES);
    items.forEach(c => c.language && langs.add(c.language));
    return [...langs].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const stats = useMemo(() => {
    const countries = new Set(items.map(c => c.country));
    const partners = items.filter(c => c.isPartner).length;
    const drafts = items.filter(isDraft).length;
    const uncovered = coverage.filter(r => r.universities > 0 && r.centers === 0);
    const avg = items.length ? Math.round(items.reduce((s, c) => s + completeness(c), 0) / items.length) : 0;
    return { countries: countries.size, langs: languageMix.length, partners, drafts, uncovered, avg };
  }, [items, coverage, languageMix]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(c => {
      if (country && c.country !== country) return false;
      if (city && c.city !== city) return false;
      if (language && c.language !== language) return false;
      if (level && !(c.levelsOffered ?? []).includes(level) && !(c.levels ?? '').includes(level)) return false;
      if (courseType && !(c.courseTypes ?? []).includes(courseType)) return false;
      if (onlyPartners && !c.isPartner) return false;
      if (onlyDrafts && !isDraft(c)) return false;
      if (!q) return true;
      return [c.name, c.city, c.country, c.language, c.description, c.address]
        .some(v => (v ?? '').toLowerCase().includes(q))
        || (c.examsPrepared ?? []).some(e => e.toLowerCase().includes(q));
    });
  }, [items, query, country, city, language, level, courseType, onlyPartners, onlyDrafts]);

  const groups = useMemo(() => {
    if (!groupByCountry || view === 'table') return null;
    const map = new Map<string, CenterRow[]>();
    for (const c of filtered) {
      if (!map.has(c.country)) map.set(c.country, []);
      map.get(c.country)!.push(c);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, [filtered, groupByCountry, view]);

  const activeFilters = [country, city, language, level, courseType, query.trim()].filter(Boolean).length
    + (onlyPartners ? 1 : 0) + (onlyDrafts ? 1 : 0);
  const resetFilters = () => {
    setQuery(''); setCountry(''); setCity(''); setLanguage(''); setLevel('');
    setCourseType(''); setOnlyPartners(false); setOnlyDrafts(false);
  };

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const openCreate = (presetCountry?: string) => {
    setEditingId(null);
    // Pré-remplissage avec le pays consulté : on ajoute presque toujours dans ce pays.
    setForm({ ...emptyForm, country: presetCountry ?? country ?? '' });
    setPartnerQuery('');
    setEditorOpen(true);
  };

  const openEdit = (c: CenterRow) => {
    setEditingId(c.id);
    setForm(toForm(c));
    setPartnerQuery('');
    setEditorOpen(true);
  };

  const canSave = !!form.name.trim() && !!form.country.trim() && !!form.language.trim();

  const handleSave = async () => {
    if (!canSave) {
      setError('Le nom, le pays et la langue enseignée sont obligatoires.');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload = toPayload(form);
      if (editingId !== null) await apiService.adminUpdateLanguageCenter(editingId, payload);
      else await apiService.adminCreateLanguageCenter(payload);
      setEditorOpen(false);
      flash(editingId !== null ? 'Centre mis à jour.' : 'Centre ajouté.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: CenterRow) => {
    if (!confirm(`Supprimer « ${c.name} » ?`)) return;
    try {
      await apiService.adminDeleteLanguageCenter(c.id);
      flash('Centre supprimé.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  /** Publication rapide depuis la liste, sans ouvrir l'éditeur. */
  const togglePublish = async (c: CenterRow) => {
    const next = isDraft(c);
    try {
      await apiService.adminUpdateLanguageCenter(c.id, { isValidated: next });
      flash(next ? 'Centre publié.' : 'Centre repassé en brouillon.');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Mise à jour impossible.');
    }
  };

  const selectCls = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 cursor-pointer transition-colors duration-150 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
  const toggleCls = (on: boolean, activeCls: string) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      on ? activeCls : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
    }`;

  return (
    <div>
      <PageHeader
        title="Centres de langue"
        subtitle={`${items.length} centre${items.length > 1 ? 's' : ''} · ${stats.countries} pays · ${stats.langs} langues enseignées`}
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

      {/* ── Synthèse ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Centres" value={items.length} icon={LanguageIcon} tone="primary" hint={`fiches remplies à ${stats.avg}% en moyenne`} />
        <StatCard label="Pays couverts" value={stats.countries} icon={GlobeAltIcon} tone="gold"
          hint={stats.uncovered.length ? `${stats.uncovered.length} pays d’études sans centre` : 'Tous les pays d’études couverts'} />
        <StatCard label="Partenaires" value={stats.partners} icon={SparklesIcon} tone="teal"
          hint={stats.partners === 0 ? 'aucun partenariat déclaré' : undefined} />
        <StatCard label="Brouillons" value={stats.drafts} icon={EyeSlashIcon} tone={stats.drafts ? 'rose' : 'indigo'}
          hint={stats.drafts ? 'invisibles côté étudiant' : 'tout est publié'} />
      </div>

      {stats.uncovered.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-gold-800">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span>Ces pays ont des universités mais aucun centre de langue :</span>
          {stats.uncovered.map(r => (
            <button key={r.country} type="button" onClick={() => openCreate(r.country)}
              className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 hover:bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400/40">
              {countryLabel(r.country)} +
            </button>
          ))}
        </div>
      )}

      {!loading && coverage.length > 0 && (
        <div className="mb-6 grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <CoveragePanel rows={coverage} selected={country} onSelect={c => { setCountry(c); setCity(''); }} />
          </div>
          <LanguageMix rows={languageMix} total={items.length} selected={language} onSelect={setLanguage} />
        </div>
      )}

      {/* ── Barre d'outils : recherche, vue, filtres ── */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-stone-200/70 bg-cream/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-cream/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un centre, une ville, un examen…"
              aria-label="Rechercher un centre de langue"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Vue cartes / tableau : lecture détaillée ou balayage dense. */}
            <div className="inline-flex rounded-lg bg-stone-100 p-0.5" role="group" aria-label="Mode d’affichage">
              {([
                ['cards', 'Cartes', Squares2X2Icon],
                ['table', 'Tableau', TableCellsIcon],
              ] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setView(value)}
                  aria-pressed={view === value}
                  title={label}
                  className={`inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    view === value ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {view === 'cards' && (
              <button
                type="button"
                onClick={() => setGroupByCountry(v => !v)}
                aria-pressed={groupByCountry}
                className={toggleCls(groupByCountry, 'bg-stone-800 text-white')}
              >
                Grouper par pays
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select value={country} onChange={e => { setCountry(e.target.value); setCity(''); }} aria-label="Filtrer par pays" className={selectCls}>
            <option value="">Tous les pays</option>
            {countryOptions.map(c => <option key={c} value={c}>{countryLabel(c)}</option>)}
          </select>

          <select value={city} onChange={e => setCity(e.target.value)} aria-label="Filtrer par ville" className={selectCls}>
            <option value="">Toutes les villes</option>
            {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Filtrer par langue" className={selectCls}>
            <option value="">Toutes les langues</option>
            {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={level} onChange={e => setLevel(e.target.value)} aria-label="Filtrer par niveau" className={selectCls}>
            <option value="">Tous les niveaux</option>
            {CEFR.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={courseType} onChange={e => setCourseType(e.target.value)} aria-label="Filtrer par format de cours" className={selectCls}>
            <option value="">Tous les formats</option>
            {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button type="button" onClick={() => setOnlyPartners(v => !v)} aria-pressed={onlyPartners}
            className={toggleCls(onlyPartners, 'border border-primary/30 bg-primary/10 text-primary')}>
            <SparklesIcon className="h-4 w-4" /> Partenaires
          </button>

          <button type="button" onClick={() => setOnlyDrafts(v => !v)} aria-pressed={onlyDrafts}
            className={toggleCls(onlyDrafts, 'border border-gold-300 bg-gold-100 text-gold-800')}>
            <EyeSlashIcon className="h-4 w-4" /> Brouillons
            {stats.drafts > 0 && <span className="tabular-nums text-xs">({stats.drafts})</span>}
          </button>

          {activeFilters > 0 && (
            <button type="button" onClick={resetFilters}
              className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors duration-150 hover:text-primary cursor-pointer">
              <XMarkIcon className="h-4 w-4" /> Réinitialiser ({activeFilters})
            </button>
          )}

          <span className="ml-auto text-sm text-stone-500">
            <span className="font-medium text-stone-700 tabular-nums">{filtered.length}</span> centre{filtered.length > 1 ? 's' : ''}
            {filtered.length !== items.length && <span className="text-stone-400"> sur {items.length}</span>}
          </span>
        </div>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="p-5">
              <div className="animate-pulse space-y-2.5">
                <div className="h-3 w-24 rounded bg-stone-100" />
                <div className="h-4 w-1/2 rounded bg-stone-100" />
                <div className="h-3 w-1/3 rounded bg-stone-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <LanguageIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {items.length === 0 ? 'Aucun centre de langue' : 'Aucun résultat'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0
              ? 'Ajoutez un centre : il apparaîtra pour les étudiants du pays concerné.'
              : 'Essayez d’élargir vos filtres.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {activeFilters > 0 && <SecondaryButton onClick={resetFilters}>Réinitialiser les filtres</SecondaryButton>}
            {items.length === 0 && <PrimaryButton onClick={() => openCreate()}><PlusIcon className="h-4 w-4" /> Ajouter un centre</PrimaryButton>}
          </div>
        </Card>
      ) : view === 'table' ? (
        <CenterTable rows={filtered} onEdit={openEdit} onDelete={handleDelete} onTogglePublish={togglePublish} />
      ) : groups ? (
        <div className="space-y-8">
          {groups.map(([key, list]) => {
            const isCollapsed = collapsed[key];
            return (
              <section key={key}>
                <button
                  type="button"
                  onClick={() => setCollapsed(c => ({ ...c, [key]: !c[key] }))}
                  aria-expanded={!isCollapsed}
                  className="group mb-3 flex w-full items-center gap-2 text-left cursor-pointer"
                >
                  <ChevronRightIcon className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                  <h2 className="font-display text-lg font-semibold text-stone-800 transition-colors duration-150 group-hover:text-primary">
                    {countryLabel(key)}
                  </h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium tabular-nums text-stone-600">{list.length}</span>
                  <span className="ml-2 h-px flex-1 bg-gradient-to-r from-gold-300/60 via-stone-200 to-transparent" />
                </button>
                {!isCollapsed && (
                  <div className="space-y-3">
                    {list.map(c => (
                      <CenterCard key={c.id} c={c} onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} onTogglePublish={() => togglePublish(c)} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <CenterCard key={c.id} c={c} onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} onTogglePublish={() => togglePublish(c)} />
          ))}
        </div>
      )}

      {/* ── Éditeur ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm" onClick={() => setEditorOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId !== null ? 'Modifier un centre de langue' : 'Ajouter un centre de langue'}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-stone-900/5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-800">
                  {editingId !== null ? 'Modifier le centre' : 'Ajouter un centre de langue'}
                </h2>
                {form.country && (
                  <p className="mt-0.5 text-xs text-stone-400">
                    {countryLabel(form.country)}{form.city ? ` · ${form.city}` : ''}
                  </p>
                )}
              </div>
              <IconButton onClick={() => setEditorOpen(false)} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Nom du centre" required>
                    <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Goethe-Institut Berlin" />
                  </Field>
                </div>
                <Field label="Pays" required>
                  <Select value={form.country} onChange={e => { set('country', e.target.value); set('universityPartners', []); }}>
                    <option value="">— Choisir —</option>
                    {countryOptions.map(c => <option key={c} value={c}>{countryLabel(c)}</option>)}
                  </Select>
                </Field>
                <Field label="Ville">
                  <TextInput value={form.city} onChange={e => set('city', e.target.value)} placeholder="Berlin" list="admin-lc-cities" />
                </Field>
              </div>
              <datalist id="admin-lc-cities">{formCityOptions.map(c => <option key={c} value={c} />)}</datalist>
              <p className="-mt-2 text-xs text-stone-400">
                Le pays reprend le vocabulaire du catalogue universités : c’est ce qui relie le centre
                aux étudiants recalés sur l’exigence de langue d’une université de ce pays.
              </p>

              <Field label="Adresse">
                <TextInput value={form.address} onChange={e => set('address', e.target.value)} placeholder="Neue Schönhauser Str. 20, 10178 Berlin" />
              </Field>

              <Field label="Présentation">
                <TextArea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Institut culturel officiel, cours intensifs et préparation aux certifications reconnues par les universités." />
              </Field>

              <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">Enseignement</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Langue enseignée" required>
                    <Select value={form.language} onChange={e => set('language', e.target.value)}>
                      <option value="">— Choisir —</option>
                      {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
                    </Select>
                  </Field>
                  <Field label="Rentrées / sessions">
                    <TextInput value={form.startDates} onChange={e => set('startDates', e.target.value)} placeholder="Rentrées chaque lundi" />
                  </Field>
                </div>

                <Field label="Niveaux enseignés">
                  <ChipGroup options={CEFR} selected={form.levelsOffered} onToggle={v => toggleIn('levelsOffered', v)} />
                </Field>

                <Field label="Formats de cours">
                  <ChipGroup options={COURSE_TYPES} selected={form.courseTypes} onToggle={v => toggleIn('courseTypes', v)} />
                </Field>

                <Field label="Examens préparés">
                  <ChipGroup options={EXAMS} selected={form.examsPrepared} onToggle={v => toggleIn('examsPrepared', v)} scroll />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Heures par semaine">
                    <TextInput type="number" min={1} value={form.weeklyHours} onChange={e => set('weeklyHours', e.target.value)} placeholder="20" />
                  </Field>
                  <Field label="Taille maximale d’une classe">
                    <TextInput type="number" min={1} value={form.classSize} onChange={e => set('classSize', e.target.value)} placeholder="14" />
                  </Field>
                </div>

                <Field label="Accréditations (séparées par des virgules)">
                  <TextInput value={form.accreditations} onChange={e => set('accreditations', e.target.value)} placeholder="Eaquals, IALC, Bildungsurlaub" />
                </Field>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                  <BanknotesIcon className="h-4 w-4" /> Tarif indicatif
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="À partir de">
                    <TextInput type="number" min={0} value={form.priceFrom} onChange={e => set('priceFrom', e.target.value)} placeholder="250" />
                  </Field>
                  <Field label="Par">
                    <Select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}>
                      {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </Select>
                  </Field>
                  <Field label="Devise">
                    <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  Affiché « dès … » côté site : c’est un ordre de grandeur, pas un devis.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">Services au dossier étudiant</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([
                    ['offersVisaSupport', 'Lettre pour le visa', IdentificationIcon],
                    ['offersAccommodation', 'Aide au logement', HomeModernIcon],
                    ['offersPathway', 'Passerelle universitaire', AcademicCapIcon],
                  ] as const).map(([key, label, Icon]) => (
                    <label key={key}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                        form[key] ? 'border-primary/30 bg-primary/5 text-stone-800' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}>
                      <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
                      <Icon className={`h-4 w-4 ${form[key] ? 'text-primary' : 'text-stone-400'}`} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                  Universités partenaires {form.country && <span className="normal-case tracking-normal text-stone-400">— {countryLabel(form.country)}</span>}
                </p>
                {form.country ? (
                  <>
                    <TextInput value={partnerQuery} onChange={e => setPartnerQuery(e.target.value)} placeholder="Filtrer les universités du pays…" />
                    <div className="mt-3">
                      <ChipGroup
                        options={[...new Set([...form.universityPartners, ...partnerCandidates])].slice(0, 60)}
                        selected={form.universityPartners}
                        onToggle={v => toggleIn('universityPartners', v)}
                        scroll
                      />
                    </div>
                    {partnerCandidates.length === 0 && (
                      <p className="mt-2 text-xs text-stone-400">Aucune université au catalogue pour ce pays.</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-stone-400">Choisissez d’abord un pays pour voir les universités du catalogue.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Site web">
                  <TextInput value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="Page d’inscription">
                  <TextInput value={form.registrationUrl} onChange={e => set('registrationUrl', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="E-mail">
                  <TextInput type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@centre.de" />
                </Field>
                <Field label="Téléphone">
                  <TextInput value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+49 30 …" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Image (URL)">
                    <TextInput value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…/photo.jpg" />
                  </Field>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                  form.isPartner ? 'border-primary/30 bg-primary/5 text-stone-800' : 'border-stone-200 text-stone-700 hover:border-stone-300'
                }`}>
                  <input type="checkbox" checked={form.isPartner} onChange={e => set('isPartner', e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
                  <SparklesIcon className={`h-4 w-4 ${form.isPartner ? 'text-primary' : 'text-stone-400'}`} /> Partenaire Midzo
                </label>
                <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                  form.isValidated ? 'border-primary/30 bg-primary/5 text-stone-800' : 'border-gold-300 bg-gold-50 text-gold-800'
                }`}>
                  <input type="checkbox" checked={form.isValidated} onChange={e => set('isValidated', e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
                  {form.isValidated
                    ? <><EyeIcon className="h-4 w-4 text-primary" /> Publié sur le site</>
                    : <><EyeSlashIcon className="h-4 w-4 text-gold-700" /> Brouillon — invisible</>}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-stone-200 bg-stone-50/60 px-6 py-4">
              <SecondaryButton onClick={() => setEditorOpen(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !canSave}>
                <CheckIcon className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLanguageCenters;
