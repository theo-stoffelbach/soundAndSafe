import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingBag, Edit, Trash2, X } from 'lucide-react';
import { usersApi } from '../../services/api';
import toast from 'react-hot-toast';

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [saving, setSaving] = useState(false);

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

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const res = await usersApi.update(editingUser.id, editForm);
      setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
      setEditingUser(null);
      toast.success('Utilisateur mis à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user._count.orders > 0) {
      toast.error('Impossible de supprimer un utilisateur avec des commandes');
      return;
    }

    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;

    try {
      await usersApi.delete(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('Utilisateur supprimé');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
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
                  <th className="text-center px-4 py-3 text-sm font-medium text-dark-600">Actions</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={user._count.orders > 0 ? 'Impossible (commandes existantes)' : 'Supprimer'}
                          disabled={user._count.orders > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Modal d'édition */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Modifier l'utilisateur</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input"
                >
                  <option value="CUSTOMER">Client</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
