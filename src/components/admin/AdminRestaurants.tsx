import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville' },
  { key: 'location', label: 'Localisation affichée (ex. Paris, France)', required: true, hideInTable: true },
  { key: 'cuisine', label: 'Cuisine', required: true },
  { key: 'priceRange', label: 'Gamme de prix', type: 'select', options: ['€', '€€', '€€€', '€€€€'], required: true },
  { key: 'features', label: 'Points forts (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'rating', label: 'Note (0-5)', hideInTable: true },
  { key: 'reviews', label: "Nombre d'avis", hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminRestaurants: React.FC = () => (
  <AdminCRUD
    title="Restaurants"
    subtitle="Restaurants affichés sur la page Réservation de restaurant."
    fields={fields}
    fetchItems={() => apiService.adminGetRestaurants()}
    createItem={data => apiService.adminCreateRestaurant(data)}
    updateItem={(id, data) => apiService.adminUpdateRestaurant(id, data)}
    deleteItem={id => apiService.adminDeleteRestaurant(id)}
    itemLabelKey="name"
  />
);

export default AdminRestaurants;
