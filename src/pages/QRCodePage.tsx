import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { useToast } from '../contexts/ToastContext';
import { getBusinessById } from '../services/businessStorage';
import { Business } from '../types';
import { copyToClipboard, getReviewPageUrl } from '../services/utils';
import { generateStyledQrCardCanvas, QrTheme } from '../services/qrCanvasGenerator';
import { GoogleGIcon } from '../components/GoogleGIcon';
import { ArrowLeft, Download, Copy, Printer, ExternalLink, Building2, Star, Sparkles, Smartphone, CheckCircle, Tag } from 'lucide-react';

export const QRCodePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<QrTheme>('google-classic');
  const [whiteLabelText, setWhiteLabelText] = useState('');

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
      color: { dark: selectedTheme === 'dark-luxe' ? '#ffffff' : '#0f172a', light: '#ffffff00' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch(() => showToast('Failed to generate QR code.', 'error'));
  }, [reviewUrl, selectedTheme]);

  const downloadStyledPng = async () => {
    if (!qrDataUrl || !business) return;
    setDownloading(true);
    try {
      const styledCanvasUrl = await generateStyledQrCardCanvas(business, qrDataUrl, {
        theme: selectedTheme,
        whiteLabelText: whiteLabelText.trim(),
      });
      const a = document.createElement('a');
      a.href = styledCanvasUrl;
      a.download = `${business.slug}-${selectedTheme}-qr-poster.png`;
      a.click();
      showToast('Downloaded Google Review QR Poster (PNG).', 'success');
    } catch {
      showToast('Failed to generate styled QR poster.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const downloadRawPng = () => {
    if (!qrDataUrl || !business) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${business.slug}-qr-raw.png`;
    a.click();
    showToast('Downloaded raw QR code image.', 'success');
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

  const isDark = selectedTheme === 'dark-luxe';
  const isAcrylic = selectedTheme === 'acrylic-minimal';

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(`/business/${business.id}`)} className="btn-ghost text-sm mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Business
        </button>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="section-title">Official Google Review Display Standee</h1>
            <p className="section-subtitle">Custom white-labeled QR display poster for {business.name}</p>
          </div>

          {/* Theme Selector Pills */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setSelectedTheme('google-classic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTheme === 'google-classic'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Classic Google White
            </button>
            <button
              onClick={() => setSelectedTheme('dark-luxe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTheme === 'dark-luxe'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Dark Luxe
            </button>
            <button
              onClick={() => setSelectedTheme('acrylic-minimal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTheme === 'acrylic-minimal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Acrylic Sky Glass
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Styled Google Review QR Card (Printable & Viewable Live Preview) */}
          <div className="md:col-span-7">
            <div
              id="qr-print-area"
              className={`rounded-3xl p-8 text-center shadow-2xl border relative overflow-hidden transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : isAcrylic
                  ? 'bg-gradient-to-b from-sky-50 to-slate-50 border-sky-100 text-slate-900'
                  : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              {/* Top Google 4-Color Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="h-full w-1/4 bg-[#4285F4]"></div>
                <div className="h-full w-1/4 bg-[#EA4335]"></div>
                <div className="h-full w-1/4 bg-[#FBBC05]"></div>
                <div className="h-full w-1/4 bg-[#34A853]"></div>
              </div>

              {/* Official Google Header Label */}
              <div className="flex items-center justify-center gap-2 mb-2 mt-2">
                <GoogleGIcon className="w-6 h-6" />
                <span className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Review us on Google
                </span>
              </div>

              {/* Google Rating Stars & Score */}
              <div className="flex items-center justify-center gap-1 mb-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className={`text-[11px] font-extrabold uppercase tracking-widest mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                VERIFIED 4.9 / 5.0 RATING
              </div>

              {/* Business Logo */}
              <div className="flex items-center justify-center mb-5">
                {business.logo ? (
                  <div className={`w-20 h-20 rounded-2xl p-1.5 shadow-sm border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-md">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>

              {/* Business Name */}
              <h2 className={`font-extrabold text-2xl tracking-tight leading-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {business.name}
              </h2>
              
              {/* Subtitle */}
              <p className={`text-sm font-medium mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Share Your Experience
              </p>

              {/* Framed QR Code Container */}
              {qrDataUrl ? (
                <div className={`inline-block p-6 rounded-3xl border shadow-inner mb-5 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200/90'
                }`}>
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-xl" />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto rounded-3xl shimmer mb-5" />
              )}

              {/* ------------------------------------------------------------- */}
              {/* EXECUTIVE LOWER SIDE DESIGN BELOW QR CODE */}
              {/* ------------------------------------------------------------- */}

              {/* 1. Contactless NFC & Camera Callout Badge Pill */}
              <div className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full mb-5 border text-xs font-bold uppercase tracking-wide transition-all ${
                isDark ? 'bg-slate-800/90 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <Smartphone className="w-4 h-4 text-[#4285F4]" />
                <span>Tap Phone Here or Scan QR Code</span>
              </div>

              {/* 2. Unified 3-Step Process Flow Ribbon */}
              <div className={`grid grid-cols-3 divide-x rounded-2xl border p-3.5 mb-5 max-w-md mx-auto ${
                isDark ? 'bg-slate-950/80 border-slate-800 divide-slate-800' : 'bg-slate-50 border-slate-200/90 divide-slate-200'
              }`}>
                <div className="flex items-center justify-center gap-2 px-1 text-center">
                  <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">1</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Scan Code</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-1 text-center">
                  <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">2</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Copy Text</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-1 text-center">
                  <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">3</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Post Google</span>
                </div>
              </div>

              {/* 3. White Labeling Footer Badge */}
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {whiteLabelText.trim()
                  ? `OFFICIAL VERIFIED LISTING • POWERED BY ${whiteLabelText.trim().toUpperCase()}`
                  : 'OFFICIAL VERIFIED LISTING • WHITE LABEL FEEDBACK PORTAL'}
              </div>

              {/* 4. Bottom Google 4-Color Accent Line Ribbon */}
              <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                <div className="h-full w-1/4 bg-[#4285F4]"></div>
                <div className="h-full w-1/4 bg-[#EA4335]"></div>
                <div className="h-full w-1/4 bg-[#FBBC05]"></div>
                <div className="h-full w-1/4 bg-[#34A853]"></div>
              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="md:col-span-5 space-y-4">
            
            {/* White Labeling Settings */}
            <div className="card p-5 border border-brand-100 bg-brand-50/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                <Tag className="w-3.5 h-3.5" /> White Label Brand Name (Optional)
              </div>
              <input
                type="text"
                value={whiteLabelText}
                onChange={(e) => setWhiteLabelText(e.target.value)}
                placeholder="e.g. Your Agency Name"
                className="input text-xs w-full bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Customize the footer white label branding on exported posters.
              </p>
            </div>

            {/* Review URL Card */}
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Review Page URL</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  className="input text-xs flex-1 bg-slate-50"
                  aria-label="Review URL"
                />
                <button onClick={copyLink} className="btn-secondary px-3 py-2.5 flex-shrink-0" title="Copy link">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Open Preview */}
            <a
              href={reviewUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full justify-center gap-2 py-2.5 text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Open Review Page
            </a>

            <div className="divider-text text-xs text-slate-400 text-center my-2">Download Standee Poster</div>

            {/* Download Styled Card PNG */}
            <Button fullWidth onClick={downloadStyledPng} loading={downloading} className="shadow-md py-3 text-sm">
              <Download className="w-4 h-4" /> Download Google Review Poster (PNG)
            </Button>

            {/* Download Raw QR */}
            <Button fullWidth variant="secondary" onClick={downloadRawPng}>
              <Download className="w-4 h-4" /> Download Raw QR Only (PNG)
            </Button>

            {/* Download SVG */}
            <Button fullWidth variant="secondary" onClick={downloadSvg}>
              <Download className="w-4 h-4" /> Download Vector (SVG)
            </Button>

            {/* Print */}
            <Button fullWidth variant="secondary" onClick={handlePrint} className="no-print">
              <Printer className="w-4 h-4" /> Print Display Standee Card
            </Button>

            <div className="card p-4 bg-amber-50/80 border-amber-100 rounded-2xl">
              <div className="flex gap-2 items-start text-xs text-amber-800 leading-relaxed">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Pro Tip:</strong> Select a theme above and enter your custom white label brand name to export professionally branded QR standees for your clients!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80%; }
        }
      `}</style>
    </AdminLayout>
  );
};




