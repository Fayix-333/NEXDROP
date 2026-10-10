/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Footer } from './components/Footer';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { SellerAuthModal } from './components/SellerAuthModal';
import { CustomerAuthPage } from './components/CustomerAuthPage';
import { SellerAuthPage } from './components/SellerAuthPage';

import { Product, CartItem, User, Order, Seller, AppView } from './types';
import { NexdropStore } from './services/storage';
import { TRANSLATIONS } from './data/translations';
import { Sparkles, Flame, Percent, ArrowUpDown } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<AppView>('store');
  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');

  // Data state
  const [products, setProducts] = useState<Product[]>(() => NexdropStore.getProducts());
  const [categories] = useState(() => NexdropStore.getCategories());
  const [user, setUser] = useState<User>(() => NexdropStore.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => NexdropStore.isCustomerLoggedIn());
  const [cart, setCart] = useState<CartItem[]>(() => NexdropStore.getCart());

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [storeFilterTab, setStoreFilterTab] = useState<'all' | 'trending' | 'kerala' | 'deals'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Modals & Drawers
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isSellerAuthOpen, setIsSellerAuthOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('KERALA100');
  const [appliedDiscount, setAppliedDiscount] = useState(100);

  // Wishlist handler
  const handleToggleWishlist = (productId: string) => {
    const updatedWishlist = NexdropStore.toggleWishlist(productId);
    setUser({ ...user, wishlist: updatedWishlist });
  };

  // Cart handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    const updated = NexdropStore.addToCart(product, quantity);
    setCart([...updated]);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    const updated = NexdropStore.updateCartQty(productId, quantity);
    setCart([...updated]);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (order: Order) => {
    setCart([]);
  };

  const handleCustomerAuthSuccess = (authenticatedUser: User) => {
    NexdropStore.setCustomerLoggedIn(true);
    setIsLoggedIn(true);
    setUser(authenticatedUser);
    setIsCustomerAuthOpen(false);
    setCurrentView('customer');
  };

  const handleSellerAuthSuccess = (seller: Seller) => {
    setCurrentView('seller');
  };

  const handleCustomerLogout = () => {
    NexdropStore.logoutCustomer();
    setIsLoggedIn(false);
    const defaultUser = NexdropStore.getCustomers()[0];
    setUser(defaultUser);
    setCurrentView('store');
  };

  // Filtered & Sorted products
  const displayedProducts = products.filter((p) => {
    if (!p.is_active) return false;

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q) || p.title_ml.includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchDistrict = p.seller_district.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchCategory && !matchDistrict) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    // Discovery Tab filter
    if (storeFilterTab === 'trending' && !p.is_trending) return false;
    if (storeFilterTab === 'kerala' && !p.is_kerala_special) return false;
    if (storeFilterTab === 'deals' && p.discount_percent < 25) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...displayedProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured default
  });

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const t = TRANSLATIONS[lang];

  // Dedicated Official Authentication & Operations Views
  if (currentView === 'customer-login' || currentView === 'customer-register') {
    return (
      <CustomerAuthPage
        initialMode={currentView === 'customer-register' ? 'register' : 'login'}
        onAuthSuccess={handleCustomerAuthSuccess}
        onBackToStore={() => setCurrentView('store')}
        lang={lang}
        onSwitchToSellerAuth={() => setCurrentView('seller-login')}
      />
    );
  }

  if (currentView === 'seller-login' || currentView === 'seller-register') {
    return (
      <SellerAuthPage
        initialMode={currentView === 'seller-register' ? 'register' : 'login'}
        onSellerAuthSuccess={handleSellerAuthSuccess}
        onBackToStore={() => setCurrentView('store')}
        lang={lang}
        onSwitchToCustomerAuth={() => setCurrentView('customer-login')}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBackToStore={() => setCurrentView('store')}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050706] text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={handleCustomerLogout}
        cartCount={cartTotalItems}
        wishlistCount={user.wishlist.length}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={(dist) => setSelectedDistrict(dist)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'ml' : 'en')}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          if (!isLoggedIn) {
            setIsCustomerAuthOpen(true);
          } else {
            setCurrentView('customer');
          }
        }}
        currentView={currentView}
        onChangeView={(view) => setCurrentView(view)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        products={products}
        onSelectProduct={(p) => setActiveProductModal(p)}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onOpenSellerAuth={() => setCurrentView('seller-login')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'store' && (
          <div>
            {/* Hero Section */}
            {!searchQuery && (
              <Hero
                lang={lang}
                onShopNow={() => {
                  const el = document.getElementById('marketplace-catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onExploreCategories={() => {
                  const el = document.getElementById('marketplace-catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                selectedDistrict={selectedDistrict}
              />
            )}

            {/* Category Navigation Bar */}
            <CategoryBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('marketplace-catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              lang={lang}
            />

            {/* Marketplace Catalog Section */}
            <section id="marketplace-catalog" className="px-3 sm:px-6 py-8">
              <div className="mx-auto max-w-7xl space-y-6">
                {/* Discovery Controls Bar */}
                <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                    <button
                      onClick={() => setStoreFilterTab('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        storeFilterTab === 'all'
                          ? 'bg-[#00F58A] text-black shadow-md shadow-[#00F58A]/20'
                          : 'bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {t.allProducts}
                    </button>

                    <button
                      onClick={() => setStoreFilterTab('trending')}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        storeFilterTab === 'trending'
                          ? 'bg-[#00F58A] text-black shadow-md shadow-[#00F58A]/20'
                          : 'bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{t.trendingInKerala}</span>
                    </button>

                    <button
                      onClick={() => setStoreFilterTab('kerala')}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        storeFilterTab === 'kerala'
                          ? 'bg-[#00F58A] text-black shadow-md shadow-[#00F58A]/20'
                          : 'bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00F58A]" />
                      <span>{t.keralaSpecialties}</span>
                    </button>

                    <button
                      onClick={() => setStoreFilterTab('deals')}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        storeFilterTab === 'deals'
                          ? 'bg-[#00F58A] text-black shadow-md shadow-[#00F58A]/20'
                          : 'bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5 text-amber-400" />
                      <span>Today&apos;s Kerala Deals</span>
                    </button>
                  </div>

                  {/* Sorter */}
                  <div className="flex items-center gap-2 self-end md:self-auto text-xs text-[#A6B2AA]">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#00F58A]" />
                    <span>Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 rounded-xl text-xs glass-input bg-[#101411] text-white border border-white/15"
                    >
                      <option value="featured">Featured First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Product Grid */}
                {sortedProducts.length === 0 ? (
                  <div className="p-16 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
                    <p className="text-base font-bold text-white">No products match your criteria</p>
                    <p className="text-xs text-[#A6B2AA]">
                      Try clearing search filters or selecting &apos;All Departments&apos;.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setStoreFilterTab('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-bold text-xs"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {sortedProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        isWishlisted={user.wishlist.includes(prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                        onQuickView={(p) => setActiveProductModal(p)}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {currentView === 'customer' && (
          <CustomerDashboard
            user={user}
            onSelectProduct={(p) => setActiveProductModal(p)}
            onAddToCart={handleAddToCart}
            lang={lang}
            onBackToStore={() => setCurrentView('store')}
            onLogout={handleCustomerLogout}
          />
        )}

        {currentView === 'seller' && (
          <SellerDashboard
            onBackToStore={() => setCurrentView('store')}
            lang={lang}
            onOpenSellerAuth={() => setCurrentView('seller-login')}
          />
        )}
      </main>

      {/* Floating WhatsApp Support Action */}
      <WhatsAppFloatingButton lang={lang} district={selectedDistrict} />

      {/* Footer */}
      <Footer
        lang={lang}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('store');
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
        onOpenSellerPortal={() => setCurrentView('seller-register')}
        onNavigateView={(view) => setCurrentView(view)}
      />

      {/* Product Detail Modal */}
      {activeProductModal && (
        <ProductDetailModal
          product={activeProductModal}
          currentUser={user}
          onClose={() => setActiveProductModal(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isWishlisted={user.wishlist.includes(activeProductModal.id)}
          onToggleWishlist={handleToggleWishlist}
          lang={lang}
          initialPin={user.addresses?.[0]?.pin_code || "682001"}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        appliedDiscount={appliedDiscount}
        setAppliedDiscount={setAppliedDiscount}
        lang={lang}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={user}
        couponCode={couponCode}
        appliedDiscount={appliedDiscount}
        onOrderCompleted={handleOrderCompleted}
        lang={lang}
      />

      {/* Customer Auth Modal (Login / Sign Up / Forgot Password) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onAuthSuccess={handleCustomerAuthSuccess}
        lang={lang}
      />

      {/* Seller Auth Modal (Merchant Login & Business Onboarding) */}
      <SellerAuthModal
        isOpen={isSellerAuthOpen}
        onClose={() => setIsSellerAuthOpen(false)}
        onSellerAuthSuccess={handleSellerAuthSuccess}
        lang={lang}
      />
    </div>
  );
}
