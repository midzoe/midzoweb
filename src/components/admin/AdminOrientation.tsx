import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 10.1 : gestion des ressources d'orientation (guides, formations, entreprises, certifications).
// `location` = lieu de la formation, exposé uniquement aux premium côté public (FR35).
const fields: FieldDef[] = [
  { key: 'title', label: 'Titre', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['guide', 'book', 'company', 'certification'], required: true },
  { key: 'category', label: 'Catégorie' },
  { key: 'provider', label: 'Organisme', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'link', label: 'Lien', hideInTable: true },
  { key: 'location', label: 'Lieu (premium)', hideInTable: true },
  { key: 'isValidated', label: 'Validé (public)', type: 'checkbox' },
];

const AdminOrientation: React.FC = () => (
  <AdminCRUD
    title="Orientation"
    fields={fields}
    fetchItems={() => apiService.adminGetOrientation()}
    createItem={data => apiService.adminCreateOrientation(data)}
    updateItem={(id, data) => apiService.adminUpdateOrientation(id, data)}
    deleteItem={id => apiService.adminDeleteOrientation(id)}
    itemLabelKey="title"
  />
);

export default AdminOrientation;
