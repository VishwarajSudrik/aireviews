import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Star, QrCode, Users, CheckCircle, Sparkles } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Add Your Business',
    desc: 'Enter your business details, services, and Google review URL in minutes.',
    icon: Building2Icon,
  },
  {
    num: '02',
    title: 'Generate AI-Assisted Suggestions',
    desc: 'Our AI creates 50 diverse, natural review starting points tailored to your business.',
    icon: SparklesIcon,
  },
  {
    num: '03',
    title: 'Create Your QR Code',
    desc: 'Instantly generate a printable QR code linked to your unique review page.',
    icon: QrCodeIcon,
  },
  {
    num: '04',
    title: 'Customers Scan & Share',
    desc: 'Customers scan the QR, choose a suggestion, personalize it, and head to Google.',
    icon: UsersIcon,
  },
];

function Building2Icon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function SparklesIcon() {
  return <Sparkles className="w-6 h-6" />;
}

function QrCodeIcon() {
  return <QrCode className="w-6 h-6" />;
}

function UsersIcon() {
  return <Users className="w-6 h-6" />;
}

const benefits = [
  'No fake reviews — AI-assisted starting points only',
  'Customers personalize suggestions for authenticity',
  'Works with any Google Business profile',
  'Mobile-optimized for QR code scanning',
  '50 diverse suggestions per business',
  'Downloadable QR code for print materials',
];

export const LandingPage = () => (
  <div className="min-h-screen bg-white overflow-x-hidden">
    {/* Header */}
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Review<span className="gradient-text">QR</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
          <Link to="/business/create" className="btn-primary text-sm py-2 px-4">
            Get Started
          </Link>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-brand-100/60 to-accent-100/40 blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-accent-100/50 to-brand-100/30 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Assisted Review Experience
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Turn Customer Experiences<br />
          Into <span className="gradient-text">Better Reviews</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create AI-assisted review suggestions for your business and share them instantly
          through a simple QR code. No fake reviews — just great starting points.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/business/create" className="btn-primary text-base py-3.5 px-8 shadow-lg hover:shadow-xl">
            Create Your Review QR <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/review/apex-pinhole-surgery" className="btn-secondary text-base py-3.5 px-8">
            View Demo Page
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { val: '50', label: 'Suggestions' },
            { val: '5', label: 'Categories' },
            { val: '1-Click', label: 'QR Download' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold gradient-text">{s.val}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From setup to customer reviews in four simple steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-brand-200 to-transparent z-0 -translate-y-px" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% - 1rem)' }} />
              )}
              <div className="card p-6 hover:shadow-md transition-shadow relative z-10">
                <div className="text-xs font-bold text-brand-400 tracking-widest mb-4 font-mono">{step.num}</div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center text-white mb-4 shadow-sm">
                  <step.icon />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Benefits */}
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold mb-6">
              <CheckCircle className="w-3.5 h-3.5" />
              Ethical & Authentic
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              AI-Assisted, Not Fake
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              ReviewQR generates review <strong>starting points</strong> based on your real business information —
              never fake testimonials. Customers always personalize suggestions to reflect their genuine experience.
            </p>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link to="/business/create" className="btn-primary">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Review card preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-accent-100 rounded-3xl transform rotate-3 opacity-50" />
            <div className="relative card p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Apex Pinhole Surgery</div>
                  <div className="flex text-yellow-400 text-xs">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "The team at Apex Pinhole Surgery made me feel completely at ease. The minimally invasive approach meant almost no downtime, and my results have been amazing."
              </p>
              <div className="flex gap-2 pt-2">
                <span className="badge bg-purple-100 text-purple-700">Customer Experience</span>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs py-2 px-3">Edit</button>
                <button className="btn-primary text-xs py-2 px-3">Copy Review</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-gradient-to-br from-brand-600 to-accent-700 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to boost your Google reviews?
        </h2>
        <p className="text-brand-100 text-lg mb-10">
          Set up your AI review experience in minutes. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/business/create" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl active:scale-95 text-base">
            Create Your Review QR <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-base">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 bg-gray-900 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-white font-bold text-sm">ReviewQR</span>
      </div>
      <p className="text-gray-500 text-xs">AI-assisted review platform for local businesses.</p>
    </footer>
  </div>
);
