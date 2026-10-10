import React from 'react';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { AppView } from '../types';

interface FooterProps {
  lang: 'en' | 'ml';
  onSelectCategory: (cat: string) => void;
  onOpenSellerPortal: () => void;
  onNavigateView?: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSelectCategory,
  onOpenSellerPortal,
  onNavigateView,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#070A08] text-white">
      {/* Top Banner: Kerala Delivery Assurance */}
      <div className="border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 flex items-center justify-center text-[#00F58A] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">All 14 Districts Covered</p>
              <p className="text-[#A6B2AA]">Trivandrum to Kasaragod with dedicated surface couriers.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 flex items-center justify-center text-[#00F58A] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">GST Registered & Verified</p>
              <p className="text-[#A6B2AA]">Strict vendor verification for authentic Kerala goods.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 flex items-center justify-center text-[#00F58A] shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Kerala Support Desk</p>
              <div className="text-[#A6B2AA] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <a
                  href="tel:+919037538732"
                  className="hover:text-[#00F58A] font-semibold text-white transition-colors"
                >
                  +91 9037538732
                </a>
                <span className="hidden sm:inline">·</span>
                <a
                  href="mailto:nexdropkerala@gmail.com"
                  className="hover:text-[#00F58A] text-[#00F58A] transition-colors"
                >
                  nexdropkerala@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 flex items-center justify-center text-[#00F58A] shrink-0">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="font-bold text-white">Made for Kerala</p>
              <p className="text-[#A6B2AA]">Promoting traditional handlooms & Malabar farmers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00F58A]/20 border border-[#00F58A]/40 flex items-center justify-center">
                <span className="text-sm font-extrabold text-[#00F58A]">NX</span>
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                NEXDROP
              </span>
            </div>
            <p className="text-xs text-[#A6B2AA] max-w-sm leading-relaxed">
              {t.brandTagline} Kerala&apos;s next-generation e-commerce marketplace connecting verified local producers, handloom cooperatives, and premium technology brands directly to your doorstep.
            </p>
            <div className="text-[11px] text-[#A6B2AA] space-y-1">
              <p>📍 Central Fulfillment: Aluva Logistics Park, Ernakulam, Kerala 683101</p>
              <p>🏛 Regional Hubs: Thiruvananthapuram · Kozhikode · Thrissur</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <a
                  href="tel:+919037538732"
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#00F58A] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>+91 9037538732</span>
                </a>
                <span>·</span>
                <a
                  href="mailto:nexdropkerala@gmail.com"
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#00F58A] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>nexdropkerala@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-xs text-[#A6B2AA]">
              <li>
                <button onClick={() => onSelectCategory('grocery')} className="hover:text-[#00F58A] transition-colors">
                  Wayanad Spices
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('fashion')} className="hover:text-[#00F58A] transition-colors">
                  Handloom Linen & Apparel
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('electronics')} className="hover:text-[#00F58A] transition-colors">
                  Next-Gen Audio & Wearables
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('home')} className="hover:text-[#00F58A] transition-colors">
                  Heritage Bell-Metal Cookware
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('beauty')} className="hover:text-[#00F58A] transition-colors">
                  Ayurvedic Tailams & Care
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">Customer & Shopper</h4>
            <ul className="space-y-2 text-xs text-[#A6B2AA]">
              <li>
                <button
                  onClick={() => onNavigateView ? onNavigateView('customer-login') : null}
                  className="hover:text-[#00F58A] transition-colors text-left"
                >
                  Customer Account Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateView ? onNavigateView('customer-register') : null}
                  className="hover:text-[#00F58A] transition-colors text-left"
                >
                  Register New Shopper
                </button>
              </li>
              <li>
                <a href="#tracking" className="hover:text-[#00F58A] transition-colors">
                  Track Kerala Shipment
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-[#00F58A] transition-colors">
                  Returns & Refund Policy (7-Day)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">Merchants & Operations</h4>
            <ul className="space-y-2 text-xs text-[#A6B2AA]">
              <li>
                <button
                  onClick={() => onNavigateView ? onNavigateView('seller-register') : onOpenSellerPortal()}
                  className="text-[#00F58A] hover:underline font-semibold text-left"
                >
                  Onboard Kerala Shop →
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateView ? onNavigateView('seller-login') : onOpenSellerPortal()}
                  className="hover:text-[#00F58A] transition-colors text-left"
                >
                  Seller Central Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateView ? onNavigateView('admin') : null}
                  className="text-slate-400 hover:text-[#00F58A] transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>Central Operations Admin</span>
                </button>
              </li>
              <li>
                <a href="#seller-guidelines" className="hover:text-[#00F58A] transition-colors">
                  Merchant Commission Guide (8-15%)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A6B2AA] gap-3">
          <p>© 2026 NEXDROP Technologies Kerala Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>GSTIN: 32AABCN9988Z1Z5</span>
            <span>·</span>
            <span>FSSAI Certified Spices Network</span>
            <span>·</span>
            <span className="text-[#00F58A]">Kerala Express Verified</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
