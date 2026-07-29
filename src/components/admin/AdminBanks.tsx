import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Les comptes d'une banque (BankAccountType) ne sont pas éditables ici : ce CRUD ne gère
// pas les sous-listes. Ils se peuplent par le seed ou un appel direct à l'API admin.
// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom de la banque', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminBanks: React.FC = () => (
  <AdminCRUD
    title="Banques"
    subtitle="Banques proposées sur la page Compte bancaire étudiant."
    fields={fields}
    fetchItems={() => apiService.adminGetBanks()}
    createItem={data => apiService.adminCreateBank(data)}
    updateItem={(id, data) => apiService.adminUpdateBank(id, data)}
    deleteItem={id => apiService.adminDeleteBank(id)}
    itemLabelKey="name"
  />
);

export default AdminBanks;
