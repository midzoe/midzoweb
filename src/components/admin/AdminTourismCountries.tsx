import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 9.6 : gestion des pays tourisme (liste séparée des pays d'étude — FR19b ; gate 9.2).
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'nameFr', label: 'Nom (FR)', hideInTable: true },
  { key: 'region', label: 'Région' },
  { key: 'capital', label: 'Capitale', hideInTable: true },
  { key: 'currency', label: 'Devise', hideInTable: true },
  { key: 'language', label: 'Langue', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'isValidated', label: 'Validé (public)', type: 'checkbox' },
];

const AdminTourismCountries: React.FC = () => (
  <AdminCRUD
    title="Pays tourisme"
    fields={fields}
    fetchItems={() => apiService.adminGetTourismCountries()}
    createItem={data => apiService.adminCreateTourismCountry(data)}
    updateItem={(id, data) => apiService.adminUpdateTourismCountry(id, data)}
    deleteItem={id => apiService.adminDeleteTourismCountry(id)}
    itemLabelKey="name"
  />
);

export default AdminTourismCountries;
