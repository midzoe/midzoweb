import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 6.1 : gestion des programmes tourisme (safari/sport) à destination fixe.
const fields: FieldDef[] = [
  { key: 'title', label: 'Titre', required: true },
  { key: 'subcategory', label: 'Sous-catégorie', type: 'select', options: ['safari', 'sport'], required: true },
  { key: 'country', label: 'Pays (destination)', required: true },
  { key: 'city', label: 'Ville', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'itinerary', label: 'Itinéraire', type: 'textarea', hideInTable: true },
  { key: 'transport', label: 'Transport', hideInTable: true },
  { key: 'price', label: 'Prix', hideInTable: true },
  { key: 'currency', label: 'Devise', hideInTable: true },
  { key: 'isValidated', label: 'Validé (public)', type: 'checkbox' },
];

const AdminTourismPrograms: React.FC = () => (
  <AdminCRUD
    title="Programmes tourisme"
    fields={fields}
    fetchItems={page => apiService.adminGetTourismPrograms(page)}
    createItem={data => apiService.adminCreateTourismProgram(data)}
    updateItem={(id, data) => apiService.adminUpdateTourismProgram(id, data)}
    deleteItem={id => apiService.adminDeleteTourismProgram(id)}
    itemLabelKey="title"
  />
);

export default AdminTourismPrograms;
