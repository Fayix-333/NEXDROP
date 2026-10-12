import React, { useState } from 'react';
import {
  Store,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Percent,
  HelpCircle,
  Briefcase,
  FileText,
} from 'lucide-react';
import { NexdropStore } from '../services/storage';
import { Seller } from '../types';
import { KERALA_DISTRICTS } from '../data/mockData';

interface SellerAuthPageProps {
  initialMode?: 'login' | 'register';
  onSellerAuthSuccess: (seller: Seller) => void;
  onBackToStore: () => void;
  lang: 'en' | 'ml';
  onSwitchToCustomerAuth: () => void;
}

export const SellerAuthPage: React.FC<SellerAuthPageProps> = ({
  initialMode = 'login',
  onSellerAuthSuccess,
  onBackToStore,
  lang,
  onSwitchToCustomerAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 9037538732');
  const [district, setDistrict] = useState('Ernakulam');
  const [gstin, setGstin] = useState('32AAECP1234F1Z5');
  const [pan, setPan] = useState('AAECP1234F');
  const [bankName, setBankName] = useState('Federal Bank');
  const [accountNumber, setAccountNumber] = useState('•••• •••• 5521');
  const [ifsc, setIfsc] = useState('FDRL0001042');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide merchant registered email.');
      return;
    }
    const sellers = NexdropStore.getSellers();
    const found = sellers.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setSuccessMsg(`Welcome, ${found.business_name}! Opening Merchant Central...`);
      setTimeout(() => {
        onSellerAuthSuccess(found);
      }, 700);
    } else {
      setError('No registered shop found with this email. Please click "Onboard Kerala Business" to register your store.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!businessName || !ownerName || !email || !phone || !gstin) {
      setError('Please complete all mandatory Kerala Merchant Onboarding fields.');
      return;
    }

    const created = NexdropStore.registerSeller({
      business_name: businessName,
      owner_name: ownerName,
      email: email.toLowerCase(),
      phone,
      district,
      gstin: gstin.toUpperCase(),
      pan: pan.toUpperCase() || 'AAECP1234F',
      bank_name: bankName,
      account_number: accountNumber || '•••• 5521',
      ifsc: ifsc.toUpperCase() || 'FDRL0001042',
      commission_rate: 8,
    });

    setSuccessMsg('Kerala Merchant registered! Forwarding to Seller Central...');
    setTimeout(() => {
      onSellerAuthSuccess(created);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050706] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00F58A]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[#00C875]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Official Navigation */}
      <header className="border-b border-white/10 bg-[#0A100D]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#00F58A] transition-colors py-1.5 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="NEXDROP Logo"
              className="w-7 h-7 rounded-lg object-contain bg-black border border-[#00F58A]/40 p-0.5 shadow-lg shadow-[#00F58A]/20"
            />
            <div>
              <span className="font-display font-black text-sm tracking-wide text-white">NEXDROP</span>
              <span className="text-[10px] text-[#00F58A] block font-mono font-bold">Seller Central • Merchant Hub</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToCustomerAuth}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <span>Customer Portal</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Merchant Benefits Panel */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0D1410] border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-[#00F58A] bg-[#00F58A]/10 border border-[#00F58A]/20">
                <Building className="w-3.5 h-3.5" />
                <span>Kerala Commerce Partner Network</span>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Grow Your Business Across All 14 Kerala Districts.
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Join hundreds of Kerala retailers, spice estates, fashion designers, and gadget distributors on NEXDROP's unified marketplace.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <span>Low commission rates starting at 8%</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span>Next-day RTGS/NEFT bank settlement & UTR ledger</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>GST 32 Automated Tax Invoicing & Doorstep Kerala Courier Pickup</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 text-xs text-slate-400">
              <p>📍 Dedicated Courier Network covering all 14 Kerala districts from Kasaragod to Trivandrum.</p>
            </div>
          </div>

          {/* Right Merchant Auth Form */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0D1410]/90 backdrop-blur-2xl border border-white/15 p-6 sm:p-10 shadow-2xl flex flex-col justify-center">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                    mode === 'login'
                      ? 'text-[#00F58A] border-[#00F58A]'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  Merchant Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                    mode === 'register'
                      ? 'text-[#00F58A] border-[#00F58A]'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  Onboard Kerala Business
                </button>
              </div>

              <span className="text-[11px] font-mono text-[#00F58A]">
                {mode === 'login' ? 'SELLER CENTRAL AUTH' : 'GST 32 ONBOARDING'}
              </span>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Merchant Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. malabar@keralaretail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Merchant Portal Password
                    </label>
                    <span className="text-xs text-slate-400">Secured SSL L4</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00F58A] to-[#00C875] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#00F58A]/20 transition-all cursor-pointer"
                >
                  <span>Enter Seller Central Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Business / Trade Name
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Cochin Artisans Hub"
                      className="w-full px-3 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Proprietor / Owner Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Venu Madhav"
                      className="w-full px-3 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trade@kerala.in"
                      className="w-full px-3 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9037538732"
                      className="w-full px-3 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Kerala District HQ
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F58A]"
                    >
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d} className="bg-[#070B08]">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Kerala GSTIN (State 32)
                    </label>
                    <input
                      type="text"
                      required
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="32AAAAA0000A1Z5"
                      className="w-full px-3 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                  <span className="text-[11px] font-bold text-[#00F58A] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payout Settlement Account (NEFT / RTGS)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Bank (e.g. Federal Bank)"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070B08] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070B08] border border-white/10 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070B08] border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00F58A] to-[#00C875] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#00F58A]/20 transition-all cursor-pointer"
                >
                  <span>Submit Merchant Onboarding & Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="border-t border-white/10 bg-[#070B08] py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <span className="font-mono text-[11px]">NEXDROP Kerala Seller Central • GST 32 Regulated Merchant Hub</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Kerala Goods & Services Tax Directorate</span>
          <span>•</span>
          <a href="tel:+919037538732" className="text-white hover:text-[#00F58A] transition-colors">
            Merchant Desk: +91 9037538732
          </a>
          <span>•</span>
          <a href="mailto:nexdropkerala@gmail.com" className="text-[#00F58A] hover:underline transition-colors">
            nexdropkerala@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
};
