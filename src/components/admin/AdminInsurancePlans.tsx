import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// `audience` choisit la page : general (Assurances), student (études), travel (tourisme).
// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'provider', label: 'Assureur', required: true },
  { key: 'audience', label: 'Public', type: 'select', options: ['general', 'student', 'travel'], required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'monthlyPremium', label: 'Cotisation mensuelle' },
  { key: 'coverage', label: 'Plafond de couverture', hideInTable: true },
  { key: 'coverageTypes', label: 'Garanties (séparées par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'benefits', label: 'Avantages (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'insuranceTypes', label: 'Familles de produit (séparées par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'rating', label: 'Note (0-5)', hideInTable: true },
  { key: 'reviews', label: "Nombre d'avis", hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminInsurancePlans: React.FC = () => (
  <AdminCRUD
    title="Assurances"
    subtitle="Offres affichées sur les pages Assurances, Assurance étudiante et Assurance voyage."
    fields={fields}
    fetchItems={() => apiService.adminGetInsurancePlans()}
    createItem={data => apiService.adminCreateInsurancePlan(data)}
    updateItem={(id, data) => apiService.adminUpdateInsurancePlan(id, data)}
    deleteItem={id => apiService.adminDeleteInsurancePlan(id)}
    itemLabelKey="provider"
  />
);

export default AdminInsurancePlans;
