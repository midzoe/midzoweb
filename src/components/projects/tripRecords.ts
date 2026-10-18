import { apiService } from '../../services/api';

/**
 * Projets (études, voyage) enregistrés dans le compte sous forme de trips `/trips` :
 *  - un service « fiche » (`recordType`, ex. `study_project`) porte le projet complet en JSON ;
 *  - un service par prestation choisie (`<prefix><id>`, ex. `study:visa`), visible au dashboard.
 * Le backend ne sait pas supprimer un service de trip : une prestation retirée passe au
 * statut `cancelled`, et repasse à `pending` si elle est choisie de nouveau.
 */

export interface ApiTripService { id: number; type: string; label: string; status: string; data?: any }

export interface TripRecordInput<P> {
  recordType: string;
  servicePrefix: string;
  catalogue: { id: string; label: string }[];
  selected: string[];
  project: P & { tripId?: number };
  title: string;
  startDate?: string;
  endDate?: string;
  destinations: { country: string; city?: string; order: number }[];
}

export async function saveTripRecord<P>(input: TripRecordInput<P>): Promise<P & { tripId: number; savedAt: string }> {
  const { recordType, servicePrefix, catalogue, selected, project, title, startDate, endDate, destinations } = input;
  let tripId = project.tripId;
  let existing: ApiTripService[] = [];

  if (tripId) {
    try {
      const res = await apiService.getTrip(tripId);
      existing = res?.data?.services ?? [];
      await apiService.updateTrip(tripId, { title, startDate, endDate });
    } catch (err: any) {
      // Trip supprimé entre-temps : on en recrée un plutôt que d'échouer.
      if (err?.status !== 404) throw err;
      tripId = undefined;
      existing = [];
    }
  }

  if (!tripId) {
    const created = await apiService.createTrip({ title, status: 'planning', startDate, endDate, destinations });
    tripId = created?.data?.id as number;
    if (!tripId) throw new Error('Trip creation failed');
  }

  const saved = { ...project, tripId, savedAt: new Date().toISOString() };

  const record = existing.find(s => s.type === recordType);
  if (record) await apiService.updateTripService(record.id, { label: title, data: saved });
  else await apiService.addTripService(tripId, { type: recordType, label: title, data: saved });

  for (const service of catalogue) {
    const isSelected = selected.includes(service.id);
    const current = existing.find(s => s.type === `${servicePrefix}${service.id}`);
    if (current) {
      const next = isSelected ? (current.status === 'cancelled' ? 'pending' : current.status) : 'cancelled';
      if (next !== current.status) await apiService.updateTripService(current.id, { status: next });
    } else if (isSelected) {
      await apiService.addTripService(tripId, { type: `${servicePrefix}${service.id}`, label: service.label });
    }
  }

  return saved;
}

/** Détail de tous les trips du compte (la liste `/trips` n'inclut pas les services). */
export async function loadTripDetails(): Promise<any[]> {
  const list = await apiService.getTrips();
  const trips: any[] = list?.data ?? [];
  return Promise.all(trips.map(t => apiService.getTrip(t.id).then(r => r?.data ?? t).catch(() => t)));
}

export function recordOf(trip: any, recordType: string): ApiTripService | undefined {
  return (trip?.services ?? []).find((s: ApiTripService) => s.type === recordType);
}

/** Statut (pending / done / cancelled) de chaque prestation d'un trip, par identifiant. */
export function serviceStatusOf(trip: any, servicePrefix: string): Record<string, string> {
  const status: Record<string, string> = {};
  (trip?.services ?? [])
    .filter((s: ApiTripService) => s.type.startsWith(servicePrefix))
    .forEach((s: ApiTripService) => { status[s.type.slice(servicePrefix.length)] = s.status; });
  return status;
}

export async function loadTripRecord(tripId: number, recordType: string): Promise<any | null> {
  const res = await apiService.getTrip(tripId);
  return recordOf(res?.data, recordType)?.data ?? null;
}
