import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// `audience` sépare le catalogue grand public (general) de l'espace études (student).
// Les champs « séparés par des virgules » sont convertis en tableaux JSON par le backend
// (lib/directory-input.ts) : l'admin saisit du texte simple.
const fields: FieldDef[] = [
  { key: 'airline', label: 'Compagnie', required: true },
  { key: 'audience', label: 'Public', type: 'select', options: ['general', 'student'], required: true },
  { key: 'fromCity', label: 'Ville de départ', required: true },
  { key: 'fromCountry', label: 'Pays de départ', required: true },
  { key: 'toCity', label: "Ville d'arrivée", required: true },
  { key: 'toCountry', label: "Pays d'arrivée", required: true },
  { key: 'departure', label: 'Heure de départ', required: true, hideInTable: true },
  { key: 'arrival', label: "Heure d'arrivée", required: true, hideInTable: true },
  { key: 'price', label: 'Prix', required: true },
  { key: 'type', label: 'Classe / type', required: true },
  { key: 'duration', label: 'Durée', hideInTable: true },
  { key: 'stops', label: 'Escales (nombre)', hideInTable: true },
  { key: 'baggage', label: 'Bagages', hideInTable: true },
  { key: 'features', label: 'Services (séparés par des virgules)', type: 'textarea', hideInTable: true },
  { key: 'image', label: 'Image (URL)', hideInTable: true },
  { key: 'isActive', label: 'Visible', type: 'checkbox' },
];

const AdminFlights: React.FC = () => (
  <AdminCRUD
    title="Vols"
    subtitle="Catalogue des vols affichés sur les pages Vols et Vols étudiants."
    fields={fields}
    fetchItems={() => apiService.adminGetFlights()}
    createItem={data => apiService.adminCreateFlight(data)}
    updateItem={(id, data) => apiService.adminUpdateFlight(id, data)}
    deleteItem={id => apiService.adminDeleteFlight(id)}
    itemLabelKey="airline"
  />
);

export default AdminFlights;
