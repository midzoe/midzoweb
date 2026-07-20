import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 5.1 : gestion des universités par pays et ville. `country` est un nom de
// pays en clair (cohérent avec le reste du catalogue). Les filières (programs) sont
// hors périmètre de cette page (cf. stories 5.2 / 5.3).
const fields: FieldDef[] = [
  { key: 'name', label: "Nom de l'université", required: true },
  { key: 'city', label: 'Ville', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'website', label: 'Site web', hideInTable: true },
  { key: 'applicationUrl', label: 'URL de candidature', hideInTable: true },
  { key: 'specialty', label: 'Spécialité' },
  // Story 5.3 : exigence de langue (comparée au profil de l'étudiant).
  { key: 'requiredLanguage', label: 'Langue requise', hideInTable: true },
  { key: 'requiredLanguageLevel', label: 'Niveau requis (CEFR)', type: 'select', options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], hideInTable: true },
];

const AdminUniversities: React.FC = () => (
  <AdminCRUD
    title="Universités"
    fields={fields}
    fetchItems={page => apiService.adminGetUniversities(page)}
    createItem={data => apiService.adminCreateUniversity(data)}
    updateItem={(id, data) => apiService.adminUpdateUniversity(id, data)}
    deleteItem={id => apiService.adminDeleteUniversity(id)}
    itemLabelKey="name"
  />
);

export default AdminUniversities;
