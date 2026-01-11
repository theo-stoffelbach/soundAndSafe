import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ordersApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: { quantity: number }[];
}

const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const statusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  PAID: 'badge-primary',
  PROCESSING: 'badge-primary',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function AdminOrders() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await ordersApi.getAll({
          status: status || undefined,
          page,
          limit: 20,
        });
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [status, page]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders(orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.orders')}</h1>
          <p className="text-dark-500">{pagination.total} commandes</p>
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            if (e.target.value) {
              params.set('status', e.target.value);
            } else {
              params.delete('status');
            }
            params.set('page', '1');
            setSearchParams(params);
          }}
          className="input w-auto"
        >
          <option value="">Tous les statuts</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {t(`orders.statuses.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">{t('common.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-dark-500">
            Aucune commande
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Commande</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Statut</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-dark-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-sm text-dark-500">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} articles
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-sm text-dark-500">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-dark-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-3 py-1 ${statusColors[order.status]} border-0 cursor-pointer`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {t(`orders.statuses.${s}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {parseFloat(order.total).toFixed(2)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 p-4 border-t">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', (page - 1).toString());
                setSearchParams(params);
              }}
              disabled={page === 1}
              className="btn-outline disabled:opacity-50"
            >
              {t('common.previous')}
            </button>
            <span className="px-4">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', (page + 1).toString());
                setSearchParams(params);
              }}
              disabled={page === pagination.pages}
              className="btn-outline disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
