import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { useToast } from '../contexts/ToastContext';
import { createBusiness, slugExists } from '../services/businessStorage';
import { slugify, isValidUrl } from '../services/utils';
import { Plus, X, Globe, Phone, Mail, MapPin, Tag, Link2, Building2, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Healthcare', 'Dental', 'Legal', 'Restaurant', 'Retail', 'Beauty & Wellness',
  'Automotive', 'Real Estate', 'Fitness', 'Education', 'Technology', 'Finance',
  'Home Services', 'Hospitality', 'Other',
];

interface FormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  googleReviewUrl: string;
  services: string[];
  logo: string;
}

interface FormErrors {
  [key: string]: string;
}

const emptyForm: FormData = {
  name: '',
  slug: '',
  description: '',
  category: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  googleReviewUrl: '',
  services: [],
  logo: '',
};

export const CreateBusinessPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [serviceInput, setServiceInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name') {
        next.slug = slugify(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const addService = () => {
    const trimmed = serviceInput.trim();
    if (!trimmed) return;
    if (form.services.includes(trimmed)) {
      setServiceInput('');
      return;
    }
    setForm((prev) => ({ ...prev, services: [...prev.services, trimmed] }));
    setServiceInput('');
  };

  const removeService = (svc: string) => {
    setForm((prev) => ({ ...prev, services: prev.services.filter((s) => s !== svc) }));
  };

  const validate = useCallback((): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Business name is required.';
    if (!form.slug.trim()) errs.slug = 'Slug is required.';
    else if (slugExists(form.slug)) errs.slug = 'This slug is already in use. Choose another.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.category) errs.category = 'Category is required.';
    if (!form.googleReviewUrl.trim()) errs.googleReviewUrl = 'Google review URL is required.';
    else if (!isValidUrl(form.googleReviewUrl)) errs.googleReviewUrl = 'Please enter a valid URL.';
    if (form.website && !isValidUrl(form.website)) errs.website = 'Please enter a valid URL.';
    if (form.services.length === 0) errs.services = 'Add at least one service.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const biz = createBusiness({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        category: form.category,
        website: form.website.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        googleReviewUrl: form.googleReviewUrl.trim(),
        services: form.services,
        logo: form.logo.trim(),
      });
      showToast(`${biz.name} created successfully!`, 'success');
      navigate(`/business/${biz.id}`);
    } catch {
      showToast('Failed to create business. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title">Create Business</h1>
          <p className="section-subtitle">Fill in the details below to create a new business profile.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Business Information */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-gray-900">Business Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="name"
                  label="Business Name *"
                  placeholder="e.g. Apex Pinhole Surgery Clinic"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  error={errors.name}
                />
              </div>

              <Input
                id="slug"
                label="Business Slug *"
                placeholder="apex-pinhole-surgery"
                value={form.slug}
                onChange={(e) => update('slug', slugify(e.target.value))}
                error={errors.slug}
                hint="Used in the public URL: /review/your-slug"
              />

              <div>
                <label htmlFor="category" className="label">Category *</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className={`input ${errors.category ? 'border-red-400 focus:ring-red-400' : ''}`}
                >
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1.5 text-xs text-red-600">{errors.category}</p>}
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  id="description"
                  label="Business Description *"
                  placeholder="Describe what your business does, your specialty, and what makes you unique…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  error={errors.description}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-gray-900">Contact Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="website"
                  label="Website"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  error={errors.website}
                />
                <Globe className="absolute right-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  id="phone"
                  label="Phone"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
                <Phone className="absolute right-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  id="email"
                  label="Email"
                  placeholder="info@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <Mail className="absolute right-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  id="address"
                  label="Address"
                  placeholder="123 Main St, City, State"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
                <MapPin className="absolute right-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-gray-900">Services *</h2>
            </div>

            <div className="flex gap-2">
              <input
                id="service-input"
                type="text"
                className="input flex-1"
                placeholder="Add a service and press Enter"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addService();
                  }
                }}
              />
              <Button type="button" onClick={addService} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {errors.services && <p className="text-xs text-red-600">{errors.services}</p>}

            {form.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.services.map((svc) => (
                  <span key={svc} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100">
                    {svc}
                    <button
                      type="button"
                      onClick={() => removeService(svc)}
                      className="hover:text-brand-900 transition-colors"
                      aria-label={`Remove ${svc}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Google Review URL */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-gray-900">Google Review URL *</h2>
            </div>
            <Input
              id="googleReviewUrl"
              label="Google Business Review URL"
              placeholder="https://search.google.com/local/writereview?placeid=..."
              value={form.googleReviewUrl}
              onChange={(e) => update('googleReviewUrl', e.target.value)}
              error={errors.googleReviewUrl}
              hint="Paste the direct Google review link for this business. Customers will be redirected here after copying their review."
            />
          </div>

          {/* Logo URL */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-gray-900">Logo (Optional)</h2>
            </div>
            <Input
              id="logo"
              label="Logo URL"
              placeholder="https://example.com/logo.png"
              value={form.logo}
              onChange={(e) => update('logo', e.target.value)}
              hint="Enter a publicly accessible URL for your logo image."
            />
            {form.logo && (
              <div className="mt-3">
                <img
                  src={form.logo}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Creating…' : 'Create Business'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
