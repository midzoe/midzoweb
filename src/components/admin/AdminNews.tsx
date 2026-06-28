import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

const CATEGORIES = ['Études', 'Tourisme', 'Visa', 'Professionnelle', 'Général'];

const fields: FieldDef[] = [
  { key: 'title', label: 'Titre (EN)', required: true },
  { key: 'title_fr', label: 'Titre (FR)', hideInTable: true },
  { key: 'title_de', label: 'Titre (DE)', hideInTable: true },
  { key: 'description', label: 'Description (EN)', type: 'textarea', hideInTable: true },
  { key: 'description_fr', label: 'Description (FR)', type: 'textarea', hideInTable: true },
  { key: 'category', label: 'Catégorie', type: 'select', options: CATEGORIES },
  { key: 'image', label: 'URL Image', hideInTable: true },
  { key: 'link', label: 'Lien externe', hideInTable: true },
  { key: 'date', label: 'Date', type: 'date' },
];

const AdminNews: React.FC = () => (
  <AdminCRUD
    title="Actualités"
    fields={fields}
    fetchItems={page => apiService.adminGetNews(page)}
    createItem={data => apiService.adminCreateNews(data)}
    updateItem={(id, data) => apiService.adminUpdateNews(id, data)}
    deleteItem={id => apiService.adminDeleteNews(id)}
  />
);

export default AdminNews;
