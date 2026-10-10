import React, { useState } from 'react';
import {
  Store,
  DollarSign,
  Package,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  FileText,
  Percent,
  Search,
  ChevronDown,
  X,
  MapPin,
  TrendingUp,
  Edit2,
  Trash2,
  RotateCcw,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { Seller, Product, Order, OrderStatus, RefundRequest, SellerPayout } from '../types';
import { NexdropStore } from '../services/storage';

interface SellerDashboardProps {
  onBackToStore: () => void;
  lang: 'en' | 'ml';
  onOpenSellerAuth?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onBackToStore,
  lang,
  onOpenSellerAuth,
}) => {
  const [sellers] = useState<Seller[]>(() => NexdropStore.getSellers());
  const [currentSellerId, setCurrentSellerId] = useState<string>('seller_cochin_tech');
  const [products, setProducts] = useState<Product[]>(() => NexdropStore.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => NexdropStore.getOrders());
  const [refunds, setRefunds] = useState<RefundRequest[]>(() => NexdropStore.getRefunds());
  const [payouts, setPayouts] = useState<SellerPayout[]>(() => NexdropStore.getPayouts());

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'stock' | 'orders' | 'returns' | 'profile' | 'payouts'
  >('overview');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const activeSeller = sellers.find((s) => s.id === currentSellerId) || sellers[0];
  const sellerProducts = products.filter((p) => p.seller_id === activeSeller.id);
  const sellerOrders = orders.filter((o) =>
    o.items.some((it) => it.product.seller_id === activeSeller.id)
  );
  const sellerRefunds = refunds.filter((r) => r.seller_id === activeSeller.id);
  const sellerPayouts = payouts.filter((p) => p.seller_id === activeSeller.id);

  // Financial calculations
  const grossSales = sellerOrders.reduce(
    (sum, o) =>
      sum +
      o.items
        .filter((it) => it.product.seller_id === activeSeller.id)
        .reduce((s, it) => s + it.product.price * it.quantity, 0),
    0
  );
  const marketplaceCommission = Math.round((grossSales * activeSeller.commission_rate) / 100);
  const netEarnings = grossSales - marketplaceCommission;

  // New/Edit product form states
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('AETHER');
  const [newCategory, setNewCategory] = useState('electronics');
  const [newPrice, setNewPrice] = useState('2499');
  const [newOriginalPrice, setNewOriginalPrice] = useState('3999');
  const [newStock, setNewStock] = useState('30');
  const [newDesc, setNewDesc] = useState('');
  const [newKeralaSpecial, setNewKeralaSpecial] = useState(false);

  // Shop Profile state
  const [shopName, setShopName] = useState(activeSeller.business_name);
  const [shopPhone, setShopPhone] = useState(activeSeller.phone);
  const [shopBank, setShopBank] = useState(activeSeller.bank_name);
  const [shopAccount, setShopAccount] = useState(activeSeller.account_number);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNewTitle('');
    setNewBrand('AETHER');
    setNewCategory('electronics');
    setNewPrice('2499');
    setNewOriginalPrice('3999');
    setNewStock('30');
    setNewDesc('');
    setNewKeralaSpecial(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setNewTitle(p.title);
    setNewBrand(p.brand);
    setNewCategory(p.category);
    setNewPrice(String(p.price));
    setNewOriginalPrice(String(p.original_price));
    setNewStock(String(p.stock));
    setNewDesc(p.description);
    setNewKeralaSpecial(p.is_kerala_special);
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        title: newTitle.trim(),
        title_ml: newTitle.trim(),
        brand: newBrand.trim(),
        category: newCategory,
        price: Number(newPrice),
        original_price: Number(newOriginalPrice),
        discount_percent: Math.round(((Number(newOriginalPrice) - Number(newPrice)) / Number(newOriginalPrice)) * 100),
        stock: Number(newStock),
        description: newDesc.trim(),
        is_kerala_special: newKeralaSpecial,
      };
      NexdropStore.updateProduct(updatedProduct);
      setProducts(NexdropStore.getProducts());
      setActionSuccess(`Product "${updatedProduct.title}" updated.`);
    } else {
      const created = NexdropStore.addProduct({
        title: newTitle.trim(),
        title_ml: newTitle.trim(),
        brand: newBrand.trim(),
        category: newCategory,
        subcategory: 'General',
        price: Number(newPrice),
        original_price: Number(newOriginalPrice),
        discount_percent: Math.round(((Number(newOriginalPrice) - Number(newPrice)) / Number(newOriginalPrice)) * 100),
        rating: 5.0,
        review_count: 0,
        stock: Number(newStock),
        seller_id: activeSeller.id,
        seller_name: activeSeller.business_name,
        seller_district: activeSeller.district,
        seller_verified: true,
        images: ['/src/assets/images/product_wireless_earbuds_1791605698978.jpg'],
        description: newDesc.trim() || 'Premium merchandise curated across Kerala.',
        description_ml: 'കേരളത്തിലെ മികച്ച ഉൽപ്പന്നം.',
        features: ['High durability & quality assured', 'Direct dispatch from Kerala warehouse'],
        specs: { Origin: `${activeSeller.district}, Kerala`, Guarantee: '100% Genuine' },
        is_kerala_special: newKeralaSpecial,
        is_active: true,
        approval_status: 'approved',
      });
      setProducts(NexdropStore.getProducts());
      setActionSuccess(`Product "${created.title}" submitted.`);
    }

    setShowAddModal(false);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Are you sure you want to remove this product listing?')) return;
    const remaining = products.filter((p) => p.id !== productId);
    NexdropStore.saveProducts(remaining);
    setProducts(remaining);
    setActionSuccess('Product listing deleted.');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleUpdateStock = (productId: string, newStockVal: number) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      target.stock = Math.max(0, newStockVal);
      NexdropStore.updateProduct(target);
      setProducts([...NexdropStore.getProducts()]);
      setActionSuccess(`Stock updated for ${target.title}.`);
      setTimeout(() => setActionSuccess(null), 2000);
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    NexdropStore.setSellerOrderStatus(orderId, 'Accepted', 'Merchant confirmed stock & accepted order.');
    setOrders(NexdropStore.getOrders());
    setActionSuccess('Order accepted! Proceed to packing.');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleRejectOrder = (orderId: string) => {
    const reason = prompt('Please enter rejection reason (e.g. Stock damage, PIN unserviceable):', 'Out of stock in hub');
    if (!reason) return;
    NexdropStore.setSellerOrderStatus(orderId, 'Rejected', reason);
    setOrders(NexdropStore.getOrders());
    setActionSuccess('Order rejected.');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleDispatchOrder = (orderId: string) => {
    NexdropStore.setSellerOrderStatus(
      orderId,
      'Dispatched',
      `Handed over to Kerala courier by merchant ${activeSeller.business_name}.`
    );
    setOrders(NexdropStore.getOrders());
    setActionSuccess('Order marked as Dispatched!');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    NexdropStore.updateSellerShopProfile(activeSeller.id, {
      business_name: shopName,
      phone: shopPhone,
      bank_name: shopBank,
      account_number: shopAccount,
    });
    setActionSuccess('Shop profile details saved.');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleRequestPayout = () => {
    if (netEarnings <= 0) {
      alert('No positive pending settlement balance available.');
      return;
    }
    const created = NexdropStore.requestPayout(
      activeSeller.id,
      activeSeller.business_name,
      netEarnings,
      marketplaceCommission,
      `${activeSeller.bank_name} (${activeSeller.account_number})`
    );
    setPayouts([created, ...payouts]);
    setActionSuccess(`Payout request for ₹${netEarnings.toLocaleString('en-IN')} submitted to admin.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Seller Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F58A]/30 to-emerald-400/20 border border-[#00F58A]/40 flex items-center justify-center font-display font-extrabold text-2xl text-[#00F58A] shadow-[0_0_25px_rgba(0,245,138,0.15)]">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white">
                {activeSeller.business_name}
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                GSTIN: {activeSeller.gstin}
              </span>
            </div>
            <p className="text-xs text-[#A6B2AA] mt-0.5">
              Owner: {activeSeller.owner_name} · Hub: {activeSeller.district}, Kerala · Platform Commission:{' '}
              {activeSeller.commission_rate}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switch Active Merchant */}
          <select
            value={currentSellerId}
            onChange={(e) => setCurrentSellerId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs glass-input bg-[#101411] text-white border border-white/15"
          >
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.business_name} ({s.district})
              </option>
            ))}
          </select>

          {onOpenSellerAuth && (
            <button
              onClick={onOpenSellerAuth}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10"
            >
              Seller Sign In
            </button>
          )}

          <button
            onClick={onBackToStore}
            className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs shadow-md transition-all"
          >
            Storefront
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold animate-in fade-in">
          {actionSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'products'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'stock'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Stock Control</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Orders & Dispatch ({sellerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'returns'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returns ({sellerRefunds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'payouts'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Commission & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Shop Profile</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Total Gross Sales</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                ₹{(grossSales + activeSeller.total_sales).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#00F58A]">+18% this month</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Net Merchant Earnings</span>
              <p className="font-display text-2xl font-extrabold text-[#00F58A] tabular-nums">
                ₹{(netEarnings + Math.round(activeSeller.total_sales * 0.92)).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#A6B2AA]">After {activeSeller.commission_rate}% commission</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Active Products</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                {sellerProducts.length}
              </p>
              <p className="text-[11px] text-white/50">In-stock across Kerala hubs</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Orders Processed</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                {sellerOrders.length + activeSeller.total_orders}
              </p>
              <p className="text-[11px] text-emerald-400">99.2% Fulfillment rate</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel-glow border border-white/15 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-white">Add New Products</h3>
              <p className="text-xs text-[#A6B2AA] mt-0.5">
                List handcrafted Kerala specialties, tech accessories, or spices.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-[#00F58A]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Your Listed Inventory ({sellerProducts.length})</h3>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Listing</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#A6B2AA] border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sellerProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white truncate max-w-xs">{p.title}</p>
                            <p className="text-[11px] text-[#A6B2AA]">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-white/80">{p.category}</td>
                      <td className="p-4 font-bold text-white tabular-nums">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={p.stock < 10 ? 'text-amber-400 font-bold' : 'text-white'}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {p.approval_status || 'Approved'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Control */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Quick Stock & Inventory Management</h3>
              <p className="text-xs text-[#A6B2AA]">
                Adjust live warehouse units. Low stock items trigger customer urgency alerts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellerProducts.map((p) => (
              <div
                key={p.id}
                className="glass-panel p-4 rounded-3xl border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-[#A6B2AA]">
                      ₹{p.price.toLocaleString('en-IN')} · Current: {p.stock} units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateStock(p.id, p.stock - 5)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleUpdateStock(p.id, p.stock - 1)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                  >
                    -1
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-[#00F58A] tabular-nums">
                    {p.stock}
                  </span>
                  <button
                    onClick={() => handleUpdateStock(p.id, p.stock + 1)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleUpdateStock(p.id, p.stock + 10)}
                    className="px-2 py-1 rounded-lg bg-[#00F58A]/10 hover:bg-[#00F58A]/20 text-[#00F58A] text-xs font-bold"
                  >
                    +10
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Orders & Accept / Reject */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Merchant Assigned Kerala Orders</h3>
          <div className="space-y-3">
            {sellerOrders.map((ord) => (
              <div
                key={ord.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-white">{ord.order_number}</span>
                    <span className="text-xs text-[#A6B2AA] ml-2">Customer: {ord.customer_name}</span>
                    <p className="text-[11px] text-[#A6B2AA] mt-0.5">
                      Destination: {ord.shipping_address.street}, {ord.shipping_address.district} ({ord.shipping_address.pin_code})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.shipping_status === 'Accepted'
                          ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          : ord.shipping_status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30'
                      }`}
                    >
                      {ord.shipping_status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  {ord.items
                    .filter((it) => it.product.seller_id === activeSeller.id)
                    .map((it, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-white">
                          {it.product.title} (Qty: {it.quantity})
                        </span>
                        <span className="font-bold text-[#00F58A] tabular-nums">
                          ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Workflow Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/5 text-xs">
                  {ord.shipping_status === 'Payment Confirmed' && (
                    <>
                      <button
                        onClick={() => handleAcceptOrder(ord.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00F58A] text-black font-extrabold hover:bg-[#00C875]"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleRejectOrder(ord.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-bold border border-rose-500/30"
                      >
                        Reject Order
                      </button>
                    </>
                  )}

                  {ord.shipping_status === 'Accepted' && (
                    <button
                      onClick={() => handleDispatchOrder(ord.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#00F58A] text-black font-extrabold hover:bg-[#00C875]"
                    >
                      Dispatch & Handover Courier
                    </button>
                  )}

                  <button
                    onClick={() => {
                      alert(`Packing Slip for Order ${ord.order_number}\nCustomer: ${ord.customer_name}\nCarrier: ${ord.shipping_carrier}\nAWB: ${ord.awb_number}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs border border-white/10"
                  >
                    Print Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Returns */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Customer Return & Replacement Requests</h3>
          {sellerRefunds.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-2">
              <RotateCcw className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white">No return claims filed against your shop.</p>
            </div>
          ) : (
            sellerRefunds.map((ref) => (
              <div
                key={ref.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-white">Order: {ref.order_number}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {ref.status}
                  </span>
                </div>
                <p className="text-[#A6B2AA]">Customer: {ref.customer_name}</p>
                <p className="text-white">Reason: {ref.reason}</p>
                <p className="font-bold text-[#00F58A]">Refund Amount: ₹{ref.amount}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Commission & Payouts */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Marketplace Commission Ledger</h3>
                <p className="text-xs text-[#A6B2AA]">
                  Settlements dispatched to {activeSeller.bank_name} ({activeSeller.account_number}).
                </p>
              </div>
              <button
                onClick={handleRequestPayout}
                className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs shadow-md"
              >
                Request Payout
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-xs text-[#A6B2AA]">Total Sales Generated</span>
                <p className="font-display text-xl font-bold text-white tabular-nums mt-1">
                  ₹{grossSales.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-xs text-[#A6B2AA]">NEXDROP Fee ({activeSeller.commission_rate}%)</span>
                <p className="font-display text-xl font-bold text-rose-300 tabular-nums mt-1">
                  -₹{marketplaceCommission.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-xs text-[#A6B2AA]">Net Payable Balance</span>
                <p className="font-display text-xl font-bold text-[#00F58A] tabular-nums mt-1">
                  ₹{netEarnings.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Payout History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#A6B2AA] border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">Reference</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Fee Deducted</th>
                    <th className="p-4 font-semibold">Bank Details</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">UTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sellerPayouts.map((po) => (
                    <tr key={po.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-white">{po.id}</td>
                      <td className="p-4 font-bold text-[#00F58A]">₹{po.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-rose-300">₹{po.commission_deducted}</td>
                      <td className="p-4 text-white/80">{po.bank_details}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'Processed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-white/60">{po.utr_number || 'Pending Bank'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Shop Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-white">Shop Profile & Merchant Identity</h3>

          <div>
            <label className="text-xs text-[#A6B2AA]">Business Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#A6B2AA]">Registered Phone</label>
              <input
                type="text"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-[#A6B2AA]">Kerala District Hub</label>
              <input
                type="text"
                disabled
                value={activeSeller.district}
                className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#A6B2AA]">Settlement Bank</label>
              <input
                type="text"
                value={shopBank}
                onChange={(e) => setShopBank(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-[#A6B2AA]">Account Number</label>
              <input
                type="text"
                value={shopAccount}
                onChange={(e) => setShopAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs"
          >
            Update Profile
          </button>
        </form>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-lg w-full rounded-3xl p-6 border border-white/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Product Listing' : 'Add New Listing to NEXDROP'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-[#A6B2AA]">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wayanad Premium Cardamom"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="grocery">Grocery & Spices</option>
                    <option value="fashion">Fashion & Handlooms</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="beauty">Beauty & Ayurveda</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#A6B2AA]">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Key features, craftsmanship details..."
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="keralaSpecial"
                  checked={newKeralaSpecial}
                  onChange={(e) => setNewKeralaSpecial(e.target.checked)}
                  className="rounded accent-[#00F58A]"
                />
                <label htmlFor="keralaSpecial" className="text-xs text-white">
                  Mark as Authentic Kerala Heritage / Specialty
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs shadow-lg shadow-[#00F58A]/20 transition-all mt-2"
              >
                {editingProduct ? 'Save Changes' : 'Submit Listing for Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
