import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'course', label: 'Formation', required: true },
  { key: 'provider', label: 'Organisme', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville', hideInTable: true },
  { key: 'category', label: 'Catégorie', type: 'select', options: ['Technology', 'Healthcare', 'Business', 'Education'] },
  { key: 'duration', label: 'Durée' },
  { key: 'price', label: 'Prix' },
  { key: 'certification', label: 'Certification délivrée', hideInTable: true },
  { key: 'features', label: 'Contenus (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'rating', label: 'Note (0-5)', hideInTable: true },
  { key: 'reviews', label: "Nombre d'avis", hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'link', label: 'Lien', hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminTrainings: React.FC = () => (
  <AdminCRUD
    title="Formations"
    subtitle="Programmes affichés sur la page Training Finder."
    fields={fields}
    fetchItems={() => apiService.adminGetTrainings()}
    createItem={data => apiService.adminCreateTraining(data)}
    updateItem={(id, data) => apiService.adminUpdateTraining(id, data)}
    deleteItem={id => apiService.adminDeleteTraining(id)}
    itemLabelKey="course"
  />
);

export default AdminTrainings;
