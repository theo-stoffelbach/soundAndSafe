import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Truck, Lock, HeadphonesIcon } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import ProductCard from '../components/ui/ProductCard';

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

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  image: string | null;
  _count: { products: number };
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const lang = i18n.language as 'fr' | 'en';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsApi.getAll({ featured: true, limit: 4 }),
          categoriesApi.getAll(),
        ]);
        setFeaturedProducts(productsRes.data.products);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-dark-300 mb-8">
              {t('home.hero.subtitle')}
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t('home.hero.cta')}
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
          <Shield className="w-full h-full" />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-dark-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Livraison rapide</h3>
              <p className="text-sm text-dark-500">Expédition sous 24h</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Paiement sécurisé</h3>
              <p className="text-sm text-dark-500">PayPal & CB</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Qualité garantie</h3>
              <p className="text-sm text-dark-500">Produits certifiés</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <HeadphonesIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Support client</h3>
              <p className="text-sm text-dark-500">7j/7 par email</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('home.featured')}
          </h2>
          {loading ? (
            <div className="text-center py-12">{t('common.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} lang={lang} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/products" className="btn-outline">
              {t('nav.allProducts')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-dark-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('home.categories')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-dark-900 h-64 shadow-xl"
              >
                {category.image && (
                  <img
                    src={category.image}
                    alt={lang === 'fr' ? category.nameFr : category.nameEn}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {lang === 'fr' ? category.nameFr : category.nameEn}
                  </h3>
                  <p className="text-dark-300">
                    {category._count.products} produits
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Protégez-vous et vos proches
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Nos produits sont conçus pour vous offrir tranquillité d'esprit et sécurité au quotidien.
          </p>
          <Link to="/products" className="inline-block bg-white text-primary-700 font-bold px-10 py-5 rounded-xl hover:bg-dark-100 transition-all duration-300 shadow-2xl hover:-translate-y-1">
            Découvrir nos produits
          </Link>
        </div>
      </section>
    </div>
  );
}
