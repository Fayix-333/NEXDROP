import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Search,
  User as UserIcon,
  Globe,
  Store,
  ShieldCheck,
  ChevronDown,
  X,
  LogIn,
  Menu,
  Package,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { User, Product, AppView } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { KERALA_DISTRICTS } from '../data/mockData';
import { NexdropStore } from '../services/storage';
import {
  lookupKeralaPincode,
  lookupKeralaPincodeSync,
  searchKeralaPincodes,
  KeralaPlaceInfo,
  KERALA_DISTRICTS_ML,
} from '../services/keralaPincode';

const KERALA_DISTRICT_CAPITALS: Record<string, string> = {
  'Ernakulam': '682001',
  'Thiruvananthapuram': '695001',
  'Kozhikode': '673001',
  'Thrissur': '680001',
  'Kannur': '670001',
  'Malappuram': '676505',
  'Kollam': '691001',
  'Alappuzha': '688001',
  'Palakkad': '678001',
  'Kottayam': '686001',
  'Kasaragod': '671121',
  'Pathanamthitta': '689645',
  'Idukki': '685612',
  'Wayanad': '673121',
};

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
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onOpenCustomerAuth: () => void;
  onOpenSellerAuth: () => void;
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
  onOpenCustomerAuth,
  onOpenSellerAuth,
}) => {
  const t = TRANSLATIONS[lang];
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const userPin = user.addresses?.[0]?.pin_code || '682001';
  const [modalPin, setModalPin] = useState(userPin);
  const [identifiedPlace, setIdentifiedPlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync(userPin)
  );
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [quickPlaceQuery, setQuickPlaceQuery] = useState('');

  // Auto-sync place when userPin changes
  useEffect(() => {
    const info = lookupKeralaPincodeSync(userPin);
    if (info) setIdentifiedPlace(info);
    setModalPin(userPin);
  }, [userPin]);

  // Handle live PIN typing in modal with place identification
  const handleModalPinChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setModalPin(cleaned);
    setPinFeedback(null);

    if (cleaned.length === 6) {
      // Instant sync resolution
      const syncInfo = lookupKeralaPincodeSync(cleaned);
      if (syncInfo) setIdentifiedPlace(syncInfo);

      // Async live lookup from India Post API
      setIsResolvingPlace(true);
      try {
        const liveInfo = await lookupKeralaPincode(cleaned);
        setIdentifiedPlace(liveInfo);
      } catch (err) {
        // Handled by sync
      } finally {
        setIsResolvingPlace(false);
      }
    }
  };

  const handleApplyPin = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) {
      setPinFeedback({ type: 'error', message: 'Please enter a valid 6-digit Kerala postal PIN.' });
      return;
    }
    setIsResolvingPlace(true);
    try {
      const place = await lookupKeralaPincode(cleaned);
      if (!place.isKerala) {
        setPinFeedback({
          type: 'error',
          message: `PIN ${cleaned} is outside Kerala (${place.placeName}). NEXDROP currently services Kerala PINs (670xxx-695xxx).`,
        });
        return;
      }
      onSelectDistrict(place.district);
      if (user.addresses?.length) {
        user.addresses[0].pin_code = cleaned;
        user.addresses[0].district = place.district;
      } else {
        user.addresses = [
          {
            id: `addr_${Date.now()}`,
            name: user.name,
            phone: user.phone || '+91 9037538732',
            street: `${place.placeName.split('/')[0].trim()}, ${place.district}`,
            district: place.district,
            pin_code: cleaned,
            is_default: true,
            type: 'Home',
          },
        ];
      }
      user.default_district = place.district;
      NexdropStore.saveUser(user);
      setIdentifiedPlace(place);
      setPinFeedback({
        type: 'success',
        message: `Verified: ${place.placeName}, ${place.district}! (${place.deliverySpeed} Delivery Applied)`,
      });
      setTimeout(() => {
        setShowLocationModal(false);
        setPinFeedback(null);
      }, 700);
    } catch (e: any) {
      setPinFeedback({ type: 'error', message: e?.message || 'Failed to identify PIN code.' });
    } finally {
      setIsResolvingPlace(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5">
        <div className="mx-auto max-w-7xl">
          <div className="glass-panel rounded-2xl p-2.5 sm:p-3 md:px-5 md:py-2.5 shadow-2xl border border-white/10 flex flex-col gap-2">
            
            {/* Top Primary Navigation Row */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
              
              {/* Left Side: Mobile Hamburger & Brand Logo */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* Mobile Menu Hamburger (Visible on mobile/tablet < md) */}
                <button
                  type="button"
                  onClick={() => setShowMobileMenu(true)}
                  className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-colors"
                  aria-label="Open Mobile Menu"
                >
                  <Menu className="w-5 h-5 text-[#00F58A]" />
                </button>

                {/* Brand Logo & Tagline */}
                <button
                  onClick={() => {
                    onChangeView('store');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-2 sm:gap-2.5 group text-left focus-visible:outline-none"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00F58A]/20 via-[#00F58A]/10 to-transparent border border-[#00F58A]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,245,138,0.2)] group-hover:border-[#00F58A] transition-all duration-300 shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#00F58A]"
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
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="font-display font-black text-base sm:text-xl tracking-tight text-white group-hover:text-[#00F58A] transition-colors">
                        NEXDROP
                      </span>
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-black bg-[#00F58A] px-1 sm:px-1.5 py-0.5 rounded font-mono">
                        OFFICIAL
                      </span>
                    </div>
                    <p className="hidden lg:block text-[10px] text-[#A6B2AA] tracking-wider uppercase font-medium -mt-0.5">
                      {lang === 'ml' ? 'കേരള ഔദ്യോഗിക ഇ-കൊമേഴ്സ്' : 'Kerala Commerce Network'}
                    </p>
                  </div>
                </button>

                {/* Desktop Kerala Location Selector Button */}
                <button
                  onClick={() => {
                    setModalPin(userPin);
                    setShowLocationModal(true);
                  }}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-xs text-[#A6B2AA] hover:text-white transition-all ml-2"
                  title="Identify Place & Delivery by Kerala PIN"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00F58A]" />
                  <div className="text-left">
                    <span className="block text-[10px] text-white/50 leading-tight">Deliver to</span>
                    <span className="block font-medium text-white text-xs truncate max-w-[140px]">
                      {identifiedPlace ? `${identifiedPlace.placeName.split('/')[0].trim()} · ${userPin}` : `${userPin} · ${selectedDistrict}`}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-white/50 ml-0.5" />
                </button>
              </div>

              {/* Desktop Search Bar (Visible on md and larger) */}
              <div className="relative hidden md:block flex-1 max-w-lg lg:max-w-xl mx-2">
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
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Autocomplete Dropdown (Desktop) */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 glass-panel-glow rounded-xl p-2 z-50 border border-white/15 shadow-2xl backdrop-blur-2xl"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="text-[11px] font-medium text-[#A6B2AA] px-3 py-1 flex items-center justify-between">
                      <span>Matching Products ({searchResults.length})</span>
                      <span className="text-[10px] text-[#00F58A]">Kerala Express Delivery</span>
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
                          className="w-10 h-10 rounded-md object-cover bg-black/40 border border-white/10 shrink-0"
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

              {/* Right Side Action Zone */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Language Switcher (Visible on sm and larger) */}
                <button
                  onClick={onToggleLang}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition-colors"
                  title="Toggle English / Malayalam"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span className="font-semibold text-xs">{lang === 'en' ? 'മലയാളം' : 'EN'}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={onOpenWishlist}
                  className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors shrink-0"
                  title="Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4 text-white/90" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00F58A] text-[#050706] font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart Button */}
                <button
                  onClick={onOpenCart}
                  className="relative flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#00F58A]/10 hover:bg-[#00F58A]/20 border border-[#00F58A]/30 text-[#00F58A] hover:border-[#00F58A] transition-all group shrink-0"
                  title="View Cart"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
                  <span className="hidden lg:inline text-xs font-bold text-white">
                    {t.cart}
                  </span>
                  <span className="w-4 h-4 bg-[#00F58A] text-[#050706] font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                </button>

                {/* Desktop Account Menu Dropdown */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                    aria-label="Account Menu"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-[#00F58A] text-black font-extrabold text-[11px] flex items-center justify-center">
                      {user.name[0]}
                    </div>
                    <span className="hidden lg:inline text-xs font-medium text-white/90">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/60" />
                  </button>

                  {/* Portal Switch Dropdown */}
                  {showAccountMenu && (
                    <div
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl glass-panel-glow border border-white/15 p-2 shadow-2xl z-50 backdrop-blur-2xl"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <span className="text-[10px] font-mono text-[#00F58A] bg-[#00F58A]/10 px-1.5 py-0.5 rounded">
                            {userPin}
                          </span>
                        </div>
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
                        onClick={() => {
                          onChangeView('customer');
                          setShowAccountMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                          currentView === 'customer'
                            ? 'bg-[#00F58A]/20 text-[#00F58A] font-semibold'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Customer Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeView('customer-login');
                          setShowAccountMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#00F58A]" />
                        <span>Customer Sign In</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeView('customer-register');
                          setShowAccountMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#00F58A]" />
                        <span>Customer Sign Up</span>
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={() => {
                          onChangeView('seller');
                          setShowAccountMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                          currentView === 'seller'
                            ? 'bg-[#00F58A]/20 text-[#00F58A] font-semibold'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Seller Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeView('seller-login');
                          setShowAccountMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>Seller Login</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeView('seller-register');
                          setShowAccountMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5 text-[#00F58A]" />
                        <span>Onboard Kerala Merchant</span>
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={() => {
                          onChangeView('admin');
                          setShowAccountMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                          currentView === 'admin'
                            ? 'bg-[#00F58A]/20 text-[#00F58A] font-bold border border-[#00F58A]/30'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00F58A]" />
                        <span className="font-semibold text-[#00F58A]">Central Admin Operations</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Dedicated Search Bar (Visible strictly on screens < md) */}
            <div className="md:hidden relative w-full pt-0.5 flex flex-col gap-1.5">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-[#A6B2AA] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={lang === 'ml' ? 'ഉൽപ്പന്നങ്ങൾ, ബ്രാൻഡുകൾ തിരയുക...' : 'Search Kerala spices, electronics, fashion...'}
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#00F58A] focus:bg-white/[0.07] focus:outline-none transition-all placeholder:text-[#A6B2AA]/70"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 p-1 text-white/50 hover:text-white"
                    aria-label="Clear mobile search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Dedicated PIN & District pill bar */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setModalPin(userPin);
                    setShowLocationModal(true);
                  }}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors truncate text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00F58A] shrink-0" />
                  <span className="text-white/40">Deliver to:</span>
                  <span className="font-mono font-bold text-[#00F58A]">{userPin}</span>
                  <span className="text-white/70 truncate max-w-[140px]">
                    ({identifiedPlace ? identifiedPlace.placeName.split('/')[0].trim() : selectedDistrict})
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/40 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={onToggleLang}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white shrink-0"
                  title="Switch Language"
                >
                  {lang === 'en' ? 'മലയാളം' : 'EN'}
                </button>
              </div>

              {/* Mobile Search Autocomplete Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1.5 glass-panel-glow rounded-xl p-2 z-50 border border-white/15 shadow-2xl backdrop-blur-2xl max-h-72 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="text-[11px] font-medium text-[#A6B2AA] px-2 py-1 flex items-center justify-between border-b border-white/10 pb-1.5 mb-1">
                    <span>Products ({searchResults.length})</span>
                    <span className="text-[10px] text-[#00F58A]">Kerala Express Delivery</span>
                  </div>
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectProduct(item);
                        setIsSearchFocused(false);
                        onSearchChange('');
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors text-left group"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-md object-cover bg-black/40 border border-white/10 shrink-0"
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

          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[85vw] max-w-sm h-full bg-[#0a0f0c] border-r border-white/15 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/40 flex items-center justify-center">
                  <span className="text-sm font-black text-[#00F58A]">ND</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-base text-white tracking-tight">NEXDROP</span>
                    <span className="text-[8px] uppercase font-bold text-black bg-[#00F58A] px-1 py-0.5 rounded font-mono">
                      KERALA
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A6B2AA]">Official Commerce Network</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* User Profile Card */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#00F58A] text-black font-black text-sm flex items-center justify-center shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#A6B2AA] truncate">{user.email}</p>
                  </div>
                </div>

                {/* Delivery Location badge in profile */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#A6B2AA] truncate mr-2">
                    <MapPin className="w-3.5 h-3.5 text-[#00F58A] shrink-0" />
                    <span className="truncate">
                      📍 <strong className="text-white">{identifiedPlace ? identifiedPlace.placeName.split('/')[0].trim() : selectedDistrict}</strong> · <span className="font-mono text-[#00F58A]">{userPin}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setModalPin(userPin);
                      setShowMobileMenu(false);
                      setShowLocationModal(true);
                    }}
                    className="text-[11px] font-bold text-[#00F58A] hover:underline shrink-0"
                  >
                    Change PIN
                  </button>
                </div>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Globe className="w-4 h-4 text-[#00F58A]" />
                  <span>Language / ഭാഷ:</span>
                </div>
                <button
                  onClick={onToggleLang}
                  className="px-3 py-1 rounded-lg bg-[#00F58A]/15 border border-[#00F58A]/30 text-xs font-bold text-[#00F58A]"
                >
                  {lang === 'en' ? 'മലയാളം' : 'English'}
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 pb-1">
                  Marketplace & Customer
                </p>

                <button
                  onClick={() => {
                    onChangeView('store');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    currentView === 'store'
                      ? 'bg-[#00F58A]/20 text-[#00F58A] font-bold border border-[#00F58A]/30'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#00F58A]" />
                  <span>Storefront & Kerala Catalog</span>
                </button>

                <button
                  onClick={() => {
                    onChangeView('customer');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    currentView === 'customer'
                      ? 'bg-[#00F58A]/20 text-[#00F58A] font-bold border border-[#00F58A]/30'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#00F58A]" />
                  <div className="flex-1 text-left flex items-center justify-between">
                    <span>Customer Dashboard & Orders</span>
                    <span className="text-[9px] font-mono text-[#00F58A] bg-[#00F58A]/10 px-1.5 py-0.5 rounded">
                      Live Tracking
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenWishlist();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <div className="flex-1 text-left flex items-center justify-between">
                    <span>Wishlist Saved Items</span>
                    {wishlistCount > 0 && (
                      <span className="text-[10px] font-bold bg-[#00F58A] text-black px-1.5 py-0.2 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenCart();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  <Package className="w-4 h-4 text-[#00F58A]" />
                  <div className="flex-1 text-left flex items-center justify-between">
                    <span>Shopping Cart</span>
                    {cartCount > 0 && (
                      <span className="text-[10px] font-bold bg-[#00F58A] text-black px-1.5 py-0.2 rounded-full">
                        {cartCount} items
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    onChangeView('customer-login');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[#00F58A]" />
                  <span>Customer Sign In</span>
                </button>

                <button
                  onClick={() => {
                    onChangeView('customer-register');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  <span>Customer Registration (with PIN code)</span>
                </button>
              </div>

              {/* Merchant & Administration Section */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 pb-1">
                  Merchant & Admin Hub
                </p>

                <button
                  onClick={() => {
                    onChangeView('seller');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    currentView === 'seller'
                      ? 'bg-[#00F58A]/20 text-[#00F58A] font-bold border border-[#00F58A]/30'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Seller Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    onChangeView('seller-login');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  <Store className="w-4 h-4 text-white/60" />
                  <span>Merchant Login</span>
                </button>

                <button
                  onClick={() => {
                    onChangeView('seller-register');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#00F58A]" />
                  <span>Onboard Kerala Merchant</span>
                </button>

                <button
                  onClick={() => {
                    onChangeView('admin');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    currentView === 'admin'
                      ? 'bg-[#00F58A]/20 text-[#00F58A] font-bold border border-[#00F58A]/30'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#00F58A]" />
                  <span className="text-[#00F58A] font-semibold">Central Admin Operations</span>
                </button>
              </div>

              {/* Official Kerala Commerce Network Note */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#00F58A]/10 to-transparent border border-[#00F58A]/20 text-[11px] text-[#A6B2AA] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>Kerala Official Network</span>
                </div>
                <p>Express 24-48 hr courier routing across all 14 Kerala districts. Firebase real-time synchronized.</p>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/10 text-center text-[10px] text-white/40">
              NEXDROP Kerala Commerce · v2.5
            </div>
          </div>
        </div>
      )}

      {/* Kerala District & PIN Code Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel-glow max-w-lg w-full rounded-2xl p-4 sm:p-6 border border-white/15 animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00F58A]/15 border border-[#00F58A]/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#00F58A]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Identify Place by Kerala PIN Code</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#00F58A]/20 text-[#00F58A] border border-[#00F58A]/30">
                      Live Detector
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#A6B2AA]">
                    {lang === 'ml'
                      ? '6-അക്ക പിൻകോഡ് നൽകി സ്ഥലം, താലൂക്ക്, ഡെലിവറി സമയം കണ്ടെത്തുക'
                      : 'Detect town, taluk, post offices, and delivery speed across Kerala'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setPinFeedback(null);
                }}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct PIN Code Input & Live Place Detection */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-[#00F58A]/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Enter 6-Digit Kerala Postal PIN:</span>
                  <span className="text-[10px] text-white/40 font-normal">(670xxx - 695xxx)</span>
                </label>
                {isResolvingPlace && (
                  <span className="text-[10px] text-[#00F58A] animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F58A] animate-ping" />
                    Querying Postal Service...
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={modalPin}
                    onChange={(e) => handleModalPinChange(e.target.value)}
                    placeholder="e.g. 682001"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono text-white tracking-widest font-bold placeholder:tracking-normal placeholder:font-normal placeholder:text-white/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyPin(modalPin);
                      }
                    }}
                  />
                  {modalPin && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalPin('');
                        setIdentifiedPlace(null);
                      }}
                      className="absolute right-3 top-3 text-white/40 hover:text-white"
                      title="Clear PIN"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPin(modalPin)}
                  disabled={modalPin.length !== 6 || isResolvingPlace}
                  className="px-4 py-2.5 rounded-xl bg-[#00F58A] hover:bg-[#00dd7b] disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm shrink-0 transition-colors shadow-lg shadow-[#00F58A]/20 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Apply Place</span>
                </button>
              </div>

              {/* In-Modal Feedback Banner */}
              {pinFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    pinFeedback.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {pinFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{pinFeedback.message}</span>
                </div>
              )}

              {/* Real-time Identified Place Card */}
              {identifiedPlace && (
                <div className="p-3 rounded-xl bg-black/40 border border-[#00F58A]/40 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00F58A] animate-ping" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#00F58A]">
                          Identified Kerala Location
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-white/60">
                          {identifiedPlace.source === 'api' ? 'India Post Verified 🇮🇳' : 'Kerala Postal Directory'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {identifiedPlace.placeName}
                      </h4>
                      <p className="text-xs text-white/70">
                        District: <strong className="text-white">{identifiedPlace.district}</strong>{' '}
                        {identifiedPlace.districtMalayalam && (
                          <span className="text-[#00F58A] font-medium">({identifiedPlace.districtMalayalam})</span>
                        )}
                        {identifiedPlace.talukOrBlock && (
                          <span className="text-white/50"> · Taluk: {identifiedPlace.talukOrBlock}</span>
                        )}
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-black bg-[#00F58A] px-2 py-1 rounded-lg shrink-0">
                      PIN {identifiedPlace.pincode}
                    </span>
                  </div>

                  {/* Covered Post Offices */}
                  {identifiedPlace.postOffices && identifiedPlace.postOffices.length > 0 && (
                    <div className="pt-1.5 border-t border-white/10">
                      <span className="text-[10px] text-white/50 block mb-1">
                        Covered Post Offices & Branch Hubs:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {identifiedPlace.postOffices.map((po, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10"
                          >
                            📮 {po}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logistics SLA & Speed */}
                  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Truck className="w-3.5 h-3.5 text-[#00F58A]" />
                      <span>Speed: <strong className="text-[#00F58A]">{identifiedPlace.deliverySpeed}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{identifiedPlace.codAvailable ? 'Cash on Delivery: Yes' : 'Prepaid Only'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/70 col-span-2 text-[10px]">
                      <span>Standard Rate: ₹{identifiedPlace.standardFee} · Free above ₹{identifiedPlace.freeDeliveryThreshold}</span>
                      {identifiedPlace.expressAvailable && (
                        <span className="text-[#00F58A]"> · Express Priority: ₹{identifiedPlace.expressFee}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Kerala Place Search & Famous Hubs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>Popular Kerala Hubs & Places</span>
                </span>
                <span className="text-[10px] text-white/50">Tap to auto-identify</span>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  value={quickPlaceQuery}
                  onChange={(e) => setQuickPlaceQuery(e.target.value)}
                  placeholder="Search Kerala place (e.g. Fort Kochi, Technopark, Calicut, Munnar)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs glass-input placeholder:text-white/40 text-white"
                />
              </div>

              {/* Place Suggestions */}
              {quickPlaceQuery.trim() && (
                <div className="space-y-1 max-h-36 overflow-y-auto p-1.5 rounded-xl bg-white/[0.02] border border-white/10">
                  {searchKeralaPincodes(quickPlaceQuery).map((res) => (
                    <button
                      key={res.pincode}
                      type="button"
                      onClick={() => {
                        handleModalPinChange(res.pincode);
                        setQuickPlaceQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-white">{res.placeName}</span>
                        <span className="text-[10px] text-white/50 ml-1.5">({res.district})</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#00F58A] bg-[#00F58A]/10 px-1.5 py-0.5 rounded">
                        {res.pincode}
                      </span>
                    </button>
                  ))}
                  {searchKeralaPincodes(quickPlaceQuery).length === 0 && (
                    <p className="text-[11px] text-white/40 p-2 text-center">
                      No direct match. You can type any 6-digit Kerala PIN code directly above!
                    </p>
                  )}
                </div>
              )}

              {/* Famous Hub Chips */}
              {!quickPlaceQuery.trim() && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Fort Kochi', pin: '682001', dist: 'Ernakulam' },
                    { name: 'Kakkanad Infopark', pin: '682030', dist: 'Ernakulam' },
                    { name: 'Technopark TVM', pin: '695033', dist: 'Trivandrum' },
                    { name: 'Calicut Beach', pin: '673001', dist: 'Kozhikode' },
                    { name: 'Swaraj Round', pin: '680001', dist: 'Thrissur' },
                    { name: 'Munnar Hills', pin: '685612', dist: 'Idukki' },
                    { name: 'Wayanad Kalpetta', pin: '673121', dist: 'Wayanad' },
                    { name: 'Alappuzha Lake', pin: '688001', dist: 'Alappuzha' },
                    { name: 'Kannur City', pin: '670001', dist: 'Kannur' },
                    { name: 'Kottayam Town', pin: '686001', dist: 'Kottayam' },
                    { name: 'Palakkad Fort', pin: '678001', dist: 'Palakkad' },
                    { name: 'Kollam Beach', pin: '691001', dist: 'Kollam' },
                    { name: 'Malappuram Town', pin: '676505', dist: 'Malappuram' },
                    { name: 'Thiruvalla', pin: '689101', dist: 'Pathanamthitta' },
                    { name: 'Bekal Kasaragod', pin: '671314', dist: 'Kasaragod' },
                  ].map((hub) => (
                    <button
                      key={hub.pin}
                      type="button"
                      onClick={() => handleModalPinChange(hub.pin)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                        modalPin === hub.pin
                          ? 'bg-[#00F58A] text-black font-bold border-[#00F58A]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span>{hub.name}</span>
                      <span className="font-mono text-white/50 text-[9px]">({hub.pin})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* All 14 Districts Overview Grid */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-xs text-[#A6B2AA] block">
                All 14 Kerala Administrative Districts:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {KERALA_DISTRICTS.map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      onSelectDistrict(dist);
                      user.default_district = dist;
                      NexdropStore.saveUser(user);
                      // Set default pin for this district
                      const fallback = Object.entries(KERALA_DISTRICT_CAPITALS).find(([d]) => d === dist);
                      if (fallback) {
                        handleModalPinChange(fallback[1]);
                      }
                      setShowLocationModal(false);
                      setPinFeedback(null);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all truncate ${
                      selectedDistrict === dist
                        ? 'bg-[#00F58A] text-black font-bold shadow-lg shadow-[#00F58A]/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
                    }`}
                  >
                    <span>{dist}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
