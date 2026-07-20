import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 6.3 : gestion des partenaires (redirection trackée). clickCount en lecture seule (info).
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'url', label: 'URL', required: true },
  { key: 'category', label: 'Catégorie', hideInTable: false },
  { key: 'logoUrl', label: 'Logo (URL)', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'clickCount', label: 'Clics', hideInTable: false },
  { key: 'isActive', label: 'Actif', type: 'checkbox' },
];

const AdminPartners: React.FC = () => (
  <AdminCRUD
    title="Partenaires"
    fields={fields}
    fetchItems={page => apiService.adminGetPartners(page)}
    createItem={data => apiService.adminCreatePartner(data)}
    updateItem={(id, data) => apiService.adminUpdatePartner(id, data)}
    deleteItem={id => apiService.adminDeletePartner(id)}
    itemLabelKey="name"
  />
);

export default AdminPartners;
