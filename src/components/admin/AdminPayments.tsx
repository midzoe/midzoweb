import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon, MagnifyingGlassIcon, BanknotesIcon, CreditCardIcon, ClockIcon,
  ArrowTopRightOnSquareIcon, ChevronRightIcon, XMarkIcon, SparklesIcon, CubeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { PageHeader, Card, StatCard, IconButton, Badge } from './ui';

/**
 * Journal des paiements (table `purchases`, story 3.4).
 *
 * **Lecture seule, par construction.** La vérité d'un paiement est chez Stripe : cet
 * écran sert à consulter, chercher et rapprocher (via `stripe_session_id`), jamais à
 * corriger un montant. Chaque ligne payée porte le `quote` figé au moment de l'achat —
 * c'est la facture lisible des mois plus tard, on l'affiche telle quelle.
 *
 * Les montants sont en centimes et plusieurs devises peuvent cohabiter : les totaux sont
 * donc affichés par devise, jamais additionnés entre eux.
 */

interface QuoteSnapshot {
  is_custom?: boolean;
  package?: { id: number; name: string } | null;
  categories?: string[];
  subcategory_count?: number;
  base_price_cents?: number;
  subcategories_price_cents?: number;
  subtotal_cents?: number;
  discount_pct?: number;
  discount_cents?: number;
  total_cents?: number;
  currency?: string;
}

interface PurchaseRow {
  id: number;
  amount_cents: number;
  currency: string;
  status: string;
  is_custom: boolean;
  quote: QuoteSnapshot | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  paid_at: string | null;
  package: { id: number; name: string } | null;
  user: {
    id: number; email: string; username?: string | null;
    firstName?: string | null; lastName?: string | null; isPremium?: boolean;
  } | null;
}

interface Bucket { currency: string; count: number; amount_cents: number }
interface Stats {
  paid: Bucket[]; pending: Bucket[]; last30d: Bucket[];
  paid_count: number; pending_count: number; custom_paid_count: number;
}

/** Centimes → montant lisible dans la devise de la ligne (jamais de conversion). */
const money = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 })
    .format((cents ?? 0) / 100);

/** Plusieurs devises : on les liste plutôt que d'additionner des pommes et des oranges. */
const sumLabel = (buckets: Bucket[]) => {
  if (!buckets.length) return money(0);
  return buckets.map(b => money(b.amount_cents, b.currency)).join(' + ');
};

const dateLabel = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const clientName = (u: PurchaseRow['user']) => {
  if (!u) return 'Compte supprimé';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return full || u.username || u.email;
};

/* ── Détail d'un paiement : le devis figé, tel qu'il a été facturé ─────────── */
const QuoteDetail: React.FC<{ row: PurchaseRow }> = ({ row }) => {
  const q = row.quote ?? {};
  const currency = q.currency ?? row.currency;
  const lines: [string, string][] = [];

  if (q.base_price_cents != null) lines.push(['Base', money(q.base_price_cents, currency)]);
  if (q.subcategories_price_cents) {
    lines.push([`Sous-catégories${q.subcategory_count ? ` (${q.subcategory_count})` : ''}`, money(q.subcategories_price_cents, currency)]);
  }
  if (q.subtotal_cents != null) lines.push(['Sous-total', money(q.subtotal_cents, currency)]);
  if (q.discount_cents) lines.push([`Remise${q.discount_pct ? ` (${q.discount_pct} %)` : ''}`, `− ${money(q.discount_cents, currency)}`]);

  return (
    <div className="border-t border-stone-200 bg-stone-50/60 px-4 py-4">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
            Devis figé à l’achat
          </p>
          {lines.length === 0 ? (
            <p className="text-sm text-stone-500">Aucun détail de devis enregistré sur cette ligne.</p>
          ) : (
            <dl className="max-w-md space-y-1.5 text-sm">
              {lines.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="tabular-nums text-stone-700">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-6 border-t border-stone-200 pt-1.5 font-medium">
                <dt className="text-stone-700">Total facturé</dt>
                <dd className="tabular-nums text-stone-900">{money(row.amount_cents, row.currency)}</dd>
              </div>
            </dl>
          )}

          {!!q.categories?.length && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs text-stone-400">Catégories achetées</p>
              <div className="flex flex-wrap gap-1.5">
                {q.categories.map(c => (
                  <span key={c} className="rounded-md bg-white px-2 py-0.5 text-[11px] text-stone-600 ring-1 ring-stone-200">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">Rapprochement Stripe</p>
          <dl className="space-y-2 text-xs">
            <div>
              <dt className="text-stone-400">Session</dt>
              <dd className="break-all font-mono text-stone-600">{row.stripe_session_id ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-stone-400">Payment intent</dt>
              <dd className="break-all font-mono text-stone-600">{row.stripe_payment_intent_id ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-stone-400">Créé le</dt>
              <dd className="text-stone-600">{dateLabel(row.created_at)}</dd>
            </div>
            <div>
              <dt className="text-stone-400">Payé le</dt>
              <dd className="text-stone-600">{dateLabel(row.paid_at)}</dd>
            </div>
          </dl>
          {row.stripe_payment_intent_id && (
            <a
              href={`https://dashboard.stripe.com/payments/${row.stripe_payment_intent_id}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary transition-colors duration-150 hover:underline"
            >
              Ouvrir dans Stripe <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminPayments: React.FC = () => {
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<'' | 'paid' | 'pending'>('');
  const [kind, setKind] = useState<'' | 'package' | 'custom'>('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.adminGetPurchases({ page, limit: 25, status, kind, search: search.trim() });
      setRows(Array.isArray(res.data) ? res.data : []);
      setStats(res.stats ?? null);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? 'Impossible de charger les paiements.');
    } finally {
      setLoading(false);
    }
  }, [page, status, kind, search]);

  // La recherche interroge l'API : on laisse retomber la frappe.
  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => { setPage(1); }, [status, kind, search]);

  const averageBasket = useMemo(() => {
    const main = stats?.paid?.[0];
    if (!main || main.count === 0) return null;
    return money(Math.round(main.amount_cents / main.count), main.currency);
  }, [stats]);

  const activeFilters = (status ? 1 : 0) + (kind ? 1 : 0) + (search.trim() ? 1 : 0);
  const resetFilters = () => { setStatus(''); setKind(''); setSearch(''); };

  const selectCls = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 cursor-pointer transition-colors duration-150 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      <PageHeader
        title="Paiements"
        subtitle={
          stats
            ? `${stats.paid_count} paiement${stats.paid_count > 1 ? 's' : ''} encaissé${stats.paid_count > 1 ? 's' : ''} · ${stats.pending_count} en attente`
            : 'Journal des achats de packages'
        }
        actions={
          <IconButton title="Rafraîchir" onClick={load} disabled={loading}>
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </IconButton>
        }
      />

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Masquer l’erreur" className="shrink-0 cursor-pointer">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Synthèse ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Encaissé" value={sumLabel(stats?.paid ?? [])} icon={BanknotesIcon} tone="primary"
          hint={`${stats?.paid_count ?? 0} paiement${(stats?.paid_count ?? 0) > 1 ? 's' : ''} confirmé${(stats?.paid_count ?? 0) > 1 ? 's' : ''}`} />
        <StatCard label="30 derniers jours" value={sumLabel(stats?.last30d ?? [])} icon={CreditCardIcon} tone="gold"
          hint={stats?.last30d?.length ? undefined : 'aucun encaissement récent'} />
        <StatCard label="En attente" value={stats?.pending_count ?? 0} icon={ClockIcon}
          tone={stats?.pending_count ? 'rose' : 'indigo'}
          hint={stats?.pending_count ? 'sessions ouvertes, jamais payées' : 'aucune session en suspens'} />
        <StatCard label="Panier moyen" value={averageBasket ?? '—'} icon={SparklesIcon} tone="teal"
          hint={stats?.custom_paid_count ? `${stats.custom_paid_count} sur mesure` : 'aucun package sur mesure vendu'} />
      </div>

      {/* ── Filtres ── */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-stone-200/70 bg-cream/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-cream/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un client, un package, une référence Stripe…"
              aria-label="Rechercher un paiement"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="inline-flex rounded-lg bg-stone-100 p-0.5" role="group" aria-label="Filtrer par statut">
            {([
              ['', 'Tous'],
              ['paid', 'Payés'],
              ['pending', 'En attente'],
            ] as const).map(([value, label]) => (
              <button
                key={value || 'all'}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={`rounded-[7px] px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  status === value ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select value={kind} onChange={e => setKind(e.target.value as typeof kind)} aria-label="Filtrer par type d’offre" className={selectCls}>
            <option value="">Toutes les offres</option>
            <option value="package">Package du catalogue</option>
            <option value="custom">Sur mesure</option>
          </select>

          {activeFilters > 0 && (
            <button type="button" onClick={resetFilters}
              className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors duration-150 hover:text-primary cursor-pointer">
              <XMarkIcon className="h-4 w-4" /> Réinitialiser ({activeFilters})
            </button>
          )}

          <span className="ml-auto shrink-0 text-sm text-stone-500">
            <span className="font-medium text-stone-700 tabular-nums">{total}</span> ligne{total > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Journal ── */}
      {loading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-3">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-10 rounded bg-stone-100" />)}
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="py-16 text-center">
          <BanknotesIcon className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 font-display text-lg text-stone-700">
            {activeFilters > 0 ? 'Aucun paiement pour ces critères' : 'Aucun paiement enregistré'}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
            {activeFilters > 0
              ? 'Élargissez la recherche ou remettez les filtres à zéro.'
              : 'La chaîne Stripe est en place (session de paiement, webhook, table des achats) mais aucun achat n’a encore été encaissé. La première vente apparaîtra ici automatiquement.'}
          </p>
          {activeFilters > 0 && (
            <button type="button" onClick={resetFilters} className="mt-4 text-sm text-primary hover:underline cursor-pointer">
              Réinitialiser les filtres
            </button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-left text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Offre</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(row => {
                const open = expanded === row.id;
                const paid = row.status === 'paid';
                return (
                  <React.Fragment key={row.id}>
                    <tr className="transition-colors duration-150 hover:bg-stone-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-800">{clientName(row.user)}</p>
                        <p className="text-xs text-stone-400">{row.user?.email ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-stone-700">
                          <CubeIcon className="h-4 w-4 text-stone-400" />
                          {row.package?.name ?? (row.is_custom ? 'Sur mesure' : '—')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{dateLabel(row.paid_at ?? row.created_at)}</td>
                      <td className="px-4 py-3">
                        {paid
                          ? <Badge tone="green">Payé</Badge>
                          : <Badge tone="amber">En attente</Badge>}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-medium ${paid ? 'text-stone-900' : 'text-stone-400'}`}>
                        {money(row.amount_cents, row.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? null : row.id)}
                          aria-expanded={open}
                          aria-label={open ? 'Masquer le détail' : 'Voir le détail'}
                          className="inline-flex cursor-pointer items-center rounded-lg p-1.5 text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <ChevronRightIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} className="p-0"><QuoteDetail row={row} /></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-stone-500">Page {page} sur {pages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-600 transition-colors duration-150 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-default">
              Précédent
            </button>
            <button type="button" disabled={page >= pages} onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-600 transition-colors duration-150 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-default">
              Suivant
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs text-stone-400">
        <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        Écran en lecture seule : un paiement ne se corrige pas ici. La référence fait foi
        dans le tableau de bord Stripe, et le devis affiché est celui figé au moment de l’achat.
      </p>
    </div>
  );
};

export default AdminPayments;
