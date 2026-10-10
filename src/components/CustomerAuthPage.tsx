import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  HelpCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { NexdropStore } from '../services/storage';
import { User as UserType } from '../types';
import { KERALA_DISTRICTS } from '../data/mockData';
import {
  lookupKeralaPincodeSync,
  lookupKeralaPincode,
  KeralaPlaceInfo,
} from '../services/keralaPincode';

interface CustomerAuthPageProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: UserType) => void;
  onBackToStore: () => void;
  lang: 'en' | 'ml';
  onSwitchToSellerAuth: () => void;
}

export const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onBackToStore,
  lang,
  onSwitchToSellerAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 9037538732');
  const [pinCode, setPinCode] = useState('682001');
  const [district, setDistrict] = useState('Ernakulam');
  const [detectedPlace, setDetectedPlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync('682001')
  );
  const [error, setError] = useState<string | null>(null);

  const handlePinChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPinCode(cleaned);
    if (cleaned.length === 6) {
      const sync = lookupKeralaPincodeSync(cleaned);
      if (sync && sync.isKerala) {
        setDetectedPlace(sync);
        setDistrict(sync.district);
      }
      try {
        const live = await lookupKeralaPincode(cleaned);
        if (live && live.isKerala) {
          setDetectedPlace(live);
          setDistrict(live.district);
        }
      } catch (err) {
        // sync was applied
      }
    } else {
      setDetectedPlace(null);
    }
  };
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleQuickDemoCustomer = () => {
    const demoUser = NexdropStore.getCustomers()[0];
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword('••••••••••••');
      setError(null);
      setSuccessMsg('Demo credentials loaded. Click "Sign In" or wait 1s.');
      setTimeout(() => {
        onAuthSuccess(demoUser);
      }, 900);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError(lang === 'ml' ? 'ഇമെയിൽ വിലാസം നൽകുക.' : 'Please enter your registered email address.');
      return;
    }
    const user = NexdropStore.loginCustomer(email);
    if (user) {
      if (user.is_blocked) {
        setError(
          lang === 'ml'
            ? 'നിങ്ങളുടെ അക്കൗണ്ട് അഡ്മിൻ താൽക്കാലികമായി റദ്ദാക്കിയിരിക്കുന്നു.'
            : 'This account has been suspended by administration.'
        );
        return;
      }
      setSuccessMsg(lang === 'ml' ? 'സ്വാഗതം! ലോഗിൻ വിജയകരം.' : 'Authentication successful! Welcome to NEXDROP.');
      setTimeout(() => {
        onAuthSuccess(user);
      }, 700);
    } else {
      // Auto-provision demo shopper profile
      const newUser = NexdropStore.registerCustomer({
        name: email.split('@')[0].toUpperCase(),
        email,
        phone: '+91 9037538732',
        district: 'Ernakulam',
      });
      setSuccessMsg('Account authorized. Directing to your Kerala shopping portal...');
      setTimeout(() => {
        onAuthSuccess(newUser);
      }, 700);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !phone) {
      setError(lang === 'ml' ? 'എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക.' : 'Please fill all mandatory fields to continue.');
      return;
    }
    const newUser = NexdropStore.registerCustomer({
      name,
      email,
      phone,
      district,
      pin_code: pinCode,
    });
    setSuccessMsg(
      lang === 'ml'
        ? 'അക്കൗണ്ട് വിജയകരമായി രജിസ്റ്റർ ചെയ്തു! സ്വാഗതം.'
        : 'Kerala customer profile registered successfully!'
    );
    setTimeout(() => {
      onAuthSuccess(newUser);
    }, 900);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    setSuccessMsg(`Official OTP and reset link dispatched to ${email} & linked Kerala mobile.`);
    setTimeout(() => {
      setSuccessMsg(null);
      setMode('login');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#050706] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient liquid glass glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F58A]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00C875]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Official Navigation Bar */}
      <header className="border-b border-white/10 bg-[#0A100D]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#00F58A] transition-colors py-1.5 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ml' ? 'തിരികെ സ്റ്റോറിലേക്ക്' : 'Back to Store'}</span>
          </button>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00F58A] to-[#00C875] flex items-center justify-center shadow-lg shadow-[#00F58A]/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-black">
                <path
                  d="M12 2.5C12 2.5 5.5 11 5.5 15.5C5.5 19.0899 8.41015 22 12 22C15.5899 22 18.5 19.0899 18.5 15.5C18.5 11 12 2.5 12 2.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <span className="font-display font-black text-sm tracking-wide text-white">NEXDROP</span>
              <span className="text-[10px] text-slate-400 block font-mono">Official Kerala Portal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToSellerAuth}
            className="text-xs font-semibold text-[#00F58A] hover:underline flex items-center gap-1.5"
          >
            <span>{lang === 'ml' ? 'വ്യാപാരി ലോഗിൻ' : 'Seller Portal Login'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Brand Panel (Official Marketplace Value) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0D1410] border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-[#00F58A] bg-[#00F58A]/10 border border-[#00F58A]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Kerala Consumer Identity</span>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {lang === 'ml'
                    ? 'കേരളത്തിലെ പ്രിയപ്പെട്ട ഷോപ്പിംഗ് അനുഭവം'
                    : 'Shop smarter. Delivered across Kerala.'}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  {lang === 'ml'
                    ? '14 ജില്ലകളിലുമുള്ള വിശ്വസ്ത വ്യാപാരികൾ, വേഗതയേറിയ ഡെലിവറി, സുരക്ഷിതമായ പേയ്മെന്റുകൾ.'
                    : 'Access verified merchants, express district delivery, live order tracking, and instant UPI refund clearance.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span>Doorstep delivery to all 14 Kerala Districts</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <span>7-Day easy returns & instant UPI bank refunds</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Genuine products with Kerala artisan guarantee</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={handleQuickDemoCustomer}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#00F58A]/30 text-xs font-bold text-[#00F58A] flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo Login (Nivin Thomas)</span>
              </button>
            </div>
          </div>

          {/* Right Authentication Card */}
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
                  {lang === 'ml' ? 'ലോഗിൻ' : 'Customer Sign In'}
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
                  {lang === 'ml' ? 'രജിസ്റ്റർ ചെയ്യുക' : 'Create New Account'}
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                {mode === 'login' ? 'STEP 1 OF 1' : 'KERALA RESIDENT REGISTRATION'}
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

            {/* Form Views */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {lang === 'ml' ? 'ഇമെയിൽ വിലാസം' : 'Registered Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. nivin.thomas@keralamail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      {lang === 'ml' ? 'പാസ്‌വേഡ്' : 'Account Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#00F58A] hover:underline"
                    >
                      {lang === 'ml' ? 'പാസ്‌വേഡ് മറന്നോ?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00F58A] to-[#00C875] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#00F58A]/20 transition-all cursor-pointer"
                >
                  <span>{lang === 'ml' ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In to Customer Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'ml' ? 'പൂർണ്ണ പേര്' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sandra Nair"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'ml' ? 'ഇമെയിൽ' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nexdropkerala@gmail.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'ml' ? 'ഫോൺ നമ്പർ' : 'Mobile Number'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9037538732"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'ml' ? 'കേരള പിൻ കോഡ് (6-Digit)' : 'Kerala PIN Code (6-Digit)'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => handlePinChange(e.target.value)}
                        placeholder="682001"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'ml' ? 'ജില്ല' : 'Kerala District'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F58A]"
                      >
                        {KERALA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist} className="bg-[#070B08]">
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Identified Kerala Place Card */}
                {detectedPlace && detectedPlace.isKerala && (
                  <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00F58A]" />
                        📍 {detectedPlace.placeName}, {detectedPlace.district}
                        {detectedPlace.districtMalayalam && ` (${detectedPlace.districtMalayalam})`}
                      </span>
                      {detectedPlace.talukOrBlock && (
                        <p className="text-[11px] text-white/60 mt-0.5">
                          {detectedPlace.talukOrBlock} · {detectedPlace.deliverySpeed} Delivery
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#00F58A] bg-black/40 px-2 py-0.5 rounded">
                      {detectedPlace.pincode}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'ml' ? 'പാസ്‌വേഡ്' : 'Set Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  By registering, you agree to NEXDROP's Kerala Consumer Protection Policy, Terms of Service, and Privacy Shield.
                </p>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00F58A] to-[#00C875] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#00F58A]/20 transition-all cursor-pointer"
                >
                  <span>{lang === 'ml' ? 'അക്കൗണ്ട് സൃഷ്ടിക്കുക' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered Kerala shopper email to receive a secured one-time password (OTP) and login instructions.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shopper@kerala.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#00C875]"
                  >
                    <span>Dispatch OTP & Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Official Footer Disclaimer */}
      <footer className="border-t border-white/10 bg-[#070B08] py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <span className="font-mono text-[11px]">NEXDROP Kerala Consumer Portal • ISO 27001 Security Standard</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Kerala Consumer Protection Act Compliant</span>
          <span>•</span>
          <a href="tel:+919037538732" className="text-white hover:text-[#00F58A] transition-colors">
            Support: +91 9037538732
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
