import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { getAllBusinesses, seedDemoData } from '../services/businessStorage';
import { Business } from '../types';
import { QrCode, Building2, Plus, ExternalLink } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { getReviewPageUrl } from '../services/utils';

export const QRCodesListPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    seedDemoData();
    const bizList = getAllBusinesses();
    setBusinesses(bizList);

    // Generate small QR thumbnails
    bizList.forEach((biz) => {
      QRCodeLib.toDataURL(getReviewPageUrl(biz.slug), {
        width: 120,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).then((url) => {
        setQrMap((prev) => ({ ...prev, [biz.id]: url }));
      });
    });
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">QR Codes</h1>
          <p className="section-subtitle">Download and share QR codes for each business.</p>
        </div>
        <Link to="/business/create" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create a business to generate its QR code.</p>
          <Link to="/business/create" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Business
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <div key={biz.id} className="card p-5 text-center hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-4">
                {qrMap[biz.id] ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 inline-block">
                    <img src={qrMap[biz.id]} alt={`QR code for ${biz.name}`} className="w-24 h-24" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl shimmer" />
                )}
              </div>
              <h2 className="font-semibold text-gray-900 text-sm mb-1">{biz.name}</h2>
              <p className="text-xs text-gray-500 mb-4">/review/{biz.slug}</p>
              <div className="flex gap-2">
                <Link to={`/business/${biz.id}/qr`} className="btn-primary text-xs py-2 px-3 flex-1 justify-center">
                  <QrCode className="w-3.5 h-3.5" /> Manage QR
                </Link>
                <a
                  href={`/review/${biz.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost text-xs py-2 px-3"
                  title="Preview"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
