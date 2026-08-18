import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon, ExclamationTriangleIcon, CalculatorIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { PageHeader, Card, Field, TextInput, PrimaryButton, SecondaryButton, Badge, TableShell, EmptyRow } from './ui';

/**
 * Configuration tarifaire du MOTEUR DE DEVIS (parcours public /premium).
 *
 * C'est le seul écran qui pilote les montants du devis à la carte. Deux sources de vérité
 * y cohabitent, et il faut les deux pour qu'un prix sorte :
 *
 *  1. Le BARÈME GLOBAL (`pricing_config`, singleton) : prix d'un service supplémentaire
 *     et remises dégressives (2 catégories, puis 3+).
 *  2. Le PRIX DE BASE de chaque package du moteur (`family = null` : Study, Tourism,
 *     Orientation, Full Package Top). Les paliers de la plaquette (`family != null`) ne
 *     sont PAS ici : ils vivent dans l'écran Packages avec leur prix d'appel.
 *
 * Tant que ces montants valent 0, `computeQuote` renvoie honnêtement 0 et /premium affiche
 * « tarifs non configurés » — d'où la bannière d'alerte en haut de page.
 *
 * Saisie en EUROS, stockage en CENTIMES entiers : la base ne contient jamais un flottant
 * sur un montant.
 */

interface PricingConfig {
  price_per_subcategory_cents: number;
  discount_two_categories_pct: number;
  discount_three_plus_categories_pct: number;
  currency: string;
}

interface EnginePackage {
  id: number;
  name: string;
  base_price_cents: number;
  price_per_subcategory_cents: number | null;
  is_full_package: boolean;
  is_active: boolean;
  categories: string[];
  family: string | null;
  currency: string;
}

interface CategoryNode {
  id: string;
  name: string;
  subcategories: { id: number; name: string }[];
}

/** Centimes → champ de saisie en euros (pas de « 150.00 » quand « 150 » suffit). */
const centsToInput = (cents: number) => (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2));

/** Euros saisis → centimes ENTIERS. `null` = saisie invalide (à ne pas envoyer). */
const inputToCents = (value: string): number | null => {
  const n = Number(value.replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
};

const inputToPct = (value: string): number | null => {
  const n = Number(value.replace(',', '.'));
  if (!Number.isInteger(n) || n < 0 || n > 100) return null;
  return n;
};

const formatEuros = (cents: number, currency: string) =>
  `${(cents / 100).toLocaleString('fr-FR', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} ${currency === 'EUR' ? '€' : currency}`;

type Msg = { type: 'ok' | 'err'; text: string } | null;

const Notice: React.FC<{ m: Msg }> = ({ m }) =>
  m ? <p className={`mt-2 text-sm ${m.type === 'ok' ? 'text-primary' : 'text-rose-600'}`}>{m.text}</p> : null;

const AdminPricing: React.FC = () => {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [packages, setPackages] = useState<EnginePackage[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Barème global
  const [unitPrice, setUnitPrice] = useState('');
  const [discount2, setDiscount2] = useState('');
  const [discount3, setDiscount3] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [configBusy, setConfigBusy] = useState(false);
  const [configMsg, setConfigMsg] = useState<Msg>(null);

  // Prix de base par package : brouillons indexés par id.
  const [drafts, setDrafts] = useState<Record<number, { base: string; unit: string }>>({});
  const [pkgBusy, setPkgBusy] = useState(false);
  const [pkgMsg, setPkgMsg] = useState<Msg>(null);

  // Simulateur
  const [simCategories, setSimCategories] = useState<string[]>([]);
  const [simServices, setSimServices] = useState('0');
  const [simQuote, setSimQuote] = useState<any>(null);
  const [simError, setSimError] = useState('');
  const [simBusy, setSimBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [configRes, pkgRes, catRes] = await Promise.all([
        apiService.adminGetPricingConfig(),
        apiService.adminGetPackages(),
        apiService.getCategories(),
      ]);

      const cfg: PricingConfig = (configRes as any)?.config;
      setConfig(cfg);
      setUnitPrice(centsToInput(cfg?.price_per_subcategory_cents ?? 0));
      setDiscount2(String(cfg?.discount_two_categories_pct ?? 0));
      setDiscount3(String(cfg?.discount_three_plus_categories_pct ?? 0));
      setCurrency(cfg?.currency ?? 'EUR');

      // `family = null` : les paliers de la plaquette n'ont rien à faire dans le moteur de devis.
      const engine = ((pkgRes as any)?.packages ?? []).filter((p: EnginePackage) => p.family === null);
      setPackages(engine);
      setDrafts(
        Object.fromEntries(
          engine.map((p: EnginePackage) => [
            p.id,
            {
              base: centsToInput(p.base_price_cents),
              unit: p.price_per_subcategory_cents === null ? '' : centsToInput(p.price_per_subcategory_cents),
            },
          ])
        )
      );

      setCategories(((catRes as any)?.categories ?? (catRes as any)?.data ?? []) as CategoryNode[]);
    } catch (e: any) {
      setLoadError(e?.message || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Le devis reste à 0 tant qu'un prix de base manque : c'est le symptôme visible sur /premium. */
  const unpriced = packages.filter((p) => p.is_active && p.base_price_cents === 0);
  const notConfigured = !!config && unpriced.length > 0;

  const configValid =
    inputToCents(unitPrice) !== null &&
    inputToPct(discount2) !== null &&
    inputToPct(discount3) !== null &&
    currency.trim().length === 3;

  const saveConfig = async () => {
    const cents = inputToCents(unitPrice);
    const pct2 = inputToPct(discount2);
    const pct3 = inputToPct(discount3);
    if (cents === null || pct2 === null || pct3 === null) return;

    setConfigBusy(true);
    setConfigMsg(null);
    try {
      await apiService.adminUpdatePricingConfig({
        price_per_subcategory_cents: cents,
        discount_two_categories_pct: pct2,
        discount_three_plus_categories_pct: pct3,
        currency: currency.trim().toUpperCase(),
      });
      setConfigMsg({ type: 'ok', text: 'Barème enregistré.' });
      await load();
    } catch (e: any) {
      setConfigMsg({ type: 'err', text: e?.message || 'Échec de l’enregistrement.' });
    } finally {
      setConfigBusy(false);
    }
  };

  const draftOf = (p: EnginePackage) => drafts[p.id] ?? { base: '', unit: '' };

  const draftInvalid = (p: EnginePackage) => {
    const d = draftOf(p);
    if (inputToCents(d.base) === null) return true;
    return d.unit.trim() !== '' && inputToCents(d.unit) === null;
  };

  /** Ligne modifiée = à envoyer. Comparer les CENTIMES, pas les chaînes (« 150 » == « 150,00 »). */
  const draftChanged = (p: EnginePackage) => {
    const d = draftOf(p);
    const base = inputToCents(d.base);
    const unit = d.unit.trim() === '' ? null : inputToCents(d.unit);
    return base !== p.base_price_cents || unit !== p.price_per_subcategory_cents;
  };

  const dirtyPackages = packages.filter(draftChanged);
  const anyInvalid = packages.some(draftInvalid);

  const savePackages = async () => {
    if (anyInvalid || dirtyPackages.length === 0) return;
    setPkgBusy(true);
    setPkgMsg(null);
    try {
      // Une requête par package modifié : la route admin est unitaire (PUT /admin/packages/:id).
      for (const p of dirtyPackages) {
        const d = draftOf(p);
        await apiService.adminUpdatePackage(p.id, {
          name: p.name, // requis par la validation même en PUT partiel
          base_price_cents: inputToCents(d.base),
          // Vide = pas de prix propre : on renvoie `null` pour retomber sur le barème global.
          price_per_subcategory_cents: d.unit.trim() === '' ? null : inputToCents(d.unit),
        });
      }
      setPkgMsg({ type: 'ok', text: `${dirtyPackages.length} package(s) mis à jour.` });
      await load();
    } catch (e: any) {
      setPkgMsg({ type: 'err', text: e?.message || 'Échec de l’enregistrement.' });
    } finally {
      setPkgBusy(false);
    }
  };

  // --- Simulateur ----------------------------------------------------------
  // Les catégories proposées sont celles réellement portées par les packages du moteur :
  // simuler sur une catégorie qu'aucun package ne couvre ne dirait rien du prix réel.
  const engineCategories = useMemo(() => {
    const ids = new Set(packages.flatMap((p) => p.categories));
    return categories.filter((c) => ids.has(c.id));
  }, [packages, categories]);

  const toggleSim = (id: string) =>
    setSimCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /** Ids RÉELS de sous-catégories : le backend rejette (400) un id inconnu ou orphelin. */
  const simSubcategoryIds = useMemo(() => {
    const count = Math.max(0, parseInt(simServices, 10) || 0);
    const pool = engineCategories
      .filter((c) => simCategories.includes(c.id))
      .flatMap((c) => c.subcategories.map((s) => s.id));
    return pool.slice(0, count);
  }, [engineCategories, simCategories, simServices]);

  const runSimulation = async () => {
    if (simCategories.length === 0) return;
    setSimBusy(true);
    setSimError('');
    setSimQuote(null);
    try {
      // Même endpoint que la page publique : on vérifie le prix que verra le client, pas une copie.
      const res: any = await apiService.quotePackage(simCategories, simSubcategoryIds);
      setSimQuote(res?.quote ?? null);
    } catch (e: any) {
      setSimError(e?.message || 'Le calcul a échoué.');
    } finally {
      setSimBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Configuration tarifaire"
        subtitle="Les montants du parcours /premium (devis à la carte). Saisie en euros, stockage en centimes."
        actions={
          <SecondaryButton onClick={load}>
            <ArrowPathIcon className="h-4 w-4" /> Recharger
          </SecondaryButton>
        }
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</div>
      )}

      {notConfigured && (
        <div className="mb-6 flex gap-3 rounded-xl border border-gold-300 bg-gold-50 p-4">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-gold-700" />
          <div className="text-sm text-gold-900">
            <p className="font-semibold">Le devis à la carte est inopérant.</p>
            <p className="mt-1">
              {unpriced.length} package(s) du moteur n’ont pas de prix de base :{' '}
              <span className="font-medium">{unpriced.map((p) => p.name).join(', ')}</span>. Tant qu’ils valent 0 €,
              le total calculé vaut 0 et la page <span className="font-mono text-xs">/premium</span> affiche
              « tarifs non configurés » au lieu d’un devis.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* ── Barème global ─────────────────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-stone-900">Barème global</h2>
          <p className="mt-1 text-xs text-stone-500">
            S’applique à toutes les sélections. La remise dégressive ne concerne que les devis
            personnalisés — un package prédéfini porte déjà son avantage dans son prix.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Prix par service (€)">
              <TextInput
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                inputMode="decimal"
                placeholder="Ex. 50"
              />
            </Field>
            <Field label="Remise 2 catégories (%)">
              <TextInput value={discount2} onChange={(e) => setDiscount2(e.target.value)} inputMode="numeric" />
            </Field>
            <Field label="Remise 3+ catégories (%)">
              <TextInput value={discount3} onChange={(e) => setDiscount3(e.target.value)} inputMode="numeric" />
            </Field>
            <Field label="Devise">
              <TextInput
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
              />
            </Field>
          </div>

          <div className="mt-4">
            <PrimaryButton onClick={saveConfig} disabled={configBusy || !configValid}>
              {configBusy ? 'Enregistrement…' : 'Enregistrer le barème'}
            </PrimaryButton>
            {!configValid && (
              <p className="mt-2 text-xs text-rose-600">
                Montant en euros ≥ 0, remises entières entre 0 et 100, devise sur 3 lettres.
              </p>
            )}
            <Notice m={configMsg} />
          </div>
        </Card>

        {/* ── Prix de base des packages du moteur ───────────────────────── */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-stone-900">Prix de base des packages du moteur</h2>
          <p className="mt-1 text-xs text-stone-500">
            Ces packages ne s’affichent pas sur <span className="font-mono">/packages</span> : ils servent au calcul
            du devis. Un « prix par service » vide fait retomber le package sur le barème global.
          </p>

          <div className="mt-5">
            <TableShell
              head={
                <>
                  <th>Package</th>
                  <th>Catégories</th>
                  <th className="text-right">Prix de base (€)</th>
                  <th className="text-right">Prix par service (€)</th>
                  <th className="text-right">Enregistré</th>
                </>
              }
            >
              {packages.length === 0 && <EmptyRow colSpan={5}>Aucun package de moteur de devis.</EmptyRow>}
              {packages.map((p) => {
                const d = draftOf(p);
                return (
                  <tr key={p.id} className={draftChanged(p) ? 'bg-gold-50/40' : undefined}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-800">{p.name}</span>
                        {p.is_full_package && <Badge tone="gold">Full</Badge>}
                        {!p.is_active && <Badge tone="slate">Inactif</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">{p.categories.join(', ') || '—'}</td>
                    <td className="px-4 py-3 w-36">
                      <TextInput
                        value={d.base}
                        inputMode="decimal"
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [p.id]: { ...draftOf(p), base: e.target.value } }))
                        }
                        className="text-right tabular-nums"
                      />
                    </td>
                    <td className="px-4 py-3 w-40">
                      <TextInput
                        value={d.unit}
                        inputMode="decimal"
                        placeholder="barème global"
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [p.id]: { ...draftOf(p), unit: e.target.value } }))
                        }
                        className="text-right tabular-nums"
                      />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                      {p.base_price_cents === 0 ? (
                        <span className="text-rose-500">à saisir</span>
                      ) : (
                        <span className="text-stone-600">{formatEuros(p.base_price_cents, p.currency)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </TableShell>
          </div>

          <div className="mt-4">
            <PrimaryButton onClick={savePackages} disabled={pkgBusy || anyInvalid || dirtyPackages.length === 0}>
              {pkgBusy ? 'Enregistrement…' : `Enregistrer les prix${dirtyPackages.length ? ` (${dirtyPackages.length})` : ''}`}
            </PrimaryButton>
            {anyInvalid && <p className="mt-2 text-xs text-rose-600">Un montant est invalide (euros ≥ 0).</p>}
            <Notice m={pkgMsg} />
          </div>
        </Card>

        {/* ── Simulateur ────────────────────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
            <CalculatorIcon className="h-5 w-5 text-stone-400" />
            Simulateur
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Appelle le même endpoint que la page publique : ce qui s’affiche ici est ce que verra le client.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {engineCategories.map((c) => {
              const active = simCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleSim(c.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="w-40">
              <Field label="Services inclus">
                <TextInput
                  value={simServices}
                  inputMode="numeric"
                  onChange={(e) => setSimServices(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </Field>
            </div>
            <PrimaryButton onClick={runSimulation} disabled={simBusy || simCategories.length === 0}>
              {simBusy ? 'Calcul…' : 'Calculer'}
            </PrimaryButton>
          </div>

          {simSubcategoryIds.length < (parseInt(simServices, 10) || 0) && simCategories.length > 0 && (
            <p className="mt-2 text-xs text-stone-400">
              Les catégories choisies n’offrent que {simSubcategoryIds.length} service(s) : la simulation en tient compte.
            </p>
          )}

          {simError && <p className="mt-3 text-sm text-rose-600">{simError}</p>}

          {simQuote && (
            <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
              <div className="flex items-center gap-2">
                <Badge tone={simQuote.is_custom ? 'slate' : 'green'}>
                  {simQuote.is_custom ? 'Package personnalisé' : simQuote.package?.name}
                </Badge>
                {simQuote.total_cents > 0 && <CheckCircleIcon className="h-4 w-4 text-primary" />}
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-stone-600">
                  <dt>Base</dt>
                  <dd className="tabular-nums">{formatEuros(simQuote.base_price_cents, simQuote.currency)}</dd>
                </div>
                <div className="flex justify-between text-stone-600">
                  <dt>Services ({simQuote.subcategory_count})</dt>
                  <dd className="tabular-nums">{formatEuros(simQuote.subcategories_price_cents, simQuote.currency)}</dd>
                </div>
                {simQuote.discount_cents > 0 && (
                  <div className="flex justify-between text-primary">
                    <dt>Remise ({simQuote.discount_pct} %)</dt>
                    <dd className="tabular-nums">−{formatEuros(simQuote.discount_cents, simQuote.currency)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold text-stone-900">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatEuros(simQuote.total_cents, simQuote.currency)}</dd>
                </div>
              </dl>
              {simQuote.total_cents === 0 && (
                <p className="mt-3 text-xs text-rose-600">
                  Total nul : c’est exactement ce que voit le visiteur aujourd’hui.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminPricing;
