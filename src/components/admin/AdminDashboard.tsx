import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  UsersIcon,
  NewspaperIcon,
  BookOpenIcon,
  GlobeAltIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  total_users?: number;
  premium_users?: number;
  total_news?: number;
  total_blogs?: number;
  total_countries?: number;
  total_visa_rules?: number;
}

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href: string;
}> = ({ label, value, icon: Icon, color, href }) => (
  <Link to={href} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.adminGetStats()
      .then(res => {
        // Support res.data ou les champs directement à la racine
        const s = res.data ?? res.stats ?? res;
        setStats({
          total_users:    s.total_users    ?? s.users    ?? 0,
          premium_users:  s.premium_users  ?? s.premium  ?? 0,
          total_news:     s.total_news     ?? s.news     ?? 0,
          total_blogs:    s.total_blogs    ?? s.blogs    ?? 0,
          total_countries:s.total_countries?? s.countries?? 0,
          total_visa_rules:s.total_visa_rules?? s.visa   ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Utilisateurs', value: stats.total_users ?? 0, icon: UsersIcon, color: 'bg-blue-500', href: '/admin/users' },
    { label: 'Premium', value: stats.premium_users ?? 0, icon: StarIcon, color: 'bg-yellow-500', href: '/admin/users' },
    { label: 'Actualités', value: stats.total_news ?? 0, icon: NewspaperIcon, color: 'bg-green-500', href: '/admin/news' },
    { label: 'Blogs', value: stats.total_blogs ?? 0, icon: BookOpenIcon, color: 'bg-purple-500', href: '/admin/blogs' },
    { label: 'Pays', value: stats.total_countries ?? 0, icon: GlobeAltIcon, color: 'bg-orange-500', href: '/admin/countries' },
  ];

  const backendReady = Object.values(stats).some(v => v !== undefined && v > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {!backendReady && !loading && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Backend en attente :</strong> Les endpoints admin (<code>/admin/stats</code>, <code>/admin/users</code>, <code>/admin/news</code>, etc.) ne sont pas encore implémentés.
          L'interface est prête — les données s'afficheront automatiquement dès que le backend les expose.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/news" className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            + Ajouter une actualité
          </Link>
          <Link to="/admin/blogs" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
            + Ajouter un blog
          </Link>
          <Link to="/admin/visa" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            + Ajouter règle visa
          </Link>
          <Link to="/admin/countries" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
            + Ajouter un pays
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
