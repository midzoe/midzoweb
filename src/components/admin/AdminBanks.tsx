import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon,
  ArrowPathIcon, BuildingLibraryIcon, GlobeAltIcon, CreditCardIcon,
  ExclamationTriangleIcon, ChevronRightIcon, ChevronDownIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { useCountries } from '../../hooks/useCountries';
import {
  PageHeader, PrimaryButton, SecondaryButton, StatCard, IconButton, Badge,
  TableShell, EmptyRow, Modal, Field, TextInput, TextArea, Select, Card, BoolPill,
} from './ui';

/**
 * Banques et comptes étudiants (Epic 5 — page publique « Compte bancaire étudiant »).
 *
 * L'écran est **borné aux pays d'études** (`useCountries().studyCountries`) : un compte
 * bancaire local n'a de sens que là où l'étudiant s'installe. Même vocabulaire anglais que
 * `University.country` et que le filtre pays de l'écran public.
 *
 * Une banque n'a d'intérêt que par ses **comptes** (`BankAccountType`), et un compte que par
 * ses **conditions d'ouverture** (`requirements`) : ce sont elles qui bloquent l'étudiant à
 * l'arrivée (Anmeldung, BSN, NIE, codice fiscale, NIF, personnummer…). L'ancien écran ne
 * savait pas les éditer — le formulaire embarque donc une sous-liste de comptes, et la
 * table signale les comptes dont les conditions manquent.
 *
 * Attention : le backend **remplace les comptes en bloc** dès que `accountTypes` est envoyé
 * (cf. BankModel.update) — le formulaire poste toujours la liste complète.
 * Les listes partent en tableaux (jamais en texte « a, b, c ») : plusieurs conditions
 * contiennent des virgules, qu'un découpage serveur casserait.
 *
 * Catalogue de départ : `midzobackend/src/scripts/seed-banks-study-countries.ts`.
 */

/** Repli si l'appel `/countries` échoue : les 12 pays d'études du catalogue. */
const STUDY_COUNTRIES_FALLBACK = [
  'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Netherlands',
  'Spain', 'Sweden', 'Switzerland', 'Italy', 'Portugal', 'China',
];

/** Pays en français pour l'affichage ; la valeur stockée reste l'anglais du catalogue. */
const COUNTRY_FR: Record<string, string> = {
  Germany: 'Allemagne', France: 'France', 'United Kingdom': 'Royaume-Uni',
  'United States': 'États-Unis', Canada: 'Canada', Netherlands: 'Pays-Bas',
  Spain: 'Espagne', Italy: 'Italie', Switzerland: 'Suisse', Sweden: 'Suède',
  Portugal: 'Portugal', China: 'Chine',
};
const countryLabel = (c: string) => COUNTRY_FR[c] ?? c;

interface AccountRow {
  id?: number;
  name: string;
  features?: string[] | null;
  monthlyFee?: string | null;
  requirements?: string[] | null;
  minimumDeposit?: string | null;
  cardType?: string | null;
  withdrawalLimit?: string | null;
  onlineBanking?: boolean;
  studentPerks?: string[] | null;
}

interface Row {
  id: number;
  name: string;
  country: string;
  image?: string | null;
  description?: string | null;
  isActive: boolean;
  accountTypes: AccountRow[];
}

type AccountForm = {
  name: string; monthlyFee: string; cardType: string; minimumDeposit: string;
  withdrawalLimit: string; onlineBanking: boolean;
  features: string; requirements: string; studentPerks: string;
};

type FormState = {
  name: string; country: string; image: string; description: string;
  isActive: boolean; accounts: AccountForm[];
};

const EMPTY_ACCOUNT: AccountForm = {
  name: '', monthlyFee: '', cardType: '', minimumDeposit: '',
  withdrawalLimit: '', onlineBanking: true, features: '', requirements: '', studentPerks: '',
};

const EMPTY_FORM: FormState = {
  name: '', country: '', image: '', description: '', isActive: true, accounts: [],
};

/** Une valeur par ligne : le découpage par virgule casserait « Application en français, anglais… ». */
const toLines = (v?: string[] | null) => (v ?? []).join('\n');
const fromLines = (v: string) => v.split('\n').map(s => s.trim()).filter(Boolean);

/** Les listes JSON du backend peuvent arriver à null : on les ramène toujours à un tableau. */
const list = <T,>(v?: T[] | null): T[] => (Array.isArray(v) ? v : []);

const AdminBanks: React.FC = () => {
  const { studyCountries } = useCountries();
  const countries = studyCountries.length > 0 ? studyCountries : STUDY_COUNTRIES_FALLBACK;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [gapsOnly, setGapsOnly] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await apiService.adminGetBanks();
      setRows(res.data ?? res.banks ?? []);
    } catch {
      setRows([]);
      setError('Impossible de charger les banques — vérifiez que le backend répond.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const accountsTotal = useMemo(
    () => rows.reduce((n, r) => n + list(r.accountTypes).length, 0),
    [rows]
  );

  /** Comptes sans conditions d'ouverture : la fiche n'apprend alors rien à l'étudiant. */
  const accountsWithoutConditions = useMemo(
    () => rows.reduce((n, r) => n + list(r.accountTypes).filter(a => list(a.requirements).length === 0).length, 0),
    [rows]
  );

  const hasGap = (r: Row) => {
    const accounts = list(r.accountTypes);
    return accounts.length === 0 || accounts.some(a => list(a.requirements).length === 0);
  };

  /** Pays d'études annoncés à l'étudiant mais encore sans aucune banque. */
  const uncovered = useMemo(
    () => countries.filter(c => !rows.some(r => r.country === c)),
    [countries, rows]
  );

  /** Banques rattachées à un pays qui n'est pas (ou plus) un pays d'études. */
  const offCatalog = useMemo(
    () => rows.filter(r => !countries.includes(r.country)),
    [countries, rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter(r => !countryFilter || r.country === countryFilter)
      .filter(r => !gapsOnly || hasGap(r))
      .filter(r => !q || `${r.name} ${r.description ?? ''} ${list(r.accountTypes).map(a => a.name).join(' ')}`
        .toLowerCase().includes(q))
      .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
  }, [rows, search, countryFilter, gapsOnly]);

  const openCreate = (country?: string) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, country: country ?? countryFilter ?? '', accounts: [{ ...EMPTY_ACCOUNT }] });
    setShowForm(true);
  };

  const openEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      country: r.country,
      image: r.image ?? '',
      description: r.description ?? '',
      isActive: r.isActive,
      accounts: list(r.accountTypes).map(a => ({
        name: a.name ?? '',
        monthlyFee: a.monthlyFee ?? '',
        cardType: a.cardType ?? '',
        minimumDeposit: a.minimumDeposit ?? '',
        withdrawalLimit: a.withdrawalLimit ?? '',
        onlineBanking: a.onlineBanking ?? true,
        features: toLines(a.features),
        requirements: toLines(a.requirements),
        studentPerks: toLines(a.studentPerks),
      })),
    });
    setShowForm(true);
  };

  const patchAccount = (index: number, patch: Partial<AccountForm>) => {
    setForm(f => ({
      ...f,
      accounts: f.accounts.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    }));
  };

  const formValid =
    form.name.trim() !== '' &&
    form.country !== '' &&
    form.accounts.every(a => a.name.trim() !== '');

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    setError('');
    try {
      // La liste complète des comptes part à chaque enregistrement : le backend les remplace en bloc.
      const payload = {
        name: form.name.trim(),
        country: form.country,
        image: form.image.trim() || null,
        description: form.description.trim() || null,
        isActive: form.isActive,
        accountTypes: form.accounts.map(a => ({
          name: a.name.trim(),
          monthlyFee: a.monthlyFee.trim() || null,
          cardType: a.cardType.trim() || null,
          minimumDeposit: a.minimumDeposit.trim() || null,
          withdrawalLimit: a.withdrawalLimit.trim() || null,
          onlineBanking: a.onlineBanking,
          features: fromLines(a.features),
          requirements: fromLines(a.requirements),
          studentPerks: fromLines(a.studentPerks),
        })),
      };
      if (editingId !== null) {
        await apiService.adminUpdateBank(editingId, payload);
      } else {
        await apiService.adminCreateBank(payload);
      }
      setShowForm(false);
      await load();
    } catch {
      setError('Enregistrement refusé par le backend — vérifiez le nom, le pays et le nom de chaque compte.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Row) => {
    if (!confirm(`Supprimer « ${r.name} » (${countryLabel(r.country)}) et ses ${list(r.accountTypes).length} compte(s) ?`)) return;
    try {
      await apiService.adminDeleteBank(r.id);
      await load();
    } catch {
      setError('Suppression refusée par le backend.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Banques"
        subtitle="Catalogue borné aux pays d'études — chaque compte porte ses conditions d'ouverture."
        actions={
          <>
            <SecondaryButton onClick={load} disabled={loading}>
              <span className="inline-flex items-center gap-2">
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </span>
            </SecondaryButton>
            <PrimaryButton onClick={() => openCreate()}>
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
        <StatCard label="Banques" value={rows.length} icon={BuildingLibraryIcon} tone="primary" />
        <StatCard
          label="Pays d'études couverts"
          value={`${countries.length - uncovered.length}/${countries.length}`}
          icon={GlobeAltIcon}
          tone="gold"
          hint={uncovered.length === 0 ? 'Tous les pays d’études sont pourvus' : `${uncovered.length} sans banque`}
        />
        <StatCard label="Comptes décrits" value={accountsTotal} icon={CreditCardIcon} tone="indigo" />
        <StatCard
          label="Comptes sans conditions"
          value={accountsWithoutConditions}
          icon={ExclamationTriangleIcon}
          tone={accountsWithoutConditions > 0 ? 'rose' : 'default'}
          hint={accountsWithoutConditions > 0 ? "Conditions d'ouverture à saisir" : "Toutes les conditions sont renseignées"}
        />
      </div>

      {uncovered.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3 text-sm text-gold-800">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="font-medium">Pays d'études sans banque :</span>
          {uncovered.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => openCreate(c)}
              className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium hover:bg-white cursor-pointer"
            >
              {countryLabel(c)} +
            </button>
          ))}
        </div>
      )}

      {offCatalog.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="font-medium">Hors pays d'études :</span>
          {offCatalog.map(r => <span key={r.id} className="text-xs">{r.name} ({r.country})</span>)}
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
              placeholder="Rechercher une banque, un compte…"
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
          <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gapsOnly}
              onChange={e => setGapsOnly(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30 cursor-pointer"
            />
            Seulement les fiches à compléter (compte ou conditions manquants)
          </label>
        </div>
      </Card>

      <TableShell
        head={<>
          <th>Banque</th>
          <th>Pays</th>
          <th>Comptes</th>
          <th className="text-center">Conditions d'ouverture</th>
          <th className="text-center">Visible</th>
          <th className="text-right">Actions</th>
        </>}
      >
        {loading ? (
          <EmptyRow colSpan={6}>Chargement…</EmptyRow>
        ) : filtered.length === 0 ? (
          <EmptyRow colSpan={6}>
            {rows.length === 0
              ? 'Aucune banque — cliquez « Ajouter » pour commencer.'
              : 'Aucune banque ne correspond à ces filtres.'}
          </EmptyRow>
        ) : filtered.map(r => {
          const accounts = list(r.accountTypes);
          const missing = accounts.filter(a => list(a.requirements).length === 0).length;
          const isOpen = expanded === r.id;
          return (
            <React.Fragment key={r.id}>
              <tr className="hover:bg-stone-50 transition-colors duration-150 align-top">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                    className="flex items-start gap-2 text-left cursor-pointer"
                    title={isOpen ? 'Replier' : 'Voir les comptes et leurs conditions'}
                  >
                    {isOpen
                      ? <ChevronDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                      : <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />}
                    <span>
                      <span className="font-medium text-stone-800">{r.name}</span>
                      {r.description && (
                        <p className="mt-0.5 max-w-md text-xs text-stone-500 line-clamp-2">{r.description}</p>
                      )}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  {countries.includes(r.country)
                    ? <span className="text-stone-700">{countryLabel(r.country)}</span>
                    : <Badge tone="rose">{r.country} — hors études</Badge>}
                </td>
                <td className="px-4 py-3">
                  {accounts.length === 0 ? (
                    <Badge tone="rose">Aucun compte</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {accounts.map((a, i) => {
                        // Une grille tarifaire peut porter sa condition (« 0 CAD avec
                        // justificatif ») : la pastille tronque, le détail déplié dit tout.
                        const label = `${a.name}${a.monthlyFee ? ` · ${a.monthlyFee}` : ''}`;
                        return (
                          <span key={a.id ?? i} title={label}>
                            {/* L'ellipse se pose sur un enfant bloc : `truncate` sur le
                                Badge (inline-flex) couperait le texte sans « … ». */}
                            <Badge tone="slate" className="max-w-xs">
                              <span className="block min-w-0 truncate">{label}</span>
                            </Badge>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {accounts.length === 0 ? (
                    <span className="text-xs text-stone-400">—</span>
                  ) : missing > 0 ? (
                    <Badge tone="rose">{missing} compte(s) à compléter</Badge>
                  ) : (
                    <Badge tone="green">
                      {accounts.reduce((n, a) => n + list(a.requirements).length, 0)} conditions
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-center"><BoolPill value={r.isActive} /></td>
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

              {isOpen && (
                <tr className="bg-stone-50/70">
                  <td colSpan={6} className="px-4 py-4">
                    {accounts.length === 0 ? (
                      <p className="text-sm text-stone-500">
                        Aucun compte décrit — la banque n'apparaît pas utilement côté site.
                      </p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {accounts.map((a, i) => (
                          <div key={a.id ?? i} className="rounded-xl border border-stone-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-medium text-stone-800">{a.name}</h4>
                              {a.monthlyFee && <Badge tone="amber">{a.monthlyFee}</Badge>}
                            </div>
                            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-stone-500">
                              <div><dt className="text-stone-400">Carte</dt><dd>{a.cardType || '—'}</dd></div>
                              <div><dt className="text-stone-400">Dépôt initial</dt><dd>{a.minimumDeposit || '—'}</dd></div>
                              <div><dt className="text-stone-400">Retrait</dt><dd>{a.withdrawalLimit || '—'}</dd></div>
                            </dl>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                              Conditions d'ouverture
                            </p>
                            {list(a.requirements).length === 0 ? (
                              <p className="mt-1 text-sm text-rose-600">À renseigner.</p>
                            ) : (
                              <ul className="mt-1 list-disc list-inside space-y-0.5 text-sm text-stone-600">
                                {list(a.requirements).map((req, k) => <li key={k}>{req}</li>)}
                              </ul>
                            )}
                            {list(a.studentPerks).length > 0 && (
                              <p className="mt-3 text-xs text-stone-500">
                                <span className="font-medium text-stone-600">Avantages étudiants : </span>
                                {list(a.studentPerks).join(' · ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </TableShell>

      {!loading && filtered.length > 0 && (
        <p className="mt-3 text-xs text-stone-400">
          {filtered.length} banque{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          {filtered.length !== rows.length && ` sur ${rows.length}`}.
          Les tarifs et plafonds sont indicatifs ; les conditions d'ouverture sont la partie à tenir à jour.
        </p>
      )}

      {showForm && (
        <Modal
          title={editingId !== null ? 'Modifier une banque' : 'Ajouter une banque'}
          onClose={() => setShowForm(false)}
          maxWidth="max-w-3xl"
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom de la banque" required>
              <TextInput
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex. Deutsche Bank"
              />
            </Field>
            <Field label="Pays d'études" required>
              <Select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                <option value="">— Choisir —</option>
                {countries.map(c => <option key={c} value={c}>{countryLabel(c)}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <TextArea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Positionnement de la banque, accessibilité pour un étudiant étranger, réserve sur les tarifs…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Image (URL)">
              <TextInput
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Visible sur le site">
              <label className="flex h-[38px] items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30 cursor-pointer"
                />
                Publiée
              </label>
            </Field>
          </div>

          {/* Sous-liste des comptes : c'est là que vivent les conditions d'ouverture. */}
          <div className="pt-2">
            <div className="flex items-center justify-between border-t border-stone-200 pt-4">
              <div>
                <h3 className="font-display text-base font-semibold text-stone-800">
                  Comptes proposés ({form.accounts.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Une banque sans compte n'apporte rien côté site. Les comptes sont remplacés en bloc à l'enregistrement.
                </p>
              </div>
              <SecondaryButton onClick={() => setForm(f => ({ ...f, accounts: [...f.accounts, { ...EMPTY_ACCOUNT }] }))}>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <PlusIcon className="h-4 w-4" /> Ajouter un compte
                </span>
              </SecondaryButton>
            </div>

            {form.accounts.length === 0 && (
              <p className="mt-4 rounded-lg border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-400">
                Aucun compte décrit pour cette banque.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {form.accounts.map((a, i) => (
                <div key={i} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Field label={`Nom du compte n° ${i + 1}`} required>
                        <TextInput
                          value={a.name}
                          onChange={e => patchAccount(i, { name: e.target.value })}
                          placeholder="Ex. Das Junge Konto"
                        />
                      </Field>
                    </div>
                    <div className="pt-7">
                      <IconButton
                        tone="rose"
                        title="Retirer ce compte"
                        onClick={() => setForm(f => ({ ...f, accounts: f.accounts.filter((_, k) => k !== i) }))}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Field label="Frais mensuels">
                      <TextInput
                        value={a.monthlyFee}
                        onChange={e => patchAccount(i, { monthlyFee: e.target.value })}
                        placeholder="0 €"
                      />
                    </Field>
                    <Field label="Carte">
                      <TextInput
                        value={a.cardType}
                        onChange={e => patchAccount(i, { cardType: e.target.value })}
                        placeholder="Visa Debit"
                      />
                    </Field>
                    <Field label="Dépôt initial">
                      <TextInput
                        value={a.minimumDeposit}
                        onChange={e => patchAccount(i, { minimumDeposit: e.target.value })}
                        placeholder="0 €"
                      />
                    </Field>
                    <Field label="Plafond de retrait">
                      <TextInput
                        value={a.withdrawalLimit}
                        onChange={e => patchAccount(i, { withdrawalLimit: e.target.value })}
                        placeholder="500 €/jour"
                      />
                    </Field>
                  </div>

                  <Field label="Conditions d'ouverture — une par ligne">
                    <TextArea
                      rows={5}
                      value={a.requirements}
                      onChange={e => patchAccount(i, { requirements: e.target.value })}
                      placeholder={'Passeport en cours de validité\nVisa ou titre de séjour\nCertificat de scolarité\nJustificatif de domicile'}
                    />
                  </Field>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Caractéristiques — une par ligne">
                      <TextArea
                        rows={4}
                        value={a.features}
                        onChange={e => patchAccount(i, { features: e.target.value })}
                        placeholder={'Application mobile\nVirements SEPA instantanés'}
                      />
                    </Field>
                    <Field label="Avantages étudiants — un par ligne">
                      <TextArea
                        rows={4}
                        value={a.studentPerks}
                        onChange={e => patchAccount(i, { studentPerks: e.target.value })}
                        placeholder={'Carte gratuite pendant les études\nRéductions transports'}
                      />
                    </Field>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={a.onlineBanking}
                      onChange={e => patchAccount(i, { onlineBanking: e.target.checked })}
                      className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    Banque en ligne / application mobile
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminBanks;
