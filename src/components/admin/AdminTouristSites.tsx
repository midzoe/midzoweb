import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom du site', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville' },
  { key: 'location', label: 'Localisation affichée (ex. Paris, France)', required: true, hideInTable: true },
  { key: 'category', label: 'Catégorie', type: 'select', options: ['Landmarks', 'Historical', 'Religious Sites', 'Museums', 'Parks', 'Entertainment'], required: true },
  { key: 'price', label: 'Tarif' },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'features', label: 'Prestations (séparées par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'rating', label: 'Note (0-5)', hideInTable: true },
  { key: 'reviews', label: "Nombre d'avis", hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminTouristSites: React.FC = () => (
  <AdminCRUD
    title="Sites touristiques"
    subtitle="Sites affichés sur la page Sites touristiques."
    fields={fields}
    fetchItems={() => apiService.adminGetTouristSites()}
    createItem={data => apiService.adminCreateTouristSite(data)}
    updateItem={(id, data) => apiService.adminUpdateTouristSite(id, data)}
    deleteItem={id => apiService.adminDeleteTouristSite(id)}
    itemLabelKey="name"
  />
);

export default AdminTouristSites;
