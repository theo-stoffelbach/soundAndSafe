import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, Settings, ChevronLeft, Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), end: true },
    { to: '/admin/products', icon: Package, label: t('admin.products') },
    { to: '/admin/orders', icon: ShoppingCart, label: t('admin.orders') },
    { to: '/admin/users', icon: Users, label: t('admin.users') },
    { to: '/admin/stats', icon: BarChart3, label: t('admin.stats') },
  ];

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-dark-900 text-white z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-dark-700">
          <Shield className="h-8 w-8 text-primary-500 mr-2" />
          <span className="font-bold">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
          <NavLink
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Retour au site</span>
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
}
