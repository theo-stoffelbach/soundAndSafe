import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, Menu, X, Search, Shield, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <header className="bg-dark-900 text-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary-700 py-2">
        <div className="container mx-auto px-4 text-center text-sm">
          {t('home.freeShipping')}
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold">SoundAndSafe</span>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full px-4 py-2 pl-10 rounded-lg bg-dark-800 border border-dark-700 focus:outline-none focus:border-primary-500 text-white placeholder-dark-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
            </div>
          </form>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase text-sm">{i18n.language}</span>
            </button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors text-primary-400"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                <Link
                  to="/account"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>{t('common.account')}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>{t('common.login')}</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center space-x-1 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{t('common.cart')}</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6 py-3 border-t border-dark-800">
          <Link to="/products" className="hover:text-primary-400 transition-colors">
            {t('nav.allProducts')}
          </Link>
          <Link to="/products?category=sprays" className="hover:text-primary-400 transition-colors">
            Sprays
          </Link>
          <Link to="/products?category=alarms" className="hover:text-primary-400 transition-colors">
            Alarmes
          </Link>
          <Link to="/products?category=accessories" className="hover:text-primary-400 transition-colors">
            Accessoires
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search')}
                  className="w-full px-4 py-2 pl-10 rounded-lg bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
              </div>
            </form>

            {/* Navigation links */}
            <nav className="space-y-2">
              <Link
                to="/products"
                className="block py-2 hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.allProducts')}
              </Link>
              <Link
                to="/cart"
                className="block py-2 hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('common.cart')} ({itemCount})
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    className="block py-2 hover:text-primary-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('common.account')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block py-2 text-primary-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block py-2 text-dark-400"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block py-2 hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.login')}
                </Link>
              )}
            </nav>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 py-2 text-dark-400"
            >
              <Globe className="h-4 w-4" />
              <span>{i18n.language === 'fr' ? 'English' : 'Français'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
