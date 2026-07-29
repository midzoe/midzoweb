import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// `serviceType` détermine la page d'affichage : work_visa (visa travail),
// legalization (légalisation) ou recognition (reconnaissance de diplôme).
// Les champs spécifiques restent vides pour les autres types.
// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'provider', label: 'Prestataire', required: true },
  { key: 'serviceType', label: 'Type de service', type: 'select', options: ['work_visa', 'legalization', 'recognition'], required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'processingTime', label: 'Délai de traitement' },
  { key: 'price', label: 'Tarif' },
  { key: 'successRate', label: 'Taux de réussite (ex. 94%)' },
  { key: 'services', label: 'Prestations (séparées par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'visaTypes', label: 'Types de visa — work_visa (virgules)', type: 'textarea', hideInTable: true },
  { key: 'documentTypes', label: 'Types de document — legalization (virgules)', type: 'textarea', hideInTable: true },
  { key: 'acceptedDegrees', label: 'Diplômes acceptés — recognition (virgules)', type: 'textarea', hideInTable: true },
  { key: 'requirements', label: 'Pièces à fournir (séparées par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'features', label: 'Services inclus (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'rating', label: 'Note (0-5)', hideInTable: true },
  { key: 'link', label: 'Lien', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminServiceProviders: React.FC = () => (
  <AdminCRUD
    title="Démarches administratives"
    subtitle="Prestataires visa travail, légalisation de documents et reconnaissance de diplôme."
    fields={fields}
    fetchItems={() => apiService.adminGetServiceProviders()}
    createItem={data => apiService.adminCreateServiceProvider(data)}
    updateItem={(id, data) => apiService.adminUpdateServiceProvider(id, data)}
    deleteItem={id => apiService.adminDeleteServiceProvider(id)}
    itemLabelKey="provider"
  />
);

export default AdminServiceProviders;
