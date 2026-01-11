import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const { items, itemCount, subtotal, shipping, total, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  const lang = i18n.language as 'fr' | 'en';

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-dark-300 mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
        <Link to="/products" className="btn-primary">
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const name = lang === 'fr' ? item.nameFr : item.nameEn;
            return (
              <div
                key={item.id}
                className="card p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Image */}
                <Link to={`/products/${item.slug}`} className="w-full sm:w-32 aspect-square flex-shrink-0">
                  <img
                    src={item.image}
                    alt={name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                  <Link
                    to={`/products/${item.slug}`}
                    className="font-semibold text-lg hover:text-primary-600"
                  >
                    {name}
                  </Link>
                  <p className="text-primary-600 font-bold">
                    {item.price.toFixed(2)}€
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4">
                    {/* Quantity */}
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-dark-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-dark-100 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>

            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-dark-500">
                  {t('cart.subtotal')} ({itemCount} articles)
                </span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">{t('cart.shipping')}</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">{t('cart.freeShipping')}</span>
                  ) : (
                    `${shipping.toFixed(2)}€`
                  )}
                </span>
              </div>
              {subtotal < 50 && (
                <p className="text-sm text-dark-500">
                  Plus que {(50 - subtotal).toFixed(2)}€ pour la livraison gratuite !
                </p>
              )}
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>{t('cart.total')}</span>
              <span>{total.toFixed(2)}€</span>
            </div>

            {isAuthenticated ? (
              <Link to="/checkout" className="btn-primary w-full text-center">
                {t('cart.checkout')}
              </Link>
            ) : (
              <Link to="/login?redirect=/checkout" className="btn-primary w-full text-center">
                {t('common.login')} pour commander
              </Link>
            )}

            <Link
              to="/products"
              className="block text-center text-primary-600 hover:text-primary-700 mt-4"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
