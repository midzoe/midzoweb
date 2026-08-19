import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon,
  BuildingLibraryIcon, CheckCircleIcon, EyeSlashIcon, ExclamationTriangleIcon,
  MapPinIcon, LinkIcon, GlobeAltIcon, XMarkIcon,
  ArrowLongRightIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, Select, Modal, TableShell, EmptyRow,
} from './ui';
import { AFRICAN_COUNTRIES, africanCountryLabel } from '../../data/africanCountries';

/**
 * Représentations diplomatiques — stories 4.8 / 4.10.
 *
 * Une mission se définit par un COUPLE : le pays qu'elle représente (`country`,
 * ex. France) et le pays où elle se trouve (`hostCountry`, ex. Togo). C'est ce
 * couple qui permet de répondre à « je pars du Togo pour la France, où déposer
 * mon dossier ? » — la réponse depuis le Sénégal étant forcément différente.
 *
 * Même navigation que les fiches visa : le pays représenté se choisit dans le rail
 * de gauche, ses missions se relisent dans une table dense à droite. Une grille de
 * 168 cartes ne se parcourt pas.
 *
 * L'écran est piloté par les FICHES VISA : chaque fiche est une route
 * origine → destination qui a besoin d'une mission compétente ET vérifiée pour
 * afficher une adresse au visiteur. Les routes sans mission sont donc listées sous
 * la table de leur destination, avec de quoi les combler en deux clics.
 *
 * Une mission non vérifiée n'apparaît pas sur le site : une mauvaise adresse
 * ferait faire un déplacement inutile.
 */

const MISSION_TYPES = ['Ambassade', 'Consulat général', 'Haut-commissariat', 'Section consulaire', 'Centre de dépôt'];

interface EmbassyRow {
  id: number;
  country: string;
  name: string;
  type?: string | null;
  hostCountry?: string | null;
  city?: string | null;
  address?: string | null;
  location?: string | null;
  mapsUrl?: string | null;
  link?: string | null;
  email?: string | null;
  phone?: string | null;
  coveredCountries?: string[] | null;
  isValidated?: boolean;
  updatedAt?: string;
}

/** Ce que l'écran retient d'une fiche visa : la route qu'elle décrit. */
interface VisaRoute {
  id: number;
  originCountry: string;
  destinationCountry: string;
  visaType: string;
  isValidated?: boolean;
}

type Form = {
  country: string; name: string; type: string; host_country: string; city: string;
  address: string; maps_url: string; link: string; email: string; phone: string;
  covered_countries: string[]; is_validated: boolean;
};

const emptyForm: Form = {
  country: '', name: '', type: 'Ambassade', host_country: '', city: '',
  address: '', maps_url: '', link: '', email: '', phone: '',
  covered_countries: [], is_validated: false,
};

const str = (v?: string | null) => (v ?? '').trim();
const arr = (v?: string[] | null) => (Array.isArray(v) ? v.filter(Boolean) : []);

const toForm = (e: EmbassyRow): Form => ({
  country: str(e.country), name: str(e.name), type: str(e.type) || 'Ambassade',
  host_country: str(e.hostCountry), city: str(e.city), address: str(e.address),
  maps_url: str(e.mapsUrl), link: str(e.link), email: str(e.email), phone: str(e.phone),
  covered_countries: arr(e.coveredCountries), is_validated: !!e.isValidated,
});

/**
 * Ce qu'il faut à une mission pour être utile à un demandeur : savoir où elle est,
 * comment y aller et comment la joindre. Sert au pourcentage et à la liste des manques.
 */
const CHECKLIST: { label: string; filled: (e: EmbassyRow) => boolean }[] = [
  { label: "pays d'accueil", filled: e => !!str(e.hostCountry) },
  { label: 'ville', filled: e => !!str(e.city) },
  { label: 'adresse', filled: e => !!str(e.address) },
  { label: 'lien cartographique', filled: e => !!str(e.mapsUrl) },
  { label: 'site officiel', filled: e => !!str(e.link) },
  { label: 'contact', filled: e => !!str(e.email) || !!str(e.phone) },
];

/** Ce qui manque, en toutes lettres : plus actionnable qu'un pourcentage identique partout. */
const missingFields = (e: EmbassyRow) => CHECKLIST.filter(f => !f.filled(e)).map(f => f.label);

/**
 * Mission compétente pour un couple (destination, origine) — même règle que
 * `EmbassyModel.findCompetent` côté API : la mission installée sur place d'abord,
 * sinon celle qui déclare desservir ce pays. À égalité, on retient celle qui est
 * vérifiée : c'est elle que le visiteur verra.
 */
const competentFor = (list: EmbassyRow[], destination: string, origin: string): EmbassyRow | null => {
  const pool = list.filter(e => e.country === destination);
  const onSite = pool.filter(e => e.hostCountry === origin);
  if (onSite.length) return onSite.find(e => e.isValidated) ?? onSite[0];
  const covering = pool.filter(e => arr(e.coveredCountries).includes(origin));
  return covering.find(e => e.isValidated) ?? covering[0] ?? null;
};

/* ── Sélection multiple de pays desservis ──────────────────────────────────── */
const CountryPicker: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  exclude?: string;
}> = ({ value, onChange, exclude }) => {
  const options = AFRICAN_COUNTRIES.filter(c => c.value !== exclude && !value.includes(c.value));
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-2">
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map(v => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-stone-100 pl-2 pr-1 py-0.5 text-xs text-stone-700">
              {africanCountryLabel(v)}
              <button
                type="button"
                onClick={() => onChange(value.filter(x => x !== v))}
                aria-label={`Retirer ${africanCountryLabel(v)}`}
                className="grid h-4 w-4 place-items-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <select
        value=""
        onChange={e => { if (e.target.value) onChange([...value, e.target.value]); }}
        className="w-full cursor-pointer bg-transparent px-1 text-sm text-stone-700 focus:outline-none"
      >
        <option value="">＋ Ajouter un pays desservi…</option>
        {options.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  );
};

/** Route origine → destination, rendue comme sur l'écran Visa. */
const RouteLabel: React.FC<{ origin: string; destination: string }> = ({ origin, destination }) => (
  <span className="inline-flex items-center gap-1.5">
    {africanCountryLabel(origin)}
    <ArrowLongRightIcon className="h-4 w-4 shrink-0 text-gold-500" />
    {destination}
  </span>
);

/* ── Écran ─────────────────────────────────────────────────────────────────── */
const AdminEmbassies: React.FC = () => {
  const [items, setItems] = useState<EmbassyRow[]>([]);
  const [visas, setVisas] = useState<VisaRoute[]>([]);
  const [destinations, setDestinations] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Navigation : un pays représenté à la fois — c'est lui qui structure le réseau.
  const [activeCountry, setActiveCountry] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'draft' | 'blocking'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Trou de couverture en cours de traitement (créer la mission ou la rattacher).
  const [gapTarget, setGapTarget] = useState<{ destination: string; origin: string; fiches: number } | null>(null);
  const [attachId, setAttachId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [emb, study, visa] = await Promise.all([
        apiService.adminGetEmbassies(1, 500),
        apiService.adminGetStudyCountries(),
        // Les fiches visa disent quelles routes existent réellement : ce sont elles
        // qui déterminent les missions à saisir, pas l'inverse.
        apiService.adminGetVisaRules(),
      ]);
      setItems((emb?.data ?? []) as EmbassyRow[]);
      setVisas((visa?.data ?? []) as VisaRoute[]);
      const countries = (study?.data ?? []) as { name: string; nameFr?: string | null }[];
      setDestinations(
        countries
          .map(c => ({ value: c.name, label: c.nameFr || c.name }))
          .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
      );
    } catch {
      setError("Chargement impossible. Vérifiez que l'API répond.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const countryLabel = useCallback(
    (name: string) => destinations.find(d => d.value === name)?.label ?? name,
    [destinations],
  );

  /* ── Croisement avec les fiches visa ─────────────────────────────────────── */

  /** Une entrée par couple (destination, origine) porté par au moins une fiche visa. */
  const routes = useMemo(() => {
    const byKey = new Map<string, { destination: string; origin: string; fiches: VisaRoute[] }>();
    visas.forEach(v => {
      if (!v.originCountry || !v.destinationCountry) return;
      const key = `${v.destinationCountry}|${v.originCountry}`;
      const entry = byKey.get(key) ?? { destination: v.destinationCountry, origin: v.originCountry, fiches: [] };
      entry.fiches.push(v);
      byKey.set(key, entry);
    });
    return [...byKey.values()].map(r => ({ ...r, mission: competentFor(items, r.destination, r.origin) }));
  }, [visas, items]);

  /** Combien de routes visa (et de fiches publiées) passent par chaque mission. */
  const routeCount = useMemo(() => {
    const map = new Map<number, { routes: number; published: number }>();
    routes.forEach(r => {
      if (!r.mission) return;
      const cur = map.get(r.mission.id) ?? { routes: 0, published: 0 };
      cur.routes += 1;
      if (r.fiches.some(f => f.isValidated)) cur.published += 1;
      map.set(r.mission.id, cur);
    });
    return map;
  }, [routes]);

  /**
   * Missions bloquantes : non vérifiées alors qu'une fiche visa publiée en dépend.
   * Le visiteur lit la fiche et ne voit aucune adresse — c'est le travail urgent.
   */
  const blockingIds = useMemo(() => {
    const set = new Set<number>();
    routes.forEach(r => {
      if (r.mission && !r.mission.isValidated && r.fiches.some(f => f.isValidated)) set.add(r.mission.id);
    });
    return set;
  }, [routes]);

  /* ── Rail des pays représentés ───────────────────────────────────────────── */

  const groups = useMemo(() => {
    const byCountry = new Map<string, EmbassyRow[]>();
    items.forEach(e => {
      const list = byCountry.get(e.country) ?? [];
      list.push(e);
      byCountry.set(e.country, list);
    });
    // Une destination peut avoir des fiches visa sans aucune mission : elle doit
    // quand même apparaître dans le rail, sinon le travail à faire reste invisible.
    routes.forEach(r => { if (!byCountry.has(r.destination)) byCountry.set(r.destination, []); });

    return [...byCountry.entries()]
      .map(([value, list]) => {
        const countryRoutes = routes.filter(r => r.destination === value);
        return {
          value,
          label: countryLabel(value),
          list,
          total: list.length,
          verified: list.filter(e => e.isValidated).length,
          routesTotal: countryRoutes.length,
          routesServed: countryRoutes.filter(r => r.mission?.isValidated).length,
          orphans: countryRoutes.filter(r => !r.mission).length,
          blocking: list.filter(e => blockingIds.has(e.id)).length,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }, [items, routes, countryLabel, blockingIds]);

  // À l'arrivée, on ouvre le premier pays : un écran vide n'aide personne.
  useEffect(() => {
    if (!activeCountry && groups.length > 0) setActiveCountry(groups[0].value);
  }, [groups, activeCountry]);

  const activeGroup = groups.find(g => g.value === activeCountry);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (activeGroup?.list ?? [])
      .filter(e => {
        if (statusFilter === 'ok' && !e.isValidated) return false;
        if (statusFilter === 'draft' && e.isValidated) return false;
        if (statusFilter === 'blocking' && !blockingIds.has(e.id)) return false;
        if (!q) return true;
        return [e.name, e.city, africanCountryLabel(str(e.hostCountry)), e.hostCountry]
          .filter(Boolean)
          .some(s => String(s).toLowerCase().includes(q));
      })
      .sort((a, b) =>
        africanCountryLabel(str(a.hostCountry)).localeCompare(africanCountryLabel(str(b.hostCountry)), 'fr'));
  }, [activeGroup, search, statusFilter, blockingIds]);

  /**
   * Ce qui manque à l'échelle du réseau affiché. Sur un réseau homogène, les 19 lignes
   * portent le même manque : le dire une fois en tête évite de scanner la colonne.
   */
  const activeSummary = useMemo(() => {
    const list = activeGroup?.list ?? [];
    if (list.length === 0) return [];
    return CHECKLIST
      .map(f => ({ label: f.label, count: list.filter(e => !f.filled(e)).length }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [activeGroup]);

  /** Routes de la destination affichée qui n'ont aucune mission compétente. */
  const activeOrphans = useMemo(
    () => routes
      .filter(r => r.destination === activeCountry && !r.mission)
      .sort((a, b) => africanCountryLabel(a.origin).localeCompare(africanCountryLabel(b.origin), 'fr')),
    [routes, activeCountry],
  );

  // Changer de pays ou de filtre invalide la sélection : on ne veut pas agir sur
  // des lignes qui ne sont plus à l'écran.
  useEffect(() => { setSelected(new Set()); }, [activeCountry, statusFilter, search]);

  const stats = useMemo(() => ({
    total: items.length,
    verified: items.filter(e => e.isValidated).length,
    routes: routes.length,
    served: routes.filter(r => r.mission?.isValidated).length,
    orphans: routes.filter(r => !r.mission).length,
  }), [items, routes]);

  const allShownSelected = rows.length > 0 && rows.every(r => selected.has(r.id));

  const toggleAll = () => setSelected(allShownSelected ? new Set() : new Set(rows.map(r => r.id)));

  const toggleOne = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  /* ── Actions ─────────────────────────────────────────────────────────────── */

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, country: activeCountry });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (e: EmbassyRow) => {
    setEditingId(e.id);
    setForm(toForm(e));
    setFormError('');
    setShowForm(true);
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.country || !form.name) {
      setFormError('Le pays représenté et le nom sont obligatoires.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) await apiService.adminUpdateEmbassy(editingId, form);
      else await apiService.adminCreateEmbassy(form);
      setShowForm(false);
      await load();
    } catch (e: any) {
      setFormError(e?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  /** Relire un réseau entier d'un coup : 168 missions ne se valident pas une par une. */
  const bulkVerify = async (value: boolean) => {
    const targets = rows.filter(r => selected.has(r.id) && !!r.isValidated !== value);
    if (targets.length === 0) return;
    const question = value
      ? `Marquer ${targets.length} mission(s) comme vérifiées ?\n\nElles deviendront visibles sur le site : confirmez que les adresses et les liens sont justes.`
      : `Retirer ${targets.length} mission(s) du site ?`;
    if (!window.confirm(question)) return;
    setBusy(true);
    try {
      for (const t of targets) await apiService.adminUpdateEmbassy(t.id, { is_validated: value });
      setSelected(new Set());
      await load();
    } catch {
      setError('Action groupée interrompue — relancez.');
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = async () => {
    const targets = rows.filter(r => selected.has(r.id));
    if (targets.length === 0) return;
    const dependents = targets.reduce((s, t) => s + (routeCount.get(t.id)?.routes ?? 0), 0);
    const warning = dependents > 0
      ? `\n\n⚠ ${dependents} route(s) visa passent par ces missions et se retrouveraient sans adresse.`
      : '';
    if (!window.confirm(`Supprimer définitivement ${targets.length} mission(s) ?${warning}`)) return;
    setBusy(true);
    try {
      for (const t of targets) await apiService.adminDeleteEmbassy(t.id);
      setSelected(new Set());
      await load();
    } catch {
      setError('Suppression groupée interrompue — relancez.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (e: EmbassyRow) => {
    // Supprimer une mission qui porte des fiches visa laisse ces fiches sans adresse.
    const dependents = routeCount.get(e.id)?.routes ?? 0;
    const warning = dependents > 0
      ? `\n\n⚠ ${dependents} route(s) visa passent par cette mission et se retrouveraient sans adresse.`
      : '';
    if (!window.confirm(`Supprimer « ${e.name} » ?${warning}`)) return;
    setBusy(true);
    try {
      await apiService.adminDeleteEmbassy(e.id);
      await load();
    } catch {
      setError('Suppression impossible.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (e: EmbassyRow) => {
    const published = routeCount.get(e.id)?.published ?? 0;
    if (e.isValidated && published > 0
      && !window.confirm(
        `Retirer « ${e.name} » du site ?\n\n${published} fiche(s) visa publiée(s) n'afficheraient plus d'adresse.`,
      )) return;
    setBusy(true);
    try {
      await apiService.adminUpdateEmbassy(e.id, { is_validated: !e.isValidated });
      await load();
    } catch {
      setError('Mise à jour impossible.');
    } finally {
      setBusy(false);
    }
  };

  /** Vérifier d'un coup toutes les missions qui bloquent une fiche visa publiée. */
  const verifyBlocking = async () => {
    const targets = items.filter(e => blockingIds.has(e.id));
    if (targets.length === 0) return;
    if (!window.confirm(`Vérifier les ${targets.length} mission(s) dont dépendent des fiches visa déjà publiées ?`)) return;
    setBusy(true);
    try {
      for (const t of targets) await apiService.adminUpdateEmbassy(t.id, { is_validated: true });
      await load();
    } catch {
      setError('Vérification groupée interrompue — relancez.');
    } finally {
      setBusy(false);
    }
  };

  /** Depuis un trou de couverture : le formulaire s'ouvre déjà positionné sur la route. */
  const createForGap = () => {
    if (!gapTarget) return;
    setEditingId(null);
    setForm({ ...emptyForm, country: gapTarget.destination, host_country: gapTarget.origin });
    setFormError('');
    setGapTarget(null);
    setShowForm(true);
  };

  /** Autre façon de combler un trou : rattacher l'origine à une mission voisine. */
  const attachToMission = async () => {
    if (!gapTarget || !attachId) return;
    const mission = items.find(e => e.id === Number(attachId));
    if (!mission) return;
    setBusy(true);
    try {
      await apiService.adminUpdateEmbassy(mission.id, {
        covered_countries: [...arr(mission.coveredCountries), gapTarget.origin],
      });
      setGapTarget(null);
      setAttachId('');
      await load();
    } catch {
      setError('Rattachement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const missionsForGap = useMemo(
    () => (gapTarget ? items.filter(e => e.country === gapTarget.destination) : []),
    [items, gapTarget],
  );

  /* ── Rendu ───────────────────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader
        title="Ambassades"
        subtitle="Quelle représentation contacter selon le couple pays d'origine → pays de destination. Choisissez le pays représenté à gauche, puis relisez ses missions. Une mission non vérifiée n'affiche aucune adresse sur le site."
        actions={
          <>
            <SecondaryButton onClick={load}>
              <ArrowPathIcon className="h-4 w-4" /> Actualiser
            </SecondaryButton>
            <PrimaryButton onClick={openCreate}>
              <PlusIcon className="h-4 w-4" /> Nouvelle mission
            </PrimaryButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Missions" value={stats.total} icon={BuildingLibraryIcon} hint={`${stats.verified} vérifiée(s)`} />
        <StatCard
          label="Routes desservies"
          value={`${stats.served}/${stats.routes}`}
          icon={DocumentTextIcon}
          tone="primary"
          hint="couples origine → destination"
        />
        <StatCard
          label="Routes sans mission"
          value={stats.orphans}
          icon={ExclamationTriangleIcon}
          tone="rose"
          hint="à créer ou à rattacher"
        />
        <StatCard
          label="Missions bloquantes"
          value={blockingIds.size}
          icon={EyeSlashIcon}
          tone="gold"
          hint="fiche publiée, mission non vérifiée"
        />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {blockingIds.size > 0 && (
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gold-800">
            <strong>{blockingIds.size} mission(s)</strong> non vérifiée(s) portent des fiches visa déjà publiées :
            le visiteur lit la fiche sans voir d'adresse.
          </p>
          <div className="flex shrink-0 gap-2">
            <SecondaryButton onClick={() => setStatusFilter('blocking')}>Les filtrer</SecondaryButton>
            <PrimaryButton onClick={verifyBlocking} disabled={busy}>
              {busy ? 'En cours…' : 'Tout vérifier'}
            </PrimaryButton>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        {/* Rail des pays représentés : où l'on est, et ce qu'il reste à faire ailleurs. */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
            Pays représentés
          </p>

          {/* Sur mobile, le rail n'a pas la place : un select fait le même travail. */}
          <div className="lg:hidden">
            <Select value={activeCountry} onChange={e => setActiveCountry(e.target.value)}>
              {groups.map(g => (
                <option key={g.value} value={g.value}>
                  {g.label} — {g.verified}/{g.total} vérifiées
                </option>
              ))}
            </Select>
          </div>

          <Card className="hidden overflow-hidden lg:block">
            <ul className="max-h-[38rem] divide-y divide-stone-100 overflow-y-auto">
              {loading && groups.length === 0 && (
                <li className="px-3 py-8 text-center text-xs text-stone-400">Chargement…</li>
              )}
              {groups.map(g => {
                const active = g.value === activeCountry;
                return (
                  <li key={g.value}>
                    <button
                      type="button"
                      onClick={() => setActiveCountry(g.value)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                        active ? 'bg-primary/10' : 'hover:bg-stone-50'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-7 w-0.5 shrink-0 rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${active ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
                          {g.label}
                        </span>
                        {/* Une barre à 0 % répétée seize fois n'apprend rien : tant que
                            rien n'est vérifié, le compte suffit. */}
                        {g.verified > 0 && (
                          <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-stone-100">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${Math.round((g.verified / g.total) * 100)}%` }}
                            />
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {g.orphans > 0 && (
                          <span
                            title={`${g.orphans} route(s) visa sans mission`}
                            className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-rose-50 px-1 text-[10px] font-semibold tabular-nums text-rose-600"
                          >
                            {g.orphans}
                          </span>
                        )}
                        <span className={`text-xs tabular-nums ${g.total > 0 && g.verified === g.total ? 'text-primary' : 'text-stone-400'}`}>
                          {g.verified}/{g.total}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-stone-100 px-3 py-2 text-[10px] leading-tight text-stone-400">
              <span className="tabular-nums">vérifiées/missions</span> · pastille rouge = routes visa sans mission
            </p>
          </Card>
        </aside>

        {/* Panneau : les missions du pays représenté choisi. */}
        <section className="min-w-0">
          <Card className="mb-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* `min-w-0` : sans lui, le select à largeur `w-full` écrase la recherche. */}
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrer par pays d'accueil, ville…"
                  className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="shrink-0 sm:w-64">
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
                  <option value="all">Vérifiées et à relire</option>
                  <option value="ok">Vérifiées</option>
                  <option value="draft">À relire</option>
                  <option value="blocking">Bloquent une fiche publiée</option>
                </Select>
              </div>
            </div>
          </Card>

          {activeGroup && (
            <div className="mb-4">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-stone-800">
                <GlobeAltIcon className="h-5 w-5 text-gold-500" />
                {activeGroup.label}
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                {activeGroup.total} mission(s) · {activeGroup.verified} vérifiée(s) ·
                {' '}{activeGroup.routesServed}/{activeGroup.routesTotal} routes visa desservies
              </p>
              {activeSummary.length > 0 && (
                <p className="mt-0.5 text-[11px] text-stone-400">
                  À compléter sur ce réseau : {activeSummary.map(s => `${s.count} sans ${s.label}`).join(' · ')}
                </p>
              )}
            </div>
          )}

          {/* Ce que les fiches visa réclament et que le réseau ne couvre pas encore.
              Placé AVANT la table : c'est le travail à faire, pas une note de bas de page. */}
          {activeOrphans.length > 0 && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-semibold text-rose-800">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                {activeOrphans.length} route(s) visa sans mission compétente
              </h3>
              <p className="mt-0.5 mb-3 text-[11px] text-rose-700/70">
                Ces pays ont une fiche visa vers {activeGroup?.label} mais aucune mission sur place ni
                rattachement. Cliquez sur un pays pour créer la mission ou la rattacher à une voisine.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeOrphans.map(r => {
                  const published = r.fiches.some(f => f.isValidated);
                  return (
                    <button
                      key={`${r.destination}|${r.origin}`}
                      type="button"
                      onClick={() => {
                        setGapTarget({ destination: r.destination, origin: r.origin, fiches: r.fiches.length });
                        setAttachId('');
                      }}
                      title={published ? 'Fiche visa publiée — aucune adresse affichée' : 'Fiche visa en brouillon'}
                      className={`rounded-lg border bg-white px-2.5 py-1.5 text-xs transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        published
                          ? 'border-rose-300 font-medium text-rose-700 hover:bg-rose-100'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {africanCountryLabel(r.origin)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barre d'actions groupées : n'apparaît qu'avec une sélection. */}
          {selected.size > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
              <span className="text-sm font-medium text-stone-700">
                {selected.size} mission(s) sélectionnée(s)
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => bulkVerify(true)}
                disabled={busy}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 cursor-pointer"
              >
                {busy ? 'En cours…' : 'Vérifier'}
              </button>
              <button
                type="button"
                onClick={() => bulkVerify(false)}
                disabled={busy}
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 transition-colors duration-150 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 cursor-pointer"
              >
                Retirer du site
              </button>
              <button
                type="button"
                onClick={bulkDelete}
                disabled={busy}
                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 cursor-pointer"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-lg px-2 py-2 text-xs text-stone-500 hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}

          <TableShell
            head={
              <>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allShownSelected}
                    onChange={toggleAll}
                    aria-label="Tout sélectionner"
                    className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
                  />
                </th>
                <th className="whitespace-nowrap">Pays d'accueil</th>
                <th className="hidden md:table-cell whitespace-nowrap">À compléter</th>
                <th className="hidden lg:table-cell whitespace-nowrap">Liens</th>
                <th className="hidden sm:table-cell w-20 whitespace-nowrap">Routes</th>
                <th className="w-28 whitespace-nowrap">Statut</th>
                <th className="w-24 whitespace-nowrap text-right">Actions</th>
              </>
            }
          >
            {loading ? (
              <EmptyRow colSpan={7}>Chargement…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={7}>
                {items.length === 0
                  ? 'Aucune mission enregistrée.'
                  : activeGroup && activeGroup.total === 0
                    ? `Aucune mission de ${activeGroup.label} n'est enregistrée — les routes visa ci-dessous sont toutes à couvrir.`
                    : 'Aucune mission ne correspond à ces filtres.'}
              </EmptyRow>
            ) : (
              rows.map(e => {
                const gaps = missingFields(e);
                const covers = arr(e.coveredCountries);
                const c = routeCount.get(e.id);
                const blocking = blockingIds.has(e.id);
                return (
                  <tr
                    key={e.id}
                    onClick={() => openEdit(e)}
                    className={`cursor-pointer transition-colors duration-150 [&>td]:px-4 [&>td]:py-2 ${
                      selected.has(e.id)
                        ? 'bg-primary/5'
                        : blocking ? 'bg-gold-50/60 hover:bg-gold-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <td onClick={ev => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggleOne(e.id)}
                        aria-label={`Sélectionner ${e.name}`}
                        className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
                      />
                    </td>
                    <td>
                      {/* Bouton réel : la ligne entière est cliquable à la souris, mais
                          l'ouverture doit aussi être atteignable au clavier. */}
                      <button
                        type="button"
                        onClick={ev => { ev.stopPropagation(); openEdit(e); }}
                        className="flex items-baseline gap-1.5 whitespace-nowrap rounded text-left hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                      >
                        <span className="font-medium text-stone-800">
                          {e.hostCountry
                            ? africanCountryLabel(e.hostCountry)
                            : <span className="text-rose-500">pays d'accueil ?</span>}
                        </span>
                        <span className="text-xs text-stone-400">{e.city || 'ville ?'}</span>
                      </button>
                      {/* Annotations : seulement ce qui sort de l'ordinaire. Répéter
                          « Ambassade » et « — » sur toutes les lignes noyait le reste. */}
                      {(covers.length > 0 || (e.type && e.type !== 'Ambassade')) && (
                        <span className="mt-0.5 block whitespace-nowrap text-[11px] text-stone-500">
                          {e.type && e.type !== 'Ambassade' && (
                            <span className="mr-1.5 rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-600">{e.type}</span>
                          )}
                          {covers.length > 0 && (
                            <span className="text-gold-700">
                              dessert aussi {covers.map(africanCountryLabel).join(', ')}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap text-xs">
                      {gaps.length === 0
                        ? <span className="text-primary">fiche complète</span>
                        : <span className="text-stone-500">{gaps.join(', ')}</span>}
                    </td>
                    <td className="hidden lg:table-cell whitespace-nowrap" onClick={ev => ev.stopPropagation()}>
                      <span className="flex items-center gap-2 text-xs">
                        {e.mapsUrl && (
                          <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-stone-400 hover:text-primary">
                            <MapPinIcon className="h-3.5 w-3.5" /> carte
                          </a>
                        )}
                        {e.link ? (
                          <a href={e.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-stone-400 hover:text-primary">
                            <LinkIcon className="h-3.5 w-3.5" /> site
                          </a>
                        ) : (
                          <span className="text-stone-300">pas de site</span>
                        )}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell text-xs tabular-nums text-stone-500">
                      {c?.routes ?? 0}
                      {!!c?.published && <span className="text-stone-400"> ({c.published} pub.)</span>}
                    </td>
                    <td>
                      {/* Une pastille suffit pour l'état courant ; seul l'état anormal
                          mérite un badge qui attire l'œil. */}
                      {e.isValidated ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-primary">
                          <CheckCircleIcon className="h-4 w-4" /> Vérifiée
                        </span>
                      ) : blocking ? (
                        <Badge tone="rose" className="whitespace-nowrap">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5" /> Bloque
                        </Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-stone-400">
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-400" /> À relire
                        </span>
                      )}
                    </td>
                    <td onClick={ev => ev.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggle(e)}
                          disabled={busy}
                          title={e.isValidated ? 'Retirer du site' : 'Marquer comme vérifiée'}
                          className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40 ${
                            e.isValidated ? 'text-stone-500 hover:bg-stone-100' : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {e.isValidated ? 'Retirer' : 'Vérifier'}
                        </button>
                        <IconButton tone="blue" title="Modifier" onClick={() => openEdit(e)}>
                          <PencilSquareIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(e)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </TableShell>
        </section>
      </div>

      {/* ── Combler un trou de couverture ─────────────────────────────────────── */}
      {gapTarget && (
        <Modal
          title="Route sans mission compétente"
          onClose={() => setGapTarget(null)}
          footer={<SecondaryButton onClick={() => setGapTarget(null)}>Fermer</SecondaryButton>}
        >
          <p className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2.5 font-display text-base text-stone-800">
            <RouteLabel origin={gapTarget.origin} destination={countryLabel(gapTarget.destination)} />
          </p>
          <p className="text-xs text-stone-500">
            {gapTarget.fiches} fiche(s) visa décrivent cette route, mais aucune mission de
            {' '}{countryLabel(gapTarget.destination)} n'est installée en {africanCountryLabel(gapTarget.origin)}
            {' '}ni ne déclare le desservir. Deux façons de corriger :
          </p>

          <div className="rounded-xl border border-stone-200 p-4">
            <h4 className="font-display text-sm font-semibold text-stone-800">Il y a bien une mission sur place</h4>
            <p className="mt-0.5 mb-3 text-[11px] text-stone-400">
              Le formulaire s'ouvrira avec les deux pays déjà positionnés.
            </p>
            <PrimaryButton onClick={createForGap}>
              <PlusIcon className="h-4 w-4" /> Créer la mission
            </PrimaryButton>
          </div>

          <div className="rounded-xl border border-stone-200 p-4">
            <h4 className="font-display text-sm font-semibold text-stone-800">
              Les demandeurs sont reçus dans un pays voisin
            </h4>
            <p className="mt-0.5 mb-3 text-[11px] text-stone-400">
              {africanCountryLabel(gapTarget.origin)} sera ajouté aux pays desservis par la mission choisie.
            </p>
            {missionsForGap.length === 0 ? (
              <p className="text-xs text-stone-400">
                Aucune mission de {countryLabel(gapTarget.destination)} n'est encore enregistrée.
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={attachId} onChange={e => setAttachId(e.target.value)}>
                  <option value="">— Choisir la mission compétente —</option>
                  {missionsForGap.map(m => (
                    <option key={m.id} value={String(m.id)}>
                      {m.city ? `${m.city} (${africanCountryLabel(str(m.hostCountry))}) — ${m.name}` : m.name}
                    </option>
                  ))}
                </Select>
                <SecondaryButton onClick={attachToMission} disabled={!attachId || busy}>
                  {busy ? 'En cours…' : 'Rattacher'}
                </SecondaryButton>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal
          title={
            editingId
              ? `${countryLabel(form.country)} — ${africanCountryLabel(form.host_country) || 'pays d\'accueil ?'}`
              : 'Nouvelle mission'
          }
          onClose={() => setShowForm(false)}
          maxWidth="max-w-2xl"
          footer={
            <>
              <SecondaryButton onClick={() => setShowForm(false)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {formError}
            </div>
          )}

          <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">
            Une mission se définit par deux pays : celui qu'elle <strong>représente</strong>
            {' '}(le pays de destination) et celui où elle se <strong>trouve</strong> (le pays du demandeur).
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pays représenté" required>
              <Select value={form.country} onChange={e => set('country', e.target.value)}>
                <option value="">— Choisir —</option>
                {destinations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </Select>
            </Field>
            <Field label="Pays d'accueil">
              <Select value={form.host_country} onChange={e => set('host_country', e.target.value)}>
                <option value="">— Choisir —</option>
                {AFRICAN_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Type de mission">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                {MISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Ville">
              <TextInput value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lomé" />
            </Field>
          </div>

          <Field label="Nom de la mission" required>
            <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ambassade de France au Togo" />
          </Field>

          <Field label="Adresse postale">
            <TextInput value={form.address} onChange={e => set('address', e.target.value)} placeholder="13 avenue …, quartier …" />
          </Field>

          <Field label="Lien cartographique">
            <TextInput value={form.maps_url} onChange={e => set('maps_url', e.target.value)} placeholder="Laissez vide : une recherche Google Maps sera générée" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site officiel">
              <TextInput type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://tg.ambafrance.org" />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
            <Field label="Téléphone">
              <TextInput value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
          </div>

          <Field label="Pays desservis en plus du pays d'accueil">
            <CountryPicker
              value={form.covered_countries}
              onChange={v => set('covered_countries', v)}
              exclude={form.host_country}
            />
          </Field>
          <p className="-mt-2 text-[11px] text-stone-400">
            À remplir quand le pays de destination n'a pas de représentation sur place :
            le demandeur sera dirigé ici.
          </p>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-stone-200 px-3 py-2.5 hover:bg-stone-50">
            <input
              type="checkbox"
              checked={form.is_validated}
              onChange={e => set('is_validated', e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
            />
            <span>
              <span className="block text-sm text-stone-700">Informations vérifiées — afficher sur le site</span>
              <span className="block text-[11px] text-stone-400">
                Confirmez l'adresse et le lien avant de cocher : une erreur enverrait quelqu'un se déplacer pour rien.
              </span>
            </span>
          </label>
        </Modal>
      )}
    </div>
  );
};

export default AdminEmbassies;
