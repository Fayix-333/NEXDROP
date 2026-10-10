import React from 'react';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  lang: 'en' | 'ml';
  onSelectCategory: (cat: string) => void;
  onOpenSellerPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSelectCategory,
  onOpenSellerPortal,
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
              <p className="text-[#A6B2AA]">Malayalam & English live assistance (+91 98470 12345).</p>
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
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">Customer Care</h4>
            <ul className="space-y-2 text-xs text-[#A6B2AA]">
              <li>
                <a href="#tracking" className="hover:text-[#00F58A] transition-colors">
                  Track Kerala Shipment
                </a>
              </li>
              <li>
                <a href="#pincodes" className="hover:text-[#00F58A] transition-colors">
                  PIN Serviceability List
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-[#00F58A] transition-colors">
                  Returns & Refund Policy (7-Day)
                </a>
              </li>
              <li>
                <a href="#cod" className="hover:text-[#00F58A] transition-colors">
                  Cash on Delivery Terms
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#00F58A] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">Merchants & Business</h4>
            <ul className="space-y-2 text-xs text-[#A6B2AA]">
              <li>
                <button
                  onClick={onOpenSellerPortal}
                  className="text-[#00F58A] hover:underline font-semibold"
                >
                  Sell on NEXDROP Kerala →
                </button>
              </li>
              <li>
                <a href="#seller-guidelines" className="hover:text-[#00F58A] transition-colors">
                  Merchant Commission Guide
                </a>
              </li>
              <li>
                <a href="#logistics" className="hover:text-[#00F58A] transition-colors">
                  Kerala Logistics Network
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#00F58A] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#00F58A] transition-colors">
                  Privacy Policy
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
