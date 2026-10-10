import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { NexdropStore } from '../services/storage';
import { User as UserType } from '../types';
import { KERALA_DISTRICTS } from '../data/mockData';
import {
  lookupKeralaPincodeSync,
  lookupKeralaPincode,
  KeralaPlaceInfo,
} from '../services/keralaPincode';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
  lang: 'en' | 'ml';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  lang,
}) => {
  const [authMode, setAuthMode] = useState<'phone_otp' | 'email' | 'register' | 'forgot'>('phone_otp');

  // Phone OTP Flow States
  const [phoneNumber, setPhoneNumber] = useState('9037538732');
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'verify_otp'>('enter_phone');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState('');

  // Email Flow States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('9037538732');
  const [regPassword, setRegPassword] = useState('');
  const [pinCode, setPinCode] = useState('682001');
  const [district, setDistrict] = useState('Ernakulam');
  const [detectedPlace, setDetectedPlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync('682001')
  );

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

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
        // sync already applied
      }
    } else {
      setDetectedPlace(null);
    }
  };

  // 1. Send OTP to Mobile Number
  const handleSendMobileOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;

    if (tenDigits.length !== 10) {
      setError('Please enter a valid 10-digit Kerala mobile number.');
      return;
    }

    setIsSendingOtp(true);
    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpStep('verify_otp');
      setResendTimer(30);
      setSuccessMsg(`SMS OTP dispatched to +91 ${tenDigits}.`);
    }, 400);
  };

  // 2. Verify OTP & Log In
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    // Verify against generated code or universal test code 123456
    if (otpCode.trim() === generatedOtp || otpCode.trim() === '123456') {
      const user = NexdropStore.loginCustomerByPhone(tenDigits, customerName);
      if (user.is_blocked) {
        setError('This account has been suspended by administration.');
        return;
      }

      setSuccessMsg('Mobile verification successful! Logging you in...');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 700);
    } else {
      setError('Invalid OTP code. Please check the code and try again.');
    }
  };

  // 3. Quick Auto-fill OTP Helper
  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtpCode(generatedOtp);
      setError(null);
    }
  };

  // 4. Email Sign In
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    const user = NexdropStore.loginCustomer(email);
    if (user) {
      if (user.is_blocked) {
        setError('This account has been suspended by administration.');
        return;
      }
      setSuccessMsg('Welcome back! Logging you in...');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 600);
    } else {
      const newUser = NexdropStore.registerCustomer({
        name: email.split('@')[0],
        email,
        phone: '+91 9037538732',
        district: 'Ernakulam',
      });
      setSuccessMsg('New account created and authorized!');
      setTimeout(() => {
        onAuthSuccess(newUser);
        onClose();
      }, 600);
    }
  };

  // 5. Register with Mobile Number
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName || !regEmail || !regPhone) {
      setError('Please fill in all required fields.');
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, '').slice(-10);
    const newUser = NexdropStore.registerCustomer({
      name: regName,
      email: regEmail,
      phone: `+91 ${cleanPhone}`,
      district,
      pin_code: pinCode,
    });
    setSuccessMsg('Account registered successfully! Logging you in...');
    setTimeout(() => {
      onAuthSuccess(newUser);
      onClose();
    }, 700);
  };

  // 6. Reset Password Link
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    setSuccessMsg(`Password reset instructions sent to ${email} and linked mobile.`);
    setTimeout(() => {
      setSuccessMsg(null);
      setAuthMode('phone_otp');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-5 bg-[#070A08]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00F58A] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NEXDROP Kerala Customer Auth</span>
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
              {authMode === 'phone_otp' && (otpStep === 'enter_phone' ? 'Customer Mobile Login' : 'Verify Mobile OTP')}
              {authMode === 'email' && 'Customer Email Sign In'}
              {authMode === 'register' && 'Create Customer Account'}
              {authMode === 'forgot' && 'Reset Account Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Phone OTP vs Email */}
        {(authMode === 'phone_otp' || authMode === 'email') && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone_otp');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                authMode === 'phone_otp'
                  ? 'bg-[#00F58A] text-black font-bold shadow-md shadow-[#00F58A]/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                authMode === 'email'
                  ? 'bg-[#00F58A] text-black font-bold shadow-md shadow-[#00F58A]/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Sign In</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: PHONE OTP FLOW */}
        {authMode === 'phone_otp' && (
          <div>
            {otpStep === 'enter_phone' ? (
              <form onSubmit={handleSendMobileOtp} className="space-y-4">
                <div>
                  <label className="text-xs text-[#A6B2AA] font-medium block mb-1">
                    Enter Kerala Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-[#00F58A] select-none flex items-center gap-1">
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
                      className="w-full pl-20 pr-3 py-2.5 rounded-xl text-sm font-semibold tracking-wider glass-input"
                    />
                  </div>
                  <p className="text-[11px] text-[#A6B2AA] mt-1.5">
                    We will send a 6-digit verification OTP via SMS to verify your mobile number.
                  </p>
                </div>

                {/* Optional Customer Name if first time */}
                <div>
                  <label className="text-xs text-[#A6B2AA] font-medium block mb-1">
                    Your Name (Optional for new users)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Nair"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#A6B2AA]">Quick Kerala Demo Number:</span>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('9037538732')}
                    className="text-[#00F58A] font-mono hover:underline font-bold"
                  >
                    +91 9037538732
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Verification OTP via SMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#A6B2AA]">Don't have an account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setError(null);
                    }}
                    className="font-bold text-[#00F58A] hover:underline"
                  >
                    Register as Shopper
                  </button>
                </div>
              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Live Simulated SMS Notification Banner */}
                {generatedOtp && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-[#00F58A]/10 to-transparent border border-[#00F58A]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#00F58A]" />
                        <span>Kerala SMS Gateway</span>
                      </span>
                      <span className="text-[10px] text-[#A6B2AA]">Just now</span>
                    </div>
                    <div className="text-xs text-white">
                      OTP for <span className="font-mono text-[#00F58A] font-bold">+91 {phoneNumber}</span> is:{' '}
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-[#00F58A]/40 font-mono font-black text-sm text-[#00F58A] tracking-widest ml-1">
                        {generatedOtp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#A6B2AA]">Valid for 10 minutes</span>
                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="text-[11px] font-bold text-[#00F58A] hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>One-Tap Auto-Fill</span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="text-[#A6B2AA] font-medium">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('enter_phone');
                        setOtpCode('');
                        setError(null);
                      }}
                      className="text-[#00F58A] hover:underline text-[11px]"
                    >
                      Change Mobile (+91 {phoneNumber})
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
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
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl text-lg font-mono font-bold tracking-[0.35em] text-center glass-input"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A6B2AA]">Didn't receive SMS?</span>
                  {resendTimer > 0 ? (
                    <span className="text-[#A6B2AA] font-mono text-[11px]">
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
                  className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Log In</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: EMAIL LOGIN */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[#A6B2AA]">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. nexdropkerala@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A6B2AA]">Password</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-[#00F58A] hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all"
            >
              Sign In to Shop
            </button>

            <div className="text-center pt-2 border-t border-white/5">
              <span className="text-xs text-[#A6B2AA]">New to NEXDROP? </span>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs font-bold text-[#00F58A] hover:underline"
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* MODE 3: REGISTER */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs text-[#A6B2AA]">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ananya Menon"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A6B2AA]">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA]">Mobile Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 9037538732"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A6B2AA]">Kerala PIN Code</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="682001"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA]">Kerala District</label>
                <div className="relative mt-1">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Identified Kerala Place Banner */}
            {detectedPlace && detectedPlace.isKerala && (
              <div className="p-2.5 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-xs flex items-center justify-between">
                <span className="text-white font-medium flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-[#00F58A] shrink-0" />
                  <span>📍 {detectedPlace.placeName}, {detectedPlace.district}</span>
                </span>
                <span className="text-[10px] text-[#00F58A] font-bold shrink-0 ml-2">
                  {detectedPlace.deliverySpeed} Delivery
                </span>
              </div>
            )}

            <div>
              <label className="text-xs text-[#A6B2AA]">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all mt-2"
            >
              Register & Start Shopping
            </button>

            <div className="text-center pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#A6B2AA]">Already have an account? </span>
              <button
                type="button"
                onClick={() => setAuthMode('phone_otp')}
                className="text-xs font-bold text-[#00F58A] hover:underline"
              >
                Sign In with Mobile OTP
              </button>
            </div>
          </form>
        )}

        {/* MODE 4: FORGOT PASSWORD */}
        {authMode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-[#A6B2AA] leading-relaxed">
              Enter your registered customer email address to receive an instant OTP verification link.
            </p>

            <div>
              <label className="text-xs text-[#A6B2AA]">Registered Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. nexdropkerala@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('phone_otp')}
              className="w-full text-xs text-[#A6B2AA] hover:text-white pt-2 text-center"
            >
              ← Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
