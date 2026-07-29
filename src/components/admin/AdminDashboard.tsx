import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  UsersIcon,
  NewspaperIcon,
  BookOpenIcon,
  GlobeAltIcon,
  StarIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Card, PageHeader } from './ui';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  total_users?: number;
  premium_users?: number;
  total_news?: number;
  total_blogs?: number;
  total_countries?: number;
  total_visa_rules?: number;
  total_contacts?: number;
  new_contacts?: number;
  newsletter_study?: number;
  newsletter_tourism?: number;
  pending_validation?: number;
}

const tones: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  gold: 'bg-gold-100 text-gold-700',
  green: 'bg-primary/10 text-primary',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  rose: 'bg-rose-50 text-rose-500',
  teal: 'bg-teal-50 text-teal-600',
};

const StatCardLink: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: keyof typeof tones;
  href: string;
  badge?: number;
}> = ({ label, value, icon: Icon, tone, href, badge }) => (
  <Link
    to={href}
    className="group bg-white border border-stone-200/80 rounded-2xl shadow-card p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{label}</p>
      <div className={`shrink-0 h-9 w-9 rounded-full grid place-items-center ${tones[tone]}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
    </div>
    <p className="mt-3 font-display text-3xl font-semibold text-stone-800 tabular-nums">{value ?? '—'}</p>
    {badge != null && badge > 0 && (
      <span className="mt-2 inline-flex items-center rounded-full bg-gold-100 text-gold-700 px-2 py-0.5 text-xs font-medium">
        {badge} en attente
      </span>
    )}
  </Link>
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    apiService.adminGetStats()
      .then(res => {
        const s = res.data ?? res.stats ?? res;
        setStats({
          total_users: s.total_users ?? s.users ?? 0,
          premium_users: s.premium_users ?? s.premium ?? 0,
          total_news: s.total_news ?? s.news ?? 0,
          total_blogs: s.total_blogs ?? s.blogs ?? 0,
          total_countries: s.total_countries ?? s.countries ?? 0,
          total_visa_rules: s.total_visa_rules ?? s.visa ?? 0,
          total_contacts: s.total_contacts ?? 0,
          new_contacts: s.new_contacts ?? 0,
          newsletter_study: s.newsletter_study ?? 0,
          newsletter_tourism: s.newsletter_tourism ?? 0,
          pending_validation: s.pending_validation ?? 0,
        });
      })
      .catch((e: any) => { if (e?.status === 401) setAuthError(true); })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Utilisateurs', value: stats.total_users ?? 0, icon: UsersIcon, tone: 'blue' as const, href: '/admin/users' },
    { label: 'Premium', value: stats.premium_users ?? 0, icon: StarIcon, tone: 'gold' as const, href: '/admin/users' },
    { label: 'Messages contact', value: stats.total_contacts ?? 0, icon: EnvelopeIcon, tone: 'rose' as const, href: '/admin/contact-messages', badge: stats.new_contacts },
    { label: 'À valider', value: stats.pending_validation ?? 0, icon: ShieldCheckIcon, tone: 'teal' as const, href: '/admin/validation', badge: stats.pending_validation },
    { label: 'Actualités', value: stats.total_news ?? 0, icon: NewspaperIcon, tone: 'green' as const, href: '/admin/news' },
    { label: 'Blogs', value: stats.total_blogs ?? 0, icon: BookOpenIcon, tone: 'purple' as const, href: '/admin/blogs' },
    { label: 'Pays', value: stats.total_countries ?? 0, icon: GlobeAltIcon, tone: 'orange' as const, href: '/admin/countries' },
  ];

  const backendReady = Object.values(stats).some(v => v !== undefined && v > 0);

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle={`Bonjour ${user?.username ?? 'admin'} — vue d'ensemble de l'activité et du contenu.`} />

      {authError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <strong>Session expirée :</strong> déconnectez-vous puis reconnectez-vous pour recharger les données.
        </div>
      )}

      {!authError && !backendReady && !loading && (
        <div className="mb-6 p-4 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-800">
          <strong>Backend en attente :</strong> les endpoints admin ne renvoient pas encore de données. L'interface est prête.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-stone-200/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => <StatCardLink key={c.label} {...c} />)}
        </div>
      )}

      <Card className="mt-8 p-6">
        <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/news" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors duration-150 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> Actualité
          </Link>
          <Link to="/admin/blogs" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> Blog
          </Link>
          <Link to="/admin/visa" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> Règle visa
          </Link>
          <Link to="/admin/countries" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> Pays
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

