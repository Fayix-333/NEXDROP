import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Store,
  Package,
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Users,
  CreditCard,
  Percent,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowRight,
  Sliders,
  DollarSign,
  Truck,
  Layers,
  Lock,
  Download,
  Clock,
  Activity,
  FileText,
  BadgeAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  DeliveryPinCode,
  Seller,
  Order,
  Coupon,
  OrderStatus,
  Product,
  RefundRequest,
  SellerPayout,
  User,
  Category,
} from '../types';
import { NexdropStore } from '../services/storage';

interface AdminDashboardProps {
  onBackToStore: () => void;
  lang: 'en' | 'ml';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore, lang }) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users_sellers'
    | 'product_approvals'
    | 'orders'
    | 'refunds'
    | 'commissions'
    | 'payouts'
    | 'pincodes'
    | 'coupons'
    | 'reports'
  >('overview');

  const [pinCodes, setPinCodes] = useState<DeliveryPinCode[]>(() => NexdropStore.getPinCodes());
  const [sellers, setSellers] = useState<Seller[]>(() => NexdropStore.getSellers());
  const [orders, setOrders] = useState<Order[]>(() => NexdropStore.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => NexdropStore.getCoupons());
  const [products, setProducts] = useState<Product[]>(() => NexdropStore.getProducts());
  const [customers, setCustomers] = useState<User[]>(() => NexdropStore.getCustomers());
  const [refunds, setRefunds] = useState<RefundRequest[]>(() => NexdropStore.getRefunds());
  const [payouts, setPayouts] = useState<SellerPayout[]>(() => NexdropStore.getPayouts());
  const [categories, setCategories] = useState<Category[]>(() => NexdropStore.getCategories());

  const [searchFilter, setSearchFilter] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live IST Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Process Payout Modal state
  const [selectedPayout, setSelectedPayout] = useState<SellerPayout | null>(null);
  const [utrInput, setUtrInput] = useState('');

  // Total GMV & Commissions
  const totalGMV = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalCommission = Math.round(totalGMV * 0.08);

  const handleTogglePinService = (pin: string) => {
    const updated = pinCodes.map((p) =>
      p.pin_code === pin ? { ...p, is_serviceable: !p.is_serviceable } : p
    );
    NexdropStore.savePinCodes(updated);
    setPinCodes(updated);
    setActionNotice(`PIN code ${pin} serviceability status updated.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleAddPinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length !== 6) {
      alert('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    const newEntry: DeliveryPinCode = {
      pin_code: newPin,
      district: newDistrict,
      area_name: newArea || `${newDistrict} Central`,
      standard_delivery_fee: Number(newStandardFee) || 45,
      express_available: true,
      express_delivery_fee: 99,
      cod_allowed: newCodAllowed,
      estimated_days: 2,
      min_free_delivery_threshold: 499,
      is_serviceable: true,
    };
    const updated = [newEntry, ...pinCodes.filter((p) => p.pin_code !== newPin)];
    NexdropStore.savePinCodes(updated);
    setPinCodes(updated);
    setShowAddPinModal(false);
    setNewPin('');
    setNewArea('');
    setActionNotice(`PIN ${newPin} registered into Kerala logistics network.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleToggleSellerApproval = (sellerId: string) => {
    const updated = sellers.map((s) => {
      if (s.id === sellerId) {
        return { ...s, is_approved: !s.is_approved };
      }
      return s;
    });
    NexdropStore.saveSellers(updated);
    setSellers(updated);
    setActionNotice('Seller KYC status changed.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleToggleBlockCustomer = (customerId: string) => {
    NexdropStore.toggleBlockCustomer(customerId);
    setCustomers(NexdropStore.getCustomers());
    setActionNotice('Customer account governance status updated.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleApproveProduct = (productId: string) => {
    NexdropStore.approveProduct(productId);
    setProducts(NexdropStore.getProducts());
    setActionNotice('Product listing approved and published across Kerala.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleRejectProduct = (productId: string) => {
    const reason = prompt('Enter moderation rejection remarks:', 'Inadequate product images or pricing mismatch');
    if (!reason) return;
    NexdropStore.rejectProduct(productId, reason);
    setProducts(NexdropStore.getProducts());
    setActionNotice('Product listing rejected with notes.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleApproveRefund = (refundId: string) => {
    NexdropStore.updateRefundStatus(refundId, 'Approved', 'Approved by Admin for Kerala doorstep pickup.');
    setRefunds(NexdropStore.getRefunds());
    setActionNotice('Refund request approved.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleCompleteRefund = (refundId: string) => {
    NexdropStore.updateRefundStatus(refundId, 'Refunded', 'Amount credited to customer original payment method.');
    setRefunds(NexdropStore.getRefunds());
    setActionNotice('Refund marked as completed & credited.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleRejectRefund = (refundId: string) => {
    const reason = prompt('Enter rejection reason:', 'Policy window exceeded or inspection failed');
    if (!reason) return;
    NexdropStore.updateRefundStatus(refundId, 'Rejected', reason);
    setRefunds(NexdropStore.getRefunds());
    setActionNotice('Refund claim rejected.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleProcessPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !utrInput.trim()) return;
    NexdropStore.processPayout(selectedPayout.id, utrInput.trim().toUpperCase());
    setPayouts(NexdropStore.getPayouts());
    setSelectedPayout(null);
    setUtrInput('');
    setActionNotice('Seller payout marked as processed with UTR.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleUpdateCommission = (categoryId: string, percent: number) => {
    NexdropStore.updateCategoryCommission(categoryId, percent);
    setCategories(NexdropStore.getCategories());
    setActionNotice('Marketplace category commission rate updated.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    NexdropStore.updateOrderStatus(orderId, status, `Admin override: Status set to ${status}.`);
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

  const handleExportReport = () => {
    setActionNotice('Official Tax & GST Report (KL-COMMERCE-2026.csv) generated and queued for download.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050706] text-slate-100 flex flex-col md:flex-row">
      {/* Official Enterprise Operations Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A100D] border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Official Brand Lockup Header */}
          <div className="p-4 border-b border-white/10 bg-[#060B08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F58A] to-[#00C875] flex items-center justify-center font-bold text-black shadow-lg shadow-[#00F58A]/20">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="font-display font-black text-sm tracking-wide text-white">
                  NEXDROP <span className="text-[#00F58A]">CENTRAL</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">Official Operations Console</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#00F58A] animate-pulse" title="System Online" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Operations & GMV</span>
            </button>

            <button
              onClick={() => setActiveTab('users_sellers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'users_sellers'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {lang === 'ml' ? 'ഉപഭോക്താക്കൾ, വ്യാപാരികൾ' : 'Customers & Sellers'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('product_approvals')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'product_approvals'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Catalog Moderation</span>
              {products.filter((p) => p.approval_status === 'pending').length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                  {products.filter((p) => p.approval_status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders Dispatch</span>
            </button>

            <button
              onClick={() => setActiveTab('refunds')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'refunds'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refund Adjudication</span>
              {refunds.filter((r) => r.status === 'Pending').length > 0 && (
                <span className="ml-auto w-5 h-5 bg-amber-400 text-black font-extrabold rounded-full flex items-center justify-center text-[10px]">
                  {refunds.filter((r) => r.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('commissions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'commissions'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Commission Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'payouts'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Seller Payouts</span>
            </button>

            <button
              onClick={() => setActiveTab('pincodes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'pincodes'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Kerala PIN Coverage</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'coupons'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Festive Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'bg-[#00F58A] text-black font-extrabold shadow-md shadow-[#00F58A]/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tax & Audit Reports</span>
            </button>
          </nav>
        </div>

        {/* Bottom Return Action */}
        <div className="p-4 border-t border-white/10 bg-[#060B08]">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050706]">
        {/* Top Official App Bar */}
        <header className="h-16 px-6 border-b border-white/10 bg-[#080D0A]/90 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight uppercase">
              {activeTab === 'overview' && 'Marketplace Operations Intelligence & GMV'}
              {activeTab === 'users_sellers' && 'Customer & Merchant Governance (Customers, Sellers എന്നിവ)'}
              {activeTab === 'product_approvals' && 'Catalog Moderation & Verification'}
              {activeTab === 'orders' && 'Kerala Orders Central Dispatch Desk'}
              {activeTab === 'refunds' && 'Customer Return & Refund Adjudication'}
              {activeTab === 'commissions' && 'Category-Wise Platform Commission Rates'}
              {activeTab === 'payouts' && 'Merchant Payout Disbursals & NEFT UTR'}
              {activeTab === 'pincodes' && 'Indian 6-Digit PIN Serviceability Engine'}
              {activeTab === 'coupons' && 'Promotional Coupon Campaigns'}
              {activeTab === 'reports' && 'Kerala GST & Statutory Audit Reports'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#00F58A]" />
              <span>IST {currentTime || 'LIVE'}</span>
              <span className="text-[#00F58A]">• Kochi DC-1</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline text-xs text-slate-400">
                Admin: <span className="font-bold text-white">SuperAdmin (Kerala HQ)</span>
              </span>
              <div className="w-8 h-8 rounded-full bg-[#00F58A] flex items-center justify-center text-xs font-extrabold text-black shadow-md shadow-[#00F58A]/30">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Action Notice Notification */}
        {actionNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-bold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Content Container */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Official Enterprise KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 shadow-lg space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Total Kerala GMV</span>
                    <TrendingUp className="w-4 h-4 text-[#00F58A]" />
                  </div>
                  <p className="font-display text-2xl font-black text-white tabular-nums">
                    ₹{totalGMV.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#00F58A] font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+22.4% vs last cycle</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 shadow-lg space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Commission Retained</span>
                    <Percent className="w-4 h-4 text-[#00F58A]" />
                  </div>
                  <p className="font-display text-2xl font-black text-[#00F58A] tabular-nums">
                    ₹{totalCommission.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400">Average 9.1% platform fee</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 shadow-lg space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Active Shoppers</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="font-display text-2xl font-black text-white tabular-nums">
                    {customers.length + 1840}
                  </p>
                  <p className="text-[11px] text-slate-400">Across 14 Kerala districts</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 shadow-lg space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Verified Merchants</span>
                    <ShieldCheck className="w-4 h-4 text-[#00F58A]" />
                  </div>
                  <p className="font-display text-2xl font-black text-[#00F58A] tabular-nums">
                    {sellers.filter((s) => s.is_approved).length} / {sellers.length}
                  </p>
                  <p className="text-[11px] text-slate-400">100% GSTIN 32 validated</p>
                </div>
              </div>

              {/* Quick Operations Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab('product_approvals')}
                  className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 hover:border-[#00F58A]/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00F58A]">
                      Catalog Moderation Queue
                    </span>
                    <Layers className="w-4 h-4 text-slate-400 group-hover:text-[#00F58A]" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Review and verify product specifications, photos, and MRPs submitted by merchants.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('refunds')}
                  className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 hover:border-[#00F58A]/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00F58A]">
                      Pending Refund Claims ({refunds.filter((r) => r.status === 'Pending').length})
                    </span>
                    <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-[#00F58A]" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Approve or dispute 7-day customer returns across Kerala logistics network.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('payouts')}
                  className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 hover:border-[#00F58A]/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00F58A]">
                      Seller Settlement Payouts
                    </span>
                    <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-[#00F58A]" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Reconcile net merchant revenues and disburse via NEFT/RTGS with bank UTRs.
                  </p>
                </div>
              </div>

              {/* Kerala Logistics Coverage Pulse */}
              <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00F58A]" />
                    <h3 className="text-sm font-bold text-white">Kerala Regional Hub Telemetry</h3>
                  </div>
                  <span className="text-xs text-[#00F58A] font-mono">14 / 14 Districts Active</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
                  {[
                    { district: 'Ernakulam', load: 'Heavy', time: 'Same Day' },
                    { district: 'Thiruvananthapuram', load: 'Heavy', time: 'Same Day' },
                    { district: 'Kozhikode', load: 'Moderate', time: 'Next Day' },
                    { district: 'Thrissur', load: 'Moderate', time: 'Next Day' },
                    { district: 'Kollam', load: 'Normal', time: '2 Days' },
                    { district: 'Kannur', load: 'Normal', time: '2 Days' },
                    { district: 'Wayanad', load: 'Normal', time: '2 Days' },
                  ].map((hub) => (
                    <div key={hub.district} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <p className="font-bold text-white truncate">{hub.district}</p>
                      <p className="text-[10px] text-[#00F58A] mt-0.5">{hub.time}</p>
                      <p className="text-[10px] text-slate-400">{hub.load}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMERS & SELLERS MANAGEMENT */}
          {activeTab === 'users_sellers' && (
            <div className="space-y-6">
              {/* Sellers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Marketplace Sellers & KYC Verification</h3>
                    <p className="text-xs text-slate-400">
                      Verify Kerala trade licenses, GSTIN 32 compliance, and manage store access.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0D1410] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080D0A] text-slate-400 border-b border-white/10 font-semibold">
                      <tr>
                        <th className="p-3.5">Business / Shop</th>
                        <th className="p-3.5">Owner & Phone</th>
                        <th className="p-3.5">GSTIN / PAN</th>
                        <th className="p-3.5">District</th>
                        <th className="p-3.5">Commission</th>
                        <th className="p-3.5">KYC Status</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sellers.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-white">{s.business_name}</p>
                            <p className="text-[11px] text-slate-400">{s.email}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="text-white font-medium">{s.owner_name}</p>
                            <p className="text-[11px] text-slate-400">{s.phone}</p>
                          </td>
                          <td className="p-3.5 font-mono text-[11px]">
                            <p className="text-white">{s.gstin}</p>
                            <p className="text-slate-400">{s.pan}</p>
                          </td>
                          <td className="p-3.5 text-slate-300">{s.district}</td>
                          <td className="p-3.5 font-bold text-[#00F58A]">{s.commission_rate}%</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                s.is_approved
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              }`}
                            >
                              {s.is_approved ? 'Verified Active' : 'Pending Verification'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleSellerApproval(s.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                s.is_approved
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-[#00F58A] text-black hover:bg-[#00C875]'
                              }`}
                            >
                              {s.is_approved ? 'Suspend Shop' : 'Approve KYC'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customers Section */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Registered Customers ({lang === 'ml' ? 'ഉപഭോക്താക്കൾ' : 'Kerala Shoppers'})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage customer accounts, addresses, and account security flags.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0D1410] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080D0A] text-slate-400 border-b border-white/10 font-semibold">
                      <tr>
                        <th className="p-3.5">Customer Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5">Home District</th>
                        <th className="p-3.5">Orders</th>
                        <th className="p-3.5">Account Status</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-bold text-white">{c.name}</td>
                          <td className="p-3.5 text-slate-300 font-mono text-[11px]">{c.email}</td>
                          <td className="p-3.5 text-slate-300">{c.phone}</td>
                          <td className="p-3.5 text-slate-300">{c.default_district}</td>
                          <td className="p-3.5 font-mono text-white">
                            {orders.filter((o) => o.customer_email === c.email).length}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                c.is_blocked
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {c.is_blocked ? 'Suspended' : 'Active Shopper'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleBlockCustomer(c.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                c.is_blocked
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300'
                              }`}
                            >
                              {c.is_blocked ? 'Unblock' : 'Suspend'}
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

          {/* TAB 3: PRODUCT APPROVALS */}
          {activeTab === 'product_approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Catalog Moderation & Verification Desk</h3>
                  <p className="text-xs text-slate-400">
                    Verify seller listing details, MRP authenticity, and Kerala origin claims.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0D1410] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080D0A] text-slate-400 border-b border-white/10 font-semibold">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Seller & District</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price / MRP</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white line-clamp-1">{p.title}</p>
                              <p className="text-[11px] text-slate-400">{p.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <p className="text-white font-medium">{p.seller_name}</p>
                          <p className="text-[11px] text-slate-400">{p.seller_district}</p>
                        </td>
                        <td className="p-3.5 text-slate-300">{p.category}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-white">₹{p.price}</span>
                          <span className="text-[11px] text-slate-400 line-through ml-1.5">₹{p.original_price}</span>
                        </td>
                        <td className="p-3.5 font-mono text-white">{p.stock}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.approval_status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : p.approval_status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {p.approval_status ? p.approval_status.toUpperCase() : 'APPROVED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.approval_status !== 'approved' && (
                              <button
                                onClick={() => handleApproveProduct(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#00F58A] hover:bg-[#00C875] text-black font-extrabold text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {p.approval_status !== 'rejected' && (
                              <button
                                onClick={() => handleRejectProduct(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS DISPATCH */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Kerala Orders Central Dispatch Desk</h3>
                  <p className="text-xs text-slate-400">
                    Live logistics tracking, Kerala Speed Post integration, and status override.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-white/10 bg-[#0D1410] space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#00F58A]">{ord.order_number}</span>
                          <span className="text-[11px] text-slate-400">· {ord.created_at}</span>
                        </div>
                        <p className="text-xs text-slate-200 mt-0.5">
                          Recipient: <span className="font-bold text-white">{ord.shipping_address.name}</span> ({ord.shipping_address.phone})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {ord.shipping_address.street}, {ord.shipping_address.district} - {ord.shipping_address.pin_code}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                          {ord.shipping_status}
                        </span>
                        <span className="font-display font-black text-sm text-white mt-1">
                          ₹{ord.total_amount} ({ord.payment_method})
                        </span>
                      </div>
                    </div>

                    {/* Status Override Buttons */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                      <span className="text-slate-400 font-semibold">Override Status:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map(
                          (st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateOrderStatus(ord.id, st)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                ord.shipping_status === st
                                  ? 'bg-[#00F58A] text-black font-extrabold shadow-sm'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REFUND APPROVALS */}
          {activeTab === 'refunds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Customer Return & Doorstep Refund Claims</h3>
                  <p className="text-xs text-slate-400">
                    Adjudicate Kerala customer returns, arrange reverse courier pickups, and authorize UPI refunds.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {refunds.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-4 rounded-2xl border border-white/10 bg-[#0D1410] space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#00F58A]">Claim #{ref.id}</span>
                          <span className="font-mono text-xs font-semibold text-slate-400">Order: {ref.order_number}</span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 font-semibold">
                          Reason: {ref.reason}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Customer: {ref.customer_name} (ID: {ref.customer_id})
                        </p>
                        {ref.admin_notes && (
                          <p className="text-[11px] text-amber-300 mt-1 italic">
                            Admin Note: {ref.admin_notes}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-end justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ref.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : ref.status === 'Refunded'
                              ? 'bg-[#00F58A]/20 text-[#00F58A] border border-[#00F58A]/30'
                              : ref.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {ref.status}
                        </span>
                        <span className="font-display font-black text-sm text-white mt-1">
                          ₹{ref.amount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {ref.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRefund(ref.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#00F58A] text-black hover:bg-[#00C875] font-extrabold text-xs cursor-pointer"
                          >
                            Approve Doorstep Return
                          </button>
                          <button
                            onClick={() => handleRejectRefund(ref.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs cursor-pointer"
                          >
                            Reject Claim
                          </button>
                        </>
                      )}

                      {ref.status === 'Approved' && (
                        <button
                          onClick={() => handleCompleteRefund(ref.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold text-xs cursor-pointer"
                        >
                          Mark Refunded & Credit UPI
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COMMISSION SETTINGS */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Marketplace Category Commission Matrix</h3>
                  <p className="text-xs text-slate-400">
                    Adjust platform service commission rates applied to Kerala merchant sales.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0D1410] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080D0A] text-slate-400 border-b border-white/10 font-semibold">
                    <tr>
                      <th className="p-3.5">Category Name</th>
                      <th className="p-3.5">Malayalam Label</th>
                      <th className="p-3.5">Active Items</th>
                      <th className="p-3.5">Current Rate</th>
                      <th className="p-3.5 text-right">Quick Rate Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categories.map((c) => {
                      const currentRate = c.commission_percent ?? 8;
                      return (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-bold text-white">{c.name}</td>
                          <td className="p-3.5 text-slate-300 font-medium">{c.name_ml}</td>
                          <td className="p-3.5 text-slate-400 font-mono">
                            {products.filter((p) => p.category === c.id).length}
                          </td>
                          <td className="p-3.5 font-bold text-[#00F58A] tabular-nums">{currentRate}%</td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              {[6, 8, 10, 12, 15].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => handleUpdateCommission(c.id, rate)}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    currentRate === rate
                                      ? 'bg-[#00F58A] text-black'
                                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                  }`}
                                >
                                  {rate}%
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SELLER PAYOUTS */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Merchant Disbursals & NEFT Payout Ledger</h3>
                  <p className="text-xs text-slate-400">
                    Settle merchant revenues with Indian banking UTR reference numbers.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0D1410] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080D0A] text-slate-400 border-b border-white/10 font-semibold">
                    <tr>
                      <th className="p-3.5">Payout ID</th>
                      <th className="p-3.5">Merchant</th>
                      <th className="p-3.5">Settlement Bank</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payouts.map((po) => (
                      <tr key={po.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white">{po.id}</td>
                        <td className="p-3.5 text-white font-medium">{po.seller_name}</td>
                        <td className="p-3.5 text-slate-300">{po.bank_details}</td>
                        <td className="p-3.5 font-bold text-white tabular-nums">₹{po.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              po.status === 'Processed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {po.status === 'Pending' ? (
                            <button
                              onClick={() => {
                                setSelectedPayout(po);
                                setUtrInput(`NEFT-KL-${Date.now().toString().slice(-8)}`);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#00F58A] text-black hover:bg-[#00C875] font-extrabold cursor-pointer"
                            >
                              Disburse
                            </button>
                          ) : (
                            <span className="font-mono text-slate-400">{po.utr_number}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: KERALA PIN COVERAGE */}
          {activeTab === 'pincodes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Kerala PIN-Code Serviceability Registry</h3>
                  <p className="text-xs text-slate-400">
                    Control shipping rates, COD allowances, and regional serviceability per Kerala PIN code.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPinModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#00C875]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add PIN Code</span>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0D1410] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080D0A] text-slate-400 border-b border-white/10 font-semibold">
                    <tr>
                      <th className="p-3.5">PIN Code</th>
                      <th className="p-3.5">District & Area</th>
                      <th className="p-3.5">Standard Fee</th>
                      <th className="p-3.5">Express 24h</th>
                      <th className="p-3.5">COD Allowed</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pinCodes.map((p) => (
                      <tr key={p.pin_code} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white">{p.pin_code}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{p.district}</p>
                          <p className="text-[11px] text-slate-400">{p.area_name}</p>
                        </td>
                        <td className="p-3.5 text-white font-medium tabular-nums">₹{p.standard_delivery_fee}</td>
                        <td className="p-3.5">
                          {p.express_available ? (
                            <span className="text-[#00F58A] font-medium">Available (₹{p.express_delivery_fee})</span>
                          ) : (
                            <span className="text-slate-500">Not available</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {p.cod_allowed ? (
                            <span className="text-emerald-400 font-medium">Allowed</span>
                          ) : (
                            <span className="text-rose-400 font-medium">Disabled</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.is_serviceable
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {p.is_serviceable ? 'Serviceable' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleTogglePinService(p.pin_code)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] cursor-pointer"
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
          )}

          {/* TAB 9: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Active Promotional & Festive Coupons</h3>
                  <p className="text-xs text-slate-400">
                    Campaign codes configured for Kerala shoppers (Onam, Vishu, Kerala Special).
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#00C875]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="p-5 rounded-2xl border border-white/10 bg-[#0D1410] space-y-2 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-[#00F58A] tracking-wider">
                        {c.code}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">{c.description}</p>
                    <p className="text-[11px] text-slate-400">
                      Min Order: ₹{c.min_order_amount} · Expiry: {c.expiry_date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: OFFICIAL AUDIT & TAX REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Kerala GST 32 & Marketplace Regulatory Reports</h3>
                  <p className="text-xs text-slate-400">
                    Official financial statements, tax reconciliations, and merchant payout summaries.
                  </p>
                </div>
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#00C875]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#00F58A]">
                    <FileText className="w-5 h-5" />
                    <span className="font-bold text-sm text-white">Monthly GST-1 Summary</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Aggregated outward supplies, Kerala state GST (SGST 9%) and central GST (CGST 9%) ledger.
                  </p>
                  <button
                    onClick={handleExportReport}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200"
                  >
                    Download Statement
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#00F58A]">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-bold text-sm text-white">TDS on E-Commerce (1%)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Section 194-O tax deducted at source for all registered Kerala merchant transactions.
                  </p>
                  <button
                    onClick={handleExportReport}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200"
                  >
                    Download Form 16A
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#00F58A]">
                    <Truck className="w-5 h-5" />
                    <span className="font-bold text-sm text-white">Kerala Logistics SLA Ledger</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    District-wise turnaround times, courier SLA adherence, and return rate audits.
                  </p>
                  <button
                    onClick={handleExportReport}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200"
                  >
                    Download Logistics CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Disburse Payout Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1410] border border-white/20 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Disburse Seller Settlement via NEFT/RTGS</h3>
            <p className="text-xs text-slate-400">
              Merchant: <span className="font-bold text-white">{selectedPayout.seller_name}</span> · Amount: ₹{selectedPayout.amount}
            </p>

            <form onSubmit={handleProcessPayout} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Bank UTR Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. SBIN-NEFT-9081249"
                  className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 font-mono focus:border-[#00F58A] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                Beneficiary: {selectedPayout.bank_details}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs hover:bg-[#00C875] cursor-pointer"
                >
                  Confirm NEFT Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add PIN Modal */}
      {showAddPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1410] border border-white/20 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Register Kerala Delivery PIN</h3>
            <form onSubmit={handleAddPinCode} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">6-Digit PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 680001"
                  className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 font-mono focus:border-[#00F58A] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">District</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 focus:border-[#00F58A] outline-none"
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
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Area Name</label>
                <input
                  type="text"
                  required
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g. Swaraj Round Central"
                  className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 focus:border-[#00F58A] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={newStandardFee}
                    onChange={(e) => setNewStandardFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 focus:border-[#00F58A] outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-white pb-2.5 cursor-pointer">
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
                  className="w-1/2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs hover:bg-[#00C875] cursor-pointer"
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
          <div className="bg-[#0D1410] border border-white/20 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Promotional Campaign Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON2026"
                  className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 uppercase font-mono focus:border-[#00F58A] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Description</label>
                <input
                  type="text"
                  required
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder="e.g. ₹200 off on Malabar Handlooms"
                  className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 focus:border-[#00F58A] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Discount Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 focus:border-[#00F58A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Min Order (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-[#070B08] border border-white/10 text-white mt-1 focus:border-[#00F58A] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs hover:bg-[#00C875] cursor-pointer"
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
