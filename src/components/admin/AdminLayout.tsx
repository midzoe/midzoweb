import React, { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  BookOpenIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  LanguageIcon,
  GlobeAmericasIcon,
  CalendarDaysIcon,
  HandRaisedIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  HomeModernIcon,
  CubeIcon,
  Cog6ToothIcon,
  LightBulbIcon,
  RssIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

// Navigation groupée (design data-dense : sections claires plutôt qu'une longue liste plate).
const navGroups: {
  label: string;
  items: { href: string; label: string; icon: React.ElementType; exact?: boolean }[];
}[] = [
  {
    label: 'Général',
    items: [
      { href: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true },
      { href: '/admin/users', label: 'Utilisateurs', icon: UsersIcon },
      { href: '/admin/payments', label: 'Paiements', icon: CreditCardIcon },
      { href: '/admin/validation', label: 'File de validation', icon: ShieldCheckIcon },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/admin/contact-messages', label: 'Messages contact', icon: EnvelopeIcon },
      { href: '/admin/newsletter', label: 'Newsletter', icon: PaperAirplaneIcon },
      { href: '/admin/news', label: 'Actualités', icon: NewspaperIcon },
      { href: '/admin/blogs', label: 'Blogs', icon: BookOpenIcon },
      { href: '/admin/scraping', label: 'Actus immigration', icon: RssIcon },
    ],
  },
  {
    label: 'Études',
    items: [
      { href: '/admin/universities', label: 'Universités', icon: AcademicCapIcon },
      { href: '/admin/study-countries', label: "Pays d'étude", icon: AcademicCapIcon },
      { href: '/admin/accommodations', label: 'Hébergements', icon: HomeModernIcon },
      { href: '/admin/language-centers', label: 'Centres de langue', icon: LanguageIcon },
      { href: '/admin/orientation', label: 'Orientation', icon: LightBulbIcon },
    ],
  },
  {
    label: 'Tourisme',
    items: [
      { href: '/admin/tourism-programs', label: 'Programmes', icon: GlobeAmericasIcon },
      { href: '/admin/tourism-countries', label: 'Pays tourisme', icon: GlobeAmericasIcon },
      { href: '/admin/tourism-events', label: 'Événements', icon: CalendarDaysIcon },
      { href: '/admin/partners', label: 'Partenaires', icon: HandRaisedIcon },
      { href: '/admin/tourist-sites', label: 'Sites touristiques', icon: MapPinIcon },
      { href: '/admin/restaurants', label: 'Restaurants', icon: BuildingStorefrontIcon },
      { href: '/admin/tourism-accommodations', label: 'Hébergements tourisme', icon: HomeModernIcon },
    ],
  },
  {
    label: 'Professionnel',
    items: [
      { href: '/admin/jobs', label: "Offres d'emploi", icon: BriefcaseIcon },
      { href: '/admin/trainings', label: 'Formations', icon: AcademicCapIcon },
      { href: '/admin/service-providers', label: 'Démarches', icon: ClipboardDocumentCheckIcon },
    ],
  },
  {
    label: 'Voyage & Config',
    items: [
      { href: '/admin/visa', label: 'Visa', icon: DocumentTextIcon },
      { href: '/admin/embassies', label: 'Ambassades', icon: BuildingLibraryIcon },
      { href: '/admin/flights', label: 'Vols', icon: PaperAirplaneIcon },
      { href: '/admin/insurance-plans', label: 'Assurances', icon: ShieldCheckIcon },
      { href: '/admin/banks', label: 'Banques', icon: BanknotesIcon },
      { href: '/admin/packages', label: 'Packages', icon: CubeIcon },
      { href: '/admin/countries', label: 'Pays (fiches)', icon: GlobeAltIcon },
      { href: '/admin/settings', label: 'Paramètres', icon: Cog6ToothIcon },
    ],
  },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin && !isLoading) return <Navigate to="/" replace />;

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const currentLabel =
    navGroups.flatMap((g) => g.items).find((i) => isActive(i.href, i.exact))?.label ?? 'Admin';

  return (
    <div className="flex h-screen bg-cream overflow-hidden font-sans">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-stone-900/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-stone-900 text-stone-300 flex flex-col z-30 transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-gold-500 text-stone-900 font-display font-bold text-base">M</span>
            <span className="font-display text-lg font-semibold text-white">
              Midzo <span className="text-gold-400 text-xs font-medium tracking-wide">Admin</span>
            </span>
          </Link>
          <button className="lg:hidden text-stone-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-slim-dark py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 cursor-pointer
                        ${active
                          ? 'bg-white/5 text-white font-medium'
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'}`}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-gold-400" />}
                      <Icon className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-gold-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="grid place-items-center h-9 w-9 rounded-full bg-gold-500 text-stone-900 text-sm font-semibold shrink-0">
              {user.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-stone-500">Administrateur</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 text-center text-xs px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-stone-200 transition-colors duration-150"
            >
              ← Site
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs px-3 py-2 bg-rose-600/90 hover:bg-rose-600 rounded-lg text-white transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeftOnRectangleIcon className="h-3.5 w-3.5" />
              Déco
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-cream/80 backdrop-blur border-b border-stone-200/80 px-4 sm:px-6 h-16 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-500 lg:hidden">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="font-display text-lg font-semibold text-stone-800">{currentLabel}</span>
          <span className="ml-auto hidden sm:flex items-center gap-2 text-xs text-stone-400">
            <span className="h-2 w-2 rounded-full bg-primary" />
            En ligne
          </span>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-slim p-4 sm:p-6 lg:p-8 bg-cream">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

