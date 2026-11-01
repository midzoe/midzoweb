import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { Badge, Card, EmptyRow, IconButton, PageHeader, PrimaryButton, Select, TableShell, TextInput } from './ui';

/**
 * Consultations (25 €) : horaires d'ouverture des rendez-vous, en heure d'Allemagne, et
 * rendez-vous à venir. Changer les horaires ne touche pas aux rendez-vous déjà pris : ils
 * restent réservés et leur créneau ne peut pas être revendu.
 */

interface Availability {
  timezone: string;
  slotMinutes: number;
  leadHours: number;
  horizonDays: number;
  weekly: Record<string, [string, string][]>;
  closedDates: string[];
}

interface Booking {
  id: number;
  slot_start: string;
  status: 'held' | 'confirmed';
  label: string;
  purchase_id: number;
  user: { username: string; email: string; firstName?: string | null; lastName?: string | null } | null;
}

/** Lundi d'abord ; 0 = dimanche comme côté serveur. */
const DAYS: [string, string][] = [['1', 'Lundi'], ['2', 'Mardi'], ['3', 'Mercredi'], ['4', 'Jeudi'], ['5', 'Vendredi'], ['6', 'Samedi'], ['0', 'Dimanche']];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

const AdminConsultations: React.FC = () => {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);
  const [closedInput, setClosedInput] = useState('');

  const load = () => apiService.adminGetConsultations()
    .then((r: any) => { setAvailability(r.availability); setBookings(r.bookings ?? []); })
    .catch(() => setError('Impossible de charger les consultations.'));
  useEffect(() => { load(); }, []);

  if (!availability) {
    return <div className="p-6 lg:p-10">{error ? <p className="text-sm text-rose-600">{error}</p> : <p className="text-sm text-stone-500">Chargement…</p>}</div>;
  }

  const edit = (patch: Partial<Availability>) => { setSaved(''); setError(''); setAvailability({ ...availability, ...patch }); };
  const setRanges = (day: string, ranges: [string, string][]) => edit({ weekly: { ...availability.weekly, [day]: ranges } });

  const save = async () => {
    setSaving(true);
    try {
      const r: any = await apiService.adminUpdateConsultationAvailability(availability);
      setAvailability(r.availability);
      setSaved('Horaires enregistrés. Les rendez-vous déjà pris ne changent pas.');
      load();
    } catch (e: any) {
      setError(e?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const clientName = (b: Booking) => [b.user?.firstName, b.user?.lastName].filter(Boolean).join(' ') || b.user?.username || '—';

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <PageHeader
        title="Consultations"
        subtitle="Horaires des rendez-vous en heure d'Allemagne (heure d'été comprise). Chaque client les voit à son heure locale."
      />

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-stone-800">Horaires d'ouverture</h2>
        <p className="text-sm text-stone-500 mt-1">
          Heure d'Allemagne ({availability.timezone}). Un créneau commence toutes les {availability.slotMinutes} min dans chaque plage.
          Modifier ces horaires ne change aucun rendez-vous déjà pris.
        </p>

        <div className="mt-5 divide-y divide-stone-100">
          {DAYS.map(([day, name]) => {
            const ranges = availability.weekly[day] ?? [];
            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-3 py-3">
                <span className="w-28 shrink-0 pt-2 text-sm font-medium text-stone-700">{name}</span>
                <div className="flex-1 space-y-2">
                  {ranges.length === 0 && <p className="pt-2 text-sm text-stone-400">Fermé</p>}
                  {ranges.map(([from, to], i) => (
                    <div key={i} className="flex items-center gap-2">
                      <TextInput type="time" aria-label={`${name} : début de la plage ${i + 1}`} value={from} className="max-w-[9rem]"
                        onChange={e => setRanges(day, ranges.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
                      <span className="text-stone-400">→</span>
                      <TextInput type="time" aria-label={`${name} : fin de la plage ${i + 1}`} value={to} className="max-w-[9rem]"
                        onChange={e => setRanges(day, ranges.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
                      <IconButton title="Retirer cette plage" tone="rose" onClick={() => setRanges(day, ranges.filter((_, j) => j !== i))}>
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setRanges(day, [...ranges, ['18:00', '21:00']])}
                  className="inline-flex items-center gap-1 self-start pt-2 text-sm font-medium text-primary hover:underline">
                  <PlusIcon className="h-4 w-4" /> Ajouter une plage
                </button>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <label className="text-sm text-stone-700">
            Durée d'un rendez-vous
            <Select value={availability.slotMinutes} onChange={e => edit({ slotMinutes: Number(e.target.value) })}>
              {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
            </Select>
          </label>
          <label className="text-sm text-stone-700">
            Réservable au plus tôt (heures avant)
            <TextInput type="number" min={0} max={168} value={availability.leadHours} onChange={e => edit({ leadHours: Number(e.target.value) })} />
          </label>
          <label className="text-sm text-stone-700">
            Réservable jusqu'à (jours à l'avance)
            <TextInput type="number" min={1} max={120} value={availability.horizonDays} onChange={e => edit({ horizonDays: Number(e.target.value) })} />
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-stone-700">Jours fermés (congés, jours fériés)</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {availability.closedDates.map(d => (
              <span key={d} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
                {new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                <button type="button" aria-label={`Rouvrir le ${d}`} onClick={() => edit({ closedDates: availability.closedDates.filter(x => x !== d) })}
                  className="ml-1 text-stone-400 hover:text-rose-600">×</button>
              </span>
            ))}
            <TextInput type="date" aria-label="Jour à fermer" value={closedInput} onChange={e => setClosedInput(e.target.value)} className="max-w-[11rem]" />
            <button type="button" disabled={!closedInput} onClick={() => { edit({ closedDates: [...new Set([...availability.closedDates, closedInput])].sort() }); setClosedInput(''); }}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-40">Fermer ce jour</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <PrimaryButton onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer les horaires'}</PrimaryButton>
          {saved && <span className="text-sm text-emerald-700">{saved}</span>}
          {error && <span className="text-sm text-rose-600">{error}</span>}
        </div>
      </Card>

      <div>
        <h2 className="font-display text-lg font-semibold text-stone-800 mb-3">Rendez-vous à venir</h2>
        <TableShell head={<><th>Date (heure d'Allemagne)</th><th>Client</th><th>Statut</th><th>Achat</th></>}>
          {bookings.length === 0 ? <EmptyRow colSpan={4}>Aucun rendez-vous à venir</EmptyRow> : bookings.map(b => (
            <tr key={b.id}>
              <td className="px-4 py-3 text-stone-800">{b.label}</td>
              <td className="px-4 py-3">
                <span className="text-stone-800">{clientName(b)}</span>
                {b.user?.email && <span className="block text-xs text-stone-400">{b.user.email}</span>}
              </td>
              <td className="px-4 py-3">
                {b.status === 'confirmed' ? <Badge tone="green">Payé</Badge> : <Badge tone="amber">Paiement en cours</Badge>}
              </td>
              <td className="px-4 py-3 text-stone-500">#{b.purchase_id}</td>
            </tr>
          ))}
        </TableShell>
      </div>
    </div>
  );
};

export default AdminConsultations;
