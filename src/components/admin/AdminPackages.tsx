import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 9.6 : gestion des packages (Epic 3). Le prix (centimes) et la composition par
// catégories restent pilotés par le parcours premium / pricing-config ; cet écran gère
// nom, description et indicateurs (full/custom/actif).
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'isFullPackage', label: 'Full package', type: 'checkbox' },
  { key: 'isCustom', label: 'Custom', type: 'checkbox' },
  { key: 'isActive', label: 'Actif', type: 'checkbox' },
];

const AdminPackages: React.FC = () => (
  <AdminCRUD
    title="Packages"
    fields={fields}
    fetchItems={() => apiService.adminGetPackages()}
    createItem={data => apiService.adminCreatePackage(data)}
    updateItem={(id, data) => apiService.adminUpdatePackage(id, data)}
    deleteItem={id => apiService.adminDeletePackage(id)}
    itemLabelKey="name"
  />
);

export default AdminPackages;
