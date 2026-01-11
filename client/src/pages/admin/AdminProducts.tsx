import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { productsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  price: string;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  images: string[];
  category: { nameFr: string };
}

export default function AdminProducts() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const showArchived = searchParams.get('archived') === 'true';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.getAll({
          active: !showArchived,
          page,
          limit: 20,
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
  }, [showArchived, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Archiver "${name}" ?`)) return;

    try {
      await productsApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Produit archivé');
    } catch (error) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const handleRestore = async (id: string, name: string) => {
    try {
      await productsApi.restore(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success(`"${name}" restauré`);
    } catch (error) {
      toast.error('Erreur lors de la restauration');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {showArchived ? t('admin.archivedProducts') : t('admin.products')}
          </h1>
          <p className="text-dark-500">{pagination.total} produits</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (showArchived) {
                params.delete('archived');
              } else {
                params.set('archived', 'true');
              }
              params.set('page', '1');
              setSearchParams(params);
            }}
            className={`btn-outline ${showArchived ? 'bg-dark-100' : ''}`}
          >
            {showArchived ? 'Produits actifs' : 'Archivés'}
          </button>
          <Link to="/admin/products/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-dark-500">
            Aucun produit {showArchived ? 'archivé' : ''}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Produit</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Catégorie</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Prix</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Stock</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-dark-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images[0] || '/placeholder.jpg'}
                          alt={product.nameFr}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.nameFr}</p>
                          <p className="text-sm text-dark-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-600">
                      {product.category?.nameFr || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {parseFloat(product.price).toFixed(2)}€
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {product.stock <= product.lowStockAlert && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={
                          product.stock <= 0 ? 'text-red-600' :
                          product.stock <= product.lowStockAlert ? 'text-yellow-600' :
                          'text-dark-900'
                        }>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        {showArchived ? (
                          <button
                            onClick={() => handleRestore(product.id, product.nameFr)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.nameFr)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Archiver"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
