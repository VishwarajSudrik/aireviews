import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { useToast } from '../contexts/ToastContext';
import { getBusinessById, updateBusinessReviews } from '../services/businessStorage';
import { generateReviewSuggestions } from '../services/reviewApi';
import { Business, ReviewSuggestion } from '../types';
import { Sparkles, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateId } from '../services/utils';

const LOADING_STEPS = [
  'Analyzing business information…',
  'Creating personalized suggestions…',
  'Organizing by category…',
  'Finalizing suggestions…',
];

export const GenerateReviewsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    const biz = getBusinessById(id);
    if (biz) setBusiness(biz);
    else navigate('/dashboard');
  }, [id, navigate]);

  // Cycle through loading messages
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!business) return;
    setError('');
    setDone(false);
    setGenerating(true);
    setLoadingStep(0);

    const res = await generateReviewSuggestions({
      businessName: business.name,
      description: business.description,
      category: business.category,
      services: business.services,
      website: business.website,
    });

    setGenerating(false);

    if (!res.success || !res.reviews) {
      setError(res.message || "We couldn't generate suggestions right now. Please try again in a moment.");
      return;
    }

    // Stamp IDs and timestamps
    const stamped: ReviewSuggestion[] = res.reviews.map((r) => ({
      ...r,
      id: r.id || generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    updateBusinessReviews(business.id, stamped);
    setBusiness((prev) => prev ? { ...prev, reviewSuggestions: stamped } : prev);
    setCount(stamped.length);
    setDone(true);
    showToast(`${stamped.length} suggestions generated successfully!`, 'success');
  };

  if (!business) return null;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/business/${business.id}`)} className="btn-ghost text-sm mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <h1 className="section-title">Generate AI Review Suggestions</h1>
          <p className="section-subtitle">
            AI will create ~50 diverse review starting points for <strong>{business.name}</strong>.
          </p>
        </div>

        {/* Business summary */}
        <div className="card p-6 mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Business Summary</div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name: </span>
              <span className="text-gray-600">{business.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Category: </span>
              <span className="text-gray-600">{business.category || '—'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700">Services: </span>
              <span className="text-gray-600">{business.services.join(', ') || '—'}</span>
            </div>
          </div>
        </div>

        {/* Existing suggestions warning */}
        {business.reviewSuggestions.length > 0 && !done && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This business already has <strong>{business.reviewSuggestions.length}</strong> suggestions.
              Regenerating will replace them all.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 mb-3">{error}</p>
              <Button size="sm" variant="secondary" onClick={handleGenerate}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Success state */}
        {done && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">
                {count} suggestions generated successfully!
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => navigate(`/business/${business.id}/reviews`)}>
                  View Suggestions
                </Button>
                <Button size="sm" variant="secondary" onClick={handleGenerate}>
                  Regenerate All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {generating && (
          <div className="card p-8 text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Creating your suggestions…</h3>
            <p className="text-sm text-gray-500">{LOADING_STEPS[loadingStep]}</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i <= loadingStep ? 'bg-brand-500 w-6' : 'bg-gray-200 w-3'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        {!generating && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ready to generate</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Click below to create ~50 AI-assisted review suggestions across 5 categories.
            </p>
            <Button onClick={handleGenerate} size="lg">
              <Sparkles className="w-5 h-5" /> Generate Suggestions
            </Button>

            <p className="text-xs text-gray-400 mt-6 max-w-sm mx-auto">
              Suggestions are starting points only — customers will always personalize them to match their genuine experience.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
