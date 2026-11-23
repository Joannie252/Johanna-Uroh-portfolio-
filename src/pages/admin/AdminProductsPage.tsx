import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Product } from '../../types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  resolveAssetUrl,
} from '../../lib/api';
import { ImageUpload } from '../../components/ImageUpload';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Check,
  X,
  ShoppingBag,
  Sparkles,
  DollarSign,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Guides & Playbooks',
  'Templates',
  'Ebooks & Handouts',
  'Course Materials',
  'Worksheets & SOPs',
  'Other',
];

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editor Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Guides & Playbooks');
  const [price, setPrice] = useState<number>(29);
  const [currency, setCurrency] = useState('USD');
  const [whatYouWillLearnText, setWhatYouWillLearnText] = useState('');
  const [targetAudienceText, setTargetAudienceText] = useState('');
  const [whatIncludedText, setWhatIncludedText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts({ all: true });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setShortDescription('');
    setFullDescription('');
    setCoverImage('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop');
    setCategory('Guides & Playbooks');
    setPrice(29);
    setCurrency('USD');
    setWhatYouWillLearnText('Master real-world digital workflows\nAutomate time-consuming administrative tasks\nDeploy battle-tested templates');
    setTargetAudienceText('Virtual Assistants & Operations Coordinators\nFreelancers & Digital Specialists\nSolopreneurs');
    setWhatIncludedText('Full downloadable PDF Guide\nCopy-paste templates\nLifetime updates');
    setPreviewUrl('');
    setPurchaseUrl('https://gumroad.com');
    setFeatured(false);
    setPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setShortDescription(p.shortDescription);
    setFullDescription(p.fullDescription);
    setCoverImage(p.coverImage);
    setCategory(p.category);
    setPrice(p.price);
    setCurrency(p.currency);
    setWhatYouWillLearnText((p.whatYouWillLearn || []).join('\n'));
    setTargetAudienceText((p.targetAudience || []).join('\n'));
    setWhatIncludedText((p.whatIncluded || []).join('\n'));
    setPreviewUrl(p.previewUrl || '');
    setPurchaseUrl(p.purchaseUrl);
    setFeatured(p.featured);
    setPublished(p.published);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingId) {
      // Auto-slug for new products
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (forceDraft = false) => {
    if (!title.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (!shortDescription.trim() || !fullDescription.trim()) {
      setFormError('Short and full descriptions are required.');
      return;
    }
    if (!purchaseUrl.trim()) {
      setFormError('Purchase URL is required for customers to purchase the resource.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);

      const whatYouWillLearn = whatYouWillLearnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const targetAudience = targetAudienceText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const whatIncluded = whatIncludedText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        coverImage: coverImage.trim(),
        category: category.trim(),
        price: Number(price) || 0,
        currency: currency.trim() || 'USD',
        whatYouWillLearn,
        targetAudience,
        whatIncluded,
        previewUrl: previewUrl.trim() || undefined,
        purchaseUrl: purchaseUrl.trim(),
        featured,
        published: forceDraft ? false : published,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      console.error('Save error:', err);
      setFormError(err.message || 'Failed to save digital product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (p: Product) => {
    try {
      if (p.published) {
        await unpublishProduct(p.id);
      } else {
        await publishProduct(p.id);
      }
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to change publish status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'PUBLISHED') return p.published;
    if (activeFilter === 'DRAFT') return !p.published;
    return true;
  });

  return (
    <AdminLayout title="Digital Products">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Digital Products &amp; Resources
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage educational handouts, guides, templates, and career resources sold to students and clients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-add-product-btn"
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Digital Product</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl w-fit">
            {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === tab
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All Products' : tab === 'PUBLISHED' ? 'Published' : 'Drafts'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Products Table / Cards List */}
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            Loading digital products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-3">
            <ShoppingBag className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No products found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery ? 'No products matched your search term.' : 'Click "Add Digital Product" above to create your first educational resource.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] overflow-hidden shadow-sm">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredProducts.map((p) => {
                const formattedPrice =
                  p.price === 0
                    ? 'Free'
                    : p.currency === 'USD' || p.currency === '$'
                    ? `$${p.price}`
                    : `${p.currency} ${p.price}`;

                return (
                  <div
                    key={p.id}
                    id={`admin-product-row-${p.id}`}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4">
                      <img
                        src={resolveAssetUrl(p.coverImage)}
                        alt={p.title}
                        className="w-20 h-14 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-100 dark:bg-zinc-800"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                            {p.title}
                          </h3>
                          {p.featured && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                              Featured
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              p.published
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                            }`}
                          >
                            {p.published ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {formattedPrice}
                          </span>
                          <span>•</span>
                          <span>{p.category}</span>
                          <span>•</span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            /{p.slug}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {/* View live public resource */}
                      <a
                        href={`/resources/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Public Page"
                        className="p-2 rounded-xl text-zinc-500 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Publish / Unpublish Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p)}
                        title={p.published ? 'Unpublish to Draft' : 'Publish Product'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          p.published
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                        }`}
                      >
                        {p.published ? 'Unpublish' : 'Publish'}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        title="Edit Product"
                        className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        title="Delete Product"
                        className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal for Adding / Editing a Digital Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {editingId ? 'Edit Digital Product' : 'Add New Digital Product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-300 text-xs sm:text-sm">
                  {formError}
                </div>
              )}

              {/* Title and Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Executive VA & AI Automation Playbook"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. executive-va-ai-playbook"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Category, Price, and Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Price (0 for Free)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <ImageUpload
                  label="Cover Image *"
                  currentUrl={coverImage}
                  onImageUploaded={(url) => setCoverImage(url)}
                  helperText="Upload an image or paste a direct image URL below."
                />
                <div className="mt-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Or enter direct image URL..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Short Description * (Summary shown in product cards)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise, high-impact summary of this resource..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Description * (Detailed breakdown &amp; syllabus)
                </label>
                <textarea
                  rows={6}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Full course handout or guide overview, chapters, and topics..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-mono text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Bullet Sections: What You'll Learn, Target Audience, What's Included */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    What You&apos;ll Learn (one outcome per line)
                  </label>
                  <textarea
                    rows={3}
                    value={whatYouWillLearnText}
                    onChange={(e) => setWhatYouWillLearnText(e.target.value)}
                    placeholder="Master prompt pipelines for executive triage&#10;Synthesize multi-page PDF reports&#10;Deploy automated client intake SOPs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Who The Resource Is For (one audience profile per line)
                  </label>
                  <textarea
                    rows={3}
                    value={targetAudienceText}
                    onChange={(e) => setTargetAudienceText(e.target.value)}
                    placeholder="Virtual Assistants looking to upskill&#10;Digital specialists and freelance coordinators&#10;Solopreneurs managing multi-client workflows"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    What&apos;s Included (one item per line)
                  </label>
                  <textarea
                    rows={3}
                    value={whatIncludedText}
                    onChange={(e) => setWhatIncludedText(e.target.value)}
                    placeholder="65-page downloadable PDF guide&#10;Notion duplicate template&#10;Lifetime access to future updates"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Purchase URL & Optional Preview URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Purchase / Checkout URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={purchaseUrl}
                    onChange={(e) => setPurchaseUrl(e.target.value)}
                    placeholder="https://gumroad.com/l/... or stripe checkout"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Preview URL (Optional Sample PDF / Demo)
                  </label>
                  <input
                    type="url"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    placeholder="https://... sample preview link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Checkboxes: Featured & Published */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Feature on Homepage &amp; Top of Catalog</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Published (Visible to public visitors)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <button
                  id="admin-save-product-submit"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Digital Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action permanently removes this product from the catalog.`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
};
