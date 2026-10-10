import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Store,
  Package,
  Tag,
  MessageCircle,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { DeliveryPinCode, Seller, Order, Coupon, OrderStatus } from '../types';
import { NexdropStore } from '../services/storage';

interface AdminDashboardProps {
  onBackToStore: () => void;
  lang: 'en' | 'ml';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore, lang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pincodes' | 'sellers' | 'orders' | 'coupons'>('overview');
  const [pinCodes, setPinCodes] = useState<DeliveryPinCode[]>(() => NexdropStore.getPinCodes());
  const [sellers, setSellers] = useState<Seller[]>(() => NexdropStore.getSellers());
  const [orders, setOrders] = useState<Order[]>(() => NexdropStore.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => NexdropStore.getCoupons());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New PIN Form state
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newDistrict, setNewDistrict] = useState('Ernakulam');
  const [newArea, setNewArea] = useState('');
  const [newStandardFee, setNewStandardFee] = useState('45');
  const [newCodAllowed, setNewCodAllowed] = useState(true);

  // New Coupon Form state
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponValue, setNewCouponValue] = useState('100');
  const [newCouponMin, setNewCouponMin] = useState('999');

  // Metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.total_amount, 0) + 489000;
  const totalCommission = Math.round(totalGMV * 0.09);

  const handleTogglePinService = (pin: string) => {
    const updated = pinCodes.map((p) =>
      p.pin_code === pin ? { ...p, is_serviceable: !p.is_serviceable } : p
    );
    NexdropStore.savePinCodes(updated);
    setPinCodes(updated);
    setActionNotice(`PIN ${pin} serviceability updated.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleAddPinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(newPin.trim())) {
      alert('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    const newEntry: DeliveryPinCode = {
      pin_code: newPin.trim(),
      district: newDistrict,
      area_name: newArea.trim() || `${newDistrict} Central`,
      is_serviceable: true,
      standard_delivery_fee: Number(newStandardFee),
      express_available: true,
      express_delivery_fee: Number(newStandardFee) + 40,
      cod_allowed: newCodAllowed,
      min_free_delivery_threshold: 499,
      estimated_days: 2,
    };
    const updated = [newEntry, ...pinCodes];
    NexdropStore.savePinCodes(updated);
    setPinCodes(updated);
    setShowAddPinModal(false);
    setActionNotice(`New Kerala PIN ${newPin} registered successfully.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleToggleSellerApproval = (sellerId: string) => {
    NexdropStore.toggleSellerApproval(sellerId);
    setSellers(NexdropStore.getSellers());
    setActionNotice(`Seller approval state updated.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    NexdropStore.updateOrderStatus(orderId, status, `Admin override: Status changed to ${status}.`);
    setOrders(NexdropStore.getOrders());
    setActionNotice(`Order ${orderId} updated to ${status}.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc.trim() || `Flat ₹${newCouponValue} discount`,
      discount_type: 'flat',
      discount_value: Number(newCouponValue),
      min_order_amount: Number(newCouponMin),
      is_active: true,
      expiry_date: '2026-12-31',
    };
    const updated = [newC, ...coupons];
    NexdropStore.saveCoupons(updated);
    setCoupons(updated);
    setShowAddCouponModal(false);
    setActionNotice(`Campaign coupon ${newC.code} activated!`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F58A]/30 to-emerald-400/20 border border-[#00F58A]/40 flex items-center justify-center font-display font-extrabold text-2xl text-[#00F58A] shadow-[0_0_25px_rgba(0,245,138,0.15)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white">
                NEXDROP Kerala Admin Control Hub
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#A6B2AA] mt-0.5">
              Live Kerala logistics monitoring, merchant approval registry & catalog governance.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToStore}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
        >
          Return to Storefront
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold animate-in fade-in">
          {actionNotice}
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
          <span>Marketplace Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('pincodes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'pincodes'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Kerala PIN Coverage ({pinCodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'sellers'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Merchant Approvals ({sellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Kerala Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'coupons'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons & Offers ({coupons.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Kerala Total GMV</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                ₹{totalGMV.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#00F58A]">+24% Month over Month</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Platform Commission Earned</span>
              <p className="font-display text-2xl font-extrabold text-[#00F58A] tabular-nums">
                ₹{totalCommission.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-white/50">Average 9% merchant fee</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Registered Kerala Merchants</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                {sellers.length}
              </p>
              <p className="text-[11px] text-white/50">Across 14 districts</p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-[#A6B2AA]">Active Serviceable PINs</span>
              <p className="font-display text-2xl font-extrabold text-white tabular-nums">
                {pinCodes.filter((p) => p.is_serviceable).length}
              </p>
              <p className="text-[11px] text-[#00F58A]">98.7% Kerala coverage</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kerala PIN Coverage */}
      {activeTab === 'pincodes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Kerala PIN-Code Serviceability Registry</h3>
              <p className="text-xs text-[#A6B2AA]">
                Control shipping rates, COD allowances, and regional serviceability per Kerala PIN code.
              </p>
            </div>
            <button
              onClick={() => setShowAddPinModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add PIN Code</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#A6B2AA] border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">PIN Code</th>
                    <th className="p-4 font-semibold">District & Area</th>
                    <th className="p-4 font-semibold">Standard Fee</th>
                    <th className="p-4 font-semibold">Express 24h</th>
                    <th className="p-4 font-semibold">Cash on Delivery</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pinCodes.map((p) => (
                    <tr key={p.pin_code} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-bold text-white">{p.pin_code}</td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{p.district}</p>
                        <p className="text-[11px] text-[#A6B2AA]">{p.area_name}</p>
                      </td>
                      <td className="p-4 text-white font-medium tabular-nums">₹{p.standard_delivery_fee}</td>
                      <td className="p-4">
                        {p.express_available ? (
                          <span className="text-[#00F58A] font-medium">Available (₹{p.express_delivery_fee})</span>
                        ) : (
                          <span className="text-white/40">Not available</span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.cod_allowed ? (
                          <span className="text-emerald-400 font-medium">Allowed</span>
                        ) : (
                          <span className="text-red-400 font-medium">Disabled</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.is_serviceable
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-300 border border-red-500/20'
                          }`}
                        >
                          {p.is_serviceable ? 'Serviceable' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleTogglePinService(p.pin_code)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[11px]"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sellers */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Merchant Compliance & Onboarding</h3>
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#A6B2AA] border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">Business</th>
                    <th className="p-4 font-semibold">Owner & Contact</th>
                    <th className="p-4 font-semibold">GSTIN / Tax ID</th>
                    <th className="p-4 font-semibold">District Hub</th>
                    <th className="p-4 font-semibold">Commission</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sellers.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{s.business_name}</td>
                      <td className="p-4">
                        <p className="text-white">{s.owner_name}</p>
                        <p className="text-[11px] text-[#A6B2AA]">{s.phone}</p>
                      </td>
                      <td className="p-4 font-mono text-white/90">{s.gstin}</td>
                      <td className="p-4 text-white/80">{s.district}, Kerala</td>
                      <td className="p-4 font-bold text-[#00F58A] tabular-nums">{s.commission_rate}%</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.is_approved
                              ? 'bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {s.is_approved ? 'Verified Merchant' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleSellerApproval(s.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            s.is_approved
                              ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-[#00F58A] text-black hover:bg-[#00C875]'
                          }`}
                        >
                          {s.is_approved ? 'Suspend' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Marketplace Orders Central Control</h3>
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-white">{ord.order_number}</span>
                    <span className="text-xs text-[#A6B2AA] ml-2">
                      Customer: {ord.customer_name} ({ord.customer_phone})
                    </span>
                    <p className="text-[11px] text-[#A6B2AA]">
                      Delivery: {ord.shipping_address.street}, {ord.shipping_address.district} -{' '}
                      {ord.shipping_address.pin_code}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                      {ord.shipping_status}
                    </span>
                    <span className="font-display font-bold text-sm text-white tabular-nums">
                      ₹{ord.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Status Override */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
                  <span className="text-[#A6B2AA]">Override Status:</span>
                  {(
                    ['Payment Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'] as OrderStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateOrderStatus(ord.id, st)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                        ord.shipping_status === st
                          ? 'bg-[#00F58A] text-black font-bold border-[#00F58A]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Active Promotional Coupons</h3>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-[#00F58A] tracking-wider">
                    {c.code}
                  </span>
                  <span className="text-[10px] bg-[#00F58A]/10 text-[#00F58A] px-2 py-0.5 rounded-full border border-[#00F58A]/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-white/90">{c.description}</p>
                <p className="text-[11px] text-[#A6B2AA]">
                  Min Order: ₹{c.min_order_amount} · Expiry: {c.expiry_date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add PIN Modal */}
      {showAddPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-3xl p-6 border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-white">Register New Kerala Delivery PIN</h3>
            <form onSubmit={handleAddPinCode} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#A6B2AA]">6-Digit PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 680001"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A6B2AA]">District</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                >
                  <option value="Ernakulam">Ernakulam</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="Kozhikode">Kozhikode</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Kannur">Kannur</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Palakkad">Palakkad</option>
                  <option value="Kollam">Kollam</option>
                  <option value="Kottayam">Kottayam</option>
                  <option value="Alappuzha">Alappuzha</option>
                  <option value="Malappuram">Malappuram</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Pathanamthitta">Pathanamthitta</option>
                  <option value="Kasaragod">Kasaragod</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#A6B2AA]">Area / Landmark</label>
                <input
                  type="text"
                  required
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g. Round North / Municipal Area"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Standard Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={newStandardFee}
                    onChange={(e) => setNewStandardFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-white pb-2.5">
                    <input
                      type="checkbox"
                      checked={newCodAllowed}
                      onChange={(e) => setNewCodAllowed(e.target.checked)}
                      className="accent-[#00F58A]"
                    />
                    <span>COD Allowed</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-3xl p-6 border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-white">Create Promotional Campaign Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#A6B2AA]">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON2026"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A6B2AA]">Description</label>
                <input
                  type="text"
                  required
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder="e.g. ₹200 off on Malabar Electronics"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Discount Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Min Order Subtotal (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
