import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 5.4 : gestion des centres de langue (potentiels partenaires). `language`/`country`
// utilisent le même vocabulaire FR que UserLanguage/requiredLanguage (ex. « Anglais ») pour
// permettre la redirection depuis l'exigence de langue université (story 5.8).
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom du centre', required: true },
  { key: 'language', label: 'Langue enseignée', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville', hideInTable: false },
  { key: 'levels', label: 'Niveaux (ex. A1-C1)', hideInTable: true },
  { key: 'link', label: 'Lien', hideInTable: true },
  { key: 'isPartner', label: 'Partenaire', type: 'checkbox' },
];

const AdminLanguageCenters: React.FC = () => (
  <AdminCRUD
    title="Centres de langue"
    fields={fields}
    fetchItems={page => apiService.adminGetLanguageCenters(page)}
    createItem={data => apiService.adminCreateLanguageCenter(data)}
    updateItem={(id, data) => apiService.adminUpdateLanguageCenter(id, data)}
    deleteItem={id => apiService.adminDeleteLanguageCenter(id)}
    itemLabelKey="name"
  />
);

export default AdminLanguageCenters;
