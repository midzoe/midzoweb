import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

const fields: FieldDef[] = [
  { key: 'name', label: 'Nom (EN)', required: true },
  { key: 'name_fr', label: 'Nom (FR)', hideInTable: true },
  { key: 'region', label: 'Région' },
  { key: 'capital', label: 'Capitale', hideInTable: true },
  { key: 'flag_emoji', label: 'Drapeau (emoji)', hideInTable: true },
  { key: 'hero_image', label: 'URL Image Hero', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'study_available', label: 'Services études', type: 'checkbox' },
  { key: 'tourism_available', label: 'Services tourisme', type: 'checkbox' },
  { key: 'visa_info_available', label: 'Info visa dispo', type: 'checkbox' },
  { key: 'is_validated', label: 'Validé (IA)', type: 'checkbox' },
];

const AdminCountries: React.FC = () => (
  <AdminCRUD
    title="Pays"
    fields={fields}
    fetchItems={page => apiService.adminGetCountries(page)}
    createItem={data => apiService.adminCreateCountry(data)}
    updateItem={(id, data) => apiService.adminUpdateCountry(id, data)}
    deleteItem={id => apiService.adminDeleteCountry(id)}
    itemLabelKey="name"
  />
);

export default AdminCountries;
