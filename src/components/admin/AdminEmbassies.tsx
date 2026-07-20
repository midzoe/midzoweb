import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 4.1 : gestion des ambassades par pays. `country` doit correspondre au nom exact
// du pays (cohérent avec le catalogue Country / les règles Visa).
const fields: FieldDef[] = [
  { key: 'country', label: 'Pays', required: true },
  { key: 'name', label: 'Nom de l\'ambassade', required: true },
  { key: 'location', label: 'Localisation', hideInTable: false },
  { key: 'link', label: 'Lien (site officiel)', hideInTable: true },
  { key: 'email', label: 'Email', hideInTable: true },
  { key: 'phone', label: 'Téléphone', hideInTable: true },
];

const AdminEmbassies: React.FC = () => (
  <AdminCRUD
    title="Ambassades"
    fields={fields}
    fetchItems={page => apiService.adminGetEmbassies(page)}
    createItem={data => apiService.adminCreateEmbassy(data)}
    updateItem={(id, data) => apiService.adminUpdateEmbassy(id, data)}
    deleteItem={id => apiService.adminDeleteEmbassy(id)}
    itemLabelKey="name"
  />
);

export default AdminEmbassies;
