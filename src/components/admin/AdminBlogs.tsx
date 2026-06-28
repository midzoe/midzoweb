import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

const CATEGORIES = ['Études', 'Tourisme', 'Visa', 'Culture', 'Conseils', 'Témoignage'];

const fields: FieldDef[] = [
  { key: 'title', label: 'Titre', required: true },
  { key: 'slug', label: 'Slug (URL)', required: true },
  { key: 'category', label: 'Catégorie', type: 'select', options: CATEGORIES },
  { key: 'author', label: 'Auteur' },
  { key: 'body', label: 'Contenu', type: 'textarea', hideInTable: true },
  { key: 'image', label: 'URL Image', hideInTable: true },
  { key: 'published_at', label: 'Publié le', type: 'date' },
  { key: 'is_published', label: 'Publié', type: 'checkbox' },
];

const AdminBlogs: React.FC = () => (
  <AdminCRUD
    title="Blogs"
    fields={fields}
    fetchItems={page => apiService.adminGetBlogs(page)}
    createItem={data => apiService.adminCreateBlog(data)}
    updateItem={(id, data) => apiService.adminUpdateBlog(id, data)}
    deleteItem={id => apiService.adminDeleteBlog(id)}
  />
);

export default AdminBlogs;
