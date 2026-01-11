import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Minus, Plus, ChevronLeft, Check } from 'lucide-react';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  descriptionFr: string;
  descriptionEn: string;
  price: string;
  comparePrice: string | null;
  images: string[];
  stock: number;
  category: {
    id: string;
    nameFr: string;
    nameEn: string;
    slug: string;
  };
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const lang = i18n.language as 'fr' | 'en';

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await productsApi.getBySlug(slug);
        setProduct(res.data);
      } catch (error) {
        console.error('Erreur chargement produit:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t('common.loading')}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Link to="/products" className="btn-primary">
          Retour aux produits
        </Link>
      </div>
    );
  }

  const name = lang === 'fr' ? product.nameFr : product.nameEn;
  const description = lang === 'fr' ? product.descriptionFr : product.descriptionEn;
  const categoryName = lang === 'fr' ? product.category.nameFr : product.category.nameEn;
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? Math.round((1 - price / comparePrice) * 100) : 0;
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error(t('products.outOfStock'));
      return;
    }

    addItem(
      {
        id: product.id,
        slug: product.slug,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        price,
        image: product.images[0] || '/placeholder.jpg',
        stock: product.stock,
      },
      quantity
    );

    toast.success(`${quantity}x ${name} ajouté au panier`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-dark-500 mb-6">
        <Link to="/" className="hover:text-primary-600">
          {t('common.home')}
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">
          {t('common.products')}
        </Link>
        <span>/</span>
        <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-600">
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-dark-900">{name}</span>
      </div>

      <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t('common.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-dark-100">
            <img
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-primary-600 font-medium mb-2">{categoryName}</p>
            <h1 className="text-3xl font-bold">{name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-primary-600">
              {price.toFixed(2)}€
            </span>
            {comparePrice && (
              <>
                <span className="text-xl text-dark-400 line-through">
                  {comparePrice.toFixed(2)}€
                </span>
                <span className="badge bg-red-100 text-red-700">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>
                  {product.stock > 10
                    ? t('products.inStock')
                    : t('products.lowStock', { count: product.stock })}
                </span>
              </div>
            ) : (
              <span className="text-red-600 font-medium">
                {t('products.outOfStock')}
              </span>
            )}
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center space-x-4">
              <span className="font-medium">{t('products.quantity')} :</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-dark-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock - cartQuantity, quantity + 1))}
                  className="p-2 hover:bg-dark-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              product.stock <= 0
                ? 'bg-dark-200 text-dark-500 cursor-not-allowed'
                : inCart
                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>
              {inCart
                ? `Ajouter (${cartQuantity} dans le panier)`
                : t('products.addToCart')}
            </span>
          </button>

          {/* Description */}
          <div className="border-t pt-6">
            <h2 className="font-semibold text-lg mb-3">{t('products.description')}</h2>
            <div
              className="text-dark-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
