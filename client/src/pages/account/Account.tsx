import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, ordersApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
  items: { quantity: number }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-purple-100 text-purple-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function Account() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await ordersApi.getAll({ limit: 3 });
        setRecentOrders(res.data.orders);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);

    try {
      const res = await authApi.updateProfile(profileData);
      updateUser(res.data);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoadingPassword(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Mot de passe modifié');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors du changement');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('account.title')}</h1>

      {/* Section Mes commandes */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary-600" />
            {t('orders.title')}
          </h2>
          <Link
            to="/account/orders"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            {t('orders.viewAll')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loadingOrders ? (
          <p className="text-dark-500 text-center py-4">{t('common.loading')}</p>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-6">
            <Package className="w-12 h-12 mx-auto text-dark-300 mb-3" />
            <p className="text-dark-500 mb-3">{t('orders.noOrders')}</p>
            <Link to="/products" className="btn-primary text-sm">
              {t('cart.continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-dark-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {t(`orders.statuses.${order.status}`)}
                  </span>
                  <span className="font-semibold">{parseFloat(order.total).toFixed(2)}€</span>
                  <ChevronRight className="w-4 h-4 text-dark-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            {t('account.profile')}
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-dark-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.firstName')}</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.lastName')}</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.phone')}</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={loadingProfile}
              className="btn-primary disabled:opacity-50"
            >
              {loadingProfile ? t('common.loading') : t('common.save')}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-primary-600" />
            {t('account.changePassword')}
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('account.currentPassword')}</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('account.newPassword')}</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={loadingPassword}
              className="btn-primary disabled:opacity-50"
            >
              {loadingPassword ? t('common.loading') : t('common.save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
