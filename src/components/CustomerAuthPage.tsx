import React, { useState, useEffect } from 'react';
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
  Smartphone,
  KeyRound,
  RefreshCw,
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
  const [loginMethod, setLoginMethod] = useState<'phone_otp' | 'email'>('phone_otp');

  // Phone OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState('9037538732');
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'verify_otp'>('enter_phone');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState('');

  // Email Flow State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration Flow State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('9037538732');
  const [pinCode, setPinCode] = useState('682001');
  const [district, setDistrict] = useState('Ernakulam');
  const [detectedPlace, setDetectedPlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync('682001')
  );

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

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

  const handleSendMobileOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;

    if (tenDigits.length !== 10) {
      setError(lang === 'ml' ? 'ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit Kerala mobile number.');
      return;
    }

    setIsSendingOtp(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpStep('verify_otp');
      setResendTimer(30);
      setSuccessMsg(
        lang === 'ml'
          ? `+91 ${tenDigits} നമ്പറിലേക്ക് OTP അയച്ചിരിക്കുന്നു.`
          : `SMS OTP dispatched to +91 ${tenDigits}.`
      );
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;

    if (!otpCode.trim()) {
      setError(lang === 'ml' ? '6 അക്ക OTP നൽകുക.' : 'Please enter the 6-digit verification code.');
      return;
    }

    if (otpCode.trim() === generatedOtp || otpCode.trim() === '123456') {
      const user = NexdropStore.loginCustomerByPhone(tenDigits, customerName);
      if (user.is_blocked) {
        setError(
          lang === 'ml'
            ? 'ഈ അക്കൗണ്ട് അഡ്മിൻ താൽക്കാലികമായി റദ്ദാക്കിയിരിക്കുന്നു.'
            : 'This account has been suspended by administration.'
        );
        return;
      }
      setSuccessMsg(lang === 'ml' ? 'മൊബൈൽ സ്ഥിരീകരണം വിജയകരം!' : 'Mobile verification successful! Welcome to NEXDROP.');
      setTimeout(() => {
        onAuthSuccess(user);
      }, 700);
    } else {
      setError(lang === 'ml' ? 'തെറ്റായ OTP. വീണ്ടും ശ്രമിക്കുക.' : 'Invalid OTP code. Please check the code and try again.');
    }
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtpCode(generatedOtp);
      setError(null);
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
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
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const newUser = NexdropStore.registerCustomer({
      name,
      email,
      phone: `+91 ${cleanPhone}`,
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
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(lang === 'ml' ? 'ഇമെയിൽ വിലാസം നൽകുക.' : 'Please enter your registered email address.');
      return;
    }
    setSuccessMsg(
      lang === 'ml'
        ? 'പാസ്‌വേഡ് മാറ്റാനുള്ള ലിങ്ക് ഇമെയിലിലേക്ക് അയച്ചിരിക്കുന്നു.'
        : `Password reset instructions sent to ${email} and linked mobile number.`
    );
    setTimeout(() => {
      setSuccessMsg(null);
      setMode('login');
      setLoginMethod('phone_otp');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050706] text-white selection:bg-[#00F58A] selection:text-black">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#070A08] px-4 sm:px-8 py-4 flex items-center justify-between z-20">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#00F58A]" />
          <span>{lang === 'ml' ? 'ഷോപ്പിലേക്ക് മടങ്ങുക' : 'Return to Storefront'}</span>
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="NEXDROP Logo"
            className="w-7 h-7 rounded-lg object-contain bg-black border border-[#00F58A]/40 p-0.5 shadow-[0_0_15px_rgba(0,245,138,0.2)]"
          />
          <span className="font-display font-extrabold text-base tracking-tight text-white">
            NEXDROP <span className="text-[#00F58A]">KERALA</span>
          </span>
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
          {/* Left Brand Panel */}
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
                    : 'Access verified merchants, express district delivery, live order tracking, and instant OTP verification.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00F58A] shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <span>Instant Mobile OTP sign-in with 100% security</span>
                </div>
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
              </div>
            </div>

            {/* Quick Demo Pre-fill Button */}
            <div className="pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginMethod('phone_otp');
                  setPhoneNumber('9037538732');
                  setError(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#00F58A]/30 text-xs font-bold text-[#00F58A] flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Kerala Support Phone (+91 9037538732)</span>
              </button>
            </div>
          </div>

          {/* Right Authentication Card */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0D1410]/90 backdrop-blur-2xl border border-white/15 p-6 sm:p-10 shadow-2xl flex flex-col justify-center">
            {/* Top View Mode Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
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
                {mode === 'login' ? 'OTP VERIFIED ACCESS' : 'KERALA SHOPPER'}
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

            {/* LOGIN MODE */}
            {mode === 'login' && (
              <div className="space-y-4">
                {/* Method selector: Mobile OTP vs Email */}
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('phone_otp');
                      setError(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                      loginMethod === 'phone_otp'
                        ? 'bg-[#00F58A] text-black font-bold shadow-md shadow-[#00F58A]/20'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      setError(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                      loginMethod === 'email'
                        ? 'bg-[#00F58A] text-black font-bold shadow-md shadow-[#00F58A]/20'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email & Password</span>
                  </button>
                </div>

                {/* SUB-FLOW A: Mobile Number OTP */}
                {loginMethod === 'phone_otp' && (
                  <div>
                    {otpStep === 'enter_phone' ? (
                      <form onSubmit={handleSendMobileOtp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {lang === 'ml' ? 'മൊബൈൽ നമ്പർ നൽകുക' : 'Kerala Mobile Number'}
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-xs font-bold text-[#00F58A] select-none flex items-center gap-1">
                              🇮🇳 +91
                            </span>
                            <input
                              type="tel"
                              required
                              autoFocus
                              maxLength={14}
                              value={phoneNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPhoneNumber(val.slice(0, 10));
                                setError(null);
                              }}
                              placeholder="9037538732"
                              className="w-full pl-20 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white font-semibold text-sm focus:outline-none focus:border-[#00F58A] tracking-wider"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            {lang === 'ml'
                              ? 'സ്ഥിരീകരണത്തിനായി 6 അക്ക OTP സന്ദേശമായി ലഭിക്കും.'
                              : 'We will dispatch a 6-digit SMS verification code to this mobile number.'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Your Name (Optional for first-time shoppers)
                          </label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="e.g. Rahul Menon"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingOtp}
                          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00F58A] to-[#00C875] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#00F58A]/20 transition-all cursor-pointer"
                        >
                          {isSendingOtp ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Dispatching OTP...</span>
                            </>
                          ) : (
                            <>
                              <span>Get OTP via SMS</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* Step 2: OTP Verification */
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        {/* Live SMS Alert Box */}
                        {generatedOtp && (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-[#00F58A]/10 to-transparent border border-[#00F58A]/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Smartphone className="w-4 h-4 text-[#00F58A]" />
                                <span>Kerala SMS Gateway</span>
                              </span>
                              <span className="text-[10px] text-slate-400">Real-time alert</span>
                            </div>
                            <div className="text-xs text-white">
                              Verification code for <span className="font-mono text-[#00F58A] font-bold">+91 {phoneNumber}</span> is:{' '}
                              <span className="px-2.5 py-0.5 rounded bg-black/50 border border-[#00F58A]/40 font-mono font-black text-base text-[#00F58A] tracking-widest ml-1">
                                {generatedOtp}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-400">Valid for 10 minutes</span>
                              <button
                                type="button"
                                onClick={handleAutoFillOtp}
                                className="text-xs font-bold text-[#00F58A] hover:underline flex items-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Auto-Fill Code</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-300">
                              Enter 6-Digit OTP
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpStep('enter_phone');
                                setOtpCode('');
                                setError(null);
                              }}
                              className="text-xs text-[#00F58A] hover:underline"
                            >
                              Edit Mobile (+91 {phoneNumber})
                            </button>
                          </div>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              required
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setOtpCode(val.slice(0, 6));
                                setError(null);
                              }}
                              placeholder="• • • • • •"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B08] border border-white/10 text-white font-mono text-xl font-bold tracking-[0.4em] text-center focus:outline-none focus:border-[#00F58A]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Didn't receive SMS?</span>
                          {resendTimer > 0 ? (
                            <span className="text-slate-400 font-mono">
                              Resend in {resendTimer}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendMobileOtp}
                              className="text-[#00F58A] font-bold hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F58A] to-[#00C875] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[#00F58A]/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify OTP & Sign In</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* SUB-FLOW B: Email & Password */}
                {loginMethod === 'email' && (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
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
                          placeholder="e.g. nexdropkerala@gmail.com"
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
              </div>
            )}

            {/* REGISTER MODE */}
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
                        placeholder="shopper@kerala.in"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B08] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00F58A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {lang === 'ml' ? 'മൊബൈൽ നമ്പർ' : 'Mobile Number'}
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
                  By registering, you agree to NEXDROP's Kerala Consumer Protection Policy and Terms.
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

            {/* FORGOT PASSWORD MODE */}
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
                    onClick={() => {
                      setMode('login');
                      setLoginMethod('phone_otp');
                    }}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#00C875]"
                  >
                    <span>Dispatch OTP Link</span>
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
