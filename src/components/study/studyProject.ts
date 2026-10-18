import { apiService } from '../../services/api';

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
  label: string;
  description: string;
}

/** Services proposés dans le parcours Study (libellés repris des scénarios de test). */
export const STUDY_SERVICES: ServiceOption[] = [
  { id: 'university_finder', label: 'University Finder', description: 'Recherche et présélection des universités' },
  { id: 'admission', label: 'Admission / Candidature', description: 'Dossier de candidature (Application) et suivi' },
  { id: 'visa', label: 'Visa étudiant', description: 'Constitution du dossier et rendez-vous consulaire' },
  { id: 'housing', label: 'Logement (Housing)', description: 'Résidence étudiante ou colocation' },
  { id: 'recognition', label: 'Reconnaissance du diplôme', description: 'Équivalence / Recognition du diplôme' },
  { id: 'language_course', label: 'Cours de langue', description: 'Language Course et certification (B1, B2…)' },
  { id: 'airport_pickup', label: "Accueil à l'aéroport", description: 'Airport Pickup à l’arrivée' },
  { id: 'bank', label: 'Compte bancaire', description: 'Compte bloqué / compte courant étudiant' },
  { id: 'insurance', label: 'Assurance', description: 'Assurance santé étudiante' },
];

export const FORMATS = ['Présentiel', 'Hybride', 'Temps partiel', 'Formation continue'];

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

export interface ShortlistedUniversity { id: number; name: string; city: string }
export interface ShortlistedOffer { id: number; employer: string; city: string }

export interface StudyProject {
  version: 1;
  profile: {
    nationality: string;
    residence: string;
    diploma: string;
    languageLevel: string;
  };
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
  notes: string;
  tripId?: number;
  savedAt?: string;
  requestSentAt?: string;
  updatedAt?: string;
}

export function emptyProject(): StudyProject {
  return {
    version: 1,
    profile: { nationality: '', residence: '', diploma: '', languageLevel: '' },
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
    notes: '',
  };
}

/** Un brouillon ancien ou abîmé ne doit pas faire planter la page : on complète les champs. */
export function normalizeProject(raw: any): StudyProject {
  const base = emptyProject();
  if (!raw || typeof raw !== 'object') return base;
  const arr = (v: any) => (Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
  return {
    ...base,
    ...raw,
    version: 1,
    profile: { ...base.profile, ...(raw.profile || {}) },
    preferences: {
      ...base.preferences,
      ...(raw.preferences || {}),
      teachingLanguages: arr(raw.preferences?.teachingLanguages),
      formats: arr(raw.preferences?.formats),
    },
    domains: arr(raw.domains),
    cities: arr(raw.cities),
    services: arr(raw.services),
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

export function projectTitle(project: StudyProject, countryLabel?: string): string {
  const field = project.fieldQuery.trim() || domainLabels(project.domains)[0] || '';
  const parts = [levelLabel(project.level), field].filter(Boolean).join(' · ');
  const country = countryLabel || project.destinationLabel || project.destination || 'destination à choisir';
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

interface ApiTripService { id: number; type: string; label: string; status: string; data?: any }

export interface SavedStudyProject {
  tripId: number;
  title: string;
  project: StudyProject;
  /** Statut côté compte de chaque service choisi (pending / done). */
  serviceStatus: Record<string, string>;
}

/**
 * Crée ou met à jour le trip qui porte le projet. Le backend ne sait pas supprimer
 * un service de trip : un service retiré passe au statut `cancelled`, et repasse
 * à `pending` s'il est choisi de nouveau.
 */
export async function saveProjectToAccount(project: StudyProject, countryLabel?: string): Promise<StudyProject> {
  const title = projectTitle(project, countryLabel);
  const startDate = project.startMonth ? `${project.startMonth}-01` : undefined;

  let tripId = project.tripId;
  let existing: ApiTripService[] = [];

  if (tripId) {
    try {
      const res = await apiService.getTrip(tripId);
      existing = res?.data?.services ?? [];
      await apiService.updateTrip(tripId, { title, startDate });
    } catch (err: any) {
      // Trip supprimé entre-temps : on en recrée un plutôt que d'échouer.
      if (err?.status !== 404) throw err;
      tripId = undefined;
      existing = [];
    }
  }

  if (!tripId) {
    const destinations = project.cities.length
      ? project.cities.map((city, order) => ({ country: project.destination, city, order }))
      : [{ country: project.destination, order: 0 }];
    const created = await apiService.createTrip({ title, status: 'planning', startDate, destinations });
    tripId = created?.data?.id as number;
    if (!tripId) throw new Error('Trip creation failed');
  }

  const saved: StudyProject = { ...project, tripId, savedAt: new Date().toISOString() };

  const record = existing.find(s => s.type === PROJECT_SERVICE_TYPE);
  if (record) {
    await apiService.updateTripService(record.id, { label: title, data: saved });
  } else {
    await apiService.addTripService(tripId, { type: PROJECT_SERVICE_TYPE, label: title, data: saved });
  }

  for (const service of STUDY_SERVICES) {
    const selected = project.services.includes(service.id);
    const current = existing.find(s => s.type === `${SERVICE_TYPE_PREFIX}${service.id}`);
    if (current) {
      const next = selected ? (current.status === 'cancelled' ? 'pending' : current.status) : 'cancelled';
      if (next !== current.status) await apiService.updateTripService(current.id, { status: next });
    } else if (selected) {
      await apiService.addTripService(tripId, {
        type: `${SERVICE_TYPE_PREFIX}${service.id}`,
        label: service.label,
        data: { country: project.destination },
      });
    }
  }

  return saved;
}

/**
 * Trips du compte, séparés en projets d'études (trips portant un service
 * `study_project`) et autres voyages. La liste `/trips` n'inclut pas les
 * services : il faut le détail de chaque trip pour les distinguer.
 */
export async function loadAccountTrips(): Promise<{ projects: SavedStudyProject[]; otherTrips: any[] }> {
  const list = await apiService.getTrips();
  const trips: any[] = list?.data ?? [];
  const details = await Promise.all(
    trips.map(t => apiService.getTrip(t.id).then(r => r?.data ?? t).catch(() => t)),
  );
  const projects: SavedStudyProject[] = [];
  const otherTrips: any[] = [];
  details.forEach((trip: any) => {
    const services: ApiTripService[] = trip.services ?? [];
    const record = services.find(s => s.type === PROJECT_SERVICE_TYPE);
    if (!record) { otherTrips.push(trip); return; }
    const serviceStatus: Record<string, string> = {};
    services
      .filter(s => s.type.startsWith(SERVICE_TYPE_PREFIX))
      .forEach(s => { serviceStatus[s.type.slice(SERVICE_TYPE_PREFIX.length)] = s.status; });
    projects.push({
      tripId: trip.id,
      title: trip.title,
      project: { ...normalizeProject(record.data), tripId: trip.id },
      serviceStatus,
    });
  });
  return { projects, otherTrips };
}

export async function loadAccountProject(tripId: number): Promise<StudyProject | null> {
  const res = await apiService.getTrip(tripId);
  const record = (res?.data?.services ?? []).find((s: ApiTripService) => s.type === PROJECT_SERVICE_TYPE);
  return record ? { ...normalizeProject(record.data), tripId } : null;
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
    `Niveau de langue : ${project.profile.languageLevel || '—'}`,
    '',
    `Destination : ${countryLabel || project.destination || '—'}`,
    `Niveau visé : ${levelLabel(project.level) || '—'}`,
    `Domaine : ${[...domainLabels(project.domains), project.fieldQuery].filter(Boolean).join(', ') || '—'}`,
    `Villes : ${project.cities.join(', ') || '—'}`,
    `Rentrée souhaitée : ${project.startMonth || '—'}`,
    `Langue d'enseignement : ${project.preferences.teachingLanguages.join(', ') || 'indifférent'}`,
    `Format : ${project.preferences.formats.join(', ') || 'indifférent'}`,
    `Universités publiques uniquement : ${project.preferences.publicOnly ? 'oui' : 'non'}`,
    '',
    `Services demandés : ${project.services.map(serviceLabel).join(', ') || '—'}`,
    `Universités présélectionnées : ${project.shortlist.map(u => `${u.name} (${u.city})`).join(' ; ') || '—'}`,
    `Offres Ausbildung retenues : ${project.offerShortlist.map(o => `${o.employer} (${o.city})`).join(' ; ') || '—'}`,
  ];
  if (project.notes.trim()) lines.push('', `Notes : ${project.notes.trim()}`);
  return lines.join('\n');
}
