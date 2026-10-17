import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Distinct des logements étudiants (/admin/accommodations), tarifés au mois.
// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'name', label: 'Nom', required: true },
  { key: 'country', label: 'Pays', required: true },
  { key: 'city', label: 'Ville', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['Hotel', 'Resort', 'Apartment', 'Villa', 'Guesthouse', 'Hostel'], required: true },
  { key: 'priceRange', label: 'Gamme de prix (ex. $200-$400/night)', required: true },
  { key: 'amenities', label: 'Équipements (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'rating', label: 'Note (0-5)', hideInTable: true },
  { key: 'reviews', label: "Nombre d'avis", hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminTourismAccommodations: React.FC = () => (
  <AdminCRUD
    title="Hébergements tourisme"
    subtitle="Hôtels et résidences affichés sur la page Hébergement tourisme (tarif à la nuit)."
    fields={fields}
    fetchItems={() => apiService.adminGetTourismAccommodations()}
    createItem={data => apiService.adminCreateTourismAccommodation(data)}
    updateItem={(id, data) => apiService.adminUpdateTourismAccommodation(id, data)}
    deleteItem={id => apiService.adminDeleteTourismAccommodation(id)}
    itemLabelKey="name"
  />
);

export default AdminTourismAccommodations;
