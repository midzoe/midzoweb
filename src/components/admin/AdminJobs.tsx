import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'title', label: 'Intitulé du poste', required: true },
  { key: 'company', label: 'Entreprise', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville' },
  { key: 'location', label: 'Localisation affichée (ex. Berlin, Germany)', required: true, hideInTable: true },
  { key: 'type', label: 'Contrat', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'], required: true },
  { key: 'salary', label: 'Rémunération' },
  { key: 'experience', label: 'Expérience attendue', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'requirements', label: 'Prérequis (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'benefits', label: 'Avantages (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'applyUrl', label: 'Lien de candidature', hideInTable: true },
  { key: 'postedAt', label: 'Date de publication', type: 'date', hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminJobs: React.FC = () => (
  <AdminCRUD
    title="Offres d'emploi"
    subtitle="Annonces affichées sur la page Jobs Finder."
    fields={fields}
    fetchItems={() => apiService.adminGetJobs()}
    createItem={data => apiService.adminCreateJob(data)}
    updateItem={(id, data) => apiService.adminUpdateJob(id, data)}
    deleteItem={id => apiService.adminDeleteJob(id)}
    itemLabelKey="title"
  />
);

export default AdminJobs;
