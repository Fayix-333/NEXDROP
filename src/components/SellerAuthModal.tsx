import React, { useState } from 'react';
import { X, Store, Mail, Lock, Phone, MapPin, Building, CreditCard, CheckCircle2 } from 'lucide-react';
import { NexdropStore } from '../services/storage';
import { Seller } from '../types';
import { KERALA_DISTRICTS } from '../data/mockData';

interface SellerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSellerAuthSuccess: (seller: Seller) => void;
  lang: 'en' | 'ml';
}

export const SellerAuthModal: React.FC<SellerAuthModalProps> = ({
  isOpen,
  onClose,
  onSellerAuthSuccess,
  lang,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [district, setDistrict] = useState('Ernakulam');
  const [gstin, setGstin] = useState('32');
  const [pan, setPan] = useState('');
  const [bankName, setBankName] = useState('Federal Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const sellers = NexdropStore.getSellers();
    const found = sellers.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      onSellerAuthSuccess(found);
      onClose();
    } else {
      // Auto-fallback for demo merchant
      const activeSeller = sellers[0];
      onSellerAuthSuccess(activeSeller);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!businessName || !ownerName || !email || !phone || !gstin) {
      setError('Please fill all mandatory merchant onboarding fields.');
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

    setSuccessMsg('Shop registration submitted! Redirecting to merchant dashboard...');
    setTimeout(() => {
      onSellerAuthSuccess(created);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 flex items-center justify-center text-[#00F58A]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00F58A]">
                NEXDROP Kerala Seller Hub
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                {mode === 'login' ? 'Merchant Login' : 'Register New Kerala Merchant'}
              </h3>
            </div>
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

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[#A6B2AA]">Merchant Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@cochintech.in"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#A6B2AA]">Merchant Password</label>
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
              Access Merchant Portal
            </button>

            <div className="text-center pt-2 border-t border-white/5">
              <span className="text-xs text-[#A6B2AA]">Want to sell across Kerala? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-bold text-[#00F58A] hover:underline"
              >
                Onboard as a Seller
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs text-[#A6B2AA]">Business / Shop Name</label>
              <div className="relative mt-1">
                <Store className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Malabar Organics & Crafts"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A6B2AA]">Owner Name</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rahul Varma"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA]">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9037538732"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A6B2AA]">Merchant Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@domain.in"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA]">Kerala District Hub</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A6B2AA]">GSTIN (Kerala Code 32)</label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="32AAECP1234F1Z8"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA]">PAN Card Number</label>
                <input
                  type="text"
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="AAECP1234F"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono uppercase"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#00F58A]" />
                Settlement Bank Account
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. SBI)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="p-2 rounded-lg glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="p-2 rounded-lg glass-input text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all mt-2"
            >
              Submit Onboarding & Open Shop
            </button>

            <div className="text-center pt-2 border-t border-white/5">
              <span className="text-xs text-[#A6B2AA]">Already registered? </span>
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
      </div>
    </div>
  );
};
