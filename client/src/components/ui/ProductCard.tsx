import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  price: string;
  comparePrice: string | null;
  images: string[];
  stock: number;
}

interface ProductCardProps {
  product: Product;
  lang: 'fr' | 'en';
}

export default function ProductCard({ product, lang }: ProductCardProps) {
  const { t } = useTranslation();
  const { addItem, isInCart } = useCart();

  const name = lang === 'fr' ? product.nameFr : product.nameEn;
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? Math.round((1 - price / comparePrice) * 100) : 0;
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error(t('products.outOfStock'));
      return;
    }

    addItem({
      id: product.id,
      slug: product.slug,
      nameFr: product.nameFr,
      nameEn: product.nameEn,
      price,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
    });

    toast.success(`${name} ajouté au panier`);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card group hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-dark-100">
        <img
          src={product.images[0] || '/placeholder.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
            <span className="bg-dark-900 text-white px-4 py-2 rounded-lg font-medium">
              {t('products.outOfStock')}
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-dark-900 text-xs font-bold px-2 py-1 rounded">
            {t('products.lowStock', { count: product.stock })}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-dark-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary-600">
              {price.toFixed(2)}€
            </span>
            {comparePrice && (
              <span className="text-sm text-dark-400 line-through">
                {comparePrice.toFixed(2)}€
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2 rounded-lg transition-colors ${
              inCart
                ? 'bg-primary-100 text-primary-600'
                : product.stock <= 0
                ? 'bg-dark-100 text-dark-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
