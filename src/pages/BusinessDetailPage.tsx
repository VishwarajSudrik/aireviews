import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { useToast } from '../contexts/ToastContext';
import {
  getBusinessById,
  deleteBusiness,
  saveBusiness,
} from '../services/businessStorage';
import { Business } from '../types';
import { formatDate, getCategoryLabel, getCategoryColor } from '../services/utils';
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Star,
  QrCode,
  Sparkles,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const biz = getBusinessById(id);
    if (biz) setBusiness(biz);
    else navigate('/dashboard');
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!business) return;
    setDeleting(true);
    try {
      deleteBusiness(business.id);
      showToast(`${business.name} deleted.`, 'success');
      navigate('/dashboard');
    } catch {
      showToast('Failed to delete business.', 'error');
      setDeleting(false);
    }
  };

  if (!business) return null;

  const reviewsByCategory = business.reviewSuggestions.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost text-sm mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                {business.category && (
                  <span className="badge bg-brand-50 text-brand-700">{business.category}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{business.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {business.website && (
                  <a href={business.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> {business.website}
                  </a>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {business.phone}</span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {business.email}</span>
                )}
                {business.address && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {business.address}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                to={`/business/${business.id}/edit`}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </Link>
              <a
                href={`/review/${business.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs py-2 px-3"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview
              </a>
              <button
                onClick={() => setDeleteOpen(true)}
                className="btn-ghost text-xs py-2 px-3 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Services */}
          {business.services.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services</div>
              <div className="flex flex-wrap gap-2">
                {business.services.map((svc) => (
                  <span key={svc} className="badge bg-gray-100 text-gray-600">{svc}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link
            to={`/business/${business.id}/reviews`}
            className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {business.reviewSuggestions.length} Review Suggestions
              </div>
              <div className="text-xs text-gray-500">View & export suggestions</div>
            </div>
          </Link>

          <Link
            to={`/business/${business.id}/qr`}
            className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">QR Code & Link</div>
              <div className="text-xs text-gray-500">Download PNG/SVG & Print</div>
            </div>
          </Link>
        </div>

        {/* Review category breakdown */}
        {business.reviewSuggestions.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Suggestion Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(reviewsByCategory).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`badge ${getCategoryColor(cat)}`}>{getCategoryLabel(cat)}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-accent-500 rounded-full"
                      style={{ width: `${(count / business.reviewSuggestions.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-400 text-right">
          Created {formatDate(business.createdAt)} · Updated {formatDate(business.updatedAt)}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Business">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{business.name}</strong>? This action cannot be undone.
          All review suggestions will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            <Trash2 className="w-4 h-4" /> Delete Business
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
};
