import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';
import { productsApi, categoriesApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

export default function AdminProductEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nameFr: '',
    nameEn: '',
    slug: '',
    descriptionFr: '',
    descriptionEn: '',
    price: '',
    comparePrice: '',
    stock: '0',
    lowStockAlert: '5',
    images: [] as string[],
    categoryId: '',
    isFeatured: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les catégories
        const catRes = await categoriesApi.getAll();
        setCategories(catRes.data);

        // Charger le produit si mode édition
        if (!isNew && id) {
          const prodRes = await productsApi.getById(id);
          const p = prodRes.data;
          // Nettoyer les balises HTML des descriptions
          const cleanHtml = (text: string) => text?.replace(/<[^>]*>/g, '').trim() || '';
          setForm({
            nameFr: p.nameFr,
            nameEn: p.nameEn,
            slug: p.slug,
            descriptionFr: cleanHtml(p.descriptionFr),
            descriptionEn: cleanHtml(p.descriptionEn),
            price: p.price.toString(),
            comparePrice: p.comparePrice?.toString() || '',
            stock: p.stock.toString(),
            lowStockAlert: p.lowStockAlert.toString(),
            images: p.images || [],
            categoryId: p.categoryId,
            isFeatured: p.isFeatured,
          });
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isNew]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Nettoyer le HTML et protéger contre les injections
  const sanitizeText = (text: string) => {
    return text
      .replace(/<[^>]*>/g, '') // Enlever les balises HTML
      .replace(/[<>'"`;]/g, '') // Enlever les caractères dangereux
      .trim();
  };

  const handleNameChange = (value: string) => {
    setForm({
      ...form,
      nameFr: value,
      slug: isNew ? generateSlug(value) : form.slug,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadApi.uploadImage(file));
      const results = await Promise.all(uploadPromises);

      const newUrls = results.map((res) => res.data.url);
      setForm({ ...form, images: [...form.images, ...newUrls] });
      toast.success(`${newUrls.length} image(s) uploadée(s)`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        nameFr: sanitizeText(form.nameFr),
        nameEn: sanitizeText(form.nameEn || form.nameFr),
        slug: form.slug,
        descriptionFr: sanitizeText(form.descriptionFr),
        descriptionEn: sanitizeText(form.descriptionEn || form.descriptionFr),
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        lowStockAlert: parseInt(form.lowStockAlert),
        images: form.images,
        categoryId: form.categoryId,
        isFeatured: form.isFeatured,
      };

      if (isNew) {
        await productsApi.create(data);
        toast.success('Produit créé');
      } else {
        await productsApi.update(id!, data);
        toast.success('Produit mis à jour');
      }
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">{t('common.loading')}</div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Nouveau produit' : 'Modifier le produit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Infos principales */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-4">Informations principales</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom (FR) *</label>
              <input
                type="text"
                value={form.nameFr}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom (EN)</label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder={form.nameFr}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              className="input"
            />
            <p className="text-sm text-dark-500 mt-1">URL actuelle : /products/{form.slug || '...'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="input"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameFr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (FR)</label>
            <textarea
              value={form.descriptionFr}
              onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
              rows={4}
              className="input"
              placeholder="Description du produit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (EN)</label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              rows={4}
              className="input"
              placeholder="Product description..."
            />
          </div>
        </div>

        {/* Prix et stock */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-4">Prix et stock</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prix *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix barré</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                className="input"
                placeholder="Optionnel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alerte stock</label>
              <input
                type="number"
                min="0"
                value={form.lowStockAlert}
                onChange={(e) => setForm({ ...form, lowStockAlert: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium">
              Produit vedette (affiché sur la page d'accueil)
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-4">Images</h2>

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-dark-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-2" />
                <p className="text-dark-600">Upload en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-dark-400 mb-2" />
                <p className="text-dark-600 font-medium">Cliquez pour ajouter des images</p>
                <p className="text-dark-400 text-sm mt-1">JPG, PNG, GIF ou WebP (max 5MB)</p>
              </div>
            )}
          </div>

          {/* Images list */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {form.images.map((img, index) => {
                // Construire l'URL complète pour les images uploadées
                const imageUrl = img.startsWith('/uploads')
                  ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${img}`
                  : img;
                return (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded">
                        Principale
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-outline"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : (isNew ? 'Créer le produit' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  );
}
