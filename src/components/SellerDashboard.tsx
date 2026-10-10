import React, { useState } from 'react';
import {
  Store,
  DollarSign,
  Package,
  Plus,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  Percent,
  Search,
  ChevronDown,
  X,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Seller, Product, Order, OrderStatus } from '../types';
import { NexdropStore } from '../services/storage';

interface SellerDashboardProps {
  onBackToStore: () => void;
  lang: 'en' | 'ml';
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onBackToStore, lang }) => {
  const [sellers] = useState<Seller[]>(() => NexdropStore.getSellers());
  const [currentSellerId, setCurrentSellerId] = useState<string>('seller_cochin_tech');
  const [products, setProducts] = useState<Product[]>(() => NexdropStore.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => NexdropStore.getOrders());
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'payouts'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const activeSeller = sellers.find((s) => s.id === currentSellerId) || sellers[0];
  const sellerProducts = products.filter((p) => p.seller_id === activeSeller.id);
  // Orders containing at least one item from this seller
  const sellerOrders = orders.filter((o) =>
    o.items.some((it) => it.product.seller_id === activeSeller.id)
  );

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

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('AETHER');
  const [newCategory, setNewCategory] = useState('electronics');
  const [newPrice, setNewPrice] = useState('2499');
  const [newOriginalPrice, setNewOriginalPrice] = useState('3999');
  const [newStock, setNewStock] = useState('30');
  const [newDesc, setNewDesc] = useState('');
  const [newKeralaSpecial, setNewKeralaSpecial] = useState(false);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

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
    });

    setProducts(NexdropStore.getProducts());
    setShowAddModal(false);
    setActionSuccess(`Product "${created.title}" listed successfully!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    NexdropStore.updateOrderStatus(
      orderId,
      nextStatus,
      `Updated by merchant (${activeSeller.business_name}) at ${activeSeller.district} Hub.`
    );
    setOrders(NexdropStore.getOrders());
    setActionSuccess(`Order status updated to ${nextStatus}.`);
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

        <div className="flex items-center gap-3">
          {/* Seller Switcher for Testing Different Vendors */}
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

          <button
            onClick={onBackToStore}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
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
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Listings ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Assigned Orders ({sellerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payouts'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Commission & Payouts</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Gross Seller GMV</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                ₹{(grossSales + activeSeller.total_sales).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#00F58A]">Lifetime sales across Kerala</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Net Merchant Payouts</span>
              <p className="font-display text-2xl font-extrabold text-[#00F58A] tabular-nums">
                ₹{(netEarnings + Math.round(activeSeller.total_sales * 0.92)).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#A6B2AA]">After {activeSeller.commission_rate}% commission</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Active Catalog Products</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                {sellerProducts.length}
              </p>
              <p className="text-[11px] text-white/50">In-stock across Kerala hubs</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Total Orders Fulfilled</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                {sellerOrders.length + activeSeller.total_orders}
              </p>
              <p className="text-[11px] text-emerald-400">99.4% On-time dispatch</p>
            </div>
          </div>

          {/* Quick Action: Add Product */}
          <div className="p-6 rounded-3xl glass-panel-glow border border-white/15 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-white">Expand Your Catalog</h3>
              <p className="text-xs text-[#A6B2AA] mt-0.5">
                List new electronics, spices, or handlooms for immediate delivery across all 14 Kerala districts.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-[#00F58A]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Listing</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Your Listed Inventory</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#A6B2AA] border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Selling Price</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold">Kerala Special</th>
                    <th className="p-4 font-semibold">Status</th>
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
                      <td className="p-4 text-white/80 capitalize">{p.category}</td>
                      <td className="p-4 font-bold text-white tabular-nums">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 tabular-nums">
                        <span className={p.stock < 10 ? 'text-amber-400 font-bold' : 'text-white'}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        {p.is_kerala_special ? (
                          <span className="text-[10px] bg-[#00F58A]/10 text-[#00F58A] px-2 py-0.5 rounded-full border border-[#00F58A]/30">
                            Heritage
                          </span>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active & Live
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Kerala Orders Awaiting Merchant Dispatch</h3>
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
                      Destination: {ord.shipping_address.district}, Kerala ({ord.shipping_address.pin_code})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                      {ord.shipping_status}
                    </span>
                  </div>
                </div>

                {/* Items from this seller */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
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
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/5">
                  {ord.shipping_status === 'Payment Confirmed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Packed')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                    >
                      Mark as Packed
                    </button>
                  )}

                  {ord.shipping_status === 'Packed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Dispatched')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-xs"
                    >
                      Generate AWB & Handover to Carrier
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

      {/* Tab 4: Payouts */}
      {activeTab === 'payouts' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Marketplace Commission Ledger</h3>
              <p className="text-xs text-[#A6B2AA]">
                Settlements dispatched weekly via Federal Bank / NEFT directly to {activeSeller.bank_name} ({activeSeller.account_number}).
              </p>
            </div>
            <span className="text-xs font-bold text-[#00F58A]">Reconciliation Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-[#A6B2AA]">Total Sales Generated</span>
              <p className="font-display text-xl font-bold text-white tabular-nums mt-1">
                ₹{grossSales.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-[#A6B2AA]">NEXDROP Commission ({activeSeller.commission_rate}%)</span>
              <p className="font-display text-xl font-bold text-rose-300 tabular-nums mt-1">
                -₹{marketplaceCommission.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-[#A6B2AA]">Net Payable to Merchant</span>
              <p className="font-display text-xl font-bold text-[#00F58A] tabular-nums mt-1">
                ₹{netEarnings.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-lg w-full rounded-3xl p-6 border border-white/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add New Kerala Listing</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-[#A6B2AA]">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Malabar Robusta Dark Roast Coffee (250g)"
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
                Submit Listing for Marketplace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
