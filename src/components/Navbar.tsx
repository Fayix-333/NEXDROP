import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Search,
  User as UserIcon,
  Globe,
  SlidersHorizontal,
  Store,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';
import { User, Product } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { KERALA_DISTRICTS } from '../data/mockData';

interface NavbarProps {
  user: User;
  cartCount: number;
  wishlistCount: number;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  lang: 'en' | 'ml';
  onToggleLang: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  currentView: 'store' | 'customer' | 'seller' | 'admin';
  onChangeView: (view: 'store' | 'customer' | 'seller' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  cartCount,
  wishlistCount,
  selectedDistrict,
  onSelectDistrict,
  lang,
  onToggleLang,
  onOpenCart,
  onOpenWishlist,
  currentView,
  onChangeView,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
}) => {
  const t = TRANSLATIONS[lang];
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search filtering
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.seller_district.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2.5 sm:px-6 sm:py-3.5">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-2xl flex items-center justify-between gap-3 sm:gap-6 border border-white/10">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onChangeView('store')}
              className="flex items-center gap-2 group text-left focus-visible:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00F58A]/20 via-[#00F58A]/10 to-transparent border border-[#00F58A]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,245,138,0.2)] group-hover:border-[#00F58A] transition-all duration-300">
                <svg
                  className="w-5 h-5 text-[#00F58A]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L4 9v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-7z" />
                  <path d="M12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#00F58A" fillOpacity="0.4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#00F58A] transition-colors">
                    NEXDROP
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#00F58A] bg-[#00F58A]/10 px-1.5 py-0.5 rounded border border-[#00F58A]/30">
                    KL
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-[#A6B2AA] -mt-0.5">
                  {lang === 'ml' ? 'കേരള ഡെലിവറി' : 'Kerala Express'}
                </p>
              </div>
            </button>

            {/* Kerala Location Quick Selector */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-xs text-[#A6B2AA] hover:text-white transition-all ml-2"
              title="Change Delivery District"
            >
              <MapPin className="w-3.5 h-3.5 text-[#00F58A]" />
              <div className="text-left">
                <span className="block text-[10px] text-white/50 leading-tight">Deliver to</span>
                <span className="block font-medium text-white text-xs truncate max-w-[90px]">
                  {selectedDistrict}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-white/50 ml-0.5" />
            </button>
          </div>

          {/* Smart Search Bar */}
          <div className="relative flex-1 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#A6B2AA] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#00F58A] focus:bg-white/[0.07] focus:outline-none transition-all placeholder:text-[#A6B2AA]/70"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 p-0.5 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 glass-panel-glow rounded-xl p-2 z-50 border border-white/15 shadow-2xl backdrop-blur-2xl"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="text-[11px] font-medium text-[#A6B2AA] px-3 py-1">
                  Matching Products ({searchResults.length})
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      setIsSearchFocused(false);
                      onSearchChange('');
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-md object-cover bg-black/40 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-[#00F58A] transition-colors">
                        {lang === 'ml' ? item.title_ml : item.title}
                      </p>
                      <p className="text-[11px] text-[#A6B2AA]">
                        ₹{item.price.toLocaleString('en-IN')}{' '}
                        <span className="text-white/40">· {item.seller_district}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Zone: Lang, Wishlist, Cart, Profile Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition-colors"
              title="Toggle English / Malayalam"
            >
              <Globe className="w-3.5 h-3.5 text-[#00F58A]" />
              <span className="font-semibold text-xs">{lang === 'en' ? 'മലയാളം' : 'EN'}</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00F58A] text-[#050706] font-extrabold text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00F58A]/10 hover:bg-[#00F58A]/20 border border-[#00F58A]/30 text-[#00F58A] hover:border-[#00F58A] transition-all group"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold text-white">
                {t.cart}
              </span>
              <span className="w-4 h-4 bg-[#00F58A] text-[#050706] font-bold text-[10px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {/* Account / Portal Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-[#00F58A] text-black font-extrabold text-[11px] flex items-center justify-center">
                  F
                </div>
                <span className="hidden md:inline text-xs font-medium text-white/90">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-white/60" />
              </button>

              {/* Portal Switch Dropdown */}
              {showAccountMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl glass-panel-glow border border-white/15 p-2 shadow-2xl z-50 backdrop-blur-2xl"
                  onClick={() => setShowAccountMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-[#A6B2AA] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => onChangeView('store')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                      currentView === 'store'
                        ? 'bg-[#00F58A]/20 text-[#00F58A] font-semibold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Storefront (Shopping)</span>
                  </button>

                  <button
                    onClick={() => onChangeView('customer')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                      currentView === 'customer'
                        ? 'bg-[#00F58A]/20 text-[#00F58A] font-semibold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{t.customerDashboard}</span>
                  </button>

                  <button
                    onClick={() => onChangeView('seller')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                      currentView === 'seller'
                        ? 'bg-[#00F58A]/20 text-[#00F58A] font-semibold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{t.sellerPortal}</span>
                  </button>

                  <button
                    onClick={() => onChangeView('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                      currentView === 'admin'
                        ? 'bg-[#00F58A]/20 text-[#00F58A] font-semibold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.adminConsole}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kerala District Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-2xl p-5 border border-white/15 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00F58A]" />
                <h3 className="text-base font-bold text-white">Select Kerala Delivery District</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A6B2AA] mb-4">
              Prices, delivery speed (24-48h), and local seller availability adapt to your location across Kerala.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {KERALA_DISTRICTS.map((dist) => (
                <button
                  key={dist}
                  onClick={() => {
                    onSelectDistrict(dist);
                    setShowLocationModal(false);
                  }}
                  className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedDistrict === dist
                      ? 'bg-[#00F58A] text-black font-bold shadow-lg shadow-[#00F58A]/20'
                      : 'bg-white/5 hover:bg-white/10 text-white/90 border border-white/5'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
