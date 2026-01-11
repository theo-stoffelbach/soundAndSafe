import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingBag } from 'lucide-react';
import { usersApi } from '../../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchInput, setSearchInput] = useState('');

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await usersApi.getAll({
          search: search || undefined,
          page,
          limit: 20,
        });
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
          <p className="text-dark-500">{pagination.total} utilisateurs</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher..."
              className="input pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          </div>
          <button type="submit" className="btn-primary">
            Rechercher
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-dark-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Inscription</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-dark-600">Commandes</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-dark-600">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-dark-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-dark-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-dark-600">
                      {user.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-dark-600">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/admin/orders?user=${user.id}`}
                        className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{user._count.orders}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${
                        user.role === 'ADMIN' ? 'badge-primary' : 'bg-dark-100 text-dark-700'
                      }`}>
                        {user.role}
                      </span>
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
