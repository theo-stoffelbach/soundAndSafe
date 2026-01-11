import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">SoundAndSafe</span>
            </div>
            <p className="text-dark-400 text-sm">
              Votre sécurité est notre priorité. Découvrez notre gamme de produits d'autodéfense de qualité.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-400">Navigation</h3>
            <ul className="space-y-2 text-dark-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  {t('nav.allProducts')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  {t('common.cart')}
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  {t('common.account')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-400">{t('nav.categories')}</h3>
            <ul className="space-y-2 text-dark-400">
              <li>
                <Link to="/products?category=sprays" className="hover:text-white transition-colors">
                  Sprays de défense
                </Link>
              </li>
              <li>
                <Link to="/products?category=alarms" className="hover:text-white transition-colors">
                  Alarmes personnelles
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-white transition-colors">
                  Accessoires
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-400">Contact</h3>
            <ul className="space-y-3 text-dark-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span>contact@soundandsafe.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary-500 mt-1" />
                <span>123 Rue de la Sécurité<br />75001 Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-dark-400 text-sm">
          <p>&copy; {currentYear} SoundAndSafe. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link to="/cgv" className="hover:text-white transition-colors">
              CGV
            </Link>
            <Link to="/confidentialite" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
