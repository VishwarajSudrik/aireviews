import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { useToast } from '../contexts/ToastContext';
import { getBusinessById } from '../services/businessStorage';
import { Business } from '../types';
import { copyToClipboard, getReviewPageUrl } from '../services/utils';
import { ArrowLeft, Download, Copy, Printer, QrCode, ExternalLink, Building2 } from 'lucide-react';

export const QRCodePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!id) return;
    const biz = getBusinessById(id);
    if (biz) setBusiness(biz);
    else navigate('/dashboard');
  }, [id, navigate]);

  const reviewUrl = business ? getReviewPageUrl(business.slug) : '';

  useEffect(() => {
    if (!reviewUrl) return;
    QRCode.toDataURL(reviewUrl, {
      width: 512,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch(() => showToast('Failed to generate QR code.', 'error'));
  }, [reviewUrl]);

  const downloadPng = () => {
    if (!qrDataUrl || !business) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${business.slug}-qr.png`;
    a.click();
    showToast('QR code downloaded as PNG.', 'success');
  };

  const downloadSvg = async () => {
    if (!reviewUrl || !business) return;
    try {
      const svgStr = await QRCode.toString(reviewUrl, {
        type: 'svg',
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${business.slug}-qr.svg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('QR code downloaded as SVG.', 'success');
    } catch {
      showToast('Failed to generate SVG.', 'error');
    }
  };

  const copyLink = async () => {
    const ok = await copyToClipboard(reviewUrl);
    showToast(ok ? '✓ Review link copied!' : 'Failed to copy link.', ok ? 'success' : 'error');
  };

  const handlePrint = () => window.print();

  if (!business) return null;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(`/business/${business.id}`)} className="btn-ghost text-sm mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <h1 className="section-title">QR Code</h1>
          <p className="section-subtitle">{business.name}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Card (printable) */}
          <div id="qr-print-area" className="card p-8 text-center bg-white">
            <div className="flex items-center justify-center mb-5">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-sm">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <h2 className="font-bold text-gray-900 text-xl mb-1">{business.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Share Your Experience</p>

            {qrDataUrl ? (
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner mb-6">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            ) : (
              <div className="w-56 h-56 mx-auto rounded-2xl shimmer mb-6" />
            )}

            <p className="text-sm font-semibold text-gray-700 mb-1">Scan to get started</p>
            <p className="text-xs text-gray-400 mb-4">with our review assistant</p>

            <div className="text-xs text-brand-500 font-mono break-all px-2">{reviewUrl}</div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Review URL */}
            <div className="card p-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Review Page URL</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  className="input text-xs flex-1 bg-gray-50"
                  aria-label="Review URL"
                />
                <button onClick={copyLink} className="btn-secondary px-3 py-2.5 flex-shrink-0" title="Copy link">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Open preview */}
            <a
              href={reviewUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full justify-center gap-2 py-2.5"
            >
              <ExternalLink className="w-4 h-4" /> Open Review Page
            </a>

            <div className="divider-text text-xs text-gray-400 text-center">Download QR</div>

            <Button fullWidth onClick={downloadPng}>
              <Download className="w-4 h-4" /> Download PNG
            </Button>

            <Button fullWidth variant="secondary" onClick={downloadSvg}>
              <Download className="w-4 h-4" /> Download SVG
            </Button>

            <Button fullWidth variant="secondary" onClick={handlePrint} className="no-print">
              <Printer className="w-4 h-4" /> Print QR Card
            </Button>

            <div className="card p-4 bg-blue-50 border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Tip:</strong> Print this QR card and place it at your reception desk, on receipts, or inside your business.
                For best scanning, use the PNG for digital and SVG for print.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        }
      `}</style>
    </AdminLayout>
  );
};
