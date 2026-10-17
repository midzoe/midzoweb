import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Epic 7 UI (7.7 dashboard, 7.8 assistant multi-destination, 7.9 checklist « prêt avant départ »).
// Espace voyage autonome branché sur les endpoints /trips (vérifiés E2E 17/17).
interface Destination { id?: number; country: string; city?: string; order?: number }
interface TripService { id: number; type: string; label: string; status: string }
interface ChecklistItem { id: number; label: string; category?: string; isDone: boolean }
interface Trip {
  id: number;
  title: string;
  status: string;
  startDate?: string;
  endDate?: string;
  destinations: Destination[];
  services?: TripService[];
  checklistItems?: ChecklistItem[];
}
interface Readiness { ready: boolean; done: number; total: number; missing: { kind: string; label: string }[] }

const SERVICE_TYPES = ['flight', 'accommodation', 'visa', 'insurance', 'bank', 'language'];

const MyTripsSpace: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [history, setHistory] = useState<Trip[]>([]);
  const [nextTrip, setNextTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [selected, setSelected] = useState<Trip | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulaire nouveau trip (assistant multi-destination).
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newDests, setNewDests] = useState<Destination[]>([{ country: '', city: '' }]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h, n, a] = await Promise.all([
        apiService.getTrips(), apiService.getTripHistory(), apiService.getNextDeparture(), apiService.getTripActivities(),
      ]);
      setTrips(t.data ?? []);
      setHistory(h.data ?? []);
      setNextTrip(n.data ?? null);
      setActivities(a.data ?? []);
    } catch { /* non connecté */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openTrip = async (id: number) => {
    const res = await apiService.getTrip(id);
    setSelected(res.data ?? null);
    const chk = await apiService.getTripChecklist(id);
    setReadiness(chk.readiness ?? null);
  };

  const refreshSelected = async () => { if (selected) await openTrip(selected.id); };

  const createTrip = async () => {
    if (!newTitle) return;
    const destinations = newDests.filter(d => d.country).map((d, i) => ({ ...d, order: i }));
    await apiService.createTrip({ title: newTitle, status: 'upcoming', startDate: newStart || undefined, destinations });
    setNewTitle(''); setNewStart(''); setNewDests([{ country: '', city: '' }]);
    await loadAll();
  };

  const addService = async (type: string) => {
    if (!selected) return;
    await apiService.addTripService(selected.id, { type, label: `${type} — ${selected.title}` });
    await refreshSelected();
    await loadAll();
  };

  const toggleService = async (svc: TripService) => {
    await apiService.updateTripService(svc.id, { status: svc.status === 'done' ? 'pending' : 'done' });
    await refreshSelected();
  };

  const addChecklist = async (label: string) => {
    if (!selected || !label) return;
    await apiService.addChecklistItem(selected.id, { label });
    await refreshSelected();
  };

  const toggleChecklist = async (item: ChecklistItem) => {
    await apiService.updateChecklistItem(item.id, { isDone: !item.isDone });
    await refreshSelected();
  };

  const [newItemLabel, setNewItemLabel] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h1 className="text-4xl font-bold text-primary">Mon espace voyage</h1>

        {/* 7.7 — Prochain départ */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Prochain départ</h2>
          {nextTrip ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">{nextTrip.title}</p>
                <p className="text-sm text-gray-500">
                  {nextTrip.startDate ? new Date(nextTrip.startDate).toLocaleDateString() : '—'} ·{' '}
                  {(nextTrip.destinations || []).map(d => d.city || d.country).join(' → ')}
                </p>
              </div>
              <button onClick={() => openTrip(nextTrip.id)} className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">Ouvrir</button>
            </div>
          ) : <p className="text-gray-500">Aucun départ à venir. Créez un voyage ci-dessous.</p>}
        </section>

        {/* 7.8 — Assistant : nouveau trip multi-destination */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nouveau voyage</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titre du voyage" className="border-gray-300 rounded-md" />
            <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} className="border-gray-300 rounded-md" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-2">Destinations</p>
          {newDests.map((d, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 mb-2">
              <input value={d.country} onChange={e => { const c = [...newDests]; c[i] = { ...c[i], country: e.target.value }; setNewDests(c); }} placeholder="Pays" className="border-gray-300 rounded-md" />
              <input value={d.city ?? ''} onChange={e => { const c = [...newDests]; c[i] = { ...c[i], city: e.target.value }; setNewDests(c); }} placeholder="Ville" className="border-gray-300 rounded-md" />
            </div>
          ))}
          <div className="flex gap-3 mt-3">
            <button onClick={() => setNewDests([...newDests, { country: '', city: '' }])} className="text-sm text-primary border border-primary px-3 py-1.5 rounded-md">+ Destination</button>
            <button onClick={createTrip} className="text-sm bg-primary text-white px-4 py-1.5 rounded-md hover:bg-primary/90">Créer le voyage</button>
          </div>
        </section>

        {/* Mes voyages */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes voyages</h2>
          {loading ? <p className="text-gray-500">Chargement…</p> : (
            <div className="grid md:grid-cols-2 gap-4">
              {trips.length ? trips.map(tr => (
                <button key={tr.id} onClick={() => openTrip(tr.id)} className={`text-left border rounded-lg p-4 hover:shadow ${selected?.id === tr.id ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
                  <p className="font-medium text-primary">{tr.title}</p>
                  <p className="text-sm text-gray-500">{tr.status} · {(tr.destinations || []).map(d => d.city || d.country).join(' → ')}</p>
                </button>
              )) : <p className="text-gray-500">Aucun voyage pour l'instant.</p>}
            </div>
          )}
        </section>

        {/* Détail trip sélectionné : services + 7.9 checklist */}
        {selected && (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{selected.title}</h2>
              <button onClick={async () => { await apiService.deleteTrip(selected.id); setSelected(null); await loadAll(); }} className="text-sm text-red-600">Supprimer</button>
            </div>

            {/* Services dynamiques */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Services</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {SERVICE_TYPES.map(tp => (
                  <button key={tp} onClick={() => addService(tp)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full">+ {tp}</button>
                ))}
              </div>
              <div className="space-y-2">
                {(selected.services || []).map(svc => (
                  <label key={svc.id} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={svc.status === 'done'} onChange={() => toggleService(svc)} />
                    <span className={svc.status === 'done' ? 'line-through text-gray-400' : ''}>{svc.label} <span className="text-gray-400">({svc.type})</span></span>
                  </label>
                ))}
              </div>
            </div>

            {/* 7.9 — Checklist « prêt avant départ » */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Checklist de préparation</p>
                {readiness && (
                  <span className={`text-xs px-2 py-1 rounded-full ${readiness.ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {readiness.ready ? 'Tout est prêt ✓' : `${readiness.done}/${readiness.total} prêt`}
                  </span>
                )}
              </div>
              {readiness && readiness.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${(readiness.done / readiness.total) * 100}%` }} />
                </div>
              )}
              <div className="space-y-2 mb-3">
                {(selected.checklistItems || []).map(item => (
                  <label key={item.id} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={item.isDone} onChange={() => toggleChecklist(item)} />
                    <span className={item.isDone ? 'line-through text-gray-400' : ''}>{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} placeholder="Nouvel élément…" className="flex-1 border-gray-300 rounded-md text-sm" />
                <button onClick={async () => { await addChecklist(newItemLabel); setNewItemLabel(''); }} className="text-sm bg-primary text-white px-3 py-1.5 rounded-md">Ajouter</button>
              </div>
            </div>
          </section>
        )}

        {/* 7.6/7.7 — Historique + activités récentes */}
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Historique de voyage</h2>
            {history.length ? history.map(tr => (
              <div key={tr.id} className="border-b border-gray-100 py-2 text-sm">
                <span className="font-medium">{tr.title}</span>
                <span className="text-gray-400"> · {tr.endDate ? new Date(tr.endDate).toLocaleDateString() : '—'}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">Aucun voyage passé.</p>}
          </section>
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Activités récentes</h2>
            {activities.length ? activities.slice(0, 8).map((a, i) => (
              <div key={i} className="border-b border-gray-100 py-2 text-sm text-gray-600">
                {a.label} <span className="text-gray-400">· {a.tripTitle}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">Aucune activité récente.</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyTripsSpace;
