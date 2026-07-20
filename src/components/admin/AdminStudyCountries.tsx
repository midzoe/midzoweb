import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 9.6 : gestion des pays d'étude (inclut les brouillons IA à valider — gate 9.2).
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'nameFr', label: 'Nom (FR)', hideInTable: true },
  { key: 'region', label: 'Région' },
  { key: 'capital', label: 'Capitale', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'source', label: 'Source', hideInTable: true },
  { key: 'isValidated', label: 'Validé (public)', type: 'checkbox' },
];

const AdminStudyCountries: React.FC = () => (
  <AdminCRUD
    title="Pays d'étude"
    fields={fields}
    fetchItems={() => apiService.adminGetStudyCountries()}
    createItem={data => apiService.adminCreateStudyCountry(data)}
    updateItem={(id, data) => apiService.adminUpdateStudyCountry(id, data)}
    deleteItem={id => apiService.adminDeleteStudyCountry(id)}
    itemLabelKey="name"
  />
);

export default AdminStudyCountries;
