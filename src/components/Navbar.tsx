import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('navbar');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('midzo_language', lang);
    setIsLanguageOpen(false);
  };

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    { name: t('services'), href: '/services' },
    { name: t('contact'), href: '/contact' },
  ];

  if (user) {
    navigation.push({ name: t('dashboard'), href: '/dashboard' });
  }

  const languages = [
    { code: 'en', name: t('language_en') },
    { code: 'fr', name: t('language_fr') },
    { code: 'de', name: t('language_de') },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Midzoe</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary"
              >
                {item.name}
              </Link>
            ))}

            {/* Midzoe Tourism Link */}
            <div className="border-l border-gray-300 pl-4 ml-2 flex items-center gap-3">
              <Link
                to="/tourism"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all"
              >
                🌍 Tourism
              </Link>
              <div className="relative group">
                <button className="text-sm font-medium text-gray-900 hover:text-orange-600">
                  ▼
                </button>
                <div className="absolute right-0 mt-0 w-40 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/community" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-t-lg">
                    👥 Community Stories
                  </Link>
                  <Link to="/destination/botswana" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-b-lg">
                    📖 Guides
                  </Link>
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-primary">
                🌐 {i18n.language.toUpperCase()}
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      i18n.language === lang.code
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {user.is_premium && (
                  <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full">
                    <StarIcon className="h-3.5 w-3.5" />
                    Premium
                  </span>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    ⚙ Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
                >
                  {user.first_name || user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-primary transition-colors duration-200"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-primary transition-colors duration-200"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Tourism Link */}
            <Link
              to="/tourism"
              className="block pl-3 pr-4 py-3 text-base font-bold text-white bg-gradient-to-r from-orange-400 to-orange-500"
              onClick={() => setIsOpen(false)}
            >
              🌍 Midzoe Tourism
            </Link>

            {/* Mobile Language Switcher */}
            <div className="pl-3 pr-4 py-2">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="text-base font-medium text-gray-700 hover:text-primary"
              >
                🌐 {t('language')}
              </button>
              {isLanguageOpen && (
                <div className="mt-2 space-y-1 pl-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`block w-full text-left px-2 py-1 text-sm ${
                        i18n.language === lang.code
                          ? 'text-primary font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)}
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                    ⚙ Admin
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)}
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Mon Profil
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;