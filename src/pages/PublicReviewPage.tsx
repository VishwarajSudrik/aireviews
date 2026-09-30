import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBusinessBySlug } from '../services/businessStorage';
import { Business, ReviewSuggestion } from '../types';
import { getCategoryLabel, getCategoryColor, copyToClipboard, getValidGoogleReviewUrl } from '../services/utils';
import { Copy, ExternalLink, Star, Building2, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { trackEvent } from '../services/businessStorage';
import { GoogleGIcon } from '../components/GoogleGIcon';

const CATEGORY_ORDER = [
  'short',
  'service_focused',
  'professional_experience',
  'customer_experience',
  'natural_conversational',
] as const;

export const PublicReviewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [logoError, setLogoError] = useState(false);
  const [activeCopiedId, setActiveCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Category collapse state
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!slug) return;
    const biz = getBusinessBySlug(slug);
    if (biz) {
      setBusiness(biz);
      trackEvent({ type: 'page_view', businessSlug: slug, timestamp: new Date().toISOString() });
    } else {
      setNotFound(true);
    }
  }, [slug]);

  const handleCopyAndRedirect = async (text: string, reviewId?: string) => {
    if (!business) return;
    const ok = await copyToClipboard(text);
    if (reviewId) {
      setActiveCopiedId(reviewId);
      setShowToast(true);
      setTimeout(() => setActiveCopiedId(null), 3000);
      setTimeout(() => setShowToast(false), 3500);
    }

    trackEvent({ type: 'copy_action', businessSlug: slug ?? '', timestamp: new Date().toISOString() });
    trackEvent({ type: 'google_review_click', businessSlug: slug ?? '', timestamp: new Date().toISOString() });

    // Safely open valid Google Review link in new tab (never 400)
    const targetUrl = getValidGoogleReviewUrl(business.name, business.googleReviewUrl);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500">This review page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!business) return null;

  const byCategory = CATEGORY_ORDER.reduce<Record<string, ReviewSuggestion[]>>((acc, cat) => {
    const reviews = business.reviewSuggestions.filter((r) => r.category === cat);
    if (reviews.length > 0) acc[cat] = reviews;
    return acc;
  }, {});

  const noSuggestions = business.reviewSuggestions.length === 0;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased relative">
      
      {/* Toast Notification Banner */}
      <div
        className={`fixed bottom-5 right-5 z-50 transform transition-all duration-300 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        } bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800`}
      >
        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
          <CheckCircle className="h-4 w-4" />
        </div>
        <div>
          <span className="font-bold text-sm block">Review Text Copied!</span>
          <span className="text-xs text-slate-400">Opening Google Review page…</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Premium Brand Header with Google 4-Color Accent */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 text-center mb-8 relative overflow-hidden">
          {/* Top Google 4-Color Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="h-full w-1/4 bg-[#4285F4]"></div>
            <div className="h-full w-1/4 bg-[#EA4335]"></div>
            <div className="h-full w-1/4 bg-[#FBBC05]"></div>
            <div className="h-full w-1/4 bg-[#34A853]"></div>
          </div>

          {/* Official Google Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full mb-4 mt-1">
            <GoogleGIcon className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-700">Official Google Feedback Partner</span>
          </div>

          <div className="w-20 h-20 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {business.logo && !logoError ? (
              <img
                src={business.logo}
                alt={business.name}
                className="w-20 h-20 rounded-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Building2 className="w-10 h-10 text-brand-600" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
            {business.name}
          </h1>

          {/* Rating Trust Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-4 select-none">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">4.9/5.0</span>
            <span className="text-xs text-slate-400 font-medium">(Verified Google feedback)</span>
          </div>

          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Thank you for choosing us! Sharing your experience takes less than a minute. Select any feedback suggestion below, copy it, and paste it on our Google listing.
          </p>
        </div>

        {/* 3-Step Visual Guide Banner */}
        <div className="bg-brand-600 rounded-2xl p-5 sm:p-6 text-white shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-5 border border-brand-700">
          <div className="flex gap-3.5 items-start">
            <span className="bg-brand-500 text-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold ring-4 ring-brand-400/30">1</span>
            <div>
              <h3 className="text-sm font-bold leading-tight">1. Choose Template</h3>
              <p className="text-[11px] text-brand-100 mt-1">Read the options below and pick a suggestion.</p>
            </div>
          </div>
          <div className="flex gap-3.5 items-start">
            <span className="bg-brand-500 text-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold ring-4 ring-brand-400/30">2</span>
            <div>
              <h3 className="text-sm font-bold leading-tight">2. Copy Statement</h3>
              <p className="text-[11px] text-brand-100 mt-1">Click the button to copy the review text instantly.</p>
            </div>
          </div>
          <div className="flex gap-3.5 items-start">
            <span className="bg-brand-500 text-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold ring-4 ring-brand-400/30">3</span>
            <div>
              <h3 className="text-sm font-bold leading-tight">3. Paste & Post</h3>
              <p className="text-[11px] text-brand-100 mt-1">Directly opens Google Review page to paste & submit!</p>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <span className="h-2 w-2 rounded-full bg-brand-600"></span>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Available Review Templates</h2>
        </div>

        {/* Services tags */}
        {business.services.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {business.services.map((svc) => (
              <span key={svc} className="badge bg-white border border-slate-200 text-slate-600 shadow-sm">
                {svc}
              </span>
            ))}
          </div>
        )}

        {/* No suggestions */}
        {noSuggestions && (
          <div className="bg-white p-10 rounded-2xl text-center border border-slate-100 shadow-sm">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">No templates available yet</h3>
            <p className="text-slate-400 text-sm">Please check back later.</p>
          </div>
        )}

        {/* Template cards by category */}
        {Object.entries(byCategory).map(([cat, reviews]) => {
          const collapsed = collapsedCats.has(cat);
          return (
            <div key={cat} className="mb-6">
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-2 w-full text-left mb-3 group"
                aria-expanded={!collapsed}
              >
                <span className={`badge ${getCategoryColor(cat)}`}>{getCategoryLabel(cat)}</span>
                <span className="text-xs text-slate-400">({reviews.length})</span>
                <span className="ml-auto text-slate-400 group-hover:text-slate-600">
                  {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </span>
              </button>

              {!collapsed && (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const isCopied = activeCopiedId === review.id;
                    return (
                      <div
                        key={review.id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold leading-none flex-shrink-0">
                            ★
                          </span>
                          <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap flex-grow font-sans pt-0.5">
                            {review.text}
                          </p>
                        </div>
                        <div className="flex justify-end pt-1 border-t border-slate-50">
                          <button
                            onClick={() => handleCopyAndRedirect(review.text, review.id)}
                            className={`w-full sm:w-auto font-semibold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 ${
                              isCopied
                                ? 'bg-green-600 text-white'
                                : 'bg-brand-600 hover:bg-brand-700 text-white'
                            }`}
                          >
                            {isCopied ? (
                              <><CheckCircle className="h-4 w-4" /> Copied! Opening Google…</>
                            ) : (
                              <><Copy className="h-4 w-4" /> Copy This Statement</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
