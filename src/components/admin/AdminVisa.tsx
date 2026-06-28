import React from 'react';
import AdminCRUD, { FieldDef } from './AdminCRUD';
import { apiService } from '../../services/api';

const VISA_TYPES = ['Tourisme', 'Étudiant', 'Travail', 'Transit', 'Long séjour'];

const ALL_COUNTRIES = [
  'Afghanistan', 'Algeria', 'Angola', 'Argentina', 'Australia', 'Austria', 'Azerbaijan',
  'Belgium', 'Benin', 'Bolivia', 'Botswana', 'Brazil', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Chad', 'Chile', 'China', 'Colombia', 'Congo',
  "Côte d'Ivoire", 'Czech Republic', 'Denmark', 'DR Congo', 'Egypt', 'Ethiopia',
  'Finland', 'France', 'Gabon', 'Germany', 'Ghana', 'Greece', 'Guinea', 'Haiti',
  'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Lebanon', 'Libya',
  'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Mauritania', 'Mauritius', 'Mexico',
  'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand',
  'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia',
  'Senegal', 'Sierra Leone', 'Singapore', 'Somalia', 'South Africa', 'South Korea',
  'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Tanzania',
  'Thailand', 'Togo', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uzbekistan', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
].sort();

const fields: FieldDef[] = [
  { key: 'origin_country', label: 'Pays d\'origine', type: 'select', options: ALL_COUNTRIES, required: true },
  { key: 'destination_country', label: 'Pays de destination', type: 'select', options: ALL_COUNTRIES, required: true },
  { key: 'visa_required', label: 'Visa requis', type: 'checkbox' },
  { key: 'visa_type', label: 'Type de visa', type: 'select', options: VISA_TYPES, hideInTable: true },
  { key: 'processing_time', label: 'Délai de traitement', hideInTable: true },
  { key: 'cost', label: 'Coût estimé (€)', hideInTable: true },
  { key: 'documents_required', label: 'Documents requis (séparés par virgule)', type: 'textarea', hideInTable: true },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
  { key: 'is_validated', label: 'Validé', type: 'checkbox' },
];

const AdminVisa: React.FC = () => (
  <AdminCRUD
    title="Règles Visa"
    fields={fields}
    fetchItems={page => apiService.adminGetVisaRules(page)}
    createItem={data => apiService.adminCreateVisaRule(data)}
    updateItem={(id, data) => apiService.adminUpdateVisaRule(id, data)}
    deleteItem={id => apiService.adminDeleteVisaRule(id)}
    itemLabelKey="origin_country"
  />
);

export default AdminVisa;
