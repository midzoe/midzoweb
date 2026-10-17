import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, ArrowsRightLeftIcon,
  ArrowLongRightIcon, PaperAirplaneIcon, TicketIcon, BriefcaseIcon, GlobeAltIcon,
  ExclamationTriangleIcon, EyeSlashIcon, AcademicCapIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select, Modal, BoolPill,
} from './ui';

/**
 * Vols — catalogue affiché sur les pages Vols et Vols étudiants.
 *
 * Un vol n'a de sens que dans une ROUTE : un couple pays de départ → pays d'arrivée.
 * L'écran suit donc le geste réel de l'admin — « je choisis la route, puis je relis
 * les billets qu'elle propose » — au lieu d'aligner tous les vols du catalogue dans
 * une table où chaque ligne répète son origine et sa destination.
 *
 * Tant que les deux pays ne sont pas choisis, la liste des routes tient lieu de
 * navigation : c'est l'écran vide qui sert d'index.
 *
 * `audience` sépare le catalogue grand public (general) de l'espace études (student) :
 * une même route porte souvent les deux, d'où le filtre au-dessus des billets.
 */

interface FlightRow {
  id: number;
  airline: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  departure: string;
  arrival: string;
  price: string;
  type: string;
  audience?: string | null;
  duration?: string | null;
  stops?: number | null;
  baggage?: string | null;
  features?: string[] | null;
  image?: string | null;
  isActive?: boolean;
}

type Form = {
  airline: string; audience: string; fromCity: string; fromCountry: string;
  toCity: string; toCountry: string; departure: string; arrival: string;
  price: string; type: string; duration: string; stops: string; baggage: string;
  features: string; image: string; isActive: boolean;
};

const emptyForm: Form = {
  airline: '', audience: 'general', fromCity: '', fromCountry: '', toCity: '', toCountry: '',
  departure: '', arrival: '', price: '', type: '', duration: '', stops: '0', baggage: '',
  features: '', image: '', isActive: true,
};

const str = (v?: string | null) => (v ?? '').trim();
const dash = (v?: string | null) => str(v) || '—';
const list = (v?: string[] | null) => (Array.isArray(v) ? v.filter(Boolean) : []);

const toForm = (f: FlightRow): Form => ({
  airline: str(f.airline), audience: str(f.audience) || 'general',
  fromCity: str(f.fromCity), fromCountry: str(f.fromCountry),
  toCity: str(f.toCity), toCountry: str(f.toCountry),
  departure: str(f.departure), arrival: str(f.arrival),
  price: str(f.price), type: str(f.type), duration: str(f.duration),
  stops: String(f.stops ?? 0), baggage: str(f.baggage),
  features: list(f.features).join(', '), image: str(f.image),
  isActive: f.isActive !== false,
});

/** Le prix est stocké en texte libre (« $180 », « 180 000 FCFA ») : on n'en extrait que le nombre pour trier. */
const priceValue = (p?: string | null) => {
  const n = parseFloat(str(p).replace(/[^\d.,]/g, '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

/**
 * Les horaires sont saisis librement, en 12 h (« 9:00 AM ») comme en 24 h (« 21:00 ») :
 * un tri alphabétique placerait « 11:00 AM » avant « 9:00 AM ». On ramène en minutes.
 */
const timeValue = (t?: string | null) => {
  const m = /(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)?/i.exec(str(t));
  if (!m) return Number.POSITIVE_INFINITY;
  let h = parseInt(m[1], 10);
  const meridiem = m[3]?.toLowerCase();
  if (meridiem === 'pm' && h < 12) h += 12;
  if (meridiem === 'am' && h === 12) h = 0;
  return h * 60 + parseInt(m[2], 10);
};

const routeKey = (from: string, to: string) => `${from} → ${to}`;
const stopsLabel = (n?: number | null) => (!n ? 'direct' : `${n} escale${n > 1 ? 's' : ''}`);

const AudienceBadge: React.FC<{ audience?: string | null }> = ({ audience }) =>
  audience === 'student' ? (
    <Badge tone="indigo"><AcademicCapIcon className="h-3.5 w-3.5" /> Étudiant</Badge>
  ) : (
    <Badge tone="slate">Grand public</Badge>
  );

/* ── Le billet : ce que l'admin doit pouvoir relire d'un coup d'œil ──────────── */

const TicketCard: React.FC<{
  flight: FlightRow;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ flight, onEdit, onDelete }) => {
  const features = list(flight.features);
  return (
    <Card className={`p-4 transition-shadow duration-200 hover:shadow-card-hover sm:p-5 ${flight.isActive === false ? 'opacity-70' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-stone-800">{dash(flight.airline)}</span>
            {str(flight.type) && <Badge tone="amber">{flight.type}</Badge>}
            <AudienceBadge audience={flight.audience} />
            {flight.isActive === false && (
              <Badge tone="rose"><EyeSlashIcon className="h-3.5 w-3.5" /> Hors ligne</Badge>
            )}
          </div>

          {/* Trajet en « carte d'embarquement » : heures aux extrémités, durée au milieu. */}
          <div className="mt-4 flex items-center gap-3">
            <div className="shrink-0 text-right">
              <div className="font-display text-xl font-semibold tabular-nums text-stone-800">{dash(flight.departure)}</div>
              <div className="text-xs text-stone-400">{dash(flight.fromCity)}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
                <span className="h-px flex-1 bg-stone-200" />
                <PaperAirplaneIcon className="h-4 w-4 shrink-0 text-gold-500" />
                <span className="h-px flex-1 bg-stone-200" />
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
              </div>
              <p className="mt-1 text-center text-[11px] text-stone-400">
                {str(flight.duration) ? `${flight.duration} · ` : ''}{stopsLabel(flight.stops)}
              </p>
            </div>
            <div className="shrink-0">
              <div className="font-display text-xl font-semibold tabular-nums text-stone-800">{dash(flight.arrival)}</div>
              <div className="text-xs text-stone-400">{dash(flight.toCity)}</div>
            </div>
          </div>

          {(str(flight.baggage) || features.length > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
              {str(flight.baggage) && (
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseIcon className="h-4 w-4 text-stone-400" /> {flight.baggage}
                </span>
              )}
              {features.slice(0, 4).map(f => (
                <span key={f} className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-600">{f}</span>
              ))}
              {features.length > 4 && (
                <span title={features.slice(4).join(', ')} className="text-stone-400">
                  +{features.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Prix et actions : la colonne de décision, isolée du contenu du billet. */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-stone-100 pt-3 sm:w-40 sm:flex-col sm:items-end sm:justify-start sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="text-right">
            <div className="font-display text-2xl font-semibold tabular-nums text-stone-800">{dash(flight.price)}</div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-stone-400">par personne</div>
          </div>
          <div className="flex items-center gap-1 sm:mt-3">
            <IconButton tone="blue" title="Modifier ce vol" onClick={onEdit}><PencilSquareIcon className="h-4 w-4" /></IconButton>
            <IconButton tone="rose" title="Supprimer ce vol" onClick={onDelete}><TrashIcon className="h-4 w-4" /></IconButton>
          </div>
        </div>
      </div>
    </Card>
  );
};

/* ── Écran ───────────────────────────────────────────────────────────────────── */

const AdminFlights: React.FC = () => {
  const [items, setItems] = useState<FlightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [audience, setAudience] = useState<'all' | 'general' | 'student'>('all');
  const [sort, setSort] = useState<'price' | 'departure' | 'airline'>('price');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetFlights();
      const data = res?.data ?? res?.items ?? res;
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('Chargement impossible — vérifiez que le backend répond.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Routes ──────────────────────────────────────────────────────────────── */

  /** Une entrée par couple origine → destination réellement présent en base. */
  const routes = useMemo(() => {
    const map = new Map<string, { from: string; to: string; total: number; online: number; student: number; airlines: Set<string>; minPrice: number }>();
    for (const f of items) {
      const from = str(f.fromCountry);
      const to = str(f.toCountry);
      if (!from || !to) continue;
      const key = routeKey(from, to);
      const r = map.get(key) ?? { from, to, total: 0, online: 0, student: 0, airlines: new Set<string>(), minPrice: Number.POSITIVE_INFINITY };
      r.total += 1;
      if (f.isActive !== false) r.online += 1;
      if (f.audience === 'student') r.student += 1;
      if (str(f.airline)) r.airlines.add(str(f.airline));
      r.minPrice = Math.min(r.minPrice, priceValue(f.price));
      map.set(key, r);
    }
    return [...map.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
  }, [items]);

  const originOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of routes) counts.set(r.from, (counts.get(r.from) ?? 0) + r.total);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [routes]);

  /** Les destinations proposées sont celles réellement desservies depuis l'origine choisie. */
  const destinationOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of routes) {
      if (origin && r.from !== origin) continue;
      counts.set(r.to, (counts.get(r.to) ?? 0) + r.total);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [routes, origin]);

  // Une destination qui n'est plus desservie depuis la nouvelle origine ne doit pas
  // rester sélectionnée en silence : la liste des billets serait vide sans raison lisible.
  useEffect(() => {
    if (destination && !destinationOptions.some(([c]) => c === destination)) setDestination('');
  }, [destinationOptions, destination]);

  const routeChosen = !!origin && !!destination;

  /** Routes proposées en écran d'accueil, restreintes à la sélection partielle en cours. */
  const visibleRoutes = useMemo(
    () => routes.filter(r => (!origin || r.from === origin) && (!destination || r.to === destination)),
    [routes, origin, destination],
  );

  const tickets = useMemo(() => {
    if (!routeChosen) return [];
    return items
      .filter(f => str(f.fromCountry) === origin && str(f.toCountry) === destination)
      .filter(f => audience === 'all' || (f.audience ?? 'general') === audience)
      .sort((a, b) => {
        if (sort === 'price') return priceValue(a.price) - priceValue(b.price);
        if (sort === 'departure') return timeValue(a.departure) - timeValue(b.departure);
        return str(a.airline).localeCompare(str(b.airline));
      });
  }, [items, origin, destination, routeChosen, audience, sort]);

  const stats = useMemo(() => ({
    total: items.length,
    offline: items.filter(f => f.isActive === false).length,
    routes: routes.length,
    airlines: new Set(items.map(f => str(f.airline)).filter(Boolean)).size,
    student: items.filter(f => f.audience === 'student').length,
  }), [items, routes]);

  /* ── CRUD ────────────────────────────────────────────────────────────────── */

  const openCreate = () => {
    setEditingId(null);
    // La route en cours est pré-remplie : on crée un billet là où on est en train de lire.
    setForm({ ...emptyForm, fromCountry: origin, toCountry: destination });
    setShowForm(true);
  };

  const openEdit = (f: FlightRow) => {
    setEditingId(f.id);
    setForm(toForm(f));
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const payload = { ...form, stops: parseInt(form.stops, 10) || 0 };
    try {
      if (editingId !== null) await apiService.adminUpdateFlight(editingId, payload);
      else await apiService.adminCreateFlight(payload);
      setShowForm(false);
      // Un vol créé sur une autre route resterait invisible : on suit la route enregistrée.
      setOrigin(str(form.fromCountry));
      setDestination(str(form.toCountry));
      await load();
    } catch {
      setError('Enregistrement refusé — vérifiez les champs obligatoires.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f: FlightRow) => {
    if (!confirm(`Supprimer le vol ${str(f.airline)} ${str(f.fromCity)} → ${str(f.toCity)} ?`)) return;
    try {
      await apiService.adminDeleteFlight(f.id);
      await load();
    } catch {
      setError('Suppression impossible.');
    }
  };

  const set = (k: keyof Form, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  /* ── Rendu ───────────────────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader
        title="Vols"
        subtitle="Choisissez le pays de départ puis le pays d'arrivée : les billets de cette route s'affichent avec leurs horaires, leurs classes et leurs prix."
        actions={
          <>
            <SecondaryButton onClick={load}>
              <ArrowPathIcon className="h-4 w-4" /> Actualiser
            </SecondaryButton>
            <PrimaryButton onClick={openCreate}>
              <PlusIcon className="h-4 w-4" /> Ajouter un vol
            </PrimaryButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Billets" value={stats.total} icon={TicketIcon} hint={`${stats.student} pour les étudiants`} />
        <StatCard label="Routes desservies" value={stats.routes} icon={GlobeAltIcon} tone="primary" hint="couples départ → arrivée" />
        <StatCard label="Compagnies" value={stats.airlines} icon={PaperAirplaneIcon} tone="gold" />
        <StatCard label="Hors ligne" value={stats.offline} icon={EyeSlashIcon} tone="rose" hint="invisibles sur le site" />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Sélecteur de route : le point d'entrée de l'écran. */}
      <Card className="mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field label="Pays de départ">
              <Select value={origin} onChange={e => setOrigin(e.target.value)}>
                <option value="">— Tous les pays —</option>
                {originOptions.map(([c, n]) => (
                  <option key={c} value={c}>{c} ({n})</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex justify-center sm:pb-1">
            <IconButton
              tone="amber"
              title="Inverser départ et arrivée"
              onClick={() => { setOrigin(destination); setDestination(origin); }}
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
            </IconButton>
          </div>

          <div className="min-w-0 flex-1">
            <Field label="Pays d'arrivée">
              <Select value={destination} onChange={e => setDestination(e.target.value)}>
                <option value="">{origin ? `— Toutes les destinations depuis ${origin} —` : '— Toutes les destinations —'}</option>
                {destinationOptions.map(([c, n]) => (
                  <option key={c} value={c}>{c} ({n})</option>
                ))}
              </Select>
            </Field>
          </div>

          {(origin || destination) && (
            <div className="shrink-0 sm:pb-0.5">
              <SecondaryButton onClick={() => { setOrigin(''); setDestination(''); }}>Réinitialiser</SecondaryButton>
            </div>
          )}
        </div>
      </Card>

      {loading ? (
        <Card className="py-20 text-center text-sm text-stone-400">Chargement…</Card>
      ) : routeChosen ? (
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex flex-wrap items-center gap-2 font-display text-2xl font-semibold text-stone-800">
                {origin}
                <ArrowLongRightIcon className="h-5 w-5 shrink-0 text-gold-500" aria-hidden="true" />
                {destination}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {tickets.length} billet{tickets.length > 1 ? 's' : ''}
                {audience !== 'all' && ' pour ce public'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtre public : une même route sert souvent le grand public et les étudiants. */}
              <div className="inline-flex rounded-lg border border-stone-300 p-0.5">
                {([['all', 'Tous'], ['general', 'Grand public'], ['student', 'Étudiants']] as const).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAudience(v)}
                    aria-pressed={audience === v}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      audience === v ? 'bg-primary text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="w-44">
                <Select value={sort} onChange={e => setSort(e.target.value as typeof sort)} aria-label="Trier les billets">
                  <option value="price">Prix croissant</option>
                  <option value="departure">Heure de départ</option>
                  <option value="airline">Compagnie</option>
                </Select>
              </div>
            </div>
          </div>

          {tickets.length === 0 ? (
            <Card className="px-6 py-16 text-center">
              <TicketIcon className="mx-auto h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">
                Aucun billet {audience === 'student' ? 'étudiant ' : audience === 'general' ? 'grand public ' : ''}
                sur {origin} → {destination}.
              </p>
              <div className="mt-4 flex justify-center">
                <PrimaryButton onClick={openCreate}>
                  <PlusIcon className="h-4 w-4" /> Ajouter un vol sur cette route
                </PrimaryButton>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map(f => (
                <TicketCard key={f.id} flight={f} onEdit={() => openEdit(f)} onDelete={() => handleDelete(f)} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Écran d'accueil : les routes existantes servent d'index cliquable. */
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            {origin ? `Destinations depuis ${origin}` : destination ? `Départs vers ${destination}` : 'Routes du catalogue'}
          </h2>
          {visibleRoutes.length === 0 ? (
            <Card className="px-6 py-16 text-center">
              <PaperAirplaneIcon className="mx-auto h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">Aucun vol au catalogue pour l'instant.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleRoutes.map(r => (
                <button
                  key={routeKey(r.from, r.to)}
                  type="button"
                  onClick={() => { setOrigin(r.from); setDestination(r.to); }}
                  className="group rounded-2xl border border-stone-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <div className="flex items-center gap-2 font-medium text-stone-800">
                    <span className="min-w-0 truncate">{r.from}</span>
                    <ArrowLongRightIcon className="h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
                    <span className="min-w-0 truncate">{r.to}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
                    <span className="tabular-nums">{r.total} billet{r.total > 1 ? 's' : ''}</span>
                    <span>{r.airlines.size} compagnie{r.airlines.size > 1 ? 's' : ''}</span>
                    {r.student > 0 && <span className="text-indigo-500">{r.student} étudiant{r.student > 1 ? 's' : ''}</span>}
                    {r.online < r.total && <span className="text-rose-500">{r.total - r.online} hors ligne</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {showForm && (
        <Modal
          title={`${editingId !== null ? 'Modifier' : 'Ajouter'} un vol`}
          onClose={() => setShowForm(false)}
          maxWidth="max-w-3xl"
          footer={
            <>
              <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                <CheckIcon className="h-4 w-4" />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Compagnie" required>
              <TextInput value={form.airline} onChange={e => set('airline', e.target.value)} placeholder="Air France" />
            </Field>
            <Field label="Public" required>
              <Select value={form.audience} onChange={e => set('audience', e.target.value)}>
                <option value="general">Grand public</option>
                <option value="student">Étudiant</option>
              </Select>
            </Field>

            <Field label="Ville de départ" required>
              <TextInput value={form.fromCity} onChange={e => set('fromCity', e.target.value)} placeholder="Paris" />
            </Field>
            <Field label="Pays de départ" required>
              <TextInput value={form.fromCountry} onChange={e => set('fromCountry', e.target.value)} placeholder="France" list="flight-countries" />
            </Field>

            <Field label="Ville d'arrivée" required>
              <TextInput value={form.toCity} onChange={e => set('toCity', e.target.value)} placeholder="Rome" />
            </Field>
            <Field label="Pays d'arrivée" required>
              <TextInput value={form.toCountry} onChange={e => set('toCountry', e.target.value)} placeholder="Italy" list="flight-countries" />
            </Field>

            {/* Placeholders alignés sur la convention déjà en base (« 9:00 AM », « 2h »). */}
            <Field label="Heure de départ" required>
              <TextInput value={form.departure} onChange={e => set('departure', e.target.value)} placeholder="9:00 AM" />
            </Field>
            <Field label="Heure d'arrivée" required>
              <TextInput value={form.arrival} onChange={e => set('arrival', e.target.value)} placeholder="11:00 AM" />
            </Field>

            <Field label="Durée">
              <TextInput value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="2h" />
            </Field>
            <Field label="Escales (nombre)">
              <TextInput type="number" min={0} value={form.stops} onChange={e => set('stops', e.target.value)} />
            </Field>

            <Field label="Prix" required>
              <TextInput value={form.price} onChange={e => set('price', e.target.value)} placeholder="$180" />
            </Field>
            <Field label="Classe / type" required>
              <TextInput value={form.type} onChange={e => set('type', e.target.value)} placeholder="Economy" />
            </Field>

            <Field label="Bagages">
              <TextInput value={form.baggage} onChange={e => set('baggage', e.target.value)} placeholder="1x23kg" />
            </Field>
            <Field label="Image (URL)">
              <TextInput value={form.image} onChange={e => set('image', e.target.value)} />
            </Field>
          </div>

          {/* Les listes se saisissent en texte : le backend (lib/directory-input) les convertit. */}
          <Field label="Services (séparés par des virgules)">
            <TextArea rows={2} value={form.features} onChange={e => set('features', e.target.value)} placeholder="Wifi, Repas, Bagage cabine" />
          </Field>

          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
            />
            <span className="text-sm text-stone-600">Visible sur le site</span>
            <BoolPill value={form.isActive} yes="En ligne" no="Hors ligne" />
          </label>

          {/* Réutiliser les pays déjà saisis évite les doublons « Italy » / « Italie ». */}
          <datalist id="flight-countries">
            {[...new Set(items.flatMap(f => [str(f.fromCountry), str(f.toCountry)]).filter(Boolean))]
              .sort()
              .map(c => <option key={c} value={c} />)}
          </datalist>
        </Modal>
      )}
    </div>
  );
};

export default AdminFlights;
