import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, QrCode, Star, Plus, ArrowRight, TrendingUp, Copy, ExternalLink, Activity } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { getAllBusinesses, seedDemoData } from '../services/businessStorage';
import { seedDemoAnalytics, getAnalyticsSummary, AnalyticsSummary } from '../services/analyticsStorage';
import { Business } from '../types';
import { formatDate } from '../services/utils';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export const DashboardPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalScans: 0,
    totalViews: 0,
    totalSuggestionClicks: 0,
    totalCopies: 0,
    totalGoogleClicks: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    seedDemoData();
    seedDemoAnalytics();
    setBusinesses(getAllBusinesses());
    setAnalytics(getAnalyticsSummary());
  }, []);

  const totalReviews = businesses.reduce((sum, b) => sum + b.reviewSuggestions.length, 0);

  const stats: StatCard[] = [
    {
      label: 'Total Businesses',
      value: businesses.length,
      icon: Building2,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Review Suggestions',
      value: totalReviews,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Page Views',
      value: analytics.totalViews,
      icon: TrendingUp,
      color: 'text-accent-600',
      bg: 'bg-accent-50',
    },
    {
      label: 'Copy Conversion Rate',
      value: `${analytics.conversionRate}%`,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Manage your businesses and review experiences.</p>
        </div>
        <Link to="/business/create" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Business
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Analytics Funnel Banner */}
      <div className="card p-6 mb-10 bg-gradient-to-r from-gray-900 via-gray-800 to-brand-950 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" /> Real-Time Customer Engagement Funnel
            </div>
            <h3 className="text-lg font-bold text-white">QR Scan to Google Review Flow</h3>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-brand-200 border border-white/10 font-mono">
            {analytics.conversionRate}% Conversion Rate
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 font-medium mb-1">1. QR Scans</div>
            <div className="text-xl font-bold text-white flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-400" /> {analytics.totalScans}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 font-medium mb-1">2. Page Views</div>
            <div className="text-xl font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" /> {analytics.totalViews}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 font-medium mb-1">3. Copies / Edits</div>
            <div className="text-xl font-bold text-white flex items-center gap-1.5">
              <Copy className="w-4 h-4 text-amber-400" /> {analytics.totalCopies}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 font-medium mb-1">4. Google Redirects</div>
            <div className="text-xl font-bold text-white flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-green-400" /> {analytics.totalGoogleClicks}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your Businesses</h2>
        <Link to="/businesses" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3.5 h-3.5" />
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
          {businesses.slice(0, 6).map((biz) => (
            <div key={biz.id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center flex-shrink-0">
                  {biz.logo ? (
                    <img src={biz.logo} alt={biz.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{biz.name}</div>
                  <div className="text-xs text-gray-500">{biz.category || 'Uncategorized'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{biz.reviewSuggestions.length} suggestions</span>
                <span>{formatDate(biz.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/business/${biz.id}`}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  Manage
                </Link>
                <Link
                  to={`/business/${biz.id}/qr`}
                  className="btn-ghost text-xs py-1.5 px-3"
                  title="QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
