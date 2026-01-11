import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, CreditCard, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressesApi, ordersApi, paypalApi } from '../services/api';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
    isDefault: false,
  });

  const lang = i18n.language as 'fr' | 'en';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await addressesApi.getAll();
        setAddresses(res.data);
        const defaultAddr = res.data.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        } else if (res.data.length > 0) {
          setSelectedAddress(res.data[0].id);
        }
      } catch (error) {
        console.error('Erreur chargement adresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, items, navigate]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addressesApi.create(newAddress);
      setAddresses([...addresses, res.data]);
      setSelectedAddress(res.data.id);
      setShowAddressForm(false);
      setNewAddress({
        label: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
        isDefault: false,
      });
      toast.success('Adresse ajoutée');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'adresse');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Veuillez sélectionner une adresse');
      return;
    }

    setProcessing(true);

    try {
      // Créer la commande
      const orderRes = await ordersApi.create({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        addressId: selectedAddress,
      });

      // Créer l'ordre PayPal
      const paypalRes = await paypalApi.createOrder(orderRes.data.id);

      // Rediriger vers PayPal
      if (paypalRes.data.approvalUrl) {
        window.location.href = paypalRes.data.approvalUrl;
      } else {
        // Mode test sans PayPal configuré
        toast.success('Commande créée avec succès !');
        clearCart();
        navigate(`/account/orders/${orderRes.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la commande');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Address selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                {t('checkout.selectAddress')}
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn-outline text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('checkout.addAddress')}
              </button>
            </div>

            {/* Address form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="border rounded-lg p-4 mb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('auth.firstName')}
                    value={newAddress.firstName}
                    onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    required
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder={t('auth.lastName')}
                    value={newAddress.lastName}
                    onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <input
                  type="text"
                  placeholder={t('address.street')}
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  required
                  className="input"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('address.postalCode')}
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    required
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder={t('address.city')}
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <input
                  type="tel"
                  placeholder={t('auth.phone')}
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="input"
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn-primary">
                    {t('common.save')}
                  </button>
                </div>
              </form>
            )}

            {/* Address list */}
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-dark-500 text-center py-4">
                  Aucune adresse enregistrée. Ajoutez-en une pour continuer.
                </p>
              ) : (
                addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddress === address.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-dark-200 hover:border-dark-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                          {address.label && (
                            <span className="text-dark-500 ml-2">({address.label})</span>
                          )}
                        </p>
                        <p className="text-dark-600">{address.street}</p>
                        <p className="text-dark-600">
                          {address.postalCode} {address.city}, {address.country}
                        </p>
                        {address.phone && (
                          <p className="text-dark-500 text-sm">{address.phone}</p>
                        )}
                      </div>
                      {address.isDefault && (
                        <span className="badge-primary">Par défaut</span>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right side - Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">{t('checkout.orderSummary')}</h2>

            {/* Items */}
            <div className="space-y-3 border-b pb-4 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => {
                const name = lang === 'fr' ? item.nameFr : item.nameEn;
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-sm text-dark-500">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-b pb-4 mb-4">
              <div className="flex justify-between text-dark-600">
                <span>{t('cart.subtotal')}</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span>{t('cart.shipping')}</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">{t('cart.freeShipping')}</span>
                  ) : (
                    `${shipping.toFixed(2)}€`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>{t('cart.total')}</span>
              <span>{total.toFixed(2)}€</span>
            </div>

            {/* Pay button */}
            <button
              onClick={handleCheckout}
              disabled={processing || !selectedAddress || addresses.length === 0}
              className="btn-primary w-full py-3 flex items-center justify-center disabled:opacity-50"
            >
              {processing ? (
                t('common.loading')
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('checkout.payWithPaypal')}
                </>
              )}
            </button>

            <Link
              to="/cart"
              className="block text-center text-primary-600 hover:text-primary-700 mt-4"
            >
              {t('common.back')} au panier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
