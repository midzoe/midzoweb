import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, ArrowPathIcon, XMarkIcon,
  CubeIcon, AcademicCapIcon, SunIcon, Squares2X2Icon, CalendarDaysIcon,
  ArrowTopRightOnSquareIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, StatCard, IconButton, Badge,
  TableShell, EmptyRow, Modal, Field, TextInput, TextArea, Select, Card, BoolPill,
} from './ui';

/**
 * Gestion des packages — deux natures cohabitent volontairement ici :
 *
 *  1. Les PALIERS de la grille commerciale (plaquette « MIDZOE PACKAGES ») : Starter →
 *     All-Inclusive, Escape → Ultimate, Mix Essential → Mix XXL, consultation. Ils portent
 *     une famille, un prix d'appel et une liste d'avantages, et alimentent la page publique
 *     `/packages`. C'est ce que cet écran sert à éditer au quotidien.
 *
 *  2. Les packages du MOTEUR DE DEVIS (story 3.2 : Study, Tourism, Orientation, Full Package
 *     Top) : aucune famille, mais des catégories et un prix de base. Ils ne s'affichent PAS
 *     dans la vitrine ; leur tarification se pilote depuis le parcours premium / pricing-config.
 *
 * Le champ « Famille » est donc la frontière entre les deux : la vider sort un package de la
 * vitrine, la renseigner l'y fait entrer. Les prix sont saisis en EUROS et convertis en
 * CENTIMES à l'envoi — la base ne stocke jamais de flottant sur un montant.
 */

type FamilyId = 'study' | 'tourism' | 'mix' | 'consultation';

const FAMILIES: { id: FamilyId; label: string; icon: React.ElementType; tone: 'indigo' | 'green' | 'gold' | 'amber' }[] = [
  { id: 'study', label: 'Études', icon: AcademicCapIcon, tone: 'indigo' },
  { id: 'tourism', label: 'Tourisme', icon: SunIcon, tone: 'green' },
  { id: 'mix', label: 'Mix', icon: Squares2X2Icon, tone: 'amber' },
  { id: 'consultation', label: 'Consultation', icon: CalendarDaysIcon, tone: 'gold' },
];

const familyLabel = (f: string | null) => FAMILIES.find(x => x.id === f)?.label ?? '—';
const familyTone = (f: string | null) => FAMILIES.find(x => x.id === f)?.tone ?? 'slate';

const BILLING = [
  { value: 'once', label: 'Paiement unique' },
  { value: 'month', label: 'Par mois' },
];

const CURRENCIES = ['EUR', 'GBP', 'USD', 'CHF'];

interface Row {
  id: number;
  name: string;
  description: string | null;
  family: string | null;
  slug: string | null;
  tagline: string | null;
  service_label: string | null;
  price_from_cents: number;
  billing_period: string;
  currency: string;
  features: string[];
  badge: string | null;
  is_highlighted: boolean;
  is_active: boolean;
  order: number;
  categories: string[];
  base_price_cents: number;
}

type FormState = {
  name: string; family: string; slug: string; tagline: string; serviceLabel: string;
  description: string; priceFrom: string; billingPeriod: string; currency: string;
  features: string[]; badge: string; isHighlighted: boolean; isActive: boolean; order: string;
};

const EMPTY_FORM: FormState = {
  name: '', family: 'study', slug: '', tagline: '', serviceLabel: '', description: '',
  priceFrom: '', billingPeriod: 'once', currency: 'EUR', features: [], badge: '',
  isHighlighted: false, isActive: true, order: '',
};

/** Centimes → euros affichables dans un champ (jamais de « 150.00 » quand le prix est rond). */
const centsToInput = (cents: number) => (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2));

const formatEuros = (cents: number, currency: string) =>
  `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })} ${
    currency === 'EUR' ? '€' : currency
  }`;

/** Slug proposé à partir de la famille et du nom — l'admin peut toujours le corriger. */
const suggestSlug = (family: string, name: string) => {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!base) return '';
  return family && family !== 'consultation' && !base.startsWith(family) ? `${family}-${base}` : base;
};

const AdminPackages: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [familyFilter, setFamilyFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [featureDraft, setFeatureDraft] = useState('');
  const [saving, setSaving] = useState(false);
  // Le slug n'est auto-proposé que tant que l'admin ne l'a pas écrit lui-même.
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await apiService.adminGetPackages();
      setRows(res.data ?? res.packages ?? []);
    } catch {
      setRows([]);
      setError('Impossible de charger les packages — vérifiez que le backend répond.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showcase = useMemo(() => rows.filter(r => r.family), [rows]);
  const engine = useMemo(() => rows.filter(r => !r.family), [rows]);

  const filtered = useMemo(() => {
    const list = familyFilter === 'engine'
      ? engine
      : familyFilter
        ? showcase.filter(r => r.family === familyFilter)
        : rows;
    // Les paliers de la vitrine d'abord (dans l'ordre des familles), les packages du moteur
    // de devis en fin de liste : ce sont eux l'exception, pas le contenu principal de l'écran.
    const rank = (family: string | null) => {
      const index = FAMILIES.findIndex(f => f.id === family);
      return index === -1 ? FAMILIES.length : index;
    };
    return [...list].sort((a, b) =>
      rank(a.family) - rank(b.family) || a.order - b.order || a.id - b.id
    );
  }, [rows, showcase, engine, familyFilter]);

  /** Paliers publiés (actifs) : ce que le visiteur voit réellement sur /packages. */
  const published = useMemo(() => showcase.filter(r => r.is_active).length, [showcase]);
  /** Un palier vitrine sans prix d'appel s'afficherait « à partir de 0 € » : à signaler. */
  const priceless = useMemo(
    () => showcase.filter(r => r.is_active && r.price_from_cents <= 0),
    [showcase]
  );

  const openCreate = () => {
    setEditingId(null);
    const family = familyFilter && familyFilter !== 'engine' ? familyFilter : 'study';
    setForm({ ...EMPTY_FORM, family });
    setFeatureDraft('');
    setSlugTouched(false);
    setShowForm(true);
  };

  const openEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      family: r.family ?? '',
      slug: r.slug ?? '',
      tagline: r.tagline ?? '',
      serviceLabel: r.service_label ?? '',
      description: r.description ?? '',
      priceFrom: r.price_from_cents ? centsToInput(r.price_from_cents) : '',
      billingPeriod: r.billing_period || 'once',
      currency: r.currency || 'EUR',
      features: [...(r.features ?? [])],
      badge: r.badge ?? '',
      isHighlighted: r.is_highlighted,
      isActive: r.is_active,
      order: String(r.order ?? ''),
    });
    setFeatureDraft('');
    setSlugTouched(true);
    setShowForm(true);
  };

  const onNameChange = (name: string) =>
    setForm(f => ({ ...f, name, slug: slugTouched ? f.slug : suggestSlug(f.family, name) }));

  const onFamilyChange = (family: string) =>
    setForm(f => ({ ...f, family, slug: slugTouched ? f.slug : suggestSlug(family, f.name) }));

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value || form.features.includes(value)) return;
    setForm(f => ({ ...f, features: [...f.features, value] }));
    setFeatureDraft('');
  };

  const removeFeature = (value: string) =>
    setForm(f => ({ ...f, features: f.features.filter(x => x !== value) }));

  const priceEuros = Number(form.priceFrom.replace(',', '.'));
  const priceValid = form.priceFrom.trim() === '' || (Number.isFinite(priceEuros) && priceEuros >= 0);
  const formValid = form.name.trim() !== '' && priceValid;

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    setError('');
    try {
      // Euros saisis → centimes ENTIERS : Math.round, jamais un flottant tel quel.
      const priceFromCents = form.priceFrom.trim() === '' ? 0 : Math.round(priceEuros * 100);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        family: form.family || null,
        slug: form.slug.trim() || null,
        tagline: form.tagline.trim() || null,
        service_label: form.serviceLabel.trim() || null,
        price_from_cents: priceFromCents,
        billing_period: form.billingPeriod,
        currency: form.currency,
        features: form.features,
        badge: form.badge.trim() || null,
        is_highlighted: form.isHighlighted,
        is_active: form.isActive,
        order: form.order.trim() === '' ? 0 : parseInt(form.order, 10),
      };
      if (editingId !== null) {
        await apiService.adminUpdatePackage(editingId, payload);
      } else {
        await apiService.adminCreatePackage(payload);
      }
      setShowForm(false);
      await load();
    } catch {
      setError("Enregistrement refusé par le backend — vérifiez le nom (unique), le slug (unique) et le prix.");
    } finally {
      setSaving(false);
    }
  };

  /** Bascule publiée/masquée en un clic : c'est l'action la plus fréquente sur une grille tarifaire. */
  const toggleActive = async (r: Row) => {
    setError('');
    try {
      await apiService.adminUpdatePackage(r.id, { is_active: !r.is_active });
      await load();
    } catch {
      setError('Modification refusée par le backend.');
    }
  };

  const handleDelete = async (r: Row) => {
    if (!confirm(`Supprimer le package « ${r.name} » ?`)) return;
    try {
      await apiService.adminDeletePackage(r.id);
      await load();
    } catch {
      setError('Suppression refusée par le backend.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Packages"
        subtitle="Grille commerciale publiée sur /packages — familles, paliers, prix d'appel et avantages."
        actions={
          <>
            <SecondaryButton onClick={load} disabled={loading}>
              <span className="inline-flex items-center gap-2">
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </span>
            </SecondaryButton>
            <a
              href="/packages"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              Voir la page
            </a>
            <PrimaryButton onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </PrimaryButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Paliers vitrine" value={showcase.length} icon={CubeIcon} tone="primary" />
        <StatCard
          label="Publiés"
          value={`${published}/${showcase.length}`}
          icon={EyeIcon}
          tone="gold"
          hint={published === showcase.length ? 'Toute la grille est visible' : `${showcase.length - published} masqué(s)`}
        />
        <StatCard
          label="Sans prix d'appel"
          value={priceless.length}
          icon={ExclamationTriangleIcon}
          tone={priceless.length > 0 ? 'rose' : 'default'}
          hint={priceless.length > 0 ? 'Affichés « à partir de 0 € »' : 'Tous les paliers sont tarifés'}
        />
        <StatCard
          label="Moteur de devis"
          value={engine.length}
          icon={Squares2X2Icon}
          tone="indigo"
          hint="Hors vitrine — parcours /premium"
        />
      </div>

      {priceless.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-800">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="font-medium">Paliers publiés sans prix :</span>
          {priceless.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => openEdit(r)}
              className="cursor-pointer rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium hover:bg-white"
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Filtres par famille */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFamilyFilter('')}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              familyFilter === '' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tous ({rows.length})
          </button>
          {FAMILIES.map(({ id, label, icon: Icon }) => {
            const count = showcase.filter(r => r.family === id).length;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFamilyFilter(id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  familyFilter === id ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label} ({count})
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFamilyFilter('engine')}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              familyFilter === 'engine' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Moteur de devis ({engine.length})
          </button>
        </div>
      </Card>

      <TableShell
        striped
        head={<>
          <th>Package</th>
          <th>Famille</th>
          <th>Services</th>
          <th>Avantages</th>
          <th className="text-right">Prix d'appel</th>
          <th className="text-center">Ordre</th>
          <th className="text-center">Publié</th>
          <th className="text-right">Actions</th>
        </>}
      >
        {loading ? (
          <EmptyRow colSpan={8}>Chargement…</EmptyRow>
        ) : filtered.length === 0 ? (
          <EmptyRow colSpan={8}>
            {rows.length === 0
              ? 'Aucun package — cliquez « Ajouter » pour créer le premier palier.'
              : 'Aucun package dans cette famille.'}
          </EmptyRow>
        ) : filtered.map(r => (
          <tr key={r.id} className="align-top transition-colors duration-150 hover:bg-stone-50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-800">{r.name}</span>
                {r.badge && <Badge tone="gold">{r.badge}</Badge>}
                {r.is_highlighted && <Badge tone="amber">Mis en avant</Badge>}
              </div>
              {r.tagline && <p className="mt-0.5 max-w-sm text-xs text-stone-500">{r.tagline}</p>}
              {r.slug && <p className="mt-0.5 font-mono text-[11px] text-stone-400">/{r.slug}</p>}
            </td>
            <td className="px-4 py-3">
              {r.family ? (
                <Badge tone={familyTone(r.family)}>{familyLabel(r.family)}</Badge>
              ) : (
                <Badge tone="slate">Moteur de devis</Badge>
              )}
            </td>
            <td className="px-4 py-3 max-w-[14rem] text-stone-600">
              {r.family
                ? (r.service_label || <span className="text-stone-400">—</span>)
                : (r.categories.length > 0
                    ? <span className="text-xs">{r.categories.join(', ')}</span>
                    : <span className="text-stone-400">—</span>)}
            </td>
            <td className="px-4 py-3">
              {r.features.length > 0 ? (
                <ul className="max-w-xs space-y-0.5 text-xs text-stone-600">
                  {r.features.slice(0, 3).map(f => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate" title={f}>{f}</span>
                    </li>
                  ))}
                  {r.features.length > 3 && (
                    <li className="pl-4 text-stone-400">+{r.features.length - 3} autre(s)</li>
                  )}
                </ul>
              ) : (
                <span className="text-stone-400">—</span>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
              {r.family ? (
                r.price_from_cents > 0 ? (
                  <span className="font-medium text-stone-800">
                    {formatEuros(r.price_from_cents, r.currency)}
                    {r.billing_period === 'month' && <span className="text-xs font-normal text-stone-400"> /mois</span>}
                  </span>
                ) : (
                  <span className="text-rose-500">à saisir</span>
                )
              ) : (
                <span className="text-stone-400" title="Tarif piloté par le moteur de devis">
                  {formatEuros(r.base_price_cents, r.currency)}
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-center tabular-nums text-stone-500">{r.order}</td>
            <td className="px-4 py-3 text-center"><BoolPill value={r.is_active} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <IconButton
                  tone={r.is_active ? 'amber' : 'green'}
                  title={
                    r.family
                      ? (r.is_active ? 'Masquer de la vitrine' : 'Publier sur /packages')
                      : (r.is_active ? 'Désactiver (moteur de devis)' : 'Réactiver (moteur de devis)')
                  }
                  onClick={() => toggleActive(r)}
                >
                  {r.is_active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </IconButton>
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
          Les paliers d'une même famille s'affichent sur /packages dans l'ordre croissant du champ « Ordre ».
          Les packages « moteur de devis » n'apparaissent jamais sur cette page : ils servent au calcul du parcours /premium.
        </p>
      )}

      {showForm && (
        <Modal
          maxWidth="max-w-2xl"
          title={editingId !== null ? 'Modifier un package' : 'Ajouter un package'}
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom du palier" required>
              <TextInput
                value={form.name}
                onChange={e => onNameChange(e.target.value)}
                placeholder="Ex. Premium"
              />
            </Field>
            <Field label="Famille">
              <Select value={form.family} onChange={e => onFamilyChange(e.target.value)}>
                {FAMILIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                <option value="">— Aucune (moteur de devis) —</option>
              </Select>
            </Field>
          </div>

          {form.family === '' && (
            <p className="rounded-lg border border-gold-200 bg-gold-50/70 p-3 text-xs text-gold-800">
              Sans famille, ce package n'apparaît pas sur la page /packages : il sert au calcul du parcours
              premium (catégories et prix de base pilotés depuis la configuration tarifaire).
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de services affiché">
              <TextInput
                value={form.serviceLabel}
                onChange={e => setForm({ ...form, serviceLabel: e.target.value })}
                placeholder="Ex. 3 à 4 services"
              />
            </Field>
            <Field label="Identifiant d'URL (slug)">
              <TextInput
                value={form.slug}
                onChange={e => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }}
                placeholder="study-premium"
              />
            </Field>
          </div>

          <Field label="Accroche">
            <TextInput
              value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
              placeholder="Ex. L'essentiel de votre dossier"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Prix à partir de">
              <TextInput
                type="number"
                min={0}
                step="1"
                value={form.priceFrom}
                onChange={e => setForm({ ...form, priceFrom: e.target.value })}
                placeholder="520"
              />
            </Field>
            <Field label="Devise">
              <Select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Facturation">
              <Select value={form.billingPeriod} onChange={e => setForm({ ...form, billingPeriod: e.target.value })}>
                {BILLING.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Avantages affichés sur la carte">
            <div className="flex gap-2">
              <TextInput
                value={featureDraft}
                onChange={e => setFeatureDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                placeholder="Ex. Assistance VIP — puis Entrée"
              />
              <SecondaryButton onClick={addFeature}>Ajouter</SecondaryButton>
            </div>
            {form.features.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {form.features.map(f => (
                  <li key={f} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
                    <span className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </span>
                    <IconButton tone="rose" title="Retirer" onClick={() => removeFeature(f)}>
                      <XMarkIcon className="h-4 w-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <Field label="Description interne">
            <TextArea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ce que couvre réellement ce palier (visible dans l'admin et sur la fiche)."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pastille (facultative)">
              <TextInput
                value={form.badge}
                onChange={e => setForm({ ...form, badge: e.target.value })}
                placeholder="Ex. Le plus choisi"
              />
            </Field>
            <Field label="Ordre d'affichage">
              <TextInput
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: e.target.value })}
                placeholder="3"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              Publié sur /packages
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.isHighlighted}
                onChange={e => setForm({ ...form, isHighlighted: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              Mettre en avant (carte encadrée)
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPackages;
