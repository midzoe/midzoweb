import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon,
  ArrowPathIcon, ArrowTopRightOnSquareIcon, HomeModernIcon, GlobeAltIcon,
  BuildingOffice2Icon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { useCountries } from '../../hooks/useCountries';
import {
  PageHeader, PrimaryButton, SecondaryButton, StatCard, IconButton, Badge,
  TableShell, EmptyRow, Modal, Field, TextInput, TextArea, Select, Card,
} from './ui';

/**
 * Story 9.6 → gestion des logements étudiants (Epic 5).
 *
 * L'écran est **borné aux pays d'études** : un logement n'a de sens que là où l'étudiant
 * peut être admis. La liste des pays vient de `useCountries().studyCountries`
 * (backend, `studyAvailable = true`) — c'est le même vocabulaire anglais que
 * `University.country` et que le filtre pays de l'écran public `StudentAccommodation`.
 * Le formulaire n'expose donc pas un champ libre mais un sélecteur de ces pays, et
 * l'écran signale les pays d'études encore sans aucun logement.
 *
 * Catalogue de départ : `midzobackend/src/scripts/seed-accommodations-study-countries.ts`.
 */

const TYPES = [
  { value: 'residence', label: 'Résidence universitaire' },
  { value: 'studio', label: 'Studio' },
  { value: 'shared', label: 'Colocation' },
  { value: 'homestay', label: "Famille d'accueil" },
] as const;

const typeLabel = (t: string) => TYPES.find(x => x.value === t)?.label ?? t;
const TYPE_TONE: Record<string, 'green' | 'indigo' | 'amber' | 'blue' | 'slate'> = {
  residence: 'green', studio: 'indigo', shared: 'amber', homestay: 'blue',
};

const CURRENCIES = ['EUR', 'GBP', 'USD', 'CAD', 'CHF', 'SEK', 'CNY'];

/** Devise locale proposée par défaut à la création, selon le pays choisi. */
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  'United Kingdom': 'GBP', 'United States': 'USD', Canada: 'CAD',
  Switzerland: 'CHF', Sweden: 'SEK', China: 'CNY',
};

/** Pays en français pour l'affichage ; la valeur stockée reste l'anglais du catalogue. */
const COUNTRY_FR: Record<string, string> = {
  Germany: 'Allemagne', France: 'France', 'United Kingdom': 'Royaume-Uni',
  'United States': 'États-Unis', Canada: 'Canada', Netherlands: 'Pays-Bas',
  Spain: 'Espagne', Italy: 'Italie', Switzerland: 'Suisse', Sweden: 'Suède',
  Portugal: 'Portugal', China: 'Chine',
};
const countryLabel = (c: string) => COUNTRY_FR[c] ?? c;

/** Repli si l'appel `/countries` échoue : les 12 pays d'études du catalogue. */
const STUDY_COUNTRIES_FALLBACK = [
  'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Netherlands',
  'Spain', 'Sweden', 'Switzerland', 'Italy', 'Portugal', 'China',
];

interface Row {
  id: number;
  name: string;
  country: string;
  city: string;
  type: string;
  pricePerMonth: number;
  currency: string;
  contact?: string | null;
  description?: string | null;
}

type FormState = {
  name: string; country: string; city: string; type: string;
  pricePerMonth: string; currency: string; contact: string; description: string;
};

const EMPTY_FORM: FormState = {
  name: '', country: '', city: '', type: 'residence',
  pricePerMonth: '', currency: 'EUR', contact: '', description: '',
};

const AdminAccommodations: React.FC = () => {
  const { studyCountries } = useCountries();
  const countries = studyCountries.length > 0 ? studyCountries : STUDY_COUNTRIES_FALLBACK;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await apiService.adminGetAccommodations();
      setRows(res.data ?? res.accommodations ?? []);
    } catch {
      setRows([]);
      setError("Impossible de charger les logements — vérifiez que le backend répond.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Pays d'études annoncés à l'étudiant mais encore sans aucun logement. */
  const uncovered = useMemo(
    () => countries.filter(c => !rows.some(r => r.country === c)),
    [countries, rows]
  );

  /** Logements dont le pays n'est plus (ou pas) un pays d'études : à corriger. */
  const offCatalog = useMemo(
    () => rows.filter(r => !countries.includes(r.country)),
    [countries, rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter(r => !countryFilter || r.country === countryFilter)
      .filter(r => !typeFilter || r.type === typeFilter)
      .filter(r => !q || `${r.name} ${r.city} ${r.description ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) =>
        a.country.localeCompare(b.country) ||
        a.city.localeCompare(b.city) ||
        a.pricePerMonth - b.pricePerMonth
      );
  }, [rows, search, countryFilter, typeFilter]);

  const cities = useMemo(() => new Set(rows.map(r => `${r.country}|${r.city}`)).size, [rows]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, country: countryFilter || '', currency: CURRENCY_BY_COUNTRY[countryFilter] ?? 'EUR' });
    setShowForm(true);
  };

  const openEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({
      name: r.name, country: r.country, city: r.city, type: r.type,
      pricePerMonth: String(r.pricePerMonth ?? ''), currency: r.currency ?? 'EUR',
      contact: r.contact ?? '', description: r.description ?? '',
    });
    setShowForm(true);
  };

  /** Le choix du pays propose la devise locale tant que rien n'a été saisi à la main. */
  const onCountryChange = (country: string) => {
    setForm(f => ({ ...f, country, currency: CURRENCY_BY_COUNTRY[country] ?? 'EUR' }));
  };

  const price = Number(form.pricePerMonth);
  const formValid =
    form.name.trim() !== '' && form.country !== '' && form.city.trim() !== '' &&
    form.type !== '' && form.pricePerMonth.trim() !== '' && Number.isFinite(price) && price >= 0;

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    setError('');
    try {
      // `pricePerMonth` est un Float côté Prisma : on envoie un nombre, jamais la chaîne du champ.
      const payload = {
        name: form.name.trim(),
        country: form.country,
        city: form.city.trim(),
        type: form.type,
        pricePerMonth: price,
        currency: form.currency || 'EUR',
        contact: form.contact.trim() || null,
        description: form.description.trim() || null,
      };
      if (editingId !== null) {
        await apiService.adminUpdateAccommodation(editingId, payload);
      } else {
        await apiService.adminCreateAccommodation(payload);
      }
      setShowForm(false);
      await load();
    } catch {
      setError("Enregistrement refusé par le backend — vérifiez les champs obligatoires.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Row) => {
    if (!confirm(`Supprimer « ${r.name} » (${r.city}) ?`)) return;
    try {
      await apiService.adminDeleteAccommodation(r.id);
      await load();
    } catch {
      setError('Suppression refusée par le backend.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Logements étudiants"
        subtitle="Catalogue borné aux pays d'études — le pays reprend le vocabulaire du catalogue universités."
        actions={
          <>
            <SecondaryButton onClick={load} disabled={loading}>
              <span className="inline-flex items-center gap-2">
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </span>
            </SecondaryButton>
            <PrimaryButton onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Logements" value={rows.length} icon={HomeModernIcon} tone="primary" />
        <StatCard
          label="Pays d'études couverts"
          value={`${countries.length - uncovered.length}/${countries.length}`}
          icon={GlobeAltIcon}
          tone="gold"
          hint={uncovered.length === 0 ? 'Tous les pays d’études sont pourvus' : `${uncovered.length} sans logement`}
        />
        <StatCard label="Villes" value={cities} icon={BuildingOffice2Icon} tone="indigo" />
        <StatCard
          label="Hors pays d'études"
          value={offCatalog.length}
          icon={ExclamationTriangleIcon}
          tone={offCatalog.length > 0 ? 'rose' : 'default'}
          hint={offCatalog.length > 0 ? 'À rattacher à un pays d’études' : 'Catalogue cohérent'}
        />
      </div>

      {uncovered.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3 text-sm text-gold-800">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="font-medium">Pays d'études sans logement :</span>
          {uncovered.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => { setForm({ ...EMPTY_FORM, country: c, currency: CURRENCY_BY_COUNTRY[c] ?? 'EUR' }); setEditingId(null); setShowForm(true); }}
              className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium hover:bg-white cursor-pointer"
            >
              {countryLabel(c)} +
            </button>
          ))}
        </div>
      )}

      {/* Filtres */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un logement, une ville…"
              className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
            <option value="">Tous les pays d'études</option>
            {countries.map(c => (
              <option key={c} value={c}>
                {countryLabel(c)} ({rows.filter(r => r.country === c).length})
              </option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">Tous les types</option>
            {TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label} ({rows.filter(r => r.type === t.value).length})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <TableShell
        head={<>
          <th>Logement</th>
          <th>Pays</th>
          <th>Ville</th>
          <th>Type</th>
          <th className="text-right">Loyer / mois</th>
          <th className="text-right">Actions</th>
        </>}
      >
        {loading ? (
          <EmptyRow colSpan={6}>Chargement…</EmptyRow>
        ) : filtered.length === 0 ? (
          <EmptyRow colSpan={6}>
            {rows.length === 0
              ? 'Aucun logement — cliquez « Ajouter » pour commencer.'
              : 'Aucun logement ne correspond à ces filtres.'}
          </EmptyRow>
        ) : filtered.map(r => (
          <tr key={r.id} className="hover:bg-stone-50 transition-colors duration-150 align-top">
            <td className="px-4 py-3">
              <div className="font-medium text-stone-800">{r.name}</div>
              {r.description && (
                <p className="mt-0.5 max-w-md text-xs text-stone-500 line-clamp-2">{r.description}</p>
              )}
              {r.contact && r.contact.startsWith('http') && (
                <a
                  href={r.contact}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Site officiel <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                </a>
              )}
            </td>
            <td className="px-4 py-3">
              {countries.includes(r.country)
                ? <span className="text-stone-700">{countryLabel(r.country)}</span>
                : <Badge tone="rose">{r.country} — hors études</Badge>}
            </td>
            <td className="px-4 py-3 text-stone-700">{r.city}</td>
            <td className="px-4 py-3">
              <Badge tone={TYPE_TONE[r.type] ?? 'slate'}>{typeLabel(r.type)}</Badge>
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-stone-700 whitespace-nowrap">
              {r.pricePerMonth} {r.currency}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <IconButton tone="blue" title="Modifier" onClick={() => openEdit(r)}>
                  <PencilSquareIcon className="h-4 w-4" />
                </IconButton>
                <IconButton tone="rose" title="Supprimer" onClick={() => handleDelete(r)}>
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      {!loading && filtered.length > 0 && (
        <p className="mt-3 text-xs text-stone-400">
          {filtered.length} logement{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          {filtered.length !== rows.length && ` sur ${rows.length}`}.
          Les loyers sont indicatifs et se confirment auprès du bailleur.
        </p>
      )}

      {showForm && (
        <Modal
          title={editingId !== null ? 'Modifier un logement' : 'Ajouter un logement'}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving || !formValid}>
                <CheckIcon className="h-4 w-4" />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          <Field label="Nom du logement ou de l'organisme" required>
            <TextInput
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Studierendenwerk Berlin"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pays d'études" required>
              <Select value={form.country} onChange={e => onCountryChange(e.target.value)}>
                <option value="">— Choisir —</option>
                {countries.map(c => <option key={c} value={c}>{countryLabel(c)}</option>)}
              </Select>
            </Field>
            <Field label="Ville" required>
              <TextInput
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Ex. Berlin"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Type" required>
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>
            <Field label="Loyer / mois" required>
              <TextInput
                type="number"
                min={0}
                value={form.pricePerMonth}
                onChange={e => setForm({ ...form, pricePerMonth: e.target.value })}
                placeholder="350"
              />
            </Field>
            <Field label="Devise">
              <Select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Contact ou site officiel">
            <TextInput
              value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })}
              placeholder="https://…"
            />
          </Field>

          <Field label="Description">
            <TextArea
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Mode d'attribution, services inclus, délais de candidature… Précisez si le loyer est indicatif."
            />
          </Field>
        </Modal>
      )}
    </div>
  );
};

export default AdminAccommodations;
