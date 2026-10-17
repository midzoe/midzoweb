import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../../services/api';
import {
  MagnifyingGlassIcon, StarIcon, TrashIcon, PencilIcon, FolderOpenIcon,
  UsersIcon, ShieldCheckIcon, CheckBadgeIcon, SparklesIcon, ChevronDownIcon,
  EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, CalendarDaysIcon,
  PaperAirplaneIcon, BanknotesIcon, LanguageIcon, BellAlertIcon,
} from '@heroicons/react/24/outline';
import PremiumCasePanel from './PremiumCasePanel';
import {
  PageHeader, TableShell, EmptyRow, IconButton, Badge, StatCard,
  Modal, Field, TextInput, Select, PrimaryButton, SecondaryButton,
} from './ui';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role: string;
  is_premium?: boolean;
  isPremium?: boolean;
  premiumSince?: string | null;
  emailVerified?: boolean;
  nationality?: string | null;
  countryOfResidence?: string | null;
  newsletterStudy?: boolean;
  newsletterTourism?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  languages?: { language: string; level: string }[];
  premiumCase?: { status: string; assignedTo?: string | null; updatedAt?: string } | null;
  _count?: { trips: number; bookings: number; purchases: number; notifications: number };
  spentCents?: number;
  currency?: string;
  lastPurchaseAt?: string | null;
}

interface Stats {
  total: number; premium: number; admins: number;
  verified: number; new30d: number; newsletter: number;
}

interface EditState {
  id: number;
  email: string;
  password: string;
  role: string;
  is_premium: boolean;
  first_name: string;
  last_name: string;
  phone: string;
  nationality: string;
  country_of_residence: string;
  newsletter_study: boolean;
  newsletter_tourism: boolean;
  email_verified: boolean;
}

const ROLES = ['user', 'admin', 'superadmin'];
const roleTone = (r: string): 'rose' | 'indigo' | 'slate' =>
  r === 'superadmin' ? 'rose' : r === 'admin' ? 'indigo' : 'slate';

const caseTone = (s: string): 'blue' | 'amber' | 'green' =>
  s === 'open' ? 'blue' : s === 'in_progress' ? 'amber' : 'green';
const caseLabel = (s: string) =>
  s === 'open' ? 'Dossier ouvert' : s === 'in_progress' ? 'Dossier en cours' : 'Dossier clos';

// Les réponses backend mêlent camelCase (Prisma) et snake_case (ancien format) : on normalise ici.
const firstName = (u: AdminUser) => u.firstName ?? u.first_name ?? '';
const lastName = (u: AdminUser) => u.lastName ?? u.last_name ?? '';
const fullName = (u: AdminUser) => [firstName(u), lastName(u)].filter(Boolean).join(' ');
const isPremium = (u: AdminUser) => Boolean(u.isPremium ?? u.is_premium);
const createdAt = (u: AdminUser) => u.createdAt ?? u.created_at;

const initials = (u: AdminUser) => {
  const name = fullName(u) || u.username;
  return name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('');
};

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const fmtDateLong = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const fmtMoney = (cents = 0, currency = 'EUR') =>
  `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency === 'EUR' ? '€' : currency}`;

/** Ancienneté lisible : « il y a 3 mois » en dit plus qu'une date brute pour juger un compte. */
const sinceLabel = (d?: string | null) => {
  if (!d) return '';
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 31) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(days / 365);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
};

/** Ligne « libellé → valeur » du panneau de détail. */
const Detail: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({
  icon: Icon, label, children,
}) => (
  <div className="flex items-start gap-2.5">
    <Icon className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{label}</div>
      <div className="text-sm text-stone-700 break-words">{children}</div>
    </div>
  </div>
);

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [segment, setSegment] = useState<'' | 'premium'>('');
  const [role, setRole] = useState('');
  const [verified, setVerified] = useState('');
  const [sort, setSort] = useState('recent');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [caseUserId, setCaseUserId] = useState<number | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetUsers(page, limit, search, segment, { role, verified, sort });
      const list = res.data ?? res.users ?? res.results ?? res.items ?? [];
      const count = res.total ?? res.count ?? res.total_count ?? list.length ?? 0;
      setUsers(Array.isArray(list) ? list : []);
      setTotal(typeof count === 'number' ? count : 0);
      setStats(res.stats ?? null);
    } catch {
      setUsers([]);
      setTotal(0);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, segment, role, verified, sort]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (u: AdminUser) => setEditing({
    id: u.id,
    email: u.email,
    password: '',
    role: u.role,
    is_premium: isPremium(u),
    first_name: firstName(u),
    last_name: lastName(u),
    phone: u.phone ?? '',
    nationality: u.nationality ?? '',
    country_of_residence: u.countryOfResidence ?? '',
    newsletter_study: Boolean(u.newsletterStudy),
    newsletter_tourism: Boolean(u.newsletterTourism),
    email_verified: Boolean(u.emailVerified),
  });

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: any = {
        role: editing.role,
        is_premium: editing.is_premium,
        first_name: editing.first_name,
        last_name: editing.last_name,
        phone: editing.phone,
        nationality: editing.nationality,
        country_of_residence: editing.country_of_residence,
        newsletter_study: editing.newsletter_study,
        newsletter_tourism: editing.newsletter_tourism,
        email_verified: editing.email_verified,
      };
      if (editing.email) payload.email = editing.email;
      if (editing.password) payload.password = editing.password;
      await apiService.adminUpdateUser(editing.id, payload);
      setEditing(null);
      load();
    } catch {
      setError('Enregistrement impossible — vérifiez le backend.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await apiService.adminDeleteUser(id);
      load();
    } catch {
      setError('Suppression impossible — vérifiez le backend.');
    }
  };

  const resetFilters = () => {
    setSearch(''); setSegment(''); setRole(''); setVerified(''); setSort('recent'); setPage(1);
  };
  const filtered = Boolean(search || segment || role || verified);
  const touched = filtered || sort !== 'recent';
  const totalPages = Math.ceil(total / limit);
  const selectCls = 'border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white text-stone-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${total} compte${total > 1 ? 's' : ''}${filtered ? ' correspondant aux filtres' : ''}`}
      />

      {/* KPI — lecture globale de la base, indépendante des filtres */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Comptes" value={stats?.total ?? '—'} icon={UsersIcon} tone="primary" />
        <StatCard
          label="Premium" value={stats?.premium ?? '—'} icon={StarIcon} tone="gold"
          hint={stats && stats.total ? `${Math.round((stats.premium / stats.total) * 100)} % de la base` : undefined}
        />
        <StatCard
          label="Vérifiés" value={stats?.verified ?? '—'} icon={CheckBadgeIcon} tone="teal"
          hint={stats ? `${stats.total - stats.verified} email(s) non vérifié(s)` : undefined}
        />
        <StatCard label="Nouveaux (30 j)" value={stats?.new30d ?? '—'} icon={SparklesIcon} tone="indigo" />
        <StatCard
          label="Équipe" value={stats?.admins ?? '—'} icon={ShieldCheckIcon} tone="rose"
          hint="admins et superadmins"
        />
      </div>

      {/* Recherche + filtres */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-stone-300 overflow-hidden text-sm bg-white">
            <button onClick={() => { setSegment(''); setPage(1); }}
              className={`px-4 py-2 transition-colors duration-150 cursor-pointer ${segment === '' ? 'bg-primary text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
              Tous
            </button>
            <button onClick={() => { setSegment('premium'); setPage(1); }}
              className={`px-4 py-2 transition-colors duration-150 cursor-pointer ${segment === 'premium' ? 'bg-primary text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
              Premium
            </button>
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className={selectCls}>
            <option value="">Tous les rôles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={verified} onChange={e => { setVerified(e.target.value); setPage(1); }} className={selectCls}>
            <option value="">Email : tous</option>
            <option value="1">Vérifiés</option>
            <option value="0">Non vérifiés</option>
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className={selectCls}>
            <option value="recent">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="username">Nom (A→Z)</option>
            <option value="email">Email (A→Z)</option>
          </select>
          {touched && (
            <button onClick={resetFilters} className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-4 cursor-pointer">
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

      <TableShell head={<>
        <th className="w-10"></th>
        <th>Utilisateur</th><th>Contact</th><th>Localisation</th><th>Rôle</th>
        <th>Statut</th><th>Activité</th><th>Inscription</th><th className="text-right">Actions</th>
      </>}>
        {loading ? (
          <EmptyRow colSpan={9}>Chargement…</EmptyRow>
        ) : users.length === 0 ? (
          <EmptyRow colSpan={9}>Aucun utilisateur trouvé</EmptyRow>
        ) : users.map(u => {
          const open = expanded === u.id;
          const counts = u._count;
          return (
            <React.Fragment key={u.id}>
              <tr className={`transition-colors duration-150 ${open ? 'bg-stone-50' : 'hover:bg-stone-50'}`}>
                <td className="pl-4 py-3">
                  <button
                    onClick={() => setExpanded(open ? null : u.id)}
                    title={open ? 'Replier' : 'Voir la fiche'}
                    aria-label={open ? 'Replier' : 'Voir la fiche'}
                    className="inline-grid place-items-center h-7 w-7 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                  >
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center text-xs font-semibold ${
                      isPremium(u) ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {initials(u)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-stone-900 truncate">{u.username}</div>
                      <div className="text-xs text-stone-500 truncate">{fullName(u) || `ID #${u.id}`}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <span className="truncate max-w-[200px]">{u.email}</span>
                    {u.emailVerified
                      ? <span title="Email vérifié" className="shrink-0"><CheckBadgeIcon className="h-4 w-4 text-primary" /></span>
                      : <span title="Email non vérifié" className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-stone-400 tabular-nums">{u.phone || 'Aucun téléphone'}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="text-stone-700">{u.nationality || '—'}</div>
                  {u.countryOfResidence && (
                    <div className="text-xs text-stone-400 truncate">réside : {u.countryOfResidence}</div>
                  )}
                </td>

                <td className="px-4 py-3"><Badge tone={roleTone(u.role)}>{u.role}</Badge></td>

                <td className="px-4 py-3">
                  {isPremium(u) ? (
                    <div className="space-y-1">
                      <Badge tone="gold"><StarIcon className="h-3.5 w-3.5" /> Premium</Badge>
                      {u.premiumSince && <div className="text-xs text-stone-400">depuis {fmtDate(u.premiumSince)}</div>}
                    </div>
                  ) : (
                    <span className="text-stone-400 text-xs">Gratuit</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {counts ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 tabular-nums">
                      <span title="Voyages"><PaperAirplaneIcon className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />{counts.trips}</span>
                      <span title="Achats"><BanknotesIcon className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />{counts.purchases}</span>
                      {(u.spentCents ?? 0) > 0 && (
                        <span className="font-medium text-primary">{fmtMoney(u.spentCents, u.currency)}</span>
                      )}
                    </div>
                  ) : <span className="text-stone-400 text-xs">—</span>}
                </td>

                <td className="px-4 py-3">
                  <div className="text-stone-600 tabular-nums">{fmtDate(createdAt(u))}</div>
                  <div className="text-xs text-stone-400">{sinceLabel(createdAt(u))}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {isPremium(u) && (
                      <IconButton tone="amber" title="Dossier premium" onClick={() => setCaseUserId(u.id)}><FolderOpenIcon className="h-4 w-4" /></IconButton>
                    )}
                    <IconButton tone="blue" title="Modifier" onClick={() => startEdit(u)}><PencilIcon className="h-4 w-4" /></IconButton>
                    <IconButton tone="rose" title="Supprimer" onClick={() => deleteUser(u.id)}><TrashIcon className="h-4 w-4" /></IconButton>
                  </div>
                </td>
              </tr>

              {open && (
                <tr className="bg-stone-50/70">
                  <td colSpan={9} className="px-6 pb-6 pt-1">
                    <div className="rounded-xl border border-stone-200 bg-white p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-stone-800">
                          Fiche de {fullName(u) || u.username}
                        </h3>
                        <span className="text-xs text-stone-400 tabular-nums">ID #{u.id}</span>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <Detail icon={EnvelopeIcon} label="Email">
                          {u.email}{' '}
                          {u.emailVerified
                            ? <Badge tone="green" className="ml-1">vérifié</Badge>
                            : <Badge tone="amber" className="ml-1">non vérifié</Badge>}
                        </Detail>
                        <Detail icon={PhoneIcon} label="Téléphone">{u.phone || '—'}</Detail>
                        <Detail icon={GlobeAltIcon} label="Nationalité">{u.nationality || '—'}</Detail>
                        <Detail icon={MapPinIcon} label="Pays de résidence">{u.countryOfResidence || '—'}</Detail>

                        <Detail icon={LanguageIcon} label="Langues">
                          {u.languages && u.languages.length > 0 ? (
                            <span className="flex flex-wrap gap-1 mt-0.5">
                              {u.languages.map(l => (
                                <Badge key={l.language} tone="blue">{l.language} · {l.level}</Badge>
                              ))}
                            </span>
                          ) : 'Aucune langue renseignée'}
                        </Detail>
                        <Detail icon={BellAlertIcon} label="Newsletters">
                          {u.newsletterStudy || u.newsletterTourism ? (
                            <span className="flex flex-wrap gap-1 mt-0.5">
                              {u.newsletterStudy && <Badge tone="indigo">Études</Badge>}
                              {u.newsletterTourism && <Badge tone="green">Tourisme</Badge>}
                            </span>
                          ) : 'Non abonné'}
                        </Detail>
                        <Detail icon={CalendarDaysIcon} label="Inscription">
                          {fmtDateLong(createdAt(u))}
                          <span className="text-stone-400"> · {sinceLabel(createdAt(u))}</span>
                        </Detail>
                        <Detail icon={StarIcon} label="Premium">
                          {isPremium(u) ? `Depuis le ${fmtDateLong(u.premiumSince)}` : 'Compte gratuit'}
                          {u.premiumCase && (
                            <span className="block mt-1">
                              <Badge tone={caseTone(u.premiumCase.status)}>{caseLabel(u.premiumCase.status)}</Badge>
                              {u.premiumCase.assignedTo && (
                                <span className="text-xs text-stone-400 ml-1">· {u.premiumCase.assignedTo}</span>
                              )}
                            </span>
                          )}
                        </Detail>
                      </div>

                      {/* Activité chiffrée */}
                      <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                          { label: 'Voyages', value: counts?.trips ?? 0 },
                          { label: 'Réservations', value: counts?.bookings ?? 0 },
                          { label: 'Achats', value: counts?.purchases ?? 0 },
                          { label: 'Notifications', value: counts?.notifications ?? 0 },
                          { label: 'Total dépensé', value: fmtMoney(u.spentCents, u.currency) },
                        ].map(s => (
                          <div key={s.label}>
                            <div className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{s.label}</div>
                            <div className="font-display text-xl font-semibold text-stone-800 tabular-nums">{s.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-400">
                        {u.lastPurchaseAt && <span>Dernier achat : {fmtDate(u.lastPurchaseAt)}</span>}
                        {u.updatedAt && <span>Dernière modification : {fmtDate(u.updatedAt)}</span>}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <PrimaryButton onClick={() => startEdit(u)}>
                          <PencilIcon className="h-4 w-4" /> Modifier la fiche
                        </PrimaryButton>
                        {isPremium(u) && (
                          <SecondaryButton onClick={() => setCaseUserId(u.id)}>Ouvrir le dossier premium</SecondaryButton>
                        )}
                        <SecondaryButton onClick={() => { window.location.href = `mailto:${u.email}`; }}>Écrire un email</SecondaryButton>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </TableShell>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer">← Précédent</button>
          <span className="text-sm text-stone-500">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer">Suivant →</button>
        </div>
      )}

      {editing && (
        <Modal
          title="Modifier l'utilisateur"
          onClose={() => setEditing(null)}
          maxWidth="max-w-2xl"
          footer={<>
            <SecondaryButton onClick={() => setEditing(null)} disabled={saving}>Annuler</SecondaryButton>
            <PrimaryButton onClick={saveEdit} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</PrimaryButton>
          </>}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom">
              <TextInput value={editing.first_name} onChange={e => setEditing({ ...editing, first_name: e.target.value })} />
            </Field>
            <Field label="Nom">
              <TextInput value={editing.last_name} onChange={e => setEditing({ ...editing, last_name: e.target.value })} />
            </Field>
            <Field label="Email" required>
              <TextInput type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
            </Field>
            <Field label="Téléphone">
              <TextInput value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="+228 ..." />
            </Field>
            <Field label="Nationalité">
              <TextInput value={editing.nationality} onChange={e => setEditing({ ...editing, nationality: e.target.value })} />
            </Field>
            <Field label="Pays de résidence">
              <TextInput value={editing.country_of_residence} onChange={e => setEditing({ ...editing, country_of_residence: e.target.value })} />
            </Field>
            <Field label="Rôle">
              <Select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Nouveau mot de passe">
              <TextInput type="password" value={editing.password} onChange={e => setEditing({ ...editing, password: e.target.value })} placeholder="Laisser vide pour ne pas changer" />
            </Field>
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-2">
            {[
              { key: 'is_premium' as const, label: 'Compte premium' },
              { key: 'email_verified' as const, label: 'Email vérifié' },
              { key: 'newsletter_study' as const, label: 'Newsletter Études' },
              { key: 'newsletter_tourism' as const, label: 'Newsletter Tourisme' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing[opt.key]}
                  onChange={e => setEditing({ ...editing, [opt.key]: e.target.checked } as EditState)}
                  className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40 cursor-pointer"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </Modal>
      )}

      {caseUserId !== null && (
        <PremiumCasePanel userId={caseUserId} onClose={() => setCaseUserId(null)} />
      )}
    </div>
  );
};

export default AdminUsers;
