import { apiService } from '../../services/api';
import { loadTripRecord, recordOf, saveTripRecord, serviceStatusOf } from '../projects/tripRecords';
import { emptyPriceChoice, normalizePriceChoice, PriceChoice, snapshotLabel } from '../../pricing/priceChoice';

/**
 * Parcours « MIDZOE Study » : un projet d'études (pays > niveau > domaine > villes),
 * les services choisis et la présélection d'universités.
 *
 * Sans compte, le projet vit en brouillon dans le navigateur (il survit à la
 * fermeture du site). Avec un compte, il est enregistré comme un trip
 * (`/trips`) : le projet complet dans un service `study_project` (données JSON),
 * et un service `study:<id>` par service choisi, visible dans le dashboard.
 */

// ── Référentiels ─────────────────────────────────────────────────────────────

export type LevelId = 'bachelor' | 'medicine_first_year' | 'master' | 'vocational';

export interface LevelOption {
  id: LevelId;
  label: string;
  hint: string;
  /** Niveau des filières en base (`UniversityProgram.level`) ; absent = hors université. */
  apiLevel?: 'Bachelor' | 'Master';
}

export const LEVELS: LevelOption[] = [
  { id: 'bachelor', label: 'Licence / Bachelor', hint: 'Après le bac', apiLevel: 'Bachelor' },
  { id: 'medicine_first_year', label: 'Médecine — 1re année', hint: 'PASS / LAS en France', apiLevel: 'Bachelor' },
  { id: 'master', label: 'Master', hint: 'Après une licence ou un bachelor', apiLevel: 'Master' },
  { id: 'vocational', label: 'Formation professionnelle (Ausbildung)', hint: 'Formation en alternance rémunérée' },
];

export interface DomainOption {
  id: string;
  label: string;
  /** Fragments sans accents ni casse, cherchés dans les noms de filières (texte libre multilingue). */
  keywords: string[];
}

export const DOMAINS: DomainOption[] = [
  { id: 'computer_science', label: 'Informatique / Computer Science', keywords: ['informati', 'computer', 'software', 'logiciel', 'cyber', 'information'] },
  { id: 'data_ai', label: 'Data Science / IA', keywords: ['data', 'donnees', 'intelligence artificielle', 'artificial intelligence', 'machine learning', 'statisti', 'scientific computing'] },
  { id: 'finance', label: 'Finance / Banque', keywords: ['financ', 'banking', 'banque', 'comptab', 'accounting'] },
  { id: 'business', label: 'Économie / Gestion / Management', keywords: ['econom', 'gestion', 'management', 'business', 'commerce', 'marketing', 'entrepreneur'] },
  { id: 'medicine', label: 'Médecine / Pharmacie', keywords: ['medecin', 'medicine', 'medicina', 'pharma', 'odontolog'] },
  { id: 'public_health', label: 'Santé publique / Management de la santé', keywords: ['sante publique', 'public health', 'health', 'sante'] },
  { id: 'nursing', label: 'Soins infirmiers', keywords: ['infirmi', 'nursing', 'pflege'] },
  { id: 'biology', label: 'Biologie / Sciences de la vie', keywords: ['biolog', 'bioscience', 'biomed', 'biotech', 'sciences de la vie', 'life science', 'neuro'] },
  { id: 'engineering', label: 'Ingénierie', keywords: ['genie', 'engineering', 'ingenie', 'ingegneria'] },
  { id: 'law_politics', label: 'Droit / Sciences politiques', keywords: ['droit', 'law', 'diritto', 'giurisprudenza', 'politi', 'relations internationales', 'international relations'] },
  { id: 'sciences', label: 'Maths / Physique / Chimie', keywords: ['mathemat', 'physi', 'chimi', 'chemistry'] },
  { id: 'humanities', label: 'Lettres / Langues / Sciences humaines', keywords: ['lettre', 'litter', 'langue', 'linguist', 'histoire', 'history', 'philosoph', 'sociolog', 'psycholog'] },
];

export interface ServiceOption {
  id: string;
  /** Code de la grille tarifaire (S1..S11, T1..T10) : le prix vient de `/api/pricing`. */
  code: string;
  label: string;
  description: string;
}

/** Les 11 services Study de la grille tarifaire (libellés repris des scénarios de test). */
export const STUDY_SERVICES: ServiceOption[] = [
  { id: 'university_finder', code: 'S9', label: 'University Finder', description: 'Recherche d’université / de programme' },
  { id: 'admission', code: 'S10', label: 'Admission / Candidature', description: 'Candidature et inscription à l’université' },
  { id: 'visa', code: 'S11', label: 'Visa étudiant', description: 'Assistance à la demande de visa' },
  { id: 'housing', code: 'S5', label: 'Logement (Housing)', description: 'Recherche de logement' },
  { id: 'recognition', code: 'S8', label: 'Reconnaissance du diplôme', description: 'Équivalence / Recognition du diplôme' },
  { id: 'legalisation', code: 'S6', label: 'Légalisation de documents', description: 'Légalisation / Apostille' },
  { id: 'language_course', code: 'S4', label: 'Cours de langue', description: 'Inscription à un cours de langue' },
  { id: 'language_center', code: 'S2', label: 'Centre de langue', description: 'Recherche de centre de langue' },
  { id: 'airport_pickup', code: 'S7', label: "Accueil à l'aéroport", description: 'Accueil + transfert vers le logement' },
  { id: 'bank', code: 'S3', label: 'Compte bancaire', description: 'Aide à l’ouverture de compte' },
  { id: 'flight', code: 'S1', label: 'Vol', description: 'Recherche et réservation de vol' },
];

/** Codes tarifaires d'un projet : services études + services tourisme ajoutés (Mix). */
export function projectCodes(project: Pick<StudyProject, 'services' | 'tourismServices'>): string[] {
  const study = STUDY_SERVICES.filter(s => project.services.includes(s.id)).map(s => s.code);
  return [...study, ...project.tourismServices];
}

export const FORMATS = ['Présentiel', 'Hybride', 'Temps partiel', 'Formation continue'];

/** Diplôme le plus élevé obtenu : liste fermée (une saisie libre n'était pas exploitable). */
export const DIPLOMAS: { group: string; options: string[] }[] = [
  { group: 'Fin d’études secondaires', options: [
    'Baccalauréat scientifique (C, D, E, S)',
    'Baccalauréat littéraire (A, L)',
    'Baccalauréat économique / gestion (B, G, ES)',
    'Baccalauréat technique ou professionnel (F, T, Pro)',
    'WASSCE / WAEC (Ghana, Nigeria…)',
    'GCE A-Level / High School Diploma',
    'BEPC / Brevet (sans baccalauréat)',
  ] },
  { group: 'Enseignement supérieur', options: [
    'BTS / DUT / HND (Bac + 2)',
    'Licence / Bachelor (Bac + 3)',
    'Master / Maîtrise (Bac + 4-5)',
    'Diplôme d’ingénieur',
    'Doctorat / PhD',
  ] },
  { group: 'Formation professionnelle', options: [
    'CAP / BEP / CQP',
    'Diplôme d’infirmier ou de santé',
    'Autre diplôme professionnel',
  ] },
];
export const ALL_DIPLOMAS = DIPLOMAS.flatMap(g => g.options);

/** Langues parlées (profil) et niveaux du Cadre européen. */
export const PROFILE_LANGUAGES = [
  'Français', 'Anglais', 'Allemand', 'Espagnol', 'Italien', 'Portugais', 'Néerlandais', 'Suédois',
  'Chinois (mandarin)', 'Arabe', 'Russe', 'Turc', 'Swahili', 'Haoussa', 'Yoruba', 'Igbo', 'Wolof',
  'Lingala', 'Bambara', 'Éwé', 'Fon', 'Twi', 'Amharique',
];
export const LANGUAGE_LEVELS = [
  { value: 'A1', label: 'A1 — débutant' },
  { value: 'A2', label: 'A2 — élémentaire' },
  { value: 'B1', label: 'B1 — intermédiaire' },
  { value: 'B2', label: 'B2 — intermédiaire avancé' },
  { value: 'C1', label: 'C1 — avancé' },
  { value: 'C2', label: 'C2 — maîtrise' },
  { value: 'Natif', label: 'Langue maternelle' },
];

export interface SpokenLanguage { language: string; level: string }

/** « Anglais C1, Allemand A2 » : forme texte gardée pour le résumé envoyé au conseiller. */
export function languagesText(list: SpokenLanguage[]): string {
  return list.filter(l => l.language).map(l => `${l.language} ${l.level}`.trim()).join(', ');
}

/** Ancienne saisie libre → lignes langue + niveau quand c'est reconnaissable. */
function parseLanguages(text: string): SpokenLanguage[] {
  const out: SpokenLanguage[] = [];
  for (const part of (text || '').split(/[,;/]+/)) {
    const m = part.trim().match(/^(.+?)\s+(A1|A2|B1|B2|C1|C2|natif|native)$/i);
    const name = (m ? m[1] : part).trim();
    if (!name) continue;
    const known = PROFILE_LANGUAGES.find(l => l.toLowerCase() === name.toLowerCase());
    out.push({ language: known ?? name, level: m ? (/nati/i.test(m[2]) ? 'Natif' : m[2].toUpperCase()) : 'B1' });
  }
  return out;
}

export const TEACHING_LANGUAGES = ['Français', 'Anglais', 'Allemand'];

// ── Texte : comparaison sans accents ni casse ────────────────────────────────

export function fold(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .trim();
}

/**
 * Les villes sont saisies en français dans le catalogue universités (« Hambourg »)
 * et dans leur langue locale dans le catalogue logements (« Hamburg ») : on ramène
 * les deux à une même clé.
 */
const CITY_ALIASES: Record<string, string> = {
  hambourg: 'hamburg', hanovre: 'hannover', hanover: 'hannover', francfort: 'frankfurt',
  'frankfurt am main': 'frankfurt', munchen: 'munich', koln: 'cologne', dresde: 'dresden',
  breme: 'bremen', nuremberg: 'nurnberg', 'aix-la-chapelle': 'aachen', tubingue: 'tubingen',
  leipzig: 'leipzig', brussels: 'bruxelles', brussel: 'bruxelles', luik: 'liege',
  louvain: 'leuven', gand: 'gent', ghent: 'gent', anvers: 'antwerpen', antwerp: 'antwerpen',
  lisbonne: 'lisboa', lisbon: 'lisboa', rome: 'roma', florence: 'firenze', milan: 'milano',
  turin: 'torino', padoue: 'padova', bologne: 'bologna', seville: 'sevilla', grenade: 'granada',
  valence: 'valencia', salamanque: 'salamanca', barcelone: 'barcelona', londres: 'london',
  edimbourg: 'edinburgh', geneva: 'geneve', genf: 'geneve', berne: 'bern', bale: 'basel',
  pekin: 'beijing', nankin: 'nanjing', canton: 'guangzhou', groningue: 'groningen',
  leyde: 'leiden', nimegue: 'nijmegen', 'la haye': 'den haag', 'the hague': 'den haag',
  gothenburg: 'goteborg',
};

export function cityKey(city: string): string {
  const f = fold(city);
  return CITY_ALIASES[f] ?? f;
}

/** « Erlangen/Nuremberg » ou « Luxembourg (Esch-sur-Alzette, …) » couvrent plusieurs villes. */
export function cityMatches(entityCity: string | null | undefined, wanted: string): boolean {
  if (!entityCity) return false;
  const target = cityKey(wanted);
  if (!target) return false;
  return entityCity
    .split(/[/,()]/)
    .map(part => cityKey(part))
    .filter(Boolean)
    .some(part => part === target || part.startsWith(`${target}-`) || part.startsWith(`${target} `));
}

// ── Universités ──────────────────────────────────────────────────────────────

export interface UniversityProgram {
  id: number;
  name: string;
  level: string;
  /** Langues d'enseignement du programme ; vide ou absent = non renseigné. */
  teachingLanguages?: string[] | null;
  /** « Présentiel », « Hybride », « Temps partiel », « Formation continue » ; vide = non renseigné. */
  formats?: string[] | null;
}

export interface University {
  id: number;
  name: string;
  city: string;
  country: string;
  website?: string | null;
  applicationUrl?: string | null;
  specialty?: string | null;
  requiredLanguage?: string | null;
  requiredLanguageLevel?: string | null;
  minimumGrade?: string | null;
  admissionRequirements?: string | null;
  /** true = public, false = privé, null/absent = non renseigné. */
  isPublic?: boolean | null;
  programs: UniversityProgram[];
}

export interface UniversityMatch {
  university: University;
  programs: UniversityProgram[];
  /** Au moins une filière enseignée dans une langue souhaitée (ou langue non filtrée). */
  languageOk: boolean;
  /** La langue retenue vient du programme (true) ou, à défaut, de l'établissement (false). */
  languageFromProgram: boolean;
  /** Au moins une filière proposée dans un format souhaité (ou format non filtré). */
  formatOk: boolean;
}

/** Langues d'une filière : celles du programme si connues, sinon celle de l'établissement. */
export function programLanguages(program: UniversityProgram, university: University): { languages: string[]; fromProgram: boolean } {
  if (program.teachingLanguages?.length) return { languages: program.teachingLanguages, fromProgram: true };
  return { languages: university.requiredLanguage ? [university.requiredLanguage] : [], fromProgram: false };
}

function programMatches(program: UniversityProgram, domains: string[], fieldQuery: string): boolean {
  const name = fold(program.name);
  const query = fold(fieldQuery);
  if (domains.length === 0 && !query) return true;
  const byDomain = DOMAINS
    .filter(d => domains.includes(d.id))
    .some(d => d.keywords.some(k => name.includes(k)));
  const byQuery = query.length >= 3 && name.includes(query);
  return byDomain || byQuery;
}

/**
 * Universités du pays qui proposent au moins une filière du niveau et du domaine
 * demandés.
 *  - « Publiques uniquement » écarte les établissements renseignés comme privés ; ceux dont
 *    le statut n'est pas renseigné restent proposés (signalés à l'écran).
 *  - Langue et format sont des critères de tri : la langue est lue sur la filière quand
 *    elle est connue, sinon sur l'établissement ; un écart est signalé, pas masqué.
 */
export function matchUniversities(
  universities: University[],
  criteria: {
    level: LevelId | ''; domains: string[]; fieldQuery: string; cities: string[]; languages: string[];
    publicOnly?: boolean; formats?: string[];
  },
): UniversityMatch[] {
  const level = LEVELS.find(l => l.id === criteria.level);
  if (level && !level.apiLevel) return [];
  const wantedLanguages = criteria.languages.map(fold);
  const wantedFormats = (criteria.formats ?? []).map(fold);

  return universities
    .filter(u => !criteria.publicOnly || u.isPublic !== false)
    .filter(u => criteria.cities.length === 0 || criteria.cities.some(c => cityMatches(u.city, c)))
    .map(u => {
      const programs = (u.programs || []).filter(p =>
        (!level?.apiLevel || p.level === level.apiLevel) &&
        programMatches(p, criteria.domains, criteria.fieldQuery),
      );
      const languageHits = programs.filter(p =>
        programLanguages(p, u).languages.some(l => wantedLanguages.includes(fold(l))));
      const languageOk = wantedLanguages.length === 0 || languageHits.length > 0;
      const languageFromProgram = languageHits.some(p => programLanguages(p, u).fromProgram);
      const formatOk = wantedFormats.length === 0 ||
        programs.some(p => (p.formats ?? []).some(f => wantedFormats.includes(fold(f))));
      return { university: u, programs, languageOk, languageFromProgram, formatOk };
    })
    .filter(m => m.programs.length > 0)
    .sort((a, b) =>
      Number(b.languageOk && b.formatOk) - Number(a.languageOk && a.formatOk) ||
      Number(b.languageOk) - Number(a.languageOk) ||
      Number(b.languageFromProgram) - Number(a.languageFromProgram) ||
      b.programs.length - a.programs.length);
}

// ── Formation professionnelle (Ausbildung) ───────────────────────────────────

export interface VocationalOffer {
  id: number;
  occupation: string;
  domain: string;
  employer: string;
  employerType?: string | null;
  country: string;
  city: string;
  durationMonths?: number | null;
  languageLevel?: string | null;
  salary?: string | null;
  startDates?: string[] | null;
  requirements?: string[] | null;
  documents?: string[] | null;
  description?: string | null;
  applicationUrl?: string | null;
}

// ── Projet ───────────────────────────────────────────────────────────────────

export interface ShortlistedUniversity { id: number; name: string; city: string; country?: string }

/** Un pays choisi et ses villes (le projet peut viser plusieurs pays). */
export interface ProjectDestination { country: string; label: string; cities: string[] }
export interface ShortlistedOffer { id: number; employer: string; city: string }
export interface StudyProject {
  version: 1;
  profile: {
    nationality: string;
    residence: string;
    diploma: string;
    /** Langues parlées avec leur niveau (liste fermée). */
    languages: SpokenLanguage[];
    /** Forme texte des langues (résumé, anciens projets). */
    languageLevel: string;
  };
  /** Tous les pays visés, avec leurs villes. */
  destinations: ProjectDestination[];
  /** Pays affiché dans les résultats (l'un de `destinations`) ; ses villes sont dans `cities`. */
  destination: string;
  /** Nom affiché du pays (« Allemagne »), conservé pour les écrans sans catalogue chargé. */
  destinationLabel?: string;
  level: LevelId | '';
  domains: string[];
  fieldQuery: string;
  cities: string[];
  startMonth: string; // AAAA-MM
  preferences: {
    teachingLanguages: string[];
    publicOnly: boolean;
    formats: string[];
  };
  services: string[];
  shortlist: ShortlistedUniversity[];
  /** Offres d'Ausbildung retenues (niveau « Formation professionnelle »). */
  offerShortlist: ShortlistedOffer[];
  /** Services tourisme ajoutés au projet (codes T1..T10) : ouvre les paliers Mix. */
  tourismServices: string[];
  /** Offre et mode de paiement retenus, avec l'instantané des montants. */
  price: PriceChoice;
  notes: string;
  tripId?: number;
  savedAt?: string;
  requestSentAt?: string;
  updatedAt?: string;
}

export function emptyProject(): StudyProject {
  return {
    version: 1,
    profile: { nationality: '', residence: '', diploma: '', languages: [], languageLevel: '' },
    destinations: [],
    destination: '',
    level: '',
    domains: [],
    fieldQuery: '',
    cities: [],
    startMonth: '',
    preferences: { teachingLanguages: [], publicOnly: false, formats: [] },
    services: [],
    shortlist: [],
    offerShortlist: [],
    tourismServices: [],
    price: emptyPriceChoice(),
    notes: '',
  };
}

/** Un brouillon ancien ou abîmé ne doit pas faire planter la page : on complète les champs. */
export function normalizeProject(raw: any): StudyProject {
  const base = emptyProject();
  if (!raw || typeof raw !== 'object') return base;
  const arr = (v: any) => (Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
  const profile = { ...base.profile, ...(raw.profile || {}) };
  profile.languages = Array.isArray(raw.profile?.languages)
    ? raw.profile.languages.filter((l: any) => l && typeof l.language === 'string').map((l: any) => ({ language: l.language, level: String(l.level || 'B1') }))
    : parseLanguages(profile.languageLevel);
  profile.languageLevel = languagesText(profile.languages) || profile.languageLevel || '';
  // Anciens projets : un seul pays (`destination` + `cities`).
  const destination = typeof raw.destination === 'string' ? raw.destination : '';
  let destinations: ProjectDestination[] = Array.isArray(raw.destinations)
    ? raw.destinations
        .filter((d: any) => d && typeof d.country === 'string' && d.country)
        .map((d: any) => ({ country: d.country, label: typeof d.label === 'string' && d.label ? d.label : d.country, cities: arr(d.cities) }))
    : [];
  if (destination && !destinations.some(d => d.country === destination)) {
    destinations = [...destinations, { country: destination, label: raw.destinationLabel || destination, cities: arr(raw.cities) }];
  }
  return {
    ...base,
    ...raw,
    version: 1,
    profile,
    destinations,
    destination: destination || destinations[0]?.country || '',
    preferences: {
      ...base.preferences,
      ...(raw.preferences || {}),
      teachingLanguages: arr(raw.preferences?.teachingLanguages),
      formats: arr(raw.preferences?.formats),
    },
    domains: arr(raw.domains),
    cities: arr(raw.cities),
    // Un service retiré du catalogue (ex. « insurance ») ne doit plus compter dans le prix.
    services: arr(raw.services).filter((id: string) => STUDY_SERVICES.some(s => s.id === id)),
    tourismServices: arr(raw.tourismServices).filter((c: string) => /^T\d+$/.test(c)),
    price: normalizePriceChoice(raw.price),
    shortlist: Array.isArray(raw.shortlist) ? raw.shortlist.filter((s: any) => s && typeof s.id === 'number') : [],
    offerShortlist: Array.isArray(raw.offerShortlist) ? raw.offerShortlist.filter((s: any) => s && typeof s.id === 'number') : [],
  };
}

export function levelLabel(id: string): string {
  return LEVELS.find(l => l.id === id)?.label ?? '';
}

export function domainLabels(ids: string[]): string[] {
  return ids.map(id => DOMAINS.find(d => d.id === id)?.label).filter((x): x is string => !!x);
}

export function serviceLabel(id: string): string {
  return STUDY_SERVICES.find(s => s.id === id)?.label ?? id;
}

/** Pays visés, villes du pays affiché comprises (`cities` est la copie de travail). */
export function syncedDestinations(project: StudyProject): ProjectDestination[] {
  return project.destinations.map(d => (d.country === project.destination ? { ...d, cities: project.cities } : d));
}

export function destinationsLabel(project: StudyProject, countryLabel?: string): string {
  if (project.destinations.length > 1) return project.destinations.map(d => d.label).join(', ');
  return countryLabel || project.destinationLabel || project.destinations[0]?.label || project.destination || '';
}

export function projectTitle(project: StudyProject, countryLabel?: string): string {
  const field = project.fieldQuery.trim() || domainLabels(project.domains)[0] || '';
  const parts = [levelLabel(project.level), field].filter(Boolean).join(' · ');
  const country = destinationsLabel(project, countryLabel) || 'destination à choisir';
  return `Études — ${country}${parts ? ` — ${parts}` : ''}`;
}

// ── Brouillon local (sans compte) ────────────────────────────────────────────

const DRAFT_KEY = 'midzo_study_draft';

export function loadDraft(): StudyProject | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? normalizeProject(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveDraft(project: StudyProject): StudyProject | null {
  const stamped = { ...project, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(stamped));
    return stamped;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
}

// ── Enregistrement dans le compte (trips) ────────────────────────────────────

export const PROJECT_SERVICE_TYPE = 'study_project';
const SERVICE_TYPE_PREFIX = 'study:';

export interface SavedStudyProject {
  tripId: number;
  title: string;
  project: StudyProject;
  /** Statut côté compte de chaque service choisi (pending / done). */
  serviceStatus: Record<string, string>;
}

export async function saveProjectToAccount(project: StudyProject, countryLabel?: string): Promise<StudyProject> {
  return saveTripRecord<StudyProject>({
    recordType: PROJECT_SERVICE_TYPE,
    servicePrefix: SERVICE_TYPE_PREFIX,
    catalogue: STUDY_SERVICES,
    selected: project.services,
    project,
    title: projectTitle(project, countryLabel),
    startDate: project.startMonth ? `${project.startMonth}-01` : undefined,
    destinations: tripDestinations(project),
  });
}

/** Étapes du trip : chaque pays visé, avec ses villes. */
function tripDestinations(project: StudyProject) {
  const list = syncedDestinations(project);
  const stops = (list.length ? list : [{ country: project.destination, label: project.destination, cities: project.cities }])
    .flatMap(d => (d.cities.length ? d.cities.map(city => ({ country: d.country, city })) : [{ country: d.country, city: undefined as string | undefined }]));
  return stops.map((s, order) => ({ ...s, order }));
}

/** Projets d'études parmi les trips détaillés du compte (voir `loadTripDetails`). */
export function parseStudyTrips(trips: any[]): SavedStudyProject[] {
  return trips
    .map((trip): SavedStudyProject | null => {
      const record = recordOf(trip, PROJECT_SERVICE_TYPE);
      if (!record) return null;
      return {
        tripId: trip.id,
        title: trip.title,
        project: { ...normalizeProject(record.data), tripId: trip.id },
        serviceStatus: serviceStatusOf(trip, SERVICE_TYPE_PREFIX),
      };
    })
    .filter((p): p is SavedStudyProject => !!p);
}

export async function loadAccountProject(tripId: number): Promise<StudyProject | null> {
  const data = await loadTripRecord(tripId, PROJECT_SERVICE_TYPE);
  return data ? { ...normalizeProject(data), tripId } : null;
}

export async function deleteAccountProject(tripId: number): Promise<void> {
  await apiService.deleteTrip(tripId);
}

/** Résumé lisible du projet, envoyé avec la demande d'accompagnement. */
export function projectSummary(project: StudyProject, countryLabel?: string): string {
  const lines = [
    projectTitle(project, countryLabel),
    '',
    `Nationalité : ${project.profile.nationality || '—'}`,
    `Pays de résidence : ${project.profile.residence || '—'}`,
    `Diplôme actuel : ${project.profile.diploma || '—'}`,
    `Langues : ${languagesText(project.profile.languages) || project.profile.languageLevel || '—'}`,
    '',
    `Destination${project.destinations.length > 1 ? 's' : ''} : ${destinationsLabel(project, countryLabel) || '—'}`,
    `Niveau visé : ${levelLabel(project.level) || '—'}`,
    `Domaine : ${[...domainLabels(project.domains), project.fieldQuery].filter(Boolean).join(', ') || '—'}`,
    `Villes : ${syncedDestinations(project).filter(d => d.cities.length).map(d => `${d.cities.join(', ')}${project.destinations.length > 1 ? ` (${d.label})` : ''}`).join(' ; ') || '—'}`,
    `Rentrée souhaitée : ${project.startMonth || '—'}`,
    `Langue d'enseignement : ${project.preferences.teachingLanguages.join(', ') || 'indifférent'}`,
    `Format : ${project.preferences.formats.join(', ') || 'indifférent'}`,
    `Universités publiques uniquement : ${project.preferences.publicOnly ? 'oui' : 'non'}`,
    '',
    `Services demandés : ${project.services.map(serviceLabel).join(', ') || '—'}`,
    `Universités présélectionnées : ${project.shortlist.map(u => `${u.name} (${[u.city, u.country].filter(Boolean).join(', ')})`).join(' ; ') || '—'}`,
    `Offres Ausbildung retenues : ${project.offerShortlist.map(o => `${o.employer} (${o.city})`).join(' ; ') || '—'}`,
    `Services tourisme (Mix) : ${project.tourismServices.join(', ') || '—'}`,
    `Offre et paiement : ${project.price.snapshot ? snapshotLabel(project.price.snapshot) : 'à définir avec le conseiller'}`,
  ];
  if (project.notes.trim()) lines.push('', `Notes : ${project.notes.trim()}`);
  return lines.join('\n');
}
