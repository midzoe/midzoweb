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

/** Une étape de l'itinéraire : un pays, ses villes, et le nombre de nuits prévu (facultatif). */
export interface TourismStop { country: string; label: string; cities: string[]; nights: number | null }

export interface TourismProject {
  version: 1;
  profile: { nationality: string; residence: string };
  /** Itinéraire multi-destination, dans l'ordre du voyage. */
  stops: TourismStop[];
  /** Pays affiché dans les informations (l'une des étapes) ; ses villes sont dans `cities`. */
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
    stops: [],
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
  // Anciens voyages : une seule destination (`destination` + `cities`).
  const destination = typeof raw.destination === 'string' ? raw.destination : '';
  let stops: TourismStop[] = Array.isArray(raw.stops)
    ? raw.stops
        .filter((st: any) => st && typeof st.country === 'string' && st.country)
        .map((st: any) => {
          const n = Number(st.nights);
          return { country: st.country, label: typeof st.label === 'string' && st.label ? st.label : st.country, cities: arr(st.cities), nights: Number.isInteger(n) && n > 0 && n < 366 ? n : null };
        })
    : [];
  if (destination && !stops.some(st => st.country === destination)) {
    stops = [...stops, { country: destination, label: raw.destinationLabel || destination, cities: arr(raw.cities), nights: null }];
  }
  return {
    ...base,
    ...raw,
    version: 1,
    stops,
    destination: destination || stops[0]?.country || '',
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

/** Étapes avec les villes de l'étape affichée (`cities` est la copie de travail). */
export function syncedStops(project: TourismProject): TourismStop[] {
  return project.stops.map(st => (st.country === project.destination ? { ...st, cities: project.cities } : st));
}

export function stopsLabel(project: TourismProject, countryLabel?: string): string {
  if (project.stops.length > 1) return project.stops.map(st => st.label).join(' → ');
  return countryLabel || project.destinationLabel || project.stops[0]?.label || project.destination || '';
}

/** « Kenya (Nairobi, Masai Mara · 5 nuits) → Tanzanie (Zanzibar · 4 nuits) » */
export function itineraryText(project: TourismProject): string {
  return syncedStops(project).map(st => {
    const details = [st.cities.join(', '), st.nights ? `${st.nights} nuit${st.nights > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
    return details ? `${st.label} (${details})` : st.label;
  }).join(' → ');
}

export function tourismTitle(project: TourismProject, countryLabel?: string): string {
  const country = stopsLabel(project, countryLabel) || 'destination à choisir';
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
    destinations: (syncedStops(project).length ? syncedStops(project) : [{ country: project.destination, label: project.destination, cities: project.cities, nights: null }])
      .flatMap(st => (st.cities.length ? st.cities.map(city => ({ country: st.country, city })) : [{ country: st.country, city: undefined as string | undefined }]))
      .map((d, order) => ({ ...d, order })),
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
    `Itinéraire : ${itineraryText(project) || countryLabel || project.destination || '—'}`,
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
