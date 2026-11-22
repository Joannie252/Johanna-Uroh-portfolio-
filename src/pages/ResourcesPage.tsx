import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../lib/api';
import { Link } from '../lib/router';
import { BookOpen, Search, ArrowRight, CheckCircle2, ShoppingBag, Sparkles, Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Guides & Playbooks',
  'Templates',
  'Ebooks & Handouts',
];

export const ResourcesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProducts({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
        });
        setProducts(data);
      } catch (err: any) {
        console.error('Failed to load digital resources:', err);
        setError('Failed to load educational resources from the database.');
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadProducts();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const scrollToGrid = () => {
    const el = document.getElementById('resources-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-[#18122B] to-zinc-950 text-white p-8 sm:p-12 md:p-16 mb-16 shadow-2xl border border-purple-500/20">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-purple-200 border border-white/15 backdrop-blur-md">
              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
              <span>Practical Educational Tools &amp; Blueprints</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.1]">
              Digital Resources
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl">
              Practical resources created to help people learn useful digital and career skills. Discover step-by-step guides, production-ready templates, course handouts, and frameworks crafted from hands-on industry experience.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                id="explore-resources-cta"
                type="button"
                onClick={scrollToGrid}
                className="btn-neon-primary neon-pulse px-6 py-3.5 text-sm"
              >
                <span>Explore Resources</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs text-zinc-400 flex items-center gap-2 pl-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant digital downloads &amp; lifetime updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Filter and Search Bar */}
        <div id="resources-catalog" className="scroll-mt-28 mb-10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`resource-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`pill-neon ${
                    selectedCategory === cat
                      ? 'pill-neon-active'
                      : 'pill-neon-inactive'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="resource-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-purple-500 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 3. Product Grid */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-4 space-y-4 animate-pulse"
              >
                <div className="h-52 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="pt-2 flex justify-between items-center">
                  <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
            <ShoppingBag className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No resources found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your category filter or search terms.'
                : 'Check back soon as new educational resources and handouts are currently being prepared.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const formattedPrice =
                product.price === 0
                  ? 'Free'
                  : product.currency === 'USD' || product.currency === '$'
                  ? `$${product.price}`
                  : `${product.currency} ${product.price}`;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12141a] overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-purple-950/20 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <Link to={`/resources/${product.slug}`} className="relative aspect-[16/10] overflow-hidden block bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 dark:bg-zinc-900/90 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
                        {product.category}
                      </span>
                    </div>
                    {product.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/90 text-white shadow-sm backdrop-blur-sm">
                          Featured
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link to={`/resources/${product.slug}`}>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                          {product.title}
                        </h2>
                      </Link>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    {/* Price and View Details CTA */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                          Price
                        </span>
                        <span className="text-lg font-bold text-zinc-900 dark:text-white font-display">
                          {formattedPrice}
                        </span>
                      </div>

                      <Link
                        to={`/resources/${product.slug}`}
                        className="btn-neon-secondary px-4 py-2 text-xs font-semibold"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
