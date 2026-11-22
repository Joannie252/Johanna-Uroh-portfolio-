import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProductBySlug, getProducts } from '../lib/api';
import { Link } from '../lib/router';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Users,
  PackageCheck,
  FileText,
  Sparkles,
  ShieldCheck,
  Download,
  AlertCircle,
  Eye,
  Tag,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ResourceDetailPageProps {
  slug: string;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ slug }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResource() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProductBySlug(slug);
        setProduct(data);

        // Load other products for recommendations
        const all = await getProducts({ limit: 4 });
        setOtherProducts(all.filter((p) => p.id !== data.id).slice(0, 3));
      } catch (err: any) {
        console.error('Failed to load resource:', err);
        setError(err.message || 'The requested digital resource could not be found.');
      } finally {
        setIsLoading(false);
      }
    }

    loadResource();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
              <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-72 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-36 pb-28 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Resource Not Found</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error || 'This digital product may have been moved, unpublished, or does not exist.'}
          </p>
          <Link
            to="/resources"
            className="btn-neon-primary px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Digital Resources</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice =
    product.price === 0
      ? 'Free'
      : product.currency === 'USD' || product.currency === '$'
      ? `$${product.price}`
      : `${product.currency} ${product.price}`;

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/resources"
            className="link-neon text-xs sm:text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Digital Resources</span>
          </Link>
        </div>

        {/* Top Split Layout: Title & Main Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left / Main Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Featured Resource
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white font-display tracking-tight leading-tight">
                {product.title}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Product Cover Image */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-100 dark:bg-zinc-800">
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Full Description / Overview */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Resource Overview</span>
              </h2>

              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-zinc-600 dark:text-zinc-300 space-y-4 leading-relaxed whitespace-pre-line">
                {product.fullDescription}
              </div>
            </div>

            {/* What You'll Learn Section */}
            {product.whatYouWillLearn && product.whatYouWillLearn.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>What You&apos;ll Learn</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {product.whatYouWillLearn.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience & Who it is for */}
            {product.targetAudience && product.targetAudience.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Who This Resource Is For</span>
                </h2>

                <ul className="space-y-2.5">
                  {product.targetAudience.map((audience, idx) => (
                    <li
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Included Section */}
            {product.whatIncluded && product.whatIncluded.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>What&apos;s Included</span>
                </h2>

                <div className="space-y-2.5">
                  {product.whatIncluded.map((included, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-center gap-3 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-medium"
                    >
                      <Download className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{included}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Preview / Sample Section */}
            {product.previewUrl && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/5 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span>Preview / Sample Available</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                      Take a look at an excerpt or sample material before purchasing.
                    </p>
                  </div>
                  <a
                    href={product.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-neon-secondary px-4 py-2.5 text-xs font-semibold shrink-0"
                  >
                    <span>Open Sample Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right / Sticky Purchase Card (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Investment
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white font-display">
                    {formattedPrice}
                  </span>
                  {product.price > 0 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {product.currency} (One-time payment)
                    </span>
                  )}
                </div>
              </div>

              {/* Purchase CTA Button */}
              <div>
                <a
                  id="product-purchase-cta"
                  href={product.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl btn-neon-primary neon-pulse font-bold text-base shadow-xl flex items-center justify-center gap-2.5 text-center"
                >
                  <span>{product.price === 0 ? 'Get Free Resource' : 'Get Instant Access'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2.5">
                  Secure checkout handled via external seller platform
                </p>
              </div>

              {/* Perks / Guarantees Checklist */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <Download className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Immediate digital access after checkout</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Free lifetime updates and errata</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Authored and tested by Johanna Uroh</span>
                </div>
              </div>

              {/* Meta details */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                <div>Category: <span className="text-zinc-600 dark:text-zinc-300 font-medium">{product.category}</span></div>
                <div>Format: <span className="text-zinc-600 dark:text-zinc-300 font-medium">Digital Download / Templates / PDF</span></div>
              </div>
            </div>

            {/* Need Custom Assistance Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-6 space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Need customized training or team licensing?
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Looking to deploy these templates or training materials across your virtual team or company? Get in touch for custom workshops.
              </p>
              <Link
                to="/contact"
                className="link-neon text-xs font-semibold"
              >
                <span>Contact for team licenses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Other Recommendations */}
        {otherProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
                  More Educational Resources
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Explore other guides, tools, and digital templates
                </p>
              </div>
              <Link
                to="/resources"
                className="link-neon text-xs sm:text-sm font-semibold"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/resources/${p.slug}`}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-4 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                      {p.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                    <span>
                      {p.price === 0
                        ? 'Free'
                        : p.currency === 'USD' || p.currency === '$'
                        ? `$${p.price}`
                        : `${p.currency} ${p.price}`}
                    </span>
                    <span className="text-purple-600 font-semibold flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
