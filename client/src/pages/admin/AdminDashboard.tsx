import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, Package, Users, ShoppingCart,
  AlertTriangle, ArrowUpRight, DollarSign
} from 'lucide-react';
import { statsApi } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: { quantity: number }[];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          statsApi.getDashboard(),
          statsApi.getRecentOrders(),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">{t('common.loading')}</div>
    );
  }

  const statCards = [
    {
      label: t('admin.revenue'),
      value: `${(stats?.totalRevenue || 0).toFixed(2)}€`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: t('admin.totalOrders'),
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
      badge: stats?.pendingOrders ? `${stats.pendingOrders} en attente` : undefined,
    },
    {
      label: t('admin.totalUsers'),
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: t('admin.products'),
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
      badge: stats?.lowStockCount ? `${stats.lowStockCount} stock faible` : undefined,
      badgeColor: 'badge-warning',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-dark-500 text-sm">{stat.label}</p>
              {stat.badge && (
                <span className={`text-xs ${stat.badgeColor || 'badge-primary'}`}>
                  {stat.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {stats?.lowStockCount && stats.lowStockCount > 0 && (
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                {stats.lowStockCount} produit(s) en stock faible
              </p>
              <p className="text-sm text-yellow-700">
                Pensez à réapprovisionner vos stocks
              </p>
            </div>
            <Link to="/admin/products" className="btn-outline text-sm">
              Voir les produits
            </Link>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Commandes récentes</h2>
          <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
            Voir tout <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Commande</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Statut</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-dark-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="font-medium hover:text-primary-600">
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-dark-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.user.firstName} {order.user.lastName}</p>
                    <p className="text-sm text-dark-500">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      order.status === 'PENDING' ? 'badge-warning' :
                      order.status === 'PAID' ? 'badge-primary' :
                      order.status === 'DELIVERED' ? 'badge-success' :
                      order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'
                    }`}>
                      {t(`orders.statuses.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {parseFloat(order.total).toFixed(2)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
