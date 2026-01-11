import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MapPin, Package } from 'lucide-react';
import { ordersApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  subtotal: string;
  shipping: string;
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
  address: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string | null;
  };
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const lang = i18n.language as 'fr' | 'en';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await ordersApi.getById(id);
        setOrder(res.data);
      } catch (error) {
        console.error('Erreur chargement commande:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order || !confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    setCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      setOrder({ ...order, status: 'CANCELLED' });
      toast.success('Commande annulée');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t('common.loading')}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Commande non trouvée</h1>
        <Link to="/account/orders" className="btn-primary">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/account/orders" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {t('orders.orderNumber')}{order.orderNumber}
            <span className={`badge ${statusColors[order.status]}`}>
              {t(`orders.statuses.${order.status}`)}
            </span>
          </h1>
          <p className="text-dark-500 mt-1">
            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {['PENDING', 'PAID'].includes(order.status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
          >
            {cancelling ? t('common.loading') : 'Annuler la commande'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Articles ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => {
                const name = lang === 'fr' ? item.nameFr : item.nameEn;
                return (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-0">
                    <Link to={`/products/${item.product?.slug}`}>
                      <img
                        src={item.product?.images[0] || '/placeholder.jpg'}
                        alt={name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product?.slug}`}
                        className="font-medium hover:text-primary-600"
                      >
                        {name}
                      </Link>
                      <p className="text-sm text-dark-500">
                        {parseFloat(item.price).toFixed(2)}€ x {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary & Address */}
        <div className="space-y-6">
          {/* Address */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Adresse de livraison
            </h2>
            <div className="text-dark-600">
              <p className="font-medium">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.street}</p>
              <p>
                {order.address.postalCode} {order.address.city}
              </p>
              <p>{order.address.country}</p>
              {order.address.phone && <p className="mt-2">{order.address.phone}</p>}
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-dark-500">{t('cart.subtotal')}</span>
                <span>{parseFloat(order.subtotal).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">{t('cart.shipping')}</span>
                <span>
                  {parseFloat(order.shipping) === 0 ? (
                    <span className="text-green-600">{t('cart.freeShipping')}</span>
                  ) : (
                    `${parseFloat(order.shipping).toFixed(2)}€`
                  )}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>{t('cart.total')}</span>
                <span>{parseFloat(order.total).toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
