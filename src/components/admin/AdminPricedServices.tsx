import React, { useEffect, useState } from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';
import { Card, PrimaryButton, TextInput } from './ui';

// Grille tarifaire : prix unitaire des services (S1..S11 études, T1..T10 tourisme) et
// remises selon le mode de paiement. Les parcours Study / Tourisme et la page /packages
// lisent ces valeurs : un prix changé ici s'applique sans redéploiement.

const fields: FieldDef[] = [
  { key: 'code', label: 'Code (S1…, T1…)', required: true },
  { key: 'name', label: 'Service', required: true },
  { key: 'family', label: 'Famille', type: 'select', options: ['study', 'tourism'], required: true },
  { key: 'priceEuros', label: 'Prix (€)', required: true },
  { key: 'complexity', label: 'Complexité', type: 'select', options: ['Basic', 'Standard', 'Advanced', 'Advanced / On-site', 'Complex'] },
  { key: 'order', label: 'Ordre', hideInTable: true },
  { key: 'isActive', label: 'Actif', type: 'checkbox' },
];

/** Euros saisis → centimes entiers ; le champ virtuel `priceEuros` ne part pas tel quel. */
const toPayload = (data: any) => {
  const { priceEuros, ...rest } = data;
  const euros = Number(String(priceEuros ?? '').replace(',', '.'));
  return { ...rest, priceCents: Number.isFinite(euros) ? Math.round(euros * 100) : undefined };
};

const INSTALLMENTS = [1, 3, 6, 12];

/** Services voyage : prix par dossier, N voyageurs inclus, +X % par voyageur supplémentaire. */
const TravelerPolicy: React.FC = () => {
  const [included, setIncluded] = useState('');
  const [pct, setPct] = useState('');
  const [saved, setSaved] = useState('');
  useEffect(() => {
    apiService.adminGetSettings()
      .then((r: any) => {
        const data = r?.data ?? {};
        setIncluded(String(data['tourism.travelers_included'] ?? '2'));
        setPct(String(data['tourism.extra_traveler_pct'] ?? '25'));
      })
      .catch(() => {});
  }, []);
  const save = async () => {
    const n = Number(included); const x = Number(pct);
    if (!Number.isInteger(n) || n < 1 || n > 20 || !Number.isFinite(x) || x < 0 || x > 100) { setSaved('Valeurs invalides (1 à 20 voyageurs, 0 à 100 %).'); return; }
    await apiService.adminUpdateSetting('tourism.travelers_included', n);
    await apiService.adminUpdateSetting('tourism.extra_traveler_pct', x);
    setSaved('Règle enregistrée : appliquée aux prochains devis et paiements.');
  };
  return (
    <Card className="p-6 mt-8">
      <h2 className="font-display text-lg font-semibold text-stone-800">Prix voyage selon le nombre de voyageurs</h2>
      <p className="text-sm text-stone-500 mt-1">Les services voyage sont facturés par dossier. Au-delà des voyageurs inclus, chaque voyageur ajoute un pourcentage au prix des services voyage (études : par étudiant, non concernées).</p>
      <div className="grid grid-cols-2 gap-4 mt-4 max-w-md">
        <label className="text-sm text-stone-700">Voyageurs inclus
          <TextInput type="number" min={1} max={20} value={included} onChange={e => { setSaved(''); setIncluded(e.target.value); }} />
        </label>
        <label className="text-sm text-stone-700">+ % par voyageur supplémentaire
          <TextInput type="number" min={0} max={100} value={pct} onChange={e => { setSaved(''); setPct(e.target.value); }} />
        </label>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <PrimaryButton onClick={save}>Enregistrer la règle</PrimaryButton>
        {saved && <span className="text-sm text-stone-600" role="status">{saved}</span>}
      </div>
    </Card>
  );
};

const PaymentDiscounts: React.FC = () => {
  const [values, setValues] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState('');
  useEffect(() => {
    apiService.adminGetSettings()
      .then((r: any) => {
        const data = r?.data ?? {};
        setValues(Object.fromEntries(INSTALLMENTS.map(n => [n, String(data[`payment.discount_pct.${n}`] ?? '')])));
      })
      .catch(() => {});
  }, []);
  const save = async () => {
    for (const n of INSTALLMENTS) {
      const v = Number(values[n]);
      if (Number.isFinite(v) && v >= 0 && v <= 50) await apiService.adminUpdateSetting(`payment.discount_pct.${n}`, v);
    }
    setSaved('Remises enregistrées.');
  };
  return (
    <Card className="p-6 mt-8">
      <h2 className="font-display text-lg font-semibold text-stone-800">Remises selon le mode de paiement</h2>
      <p className="text-sm text-stone-500 mt-1">Pourcentage appliqué au montant de l'offre (0 à 50 %).</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {INSTALLMENTS.map(n => (
          <label key={n} className="text-sm text-stone-700">
            {n === 1 ? 'En 1 fois' : `En ${n} fois`} (%)
            <TextInput type="number" min={0} max={50} value={values[n] ?? ''} onChange={e => { setSaved(''); setValues({ ...values, [n]: e.target.value }); }} />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <PrimaryButton onClick={save}>Enregistrer les remises</PrimaryButton>
        {saved && <span className="text-sm text-emerald-700">{saved}</span>}
      </div>
    </Card>
  );
};

const AdminPricedServices: React.FC = () => (
  <>
    <AdminCRUD
      title="Grille tarifaire"
      subtitle="Prix à l'unité des services études (S) et tourisme (T). Les packages se règlent dans « Packages »."
      fields={fields}
      fetchItems={() => apiService.adminGetPricedServices().then((r: any) => ({
        ...r,
        data: (r?.data ?? []).map((row: any) => ({ ...row, priceEuros: String(row.priceCents / 100) })),
      }))}
      createItem={data => apiService.adminCreatePricedService(toPayload(data))}
      updateItem={(id, data) => apiService.adminUpdatePricedService(id, toPayload(data))}
      deleteItem={id => apiService.adminDeletePricedService(id)}
      itemLabelKey="name"
    />
    <div className="px-6 lg:px-10 pb-10"><PaymentDiscounts /><TravelerPolicy /></div>
  </>
);

export default AdminPricedServices;
