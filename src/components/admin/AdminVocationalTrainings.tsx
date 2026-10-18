import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Offres de formation professionnelle en alternance (Ausbildung), affichées dans le
// parcours Study (niveau « Formation professionnelle »). Les listes se saisissent
// séparées par des virgules ; le backend les convertit en tableaux.
const fields: FieldDef[] = [
  { key: 'occupation', label: 'Métier', required: true },
  { key: 'domain', label: 'Domaine (clé Study)', type: 'select', options: ['nursing', 'engineering', 'computer_science', 'business'], required: true, hideInTable: true },
  { key: 'employer', label: 'Employeur / école', required: true },
  { key: 'employerType', label: "Type d'employeur", hideInTable: true },
  { key: 'country', label: 'Pays (anglais, ex. Germany)', required: true, hideInTable: true },
  { key: 'city', label: 'Ville', required: true },
  { key: 'durationMonths', label: 'Durée (mois)', hideInTable: true },
  { key: 'languageLevel', label: 'Niveau de langue exigé', hideInTable: true },
  { key: 'salary', label: 'Rémunération (indicative)', hideInTable: true },
  { key: 'startDates', label: 'Rentrées (séparées par des virgules)', hideInTable: true },
  { key: 'requirements', label: 'Prérequis (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'documents', label: 'Documents (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'applicationUrl', label: 'Lien de candidature', hideInTable: true },
  { key: 'isValidated', label: 'Publiée', type: 'checkbox' },
];

const AdminVocationalTrainings: React.FC = () => (
  <AdminCRUD
    title="Ausbildung"
    subtitle="Offres de formation professionnelle en alternance du parcours Study."
    fields={fields}
    fetchItems={() => apiService.adminGetVocationalTrainings()}
    createItem={data => apiService.adminCreateVocationalTraining(data)}
    updateItem={(id, data) => apiService.adminUpdateVocationalTraining(id, data)}
    deleteItem={id => apiService.adminDeleteVocationalTraining(id)}
    itemLabelKey="employer"
  />
);

export default AdminVocationalTrainings;
