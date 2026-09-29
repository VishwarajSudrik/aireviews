import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { getAllBusinesses, seedDemoData } from '../services/businessStorage';
import { Business } from '../types';
import { formatDate } from '../services/utils';
import { Building2, QrCode, Plus, Star, Sparkles } from 'lucide-react';

export const BusinessesListPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    seedDemoData();
    setBusinesses(getAllBusinesses());
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Businesses</h1>
          <p className="section-subtitle">{businesses.length} business{businesses.length !== 1 ? 'es' : ''} registered</p>
        </div>
        <Link to="/business/create" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first business to get started.</p>
          <Link to="/business/create" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Business
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <div key={biz.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {biz.logo ? (
                    <img src={biz.logo} alt={biz.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900 truncate">{biz.name}</h2>
                  <span className="text-xs text-gray-500">{biz.category || 'Uncategorized'}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{biz.description}</p>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {biz.reviewSuggestions.length} suggestions</span>
                <span>{formatDate(biz.createdAt)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Link to={`/business/${biz.id}`} className="btn-secondary text-xs py-1.5 px-2 justify-center col-span-1">
                  View
                </Link>
                <Link to={`/business/${biz.id}/generate`} className="btn-ghost text-xs py-1.5 px-2 justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
                <Link to={`/business/${biz.id}/qr`} className="btn-ghost text-xs py-1.5 px-2 justify-center">
                  <QrCode className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
