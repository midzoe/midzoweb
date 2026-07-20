import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

// Story 6.2 : gestion des événements tourisme (publiés / à venir).
const fields: FieldDef[] = [
  { key: 'title', label: 'Titre', required: true },
  { key: 'status', label: 'Statut', type: 'select', options: ['upcoming', 'published'] },
  { key: 'country', label: 'Pays', hideInTable: false },
  { key: 'city', label: 'Ville', hideInTable: true },
  { key: 'location', label: 'Lieu', hideInTable: true },
  { key: 'startDate', label: 'Date de début', type: 'date', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'link', label: 'Lien', hideInTable: true },
  { key: 'imageUrl', label: 'Image (URL)', hideInTable: true },
  { key: 'isPublished', label: 'Publié', type: 'checkbox' },
];

const AdminTourismEvents: React.FC = () => (
  <AdminCRUD
    title="Événements tourisme"
    fields={fields}
    fetchItems={page => apiService.adminGetTourismEvents(page)}
    createItem={data => apiService.adminCreateTourismEvent(data)}
    updateItem={(id, data) => apiService.adminUpdateTourismEvent(id, data)}
    deleteItem={id => apiService.adminDeleteTourismEvent(id)}
    itemLabelKey="title"
  />
);

export default AdminTourismEvents;
