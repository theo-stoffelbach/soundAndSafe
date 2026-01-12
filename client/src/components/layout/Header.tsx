import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, Menu, X, Shield, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          {/* Logo + Produits */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">SoundAndSafe</span>
            </Link>
            <Link to="/products" className="hidden md:block hover:text-primary-400 transition-colors font-medium">
              {t('nav.allProducts')}
            </Link>
          </div>

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

      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700">
          <div className="container mx-auto px-4 py-4 space-y-4">
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
