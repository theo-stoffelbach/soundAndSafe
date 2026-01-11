import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, ChevronDown } from 'lucide-react';
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
}

export default function Products() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const lang = i18n.language as 'fr' | 'en';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data);
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.getAll({
          category,
          search,
          sortBy,
          order,
          page,
          limit: 12,
        });
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, sortBy, order, page]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('products.title')}</h1>
          <p className="text-dark-500 mt-1">
            {pagination.total} produits
            {search && ` pour "${search}"`}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Filter toggle - mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-outline flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{t('products.filter')}</span>
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                updateFilter('sortBy', newSort);
                updateFilter('order', newOrder);
              }}
              className="input pr-10 appearance-none"
            >
              <option value="createdAt-desc">Plus récents</option>
              <option value="createdAt-asc">Plus anciens</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="nameFr-asc">Nom A-Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className={`md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">{t('products.category')}</h3>
            <div className="space-y-2">
              <button
                onClick={() => updateFilter('category', '')}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !category ? 'bg-primary-100 text-primary-700' : 'hover:bg-dark-100'
                }`}
              >
                {t('nav.allProducts')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    category === cat.slug ? 'bg-primary-100 text-primary-700' : 'hover:bg-dark-100'
                  }`}
                >
                  {lang === 'fr' ? cat.nameFr : cat.nameEn}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">{t('common.loading')}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-dark-500">
              {t('products.noProducts')}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} lang={lang} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="px-4 py-2">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pagination.pages}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
