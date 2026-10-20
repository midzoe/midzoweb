import React, { useCallback, useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { Badge, Field, IconButton, PrimaryButton, SecondaryButton, Select, TextInput } from './ui';

/**
 * Voyages et projets d'un client, gérés par son conseiller : création d'un voyage (étapes,
 * dates, services), statut du voyage, avancement de chaque service avec commentaire et lien
 * de document visibles par le client, checklist de départ. Chaque changement qui concerne le
 * client lui est notifié (côté serveur).
 */

interface Service { id: number; type: string; label: string; status: string; note?: string | null; documentUrl?: string | null; data?: any }
interface Item { id: number; label: string; isDone: boolean }
interface Trip {
  id: number; title: string; status: string; startDate?: string | null; endDate?: string | null; createdByAdminId?: number | null;
  destinations: { country: string; city?: string | null }[]; services: Service[]; checklistItems: Item[];
  readiness: { total: number; done: number; ready: boolean };
}

const RECORDS: Record<string, string> = { study_project: 'Projet d’études', tourism_project: 'Projet de voyage' };
const TRIP_STATUS: Record<string, string> = { planning: 'En préparation', upcoming: 'À venir', ongoing: 'En cours', completed: 'Terminé' };
const SERVICE_STATUS: Record<string, string> = { pending: 'À faire', in_progress: 'En cours', done: 'Fait', cancelled: 'Annulé' };
export const SERVICE_PRESETS: { type: string; label: string }[] = [
  { type: 'study:admission', label: 'Admission' },
  { type: 'visa', label: 'Visa' },
  { type: 'accommodation', label: 'Logement' },
  { type: 'flight', label: 'Vol' },
  { type: 'insurance', label: 'Assurance' },
  { type: 'bank', label: 'Compte bancaire' },
  { type: 'language', label: 'Cours de langue' },
  { type: 'study:airport_pickup', label: 'Accueil à l’aéroport' },
  { type: 'study:recognition', label: 'Reconnaissance du diplôme' },
  { type: 'other', label: 'Autre' },
];

const fmt = (v?: string | null) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

const ServiceRow: React.FC<{ svc: Service; onChanged: () => void }> = ({ svc, onChanged }) => {
  const [status, setStatus] = useState(svc.status);
  const [note, setNote] = useState(svc.note ?? '');
  const [doc, setDoc] = useState(svc.documentUrl ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  // La ligne reste montée après le rechargement (clé = id) : on resynchronise les champs avec la
  // base sans effacer la confirmation affichée à l'admin.
  useEffect(() => { setStatus(svc.status); setNote(svc.note ?? ''); setDoc(svc.documentUrl ?? ''); }, [svc.status, svc.note, svc.documentUrl]);
  const dirty = status !== svc.status || note !== (svc.note ?? '') || doc !== (svc.documentUrl ?? '');

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      await apiService.adminUpdateTripService(svc.id, { status, note, documentUrl: doc });
      setMsg('Enregistré — client prévenu');
      onChanged();
    } catch (e: any) {
      setMsg(/http/.test(e?.message ?? '') ? 'Le lien doit commencer par http(s)://' : 'Échec de l’enregistrement');
    } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm(`Retirer « ${svc.label} » du voyage ?`)) return;
    await apiService.adminDeleteTripService(svc.id);
    onChanged();
  };

  return (
    <div className="grid gap-2 md:grid-cols-[minmax(140px,1fr)_130px_minmax(160px,2fr)_minmax(140px,1.5fr)_auto] items-center border-b border-stone-100 py-2" data-testid="admin-service-row">
      <span className={`text-sm ${status === 'cancelled' ? 'line-through text-stone-400' : 'text-stone-800'}`}>{svc.label}</span>
      <Select aria-label={`Statut de ${svc.label}`} value={status} onChange={e => setStatus(e.target.value)}>
        {Object.entries(SERVICE_STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </Select>
      <TextInput aria-label={`Message au client pour ${svc.label}`} placeholder="Message au client (visible)" value={note} onChange={e => setNote(e.target.value)} />
      <TextInput aria-label={`Lien document pour ${svc.label}`} placeholder="https://… (document)" value={doc} onChange={e => setDoc(e.target.value)} />
      <div className="flex items-center gap-1 justify-end">
        <PrimaryButton onClick={save} disabled={!dirty || busy}>{busy ? '…' : 'Enregistrer'}</PrimaryButton>
        <IconButton tone="rose" title="Retirer le service" onClick={remove}><TrashIcon className="h-4 w-4" /></IconButton>
      </div>
      {msg && <span className="md:col-span-5 text-xs text-stone-500" role="status">{msg}</span>}
    </div>
  );
};

const TripCard: React.FC<{ trip: Trip; onChanged: () => void }> = ({ trip, onChanged }) => {
  const [preset, setPreset] = useState(SERVICE_PRESETS[0].type);
  const [customLabel, setCustomLabel] = useState('');
  const [item, setItem] = useState('');
  const record = trip.services.find(s => RECORDS[s.type]);
  const services = trip.services.filter(s => !RECORDS[s.type]);
  const project = record?.data;

  const setStatus = async (status: string) => { await apiService.adminUpdateTrip(trip.id, { status }); onChanged(); };
  const addService = async () => {
    const p = SERVICE_PRESETS.find(x => x.type === preset)!;
    const label = p.type === 'other' ? customLabel.trim() : customLabel.trim() || p.label;
    if (!label) return;
    await apiService.adminAddTripService(trip.id, { type: p.type, label });
    setCustomLabel('');
    onChanged();
  };
  const addItem = async () => {
    if (!item.trim()) return;
    await apiService.adminAddTripChecklist(trip.id, item.trim());
    setItem('');
    onChanged();
  };
  const toggleItem = async (it: Item) => { await apiService.adminUpdateTripChecklist(it.id, { isDone: !it.isDone }); onChanged(); };
  const removeTrip = async () => {
    if (!window.confirm(`Supprimer le voyage « ${trip.title} » du client ? Cette action est définitive.`)) return;
    await apiService.adminDeleteTrip(trip.id);
    onChanged();
  };

  return (
    <div className="rounded-xl border border-stone-200 p-4 space-y-3" data-testid="admin-trip">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-stone-800">{trip.title}</h4>
          <p className="text-xs text-stone-500">
            {fmt(trip.startDate)} → {fmt(trip.endDate)} · {trip.destinations.map(d => d.city || d.country).join(' → ') || 'sans étape'}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {record && <Badge tone="indigo">{RECORDS[record.type]}</Badge>}
            {trip.createdByAdminId && <Badge tone="green">Créé par un conseiller</Badge>}
            <Badge tone={trip.readiness.ready ? 'green' : 'amber'}>Prêt : {trip.readiness.done}/{trip.readiness.total}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select aria-label="Statut du voyage" value={trip.status} onChange={e => setStatus(e.target.value)}>
            {Object.entries(TRIP_STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <IconButton tone="rose" title="Supprimer le voyage" onClick={removeTrip}><TrashIcon className="h-4 w-4" /></IconButton>
        </div>
      </div>

      {project && (
        <div className="text-xs text-stone-600 bg-stone-50 rounded-lg p-3">
          {[project.country && `Pays : ${project.country}`, project.level && `Niveau : ${project.level}`,
            project.cities?.length && `Villes : ${project.cities.join(', ')}`,
            project.price?.snapshot?.offerLabel && `Offre : ${project.price.snapshot.offerLabel}`,
            project.requestSentAt && `Demande envoyée le ${fmt(project.requestSentAt)}`].filter(Boolean).join(' · ')}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Services</p>
        {services.length ? services.map(s => <ServiceRow key={s.id} svc={s} onChanged={onChanged} />)
          : <p className="text-sm text-stone-400">Aucun service.</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          <Select aria-label="Service à ajouter" value={preset} onChange={e => setPreset(e.target.value)}>
            {SERVICE_PRESETS.map(p => <option key={p.type} value={p.type}>{p.label}</option>)}
          </Select>
          <TextInput aria-label="Libellé du service" placeholder="Libellé (facultatif)" value={customLabel} onChange={e => setCustomLabel(e.target.value)} className="max-w-xs" />
          <SecondaryButton onClick={addService}><PlusIcon className="h-4 w-4" /> Ajouter le service</SecondaryButton>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Checklist de départ</p>
        {trip.checklistItems.map(it => (
          <label key={it.id} className="flex items-center gap-2 text-sm py-0.5">
            <input type="checkbox" checked={it.isDone} onChange={() => toggleItem(it)} />
            <span className={it.isDone ? 'line-through text-stone-400' : 'text-stone-700'}>{it.label}</span>
          </label>
        ))}
        <div className="flex gap-2 mt-1">
          <TextInput aria-label="Élément de checklist" placeholder="Ex. Passeport valide 6 mois" value={item} onChange={e => setItem(e.target.value)} className="max-w-xs" />
          <SecondaryButton onClick={addItem}>Ajouter</SecondaryButton>
        </div>
      </div>
    </div>
  );
};

const NewTripForm: React.FC<{ userId: number; onCreated: () => void; onCancel: () => void }> = ({ userId, onCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stops, setStops] = useState([{ country: '', city: '' }]);
  const [services, setServices] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!title.trim()) { setError('Le titre est obligatoire.'); return; }
    if (start && end && end < start) { setError('La date de retour doit suivre la date de départ.'); return; }
    setBusy(true);
    try {
      await apiService.adminCreateUserTrip(userId, {
        title: title.trim(), startDate: start || undefined, endDate: end || undefined, status: 'upcoming',
        destinations: stops.filter(s => s.country.trim()),
        services: SERVICE_PRESETS.filter(p => services.includes(p.type)).map(p => ({ type: p.type, label: p.label })),
      });
      onCreated();
    } catch { setError('La création a échoué.'); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/[0.03] p-4 space-y-3" data-testid="admin-new-trip">
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Titre du voyage" required><TextInput aria-label="Titre du voyage" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex. Arrivée à Lyon — Master" /></Field>
        <Field label="Départ"><TextInput aria-label="Date de départ" type="date" value={start} onChange={e => setStart(e.target.value)} /></Field>
        <Field label="Retour"><TextInput aria-label="Date de retour" type="date" value={end} min={start || undefined} onChange={e => setEnd(e.target.value)} /></Field>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-600 mb-1">Étapes</p>
        {stops.map((s, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 mb-2">
            <TextInput aria-label={`Pays de l’étape ${i + 1}`} placeholder="Pays" value={s.country} onChange={e => setStops(stops.map((x, j) => j === i ? { ...x, country: e.target.value } : x))} />
            <TextInput aria-label={`Ville de l’étape ${i + 1}`} placeholder="Ville" value={s.city} onChange={e => setStops(stops.map((x, j) => j === i ? { ...x, city: e.target.value } : x))} />
          </div>
        ))}
        <SecondaryButton onClick={() => setStops([...stops, { country: '', city: '' }])}><PlusIcon className="h-4 w-4" /> Étape</SecondaryButton>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-600 mb-1">Services à préparer</p>
        <div className="flex flex-wrap gap-3">
          {SERVICE_PRESETS.filter(p => p.type !== 'other').map(p => (
            <label key={p.type} className="flex items-center gap-1.5 text-sm text-stone-700">
              <input type="checkbox" checked={services.includes(p.type)} onChange={() => setServices(services.includes(p.type) ? services.filter(x => x !== p.type) : [...services, p.type])} />
              {p.label}
            </label>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <SecondaryButton onClick={onCancel}>Annuler</SecondaryButton>
        <PrimaryButton onClick={submit} disabled={busy}><PaperAirplaneIcon className="h-4 w-4" /> {busy ? 'Création…' : 'Créer le voyage pour le client'}</PrimaryButton>
      </div>
    </div>
  );
};

const ClientTripsPanel: React.FC<{ userId: number }> = ({ userId }) => {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiService.adminGetUserTrips(userId);
      setTrips(res?.data ?? []);
      setError('');
    } catch { setError('Impossible de charger les voyages.'); }
  }, [userId]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3" data-testid="client-trips">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{trips ? `${trips.length} voyage${trips.length > 1 ? 's' : ''} / projet${trips.length > 1 ? 's' : ''}` : 'Chargement…'}</p>
        {!creating && <PrimaryButton onClick={() => setCreating(true)}><PlusIcon className="h-4 w-4" /> Créer un voyage</PrimaryButton>}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {creating && <NewTripForm userId={userId} onCancel={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
      {trips?.map(t => <TripCard key={t.id} trip={t} onChanged={load} />)}
      {trips && !trips.length && !creating && <p className="text-sm text-stone-400">Ce client n’a encore aucun voyage ni projet.</p>}
    </div>
  );
};

export default ClientTripsPanel;
