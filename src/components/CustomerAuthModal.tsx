import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
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
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
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
        // sync already applied
      }
    } else {
      setDetectedPlace(null);
    }
  };
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
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
      onAuthSuccess(user);
      onClose();
    } else {
      // Allow seamless login with demo account or auto-create
      const newUser = NexdropStore.registerCustomer({
        name: email.split('@')[0],
        email,
        phone: '+91 9037538732',
        district: 'Ernakulam',
      });
      onAuthSuccess(newUser);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !phone) {
      setError('Please fill in all required fields.');
      return;
    }
    const newUser = NexdropStore.registerCustomer({
      name,
      email,
      phone,
      district,
      pin_code: pinCode,
    });
    setSuccessMsg('Account registered successfully! Logging you in...');
    setTimeout(() => {
      onAuthSuccess(newUser);
      onClose();
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    setSuccessMsg(`Password reset instructions sent to ${email} and linked mobile.`);
    setTimeout(() => {
      setSuccessMsg(null);
      setMode('login');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00F58A]">
              NEXDROP Kerala Customer
            </span>
            <h3 className="font-display text-xl font-bold text-white mt-0.5">
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'register' && 'Create Customer Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
                  onClick={() => setMode('forgot')}
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
                onClick={() => setMode('register')}
                className="text-xs font-bold text-[#00F58A] hover:underline"
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* Form: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs text-[#A6B2AA]">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fayiz Mohammed"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA]">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="text-center pt-2 border-t border-white/5">
              <span className="text-xs text-[#A6B2AA]">Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-bold text-[#00F58A] hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Form: Forgot Password */}
        {mode === 'forgot' && (
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
              onClick={() => setMode('login')}
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
