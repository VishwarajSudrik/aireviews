import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { useToast } from '../contexts/ToastContext';
import { getBusinessById, updateBusinessReviews } from '../services/businessStorage';
import { Business, ReviewSuggestion, ReviewCategory } from '../types';
import { getCategoryLabel, getCategoryColor, copyToClipboard, generateId } from '../services/utils';
import {
  ArrowLeft, Search, Plus, Copy, Sparkles, Star, Download, ExternalLink
} from 'lucide-react';

const ALL_CATEGORIES: ReviewCategory[] = [
  'short',
  'service_focused',
  'professional_experience',
  'customer_experience',
  'natural_conversational',
];

export const ReviewManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ReviewCategory | 'all'>('all');

  useEffect(() => {
    if (!id) return;
    const biz = getBusinessById(id);
    if (biz) setBusiness(biz);
    else navigate('/dashboard');
  }, [id, navigate]);

  const filtered = useMemo(() => {
    if (!business) return [];
    return business.reviewSuggestions.filter((r) => {
      const matchCat = activeCategory === 'all' || r.category === activeCategory;
      const matchSearch = r.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [business, searchQuery, activeCategory]);

  const exportCsv = () => {
    if (!business || business.reviewSuggestions.length === 0) return;
    const headers = 'ID,Category,Suggestion Text\n';
    const rows = business.reviewSuggestions
      .map((r) => `"${r.id}","${r.category}","${r.text.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${business.slug}-review-suggestions.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported suggestions to CSV', 'success');
  };

  const exportJson = () => {
    if (!business || business.reviewSuggestions.length === 0) return;
    const jsonStr = JSON.stringify(business.reviewSuggestions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${business.slug}-review-suggestions.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported suggestions to JSON', 'success');
  };

  const handleCopyAndRedirect = async (text: string) => {
    if (!business) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      showToast('✓ Review copied! Opening Google Review page…', 'success');
      if (business.googleReviewUrl) {
        window.open(business.googleReviewUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      showToast('Failed to copy text. Please try again.', 'error');
    }
  };

  if (!business) return null;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(`/business/${business.id}`)} className="btn-ghost text-sm mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Review Suggestions</h1>
            <p className="section-subtitle">{business.name} · {business.reviewSuggestions.length} total</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={exportCsv} title="Export as CSV">
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportJson} title="Export as JSON">
              <Download className="w-4 h-4" /> JSON
            </Button>
            <Link to={`/business/${business.id}/generate`} className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Regenerate All
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search suggestions…"
              className="input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`badge cursor-pointer transition-all ${activeCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All ({business.reviewSuggestions.length})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const cnt = business.reviewSuggestions.filter((r) => r.category === cat).length;
              if (cnt === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`badge cursor-pointer transition-all ${activeCategory === cat ? 'bg-gray-900 text-white' : getCategoryColor(cat) + ' hover:opacity-80'}`}
                >
                  {getCategoryLabel(cat)} ({cnt})
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {business.reviewSuggestions.length === 0 && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No review suggestions yet</h3>
            <p className="text-gray-500 text-sm mb-6">Generate AI-assisted suggestions to get started.</p>
            <Link to={`/business/${business.id}/generate`} className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Generate Suggestions
            </Link>
          </div>
        )}

        {/* No filter results */}
        {business.reviewSuggestions.length > 0 && filtered.length === 0 && (
          <div className="card p-8 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No suggestions match your search.</p>
            <button className="text-brand-600 text-sm font-medium mt-2" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
              Clear filters
            </button>
          </div>
        )}

        {/* Review grid */}
        {filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((review) => (
              <div key={review.id} className="card p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge ${getCategoryColor(review.category)}`}>
                      {getCategoryLabel(review.category)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed mb-4">"{review.text}"</p>
                </div>
                <button
                  onClick={() => handleCopyAndRedirect(review.text)}
                  className="btn-primary text-xs py-2.5 px-4 w-full justify-center gap-2 mt-2"
                >
                  <Copy className="w-4 h-4" /> Copy & Open Google Review <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
