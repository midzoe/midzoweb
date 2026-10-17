import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon,
  ExclamationTriangleIcon, Squares2X2Icon, RectangleStackIcon, EyeSlashIcon,
  CheckCircleIcon, LinkIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import {
  PageHeader, PrimaryButton, SecondaryButton, Card, StatCard, IconButton, Badge,
  Field, TextInput, TextArea, Select, Modal, TableShell, EmptyRow, BoolPill,
} from './ui';

/**
 * Catalogue de services — l'écran qui manquait.
 *
 * La page publique `/services`, le TripWizard et le devis premium lisent tous les
 * tables `categories` / `services`. Jusqu'ici ces tables n'étaient modifiables que
 * par le seed : aucune route admin, et l'API n'acceptait qu'un seul champ
 * (`deliveryMode`). Ajouter un service demandait donc un redéploiement.
 *
 * Organisation en deux temps, comme les fiches visa : on choisit une catégorie à
 * gauche, on édite ses services dans une table dense à droite. Une catégorie
 * masquée (`isPublic = false`) disparaît du site sans que ses services soient
 * supprimés — c'est ainsi que « business » reste en réserve tant que ses pages
 * n'existent pas.
 */

const DELIVERY_MODES = ['online', 'physical', 'hybrid'];

const DELIVERY_LABEL: Record<string, string> = {
  online: 'En ligne',
  physical: 'Sur place',
  hybrid: 'Mixte',
};

interface CategoryRow {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isPublic: boolean;
  order: number;
  _count?: { services: number };
}

interface ServiceRow {
  id: number;
  categoryId: string;
  name: string;
  displayName?: string | null;
  description?: string | null;
  image?: string | null;
  learnMoreLink?: string | null;
  translationKey?: string | null;
  isExternal: boolean;
  isActive: boolean;
  deliveryMode: string;
  steps?: string[] | null;
  order: number;
}

const emptyCategory = (): Partial<CategoryRow> => ({
  id: '', name: '', description: '', icon: '', isPublic: true, order: 0,
});

const emptyService = (categoryId: string): Partial<ServiceRow> & { stepsText?: string } => ({
  categoryId, name: '', displayName: '', description: '', image: '',
  learnMoreLink: '', translationKey: '', isExternal: false, isActive: true,
  deliveryMode: 'online', order: 0, stepsText: '',
});

const AdminServices: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [categoryForm, setCategoryForm] = useState<Partial<CategoryRow> | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<(Partial<ServiceRow> & { stepsText?: string }) | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, svcRes]: [any, any] = await Promise.all([
        apiService.adminGetCategories(),
        apiService.adminGetServices(),
      ]);
      const cats: CategoryRow[] = catRes?.data ?? [];
      setCategories(cats);
      setServices(svcRes?.data ?? []);
      setActiveCategory(prev => (prev && cats.some(c => c.id === prev) ? prev : cats[0]?.id ?? ''));
    } catch (e: any) {
      setError(e?.message ?? 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const publicCats = categories.filter(c => c.isPublic);
    const publicCatIds = new Set(publicCats.map(c => c.id));
    return {
      categories: categories.length,
      publicCategories: publicCats.length,
      services: services.length,
      visible: services.filter(s => s.isActive && publicCatIds.has(s.categoryId)).length,
      noLink: services.filter(s => !s.learnMoreLink).length,
    };
  }, [categories, services]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services
      .filter(s => s.categoryId === activeCategory)
      .filter(s => !q || `${s.name} ${s.displayName ?? ''} ${s.learnMoreLink ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [services, activeCategory, search]);

  const currentCategory = categories.find(c => c.id === activeCategory);

  // ─── Catégories ────────────────────────────────────────────────────────────

  const openCategoryCreate = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategory());
  };

  const openCategoryEdit = (c: CategoryRow) => {
    setEditingCategoryId(c.id);
    setCategoryForm({ ...c });
  };

  const saveCategory = async () => {
    if (!categoryForm?.name?.trim()) { setError('Le nom de la catégorie est obligatoire'); return; }
    if (!editingCategoryId && !String(categoryForm.id ?? '').trim()) {
      setError("L'identifiant de la catégorie est obligatoire"); return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        id: String(categoryForm.id ?? '').trim(),
        name: categoryForm.name,
        description: categoryForm.description ?? '',
        icon: categoryForm.icon ?? '',
        isPublic: !!categoryForm.isPublic,
        order: Number(categoryForm.order ?? 0),
      };
      if (editingCategoryId) await apiService.adminUpdateCategory(editingCategoryId, payload);
      else await apiService.adminCreateCategory(payload);
      setCategoryForm(null);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (c: CategoryRow) => {
    if (!window.confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    setError('');
    try {
      await apiService.adminDeleteCategory(c.id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible');
    }
  };

  /** Publier/masquer sans ouvrir la fiche : c'est l'action la plus fréquente. */
  const toggleCategoryVisibility = async (c: CategoryRow) => {
    setError('');
    try {
      await apiService.adminUpdateCategory(c.id, { isPublic: !c.isPublic });
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Mise à jour impossible');
    }
  };

  // ─── Services ──────────────────────────────────────────────────────────────

  const openServiceCreate = () => {
    if (!activeCategory) return;
    setEditingServiceId(null);
    // Un nouveau service se place à la fin de la catégorie, pas en tête.
    const nextOrder = rows.reduce((max, r) => Math.max(max, r.order), 0) + 1;
    setServiceForm({ ...emptyService(activeCategory), order: nextOrder });
  };

  const openServiceEdit = (s: ServiceRow) => {
    setEditingServiceId(s.id);
    setServiceForm({ ...s, stepsText: (s.steps ?? []).join('\n') });
  };

  const saveService = async () => {
    if (!serviceForm?.name?.trim()) { setError('Le nom du service est obligatoire'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: serviceForm.name,
        categoryId: serviceForm.categoryId,
        displayName: serviceForm.displayName ?? '',
        description: serviceForm.description ?? '',
        image: serviceForm.image ?? '',
        learnMoreLink: serviceForm.learnMoreLink ?? '',
        translationKey: serviceForm.translationKey ?? '',
        isExternal: !!serviceForm.isExternal,
        isActive: !!serviceForm.isActive,
        deliveryMode: serviceForm.deliveryMode ?? 'online',
        steps: serviceForm.stepsText ?? '',
        order: Number(serviceForm.order ?? 0),
      };
      if (editingServiceId !== null) await apiService.adminUpdateService(editingServiceId, payload);
      else await apiService.adminCreateService(payload);
      setServiceForm(null);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (s: ServiceRow) => {
    if (!window.confirm(`Supprimer le service « ${s.displayName || s.name} » ?`)) return;
    setError('');
    try {
      await apiService.adminDeleteService(s.id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible');
    }
  };

  const toggleServiceActive = async (s: ServiceRow) => {
    setError('');
    try {
      await apiService.adminUpdateService(s.id, { isActive: !s.isActive });
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Mise à jour impossible');
    }
  };

  return (
    <div>
      <PageHeader
        title="Catalogue de services"
        subtitle="Catégories et services affichés sur /services, dans le TripWizard et dans le devis premium."
        actions={
          <>
            <SecondaryButton onClick={load}>
              <span className="inline-flex items-center gap-2"><ArrowPathIcon className="h-4 w-4" /> Actualiser</span>
            </SecondaryButton>
            <PrimaryButton onClick={openCategoryCreate}>
              <PlusIcon className="h-4 w-4" /> Catégorie
            </PrimaryButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Catégories" value={stats.categories} icon={Squares2X2Icon} hint={`${stats.publicCategories} publique(s)`} />
        <StatCard label="Services" value={stats.services} icon={RectangleStackIcon} />
        <StatCard label="Visibles sur le site" value={stats.visible} icon={CheckCircleIcon} tone="primary" hint={`${stats.services - stats.visible} masqué(s)`} />
        <StatCard label="Sans lien" value={stats.noLink} icon={LinkIcon} tone="gold" hint="Aucune page de destination" />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        {/* Rail des catégories : lesquelles sont publiées, et combien de services. */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
            Catégories
          </p>

          <div className="lg:hidden">
            <Select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {services.filter(s => s.categoryId === c.id).length} service(s)
                  {c.isPublic ? '' : ' (masquée)'}
                </option>
              ))}
            </Select>
          </div>

          <Card className="hidden overflow-hidden lg:block">
            <ul className="max-h-[32rem] divide-y divide-stone-100 overflow-y-auto">
              {loading && categories.length === 0 && (
                <li className="px-3 py-8 text-center text-xs text-stone-400">Chargement…</li>
              )}
              {!loading && categories.length === 0 && (
                <li className="px-3 py-8 text-center text-xs text-stone-400">Aucune catégorie</li>
              )}
              {categories.map(c => {
                const active = c.id === activeCategory;
                const count = services.filter(s => s.categoryId === c.id).length;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                        active ? 'bg-primary/10' : 'hover:bg-stone-50'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-8 w-0.5 shrink-0 rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${active ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
                          {c.icon} {c.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-stone-400">
                          {count} service{count > 1 ? 's' : ''}
                          {!c.isPublic && ' · masquée'}
                        </span>
                      </span>
                      {!c.isPublic && <EyeSlashIcon className="h-4 w-4 shrink-0 text-stone-300" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>

        <section className="min-w-0">
          {/* Barre de la catégorie choisie : identité, visibilité, actions. */}
          <Card className="mb-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-lg font-semibold text-stone-800">
                    {currentCategory ? `${currentCategory.icon ?? ''} ${currentCategory.name}` : '—'}
                  </h2>
                  {currentCategory && (
                    currentCategory.isPublic
                      ? <Badge tone="green">Publiée</Badge>
                      : <Badge tone="amber">Masquée</Badge>
                  )}
                </div>
                {currentCategory && (
                  <p className="mt-1 truncate text-xs text-stone-500">
                    <code className="rounded bg-stone-100 px-1">{currentCategory.id}</code>
                    {currentCategory.description ? ` — ${currentCategory.description}` : ''}
                  </p>
                )}
              </div>
              {currentCategory && (
                <div className="flex shrink-0 items-center gap-2">
                  <SecondaryButton onClick={() => toggleCategoryVisibility(currentCategory)}>
                    {currentCategory.isPublic ? 'Masquer' : 'Publier'}
                  </SecondaryButton>
                  <IconButton tone="blue" title="Modifier la catégorie" onClick={() => openCategoryEdit(currentCategory)}>
                    <PencilSquareIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton tone="rose" title="Supprimer la catégorie" onClick={() => deleteCategory(currentCategory)}>
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              )}
            </div>
          </Card>

          <Card className="mb-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <TextInput
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un service…"
                  className="pl-9"
                />
              </div>
              <PrimaryButton onClick={openServiceCreate} disabled={!activeCategory}>
                <PlusIcon className="h-4 w-4" /> Service
              </PrimaryButton>
            </div>
          </Card>

          <TableShell
            striped
            head={
              <>
                <th className="w-14">Ordre</th>
                <th>Service</th>
                <th>Lien</th>
                <th>Mode</th>
                <th className="text-center">Actif</th>
                <th className="text-right">Actions</th>
              </>
            }
          >
            {loading && <EmptyRow colSpan={6}>Chargement…</EmptyRow>}
            {!loading && rows.length === 0 && (
              <EmptyRow colSpan={6}>
                {search ? 'Aucun service ne correspond à cette recherche' : 'Aucun service dans cette catégorie'}
              </EmptyRow>
            )}
            {!loading && rows.map(s => (
              <tr key={s.id} className="[&>td]:px-4 [&>td]:py-3 align-top">
                <td className="tabular-nums text-stone-400">{s.order}</td>
                <td className="min-w-0">
                  <div className="font-medium text-stone-800">{s.displayName || s.name}</div>
                  <div className="mt-0.5 text-xs text-stone-400">
                    <code className="rounded bg-stone-100 px-1">{s.name}</code>
                    {s.translationKey && <span className="ml-2">i18n : {s.translationKey}</span>}
                  </div>
                  {s.description && (
                    <p className="mt-1 max-w-xl text-xs text-stone-500 line-clamp-2">{s.description}</p>
                  )}
                </td>
                <td className="text-xs">
                  {s.learnMoreLink ? (
                    <span className="inline-flex items-center gap-1 text-stone-600">
                      {s.isExternal && <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-stone-400" />}
                      {s.learnMoreLink}
                    </span>
                  ) : (
                    <Badge tone="amber">Sans lien</Badge>
                  )}
                </td>
                <td className="text-xs text-stone-600">{DELIVERY_LABEL[s.deliveryMode] ?? s.deliveryMode}</td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => toggleServiceActive(s)}
                    title={s.isActive ? 'Désactiver' : 'Activer'}
                    className="cursor-pointer"
                  >
                    <BoolPill value={s.isActive} yes="Actif" no="Masqué" />
                  </button>
                </td>
                <td className="text-right whitespace-nowrap">
                  <IconButton tone="blue" title="Modifier" onClick={() => openServiceEdit(s)}>
                    <PencilSquareIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton tone="rose" title="Supprimer" onClick={() => deleteService(s)}>
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </TableShell>
        </section>
      </div>

      {/* ─── Modale catégorie ─────────────────────────────────────────────── */}
      {categoryForm && (
        <Modal
          title={editingCategoryId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          onClose={() => setCategoryForm(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setCategoryForm(null)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={saveCategory} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          <Field label="Identifiant" required>
            <TextInput
              value={categoryForm.id ?? ''}
              disabled={!!editingCategoryId}
              onChange={e => setCategoryForm({ ...categoryForm, id: e.target.value })}
              placeholder="study"
            />
            <p className="mt-1 text-xs text-stone-400">
              Minuscules et tirets. Sert d'ancre dans l'URL (<code>/services#study</code>) et de préfixe aux clés de traduction.
              Non modifiable après création.
            </p>
          </Field>
          <Field label="Nom" required>
            <TextInput
              value={categoryForm.name ?? ''}
              onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <TextArea
              rows={2}
              value={categoryForm.description ?? ''}
              onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Icône (emoji)">
              <TextInput
                value={categoryForm.icon ?? ''}
                onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="🎓"
              />
            </Field>
            <Field label="Ordre">
              <TextInput
                type="number"
                value={String(categoryForm.order ?? 0)}
                onChange={e => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={!!categoryForm.isPublic}
              onChange={e => setCategoryForm({ ...categoryForm, isPublic: e.target.checked })}
              className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
            />
            Publiée sur le site
          </label>
        </Modal>
      )}

      {/* ─── Modale service ───────────────────────────────────────────────── */}
      {serviceForm && (
        <Modal
          title={editingServiceId !== null ? 'Modifier le service' : 'Nouveau service'}
          maxWidth="max-w-2xl"
          onClose={() => setServiceForm(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setServiceForm(null)} disabled={saving}>Annuler</SecondaryButton>
              <PrimaryButton onClick={saveService} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </PrimaryButton>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catégorie" required>
              <Select
                value={serviceForm.categoryId ?? ''}
                onChange={e => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Ordre">
              <TextInput
                type="number"
                value={String(serviceForm.order ?? 0)}
                onChange={e => setServiceForm({ ...serviceForm, order: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Clé de catalogue" required>
            <TextInput
              value={serviceForm.name ?? ''}
              onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
              placeholder="University finder"
            />
            <p className="mt-1 text-xs text-stone-400">
              Identifiant interne, unique dans la catégorie. Le TripWizard s'y réfère : ne le renommez pas sans raison.
            </p>
          </Field>

          <Field label="Libellé affiché">
            <TextInput
              value={serviceForm.displayName ?? ''}
              onChange={e => setServiceForm({ ...serviceForm, displayName: e.target.value })}
              placeholder="University Finder"
            />
          </Field>

          <Field label="Description">
            <TextArea
              rows={3}
              value={serviceForm.description ?? ''}
              onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lien « en savoir plus »">
              <TextInput
                value={serviceForm.learnMoreLink ?? ''}
                onChange={e => setServiceForm({ ...serviceForm, learnMoreLink: e.target.value })}
                placeholder="/services/university-finder"
              />
            </Field>
            <Field label="Mode de délivrance">
              <Select
                value={serviceForm.deliveryMode ?? 'online'}
                onChange={e => setServiceForm({ ...serviceForm, deliveryMode: e.target.value })}
              >
                {DELIVERY_MODES.map(m => <option key={m} value={m}>{DELIVERY_LABEL[m]}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Image (URL)">
            <TextInput
              value={serviceForm.image ?? ''}
              onChange={e => setServiceForm({ ...serviceForm, image: e.target.value })}
            />
          </Field>

          <Field label="Clé de traduction">
            <TextInput
              value={serviceForm.translationKey ?? ''}
              onChange={e => setServiceForm({ ...serviceForm, translationKey: e.target.value })}
              placeholder="study.universityFinder"
            />
            <p className="mt-1 text-xs text-stone-400">
              Facultatif. Si une traduction existe pour cette clé, elle prend le pas sur le libellé et la description
              ci-dessus ; sinon ce sont bien les textes saisis ici qui s'affichent.
            </p>
          </Field>

          <Field label="Étapes du parcours">
            <TextArea
              rows={5}
              value={serviceForm.stepsText ?? ''}
              onChange={e => setServiceForm({ ...serviceForm, stepsText: e.target.value })}
              placeholder={'Une étape par ligne\nÉvaluation du profil\nRecommandation de pays'}
            />
            <p className="mt-1 text-xs text-stone-400">
              Une étape par ligne. Affichées sur la page d'orientation ; laissez vide pour masquer la section.
            </p>
          </Field>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={!!serviceForm.isActive}
                onChange={e => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              Actif
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={!!serviceForm.isExternal}
                onChange={e => setServiceForm({ ...serviceForm, isExternal: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              Redirige vers un partenaire externe
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminServices;
