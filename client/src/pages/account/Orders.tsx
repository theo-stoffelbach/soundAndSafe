import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '../../services/api';

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
  items: {
    id: string;
    nameFr: string;
    nameEn: string;
    quantity: number;
    price: string;
    product: { images: string[]; slug: string };
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  PAID: 'badge-primary',
  PROCESSING: 'badge-primary',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function Orders() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const lang = i18n.language as 'fr' | 'en';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersApi.getAll({ page: pagination.page });
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [pagination.page]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('orders.title')}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-dark-300 mb-4" />
          <p className="text-dark-500 mb-4">{t('orders.noOrders')}</p>
          <Link to="/products" className="btn-primary">
            {t('cart.continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="card p-4 block hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold">
                      {t('orders.orderNumber')}{order.orderNumber}
                    </span>
                    <span className={`badge ${statusColors[order.status]}`}>
                      {t(`orders.statuses.${order.status}`)}
                    </span>
                  </div>
                  <p className="text-sm text-dark-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Mini product images */}
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={item.id}
                        src={item.product?.images[0] || '/placeholder.jpg'}
                        alt={lang === 'fr' ? item.nameFr : item.nameEn}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span className="w-10 h-10 rounded-full bg-dark-200 border-2 border-white flex items-center justify-center text-sm font-medium">
                        +{order.items.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {parseFloat(order.total).toFixed(2)}€
                    </p>
                    <p className="text-sm text-dark-500">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} articles
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-dark-400" />
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="btn-outline disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="px-4 py-2">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="btn-outline disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
