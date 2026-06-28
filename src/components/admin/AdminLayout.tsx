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
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true },
  { href: '/admin/users', label: 'Utilisateurs', icon: UsersIcon },
  { href: '/admin/news', label: 'Actualités', icon: NewspaperIcon },
  { href: '/admin/blogs', label: 'Blogs', icon: BookOpenIcon },
  { href: '/admin/visa', label: 'Visa', icon: DocumentTextIcon },
  { href: '/admin/countries', label: 'Pays', icon: GlobeAltIcon },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col z-30 transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <Link to="/admin" className="text-xl font-bold text-white">
            Midzoe <span className="text-primary text-sm font-normal">Admin</span>
          </Link>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {nav.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(href, exact)
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Connecté en tant que</div>
          <div className="text-sm font-medium text-white mb-3">{user.username}</div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 text-center text-xs px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
            >
              ← Site
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
            >
              <ArrowLeftOnRectangleIcon className="h-3.5 w-3.5" />
              Déco
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="font-semibold text-gray-800">Panel Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
