import { apiService } from '../../services/api';
import { loadTripRecord, recordOf, saveTripRecord, serviceStatusOf } from '../projects/tripRecords';
import { emptyPriceChoice, normalizePriceChoice, PriceChoice, snapshotLabel } from '../../pricing/priceChoice';

/**
 * Parcours « Composer mon voyage » (Tourisme) : destination, dates, voyageurs, services
 * T1..T10 de la grille tarifaire, offre et paiement. Même mécanique que le parcours Study :
 * brouillon sur l'appareil sans compte, trip `/trips` + fiche `tourism_project` avec compte.
 */

export interface TourismServiceOption { id: string; label: string }

/** Les 10 services tourisme de la grille (le prix vient de `/api/pricing`, par code). */
export const TOURISM_SERVICES: TourismServiceOption[] = [
  { id: 'T1', label: 'Guide de la destination / de la ville' },
  { id: 'T2', label: 'Recommandations de restaurants' },
  { id: 'T3', label: 'Recherche et réservation de vol' },
  { id: 'T4', label: 'Recherche d’événements' },
  { id: 'T5', label: 'Initiation à la langue locale' },
  { id: 'T6', label: 'Recherche d’hébergement' },
  { id: 'T7', label: 'Organisation des loisirs et activités' },
  { id: 'T8', label: 'Itinéraire de voyage personnalisé' },
  { id: 'T9', label: 'Organisation d’un guide local' },
  { id: 'T10', label: 'Accueil à l’aéroport + transfert vers l’hébergement' },
];

export const INTERESTS = ['Safari & nature', 'Plage & détente', 'Culture & patrimoine', 'Sport & événements', 'Gastronomie', 'Shopping & ville'];

export interface TourismProject {
  version: 1;
  profile: { nationality: string; residence: string };
  destination: string;
  destinationLabel?: string;
  cities: string[];
  startDate: string; // AAAA-MM-JJ
  endDate: string;
  travelers: number;
  interests: string[];
  services: string[]; // codes T1..T10
  price: PriceChoice;
  notes: string;
  tripId?: number;
  savedAt?: string;
  requestSentAt?: string;
  updatedAt?: string;
}

export function emptyTourismProject(): TourismProject {
  return {
    version: 1,
    profile: { nationality: '', residence: '' },
    destination: '',
    cities: [],
    startDate: '',
    endDate: '',
    travelers: 1,
    interests: [],
    services: [],
    price: emptyPriceChoice(),
    notes: '',
  };
}

export function normalizeTourismProject(raw: any): TourismProject {
  const base = emptyTourismProject();
  if (!raw || typeof raw !== 'object') return base;
  const arr = (v: any) => (Array.isArray(v) ? v.filter((x: any) => typeof x === 'string') : []);
  const travelers = Number(raw.travelers);
  return {
    ...base,
    ...raw,
    version: 1,
    profile: { ...base.profile, ...(raw.profile || {}) },
    cities: arr(raw.cities),
    interests: arr(raw.interests),
    services: arr(raw.services).filter((c: string) => TOURISM_SERVICES.some(s => s.id === c)),
    travelers: Number.isInteger(travelers) && travelers >= 1 && travelers <= 50 ? travelers : 1,
    price: normalizePriceChoice(raw.price),
  };
}

/** Nombre de nuits entre deux dates AAAA-MM-JJ ; null si incomplet ou incohérent. */
export function nightsBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const n = Math.round((b.getTime() - a.getTime()) / 86400000);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function tourismTitle(project: TourismProject, countryLabel?: string): string {
  const country = countryLabel || project.destinationLabel || project.destination || 'destination à choisir';
  const when = project.startDate ? ` — ${project.startDate}${project.endDate ? ` → ${project.endDate}` : ''}` : '';
  return `Voyage — ${country}${when}`;
}

// ── Brouillon local ──────────────────────────────────────────────────────────

const DRAFT_KEY = 'midzo_tourism_draft';

export function loadTourismDraft(): TourismProject | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? normalizeTourismProject(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveTourismDraft(project: TourismProject): TourismProject | null {
  const stamped = { ...project, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(stamped));
    return stamped;
  } catch {
    return null;
  }
}

export function clearTourismDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
}

// ── Compte ───────────────────────────────────────────────────────────────────

export const TOURISM_RECORD_TYPE = 'tourism_project';
const TOURISM_PREFIX = 'tourism:';

export interface SavedTourismProject {
  tripId: number;
  title: string;
  project: TourismProject;
  serviceStatus: Record<string, string>;
}

export async function saveTourismToAccount(project: TourismProject, countryLabel?: string): Promise<TourismProject> {
  return saveTripRecord<TourismProject>({
    recordType: TOURISM_RECORD_TYPE,
    servicePrefix: TOURISM_PREFIX,
    catalogue: TOURISM_SERVICES,
    selected: project.services,
    project,
    title: tourismTitle(project, countryLabel),
    startDate: project.startDate || undefined,
    endDate: project.endDate || undefined,
    destinations: project.cities.length
      ? project.cities.map((city, order) => ({ country: project.destination, city, order }))
      : [{ country: project.destination, order: 0 }],
  });
}

export function parseTourismTrips(trips: any[]): SavedTourismProject[] {
  return trips
    .map((trip): SavedTourismProject | null => {
      const record = recordOf(trip, TOURISM_RECORD_TYPE);
      if (!record) return null;
      return {
        tripId: trip.id,
        title: trip.title,
        project: { ...normalizeTourismProject(record.data), tripId: trip.id },
        serviceStatus: serviceStatusOf(trip, TOURISM_PREFIX),
      };
    })
    .filter((p): p is SavedTourismProject => !!p);
}

export async function loadTourismProject(tripId: number): Promise<TourismProject | null> {
  const data = await loadTripRecord(tripId, TOURISM_RECORD_TYPE);
  return data ? { ...normalizeTourismProject(data), tripId } : null;
}

export async function deleteTourismProject(tripId: number): Promise<void> {
  await apiService.deleteTrip(tripId);
}

export function tourismSummary(project: TourismProject, countryLabel?: string): string {
  const nights = nightsBetween(project.startDate, project.endDate);
  const lines = [
    tourismTitle(project, countryLabel),
    '',
    `Nationalité : ${project.profile.nationality || '—'}`,
    `Pays de résidence : ${project.profile.residence || '—'}`,
    `Destination : ${countryLabel || project.destination || '—'}`,
    `Villes / étapes : ${project.cities.join(', ') || '—'}`,
    `Dates : ${project.startDate || '—'} → ${project.endDate || '—'}${nights != null ? ` (${nights} nuit${nights > 1 ? 's' : ''})` : ''}`,
    `Voyageurs : ${project.travelers}`,
    `Centres d’intérêt : ${project.interests.join(', ') || '—'}`,
    '',
    `Services : ${TOURISM_SERVICES.filter(s => project.services.includes(s.id)).map(s => `${s.id} ${s.label}`).join(' ; ') || '—'}`,
    `Offre et paiement : ${project.price.snapshot ? snapshotLabel(project.price.snapshot) : 'à définir avec le conseiller'}`,
  ];
  if (project.notes.trim()) lines.push('', `Notes : ${project.notes.trim()}`);
  return lines.join('\n');
}
