import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 9.6 : gestion des logements étudiants (Epic 5).
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['studio', 'shared', 'residence', 'homestay'], required: true },
  { key: 'pricePerMonth', label: 'Prix / mois', required: true },
  { key: 'currency', label: 'Devise', hideInTable: true },
  { key: 'contact', label: 'Contact', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
];

const AdminAccommodations: React.FC = () => (
  <AdminCRUD
    title="Hébergements"
    fields={fields}
    fetchItems={() => apiService.adminGetAccommodations()}
    createItem={data => apiService.adminCreateAccommodation(data)}
    updateItem={(id, data) => apiService.adminUpdateAccommodation(id, data)}
    deleteItem={id => apiService.adminDeleteAccommodation(id)}
    itemLabelKey="name"
  />
);

export default AdminAccommodations;
