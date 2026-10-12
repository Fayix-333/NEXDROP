import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Heart,
  RotateCcw,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  CreditCard,
  Plus,
  Trash2,
  Star,
  LogOut,
  ShoppingBag,
  Truck,
  Navigation,
  Radio,
  Edit3,
  Check,
  RefreshCw,
  Share2,
  Send,
  Sparkles,
  Phone,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Order, User, Product, OrderStatus, Address, RefundRequest } from '../types';
import { NexdropStore } from '../services/storage';
import {
  listenToCustomerOrders,
  saveUserToFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
} from '../services/firebase';
import { KERALA_DISTRICTS } from '../data/mockData';
import {
  lookupKeralaPincodeSync,
  lookupKeralaPincode,
  KeralaPlaceInfo,
} from '../services/keralaPincode';

interface CustomerDashboardProps {
  user: User;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, qty: number) => void;
  lang: 'en' | 'ml';
  onBackToStore: () => void;
  onLogout: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  onSelectProduct,
  onAddToCart,
  lang,
  onBackToStore,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'refunds' | 'payments'>('orders');
  const [orders, setOrders] = useState<Order[]>(() =>
    NexdropStore.getOrders().filter((o) => o.customer_id === user.id)
  );
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [statusActionMsg, setStatusActionMsg] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered'>('all');

  // Real-time Firestore live listener for customer orders
  useEffect(() => {
    const unsubscribe = listenToCustomerOrders(user.id, (realtimeOrders) => {
      if (realtimeOrders && realtimeOrders.length > 0) {
        setOrders(realtimeOrders);
      }
    });
    return () => unsubscribe();
  }, [user.id]);

  // Return & Refund Modal state
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('Damaged or wrong item delivered');
  const [refunds, setRefunds] = useState<RefundRequest[]>(() =>
    NexdropStore.getRefunds().filter((r) => r.customer_id === user.id)
  );

  // Address & PIN Code Management state
  const [addresses, setAddresses] = useState<Address[]>(user.addresses);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newDistrict, setNewDistrict] = useState(user.default_district || 'Ernakulam');
  const [newPin, setNewPin] = useState(user.addresses?.[0]?.pin_code || '682001');
  const [newPhone, setNewPhone] = useState(user.phone || '+91 9037538732');
  const [newType, setNewType] = useState<'Home' | 'Work'>('Home');
  const [newAddressPlace, setNewAddressPlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync(user.addresses?.[0]?.pin_code || '682001')
  );

  // PIN Code & Firebase Profile quick editor modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [profilePin, setProfilePin] = useState(user.addresses?.[0]?.pin_code || '682001');
  const [profilePhone, setProfilePhone] = useState(user.phone || '+91 9037538732');
  const [profileDistrict, setProfileDistrict] = useState(user.default_district || 'Ernakulam');
  const [profilePlace, setProfilePlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync(user.addresses?.[0]?.pin_code || '682001')
  );
  const [pinVerificationNotice, setPinVerificationNotice] = useState<string | null>(null);
  const [isSavingFirebase, setIsSavingFirebase] = useState(false);

  const handleProfilePinChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setProfilePin(cleaned);
    if (cleaned.length === 6) {
      const sync = lookupKeralaPincodeSync(cleaned);
      if (sync && sync.isKerala) {
        setProfilePlace(sync);
        setProfileDistrict(sync.district);
        setPinVerificationNotice(null);
      } else {
        setPinVerificationNotice('Note: Not a standard Kerala postal PIN code (670xxx - 695xxx)');
      }
      try {
        const live = await lookupKeralaPincode(cleaned);
        if (live && live.isKerala) {
          setProfilePlace(live);
          setProfileDistrict(live.district);
        }
      } catch (err) {
        // sync handled
      }
    } else {
      setProfilePlace(null);
    }
  };

  const handleNewAddressPinChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setNewPin(cleaned);
    if (cleaned.length === 6) {
      const sync = lookupKeralaPincodeSync(cleaned);
      if (sync && sync.isKerala) {
        setNewAddressPlace(sync);
        setNewDistrict(sync.district);
      }
      try {
        const live = await lookupKeralaPincode(cleaned);
        if (live && live.isKerala) {
          setNewAddressPlace(live);
          setNewDistrict(live.district);
        }
      } catch (err) {
        // sync handled
      }
    } else {
      setNewAddressPlace(null);
    }
  };

  const wishlistProducts = NexdropStore.getProducts().filter((p) =>
    user.wishlist.includes(p.id)
  );

  // Active in-transit orders
  const activeOrders = orders.filter(
    (o) =>
      o.shipping_status === 'Processing' ||
      o.shipping_status === 'In Transit' ||
      o.shipping_status === 'Out for Delivery' ||
      o.shipping_status === 'Payment Confirmed' ||
      o.shipping_status === 'Packed' ||
      o.shipping_status === 'Dispatched' ||
      o.shipping_status === 'Accepted'
  );

  const deliveredOrders = orders.filter((o) => o.shipping_status === 'Delivered');

  const displayedOrders = orders.filter((o) => {
    if (orderFilter === 'active') {
      return (
        o.shipping_status === 'Processing' ||
        o.shipping_status === 'In Transit' ||
        o.shipping_status === 'Out for Delivery' ||
        o.shipping_status === 'Payment Confirmed' ||
        o.shipping_status === 'Packed' ||
        o.shipping_status === 'Dispatched' ||
        o.shipping_status === 'Accepted'
      );
    }
    if (orderFilter === 'delivered') return o.shipping_status === 'Delivered';
    return true;
  });

  // Calculate live tracking progress percentage
  const getProgressPercentage = (status: OrderStatus) => {
    switch (status) {
      case 'Pending Payment':
        return 10;
      case 'Payment Confirmed':
      case 'Accepted':
        return 25;
      case 'Processing':
      case 'Packed':
        return 50;
      case 'Dispatched':
      case 'In Transit':
        return 75;
      case 'Out for Delivery':
        return 90;
      case 'Delivered':
        return 100;
      case 'Cancelled':
      case 'Rejected':
        return 0;
      default:
        return 40;
    }
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Out for Delivery':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse';
      case 'In Transit':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'Processing':
      case 'Packed':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-[#00F58A]/10 text-[#00F58A] border-[#00F58A]/30';
    }
  };

  // Simulate Next Live Status Progression (real-time demonstration & testing)
  const handleSimulateStatusAdvance = async (order: Order) => {
    let nextStatus: OrderStatus = 'Processing';
    let locationNote = 'Order processing started at Kerala regional hub.';

    if (order.shipping_status === 'Payment Confirmed' || order.shipping_status === 'Accepted') {
      nextStatus = 'Processing';
      locationNote = 'Items verified and packing underway at Kochi Central Hub (Aluva).';
    } else if (order.shipping_status === 'Processing' || order.shipping_status === 'Packed') {
      nextStatus = 'In Transit';
      locationNote = `Consignment transit along NH-66 to ${order.shipping_address.district} Regional Logistics Center.`;
    } else if (order.shipping_status === 'In Transit' || order.shipping_status === 'Dispatched') {
      nextStatus = 'Out for Delivery';
      locationNote = `Courier executive assigned with parcel in ${order.shipping_address.district} - PIN ${order.shipping_address.pin_code}.`;
    } else if (order.shipping_status === 'Out for Delivery') {
      nextStatus = 'Delivered';
      locationNote = `Package securely handed over to recipient at ${order.shipping_address.street}.`;
    }

    NexdropStore.updateOrderStatus(order.id, nextStatus, locationNote);
    const updatedList = NexdropStore.getOrders().filter((o) => o.customer_id === user.id);
    setOrders(updatedList);

    if (selectedOrderForTracking?.id === order.id) {
      const refreshed = updatedList.find((o) => o.id === order.id);
      if (refreshed) setSelectedOrderForTracking(refreshed);
    }

    setStatusActionMsg(`Status advanced to "${nextStatus}" and synced to Firebase in real-time!`);
    setTimeout(() => setStatusActionMsg(null), 3500);
  };

  const handleCancelOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    NexdropStore.updateOrderStatus(orderId, 'Cancelled', 'Customer initiated order cancellation.');
    setOrders(NexdropStore.getOrders().filter((o) => o.customer_id === user.id));
    setStatusActionMsg('Order cancelled successfully.');
    setTimeout(() => setStatusActionMsg(null), 3000);
  };

  const handleOpenRefundModal = (order: Order) => {
    setRefundModalOrder(order);
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;

    const newRefund = NexdropStore.createRefundRequest({
      order_id: refundModalOrder.id,
      order_number: refundModalOrder.order_number,
      customer_id: user.id,
      customer_name: user.name,
      seller_id: refundModalOrder.items[0]?.product?.seller_id || 'merchant_direct',
      amount: refundModalOrder.total_amount,
      reason: refundReason,
    });

    NexdropStore.updateOrderStatus(
      refundModalOrder.id,
      'Return Requested',
      `Return & refund requested by customer. Reason: ${refundReason}`
    );

    setOrders(NexdropStore.getOrders().filter((o) => o.customer_id === user.id));
    setRefunds([newRefund, ...refunds]);
    setRefundModalOrder(null);
    setStatusActionMsg('Return request submitted! Admin & Seller will verify within 24 hours.');
    setTimeout(() => setStatusActionMsg(null), 4000);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newPin) return;

    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      name: user.name,
      phone: newPhone,
      street: newStreet,
      district: newDistrict,
      pin_code: newPin,
      is_default: addresses.length === 0,
      type: newType,
    };

    const updated = [...addresses, newAddr];
    user.addresses = updated;
    user.phone = newPhone;
    user.default_district = newDistrict;
    NexdropStore.saveUser(user);
    await saveUserToFirestore(user);

    setAddresses(updated);
    setShowAddAddressModal(false);
    setNewStreet('');
    setStatusActionMsg('New Kerala address added and saved to Firebase Firestore.');
    setTimeout(() => setStatusActionMsg(null), 3000);
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    user.addresses = updated;
    NexdropStore.saveUser(user);
    await saveUserToFirestore(user);
    setAddresses(updated);
  };

  // Save PIN code, Phone number, and District directly to Firebase Firestore
  const handleSavePinAndProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceability = NexdropStore.checkPinServiceability(profilePin);
    if (!serviceability.serviceable && !profilePin.startsWith('6')) {
      setPinVerificationNotice('Please enter a valid Kerala PIN code (670xxx - 695xxx).');
      return;
    }

    setIsSavingFirebase(true);

    const primaryAddr = user.addresses?.[0] || {
      id: `addr_${Date.now()}`,
      name: user.name,
      phone: profilePhone,
      street: `${profileDistrict} Hub Road`,
      district: profileDistrict,
      pin_code: profilePin,
      is_default: true,
      type: 'Home',
    };

    const updatedAddresses = user.addresses?.length
      ? user.addresses.map((a, i) =>
          i === 0
            ? { ...a, pin_code: profilePin, phone: profilePhone, district: profileDistrict }
            : a
        )
      : [primaryAddr];

    const updatedUser: User = {
      ...user,
      phone: profilePhone,
      default_district: profileDistrict,
      addresses: updatedAddresses,
    };

    NexdropStore.saveUser(updatedUser);
    await saveUserToFirestore(updatedUser);

    setAddresses(updatedAddresses);
    setIsSavingFirebase(false);
    setShowPinModal(false);
    setPinVerificationNotice(null);
    setStatusActionMsg('Your Kerala PIN code & phone number have been securely synced to Firebase!');
    setTimeout(() => setStatusActionMsg(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Profile Summary */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F58A]/30 to-emerald-400/20 border border-[#00F58A]/40 flex items-center justify-center font-display font-extrabold text-2xl text-[#00F58A] shadow-[0_0_25px_rgba(0,245,138,0.15)]">
            {user.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white">{user.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                Verified Customer
              </span>
            </div>
            <p className="text-xs text-[#A6B2AA] mt-0.5">
              {user.email} · {user.phone || 'Phone not set'} · Kerala PIN:{' '}
              <span className="text-white font-mono font-bold">
                {user.addresses?.[0]?.pin_code || '682001'}
              </span>{' '}
              ({user.default_district})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPinModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#00F58A]/10 hover:bg-[#00F58A]/20 text-[#00F58A] text-xs font-bold border border-[#00F58A]/30 flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Update PIN & Phone</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={onBackToStore}
            className="px-4 py-2 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs shadow-md transition-all"
          >
            Storefront
          </button>
        </div>
      </div>

      {/* Prominent PIN Code & Firebase Profile Connectivity Card */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel-glow border border-[#00F58A]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-[#00F58A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Kerala Delivery PIN & User Details
              </span>
              <span className="text-[10px] text-[#00F58A] font-semibold bg-[#00F58A]/10 px-2 py-0.5 rounded-full border border-[#00F58A]/30">
                Synced with Google Cloud Firestore
              </span>
            </div>
            <p className="text-xs text-[#A6B2AA] mt-1">
              Active PIN:{' '}
              <span className="font-mono font-bold text-white">
                {user.addresses?.[0]?.pin_code || '682001'}
              </span>{' '}
              · Mobile:{' '}
              <span className="font-mono font-bold text-white">
                {user.phone || '+91 9037538732'}
              </span>{' '}
              · District: <span className="text-white font-medium">{user.default_district}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPinModal(true)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 flex items-center gap-1.5 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#00F58A]" />
          <span>Change Delivery PIN Code</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>
            My Orders ({orders.length})
            {activeOrders.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] font-extrabold">
                {activeOrders.length} In-Transit
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'wishlist'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'addresses'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'refunds'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returns & Refunds ({refunds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'payments'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment History</span>
        </button>
      </div>

      {statusActionMsg && (
        <div className="p-3.5 rounded-2xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusActionMsg}</span>
        </div>
      )}

      {/* Tab 1: Orders with Real-Time Tracking Feature */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Real-time Order Tracking Highlight Banner for Active Orders */}
          {activeOrders.length > 0 && (
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-[#00F58A]/30 space-y-4 relative overflow-hidden bg-gradient-to-r from-[#00F58A]/5 via-transparent to-emerald-500/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#00F58A] animate-ping" />
                  <span className="font-display font-extrabold text-sm sm:text-base text-white">
                    Live Kerala Shipment Tracking Active
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00F58A]/15 text-[#00F58A] border border-[#00F58A]/30">
                    {activeOrders.length} Consignment{activeOrders.length > 1 ? 's' : ''} in Transit
                  </span>
                </div>
                <span className="text-[11px] text-[#A6B2AA]">
                  Real-time status updates broadcast from Kerala Logistics Grid
                </span>
              </div>

              {/* Show primary active order card with live progress bar */}
              {activeOrders.slice(0, 1).map((activeOrd) => (
                <div
                  key={activeOrd.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[#A6B2AA]">Order </span>
                      <span className="font-mono font-bold text-white">{activeOrd.order_number}</span>
                      <span className="text-[#A6B2AA]"> · Carrier: {activeOrd.shipping_carrier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#A6B2AA]">Destination:</span>
                      <span className="font-mono font-bold text-[#00F58A]">
                        PIN {activeOrd.shipping_address.pin_code} ({activeOrd.shipping_address.district})
                      </span>
                    </div>
                  </div>

                  {/* Multi-step progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#00F58A]" />
                        Current Milestone: {activeOrd.shipping_status}
                      </span>
                      <span className="font-mono text-[11px] text-[#00F58A] font-bold">
                        {getProgressPercentage(activeOrd.shipping_status)}% Dispatched
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-[#00F58A] to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(activeOrd.shipping_status)}%` }}
                      />
                    </div>

                    {/* Progress checkpoints */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 text-[#A6B2AA]">
                      <span className="font-semibold text-white">1. Confirmed</span>
                      <span
                        className={
                          ['Processing', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'].includes(
                            activeOrd.shipping_status
                          )
                            ? 'font-semibold text-white'
                            : ''
                        }
                      >
                        2. Processing
                      </span>
                      <span
                        className={
                          ['In Transit', 'Out for Delivery', 'Delivered'].includes(
                            activeOrd.shipping_status
                          )
                            ? 'font-semibold text-white'
                            : ''
                        }
                      >
                        3. In Transit
                      </span>
                      <span
                        className={
                          ['Out for Delivery', 'Delivered'].includes(activeOrd.shipping_status)
                            ? 'font-semibold text-white'
                            : ''
                        }
                      >
                        4. Out for Delivery
                      </span>
                    </div>
                  </div>

                  {/* Quick actions for testing & viewing */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="text-[11px] text-[#A6B2AA]">
                      AWB Consignment: <span className="font-mono text-white">{activeOrd.awb_number}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulateStatusAdvance(activeOrd)}
                        className="px-3 py-1.5 rounded-xl bg-[#00F58A]/15 hover:bg-[#00F58A]/25 text-[#00F58A] text-xs font-bold border border-[#00F58A]/30 flex items-center gap-1.5 transition-all"
                        title="Simulate Next Live Milestone Progression"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Simulate Next Status Step</span>
                      </button>

                      <button
                        onClick={() => setSelectedOrderForTracking(activeOrd)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5"
                      >
                        <Navigation className="w-3 h-3 text-[#00F58A]" />
                        <span>Detailed Checkpoint Map</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter Sub-nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOrderFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                orderFilter === 'all'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-[#A6B2AA] hover:text-white'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setOrderFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                orderFilter === 'active'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-[#A6B2AA] hover:text-white'
              }`}
            >
              In Transit & Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setOrderFilter('delivered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                orderFilter === 'delivered'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-[#A6B2AA] hover:text-white'
              }`}
            >
              Delivered ({deliveredOrders.length})
            </button>
          </div>

          {/* Orders List */}
          {displayedOrders.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
              <Package className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white">No orders found in this filter</p>
              <p className="text-xs text-[#A6B2AA]">
                Shop authentic spices, audio devices, and handloom apparel across Kerala.
              </p>
            </div>
          ) : (
            displayedOrders.map((ord) => (
              <div
                key={ord.id}
                className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4 hover:border-white/20 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-white">
                      {ord.order_number}
                    </span>
                    <span className="text-xs text-[#A6B2AA]">·</span>
                    <span className="text-xs text-[#A6B2AA]">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-[#A6B2AA]">·</span>
                    <span className="text-xs text-[#A6B2AA]">
                      PIN: <span className="font-mono text-white">{ord.shipping_address.pin_code}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                        ord.shipping_status
                      )}`}
                    >
                      {ord.shipping_status}
                    </span>
                    <span className="text-xs text-white/50 font-mono">AWB: {ord.awb_number}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5"
                    >
                      <img
                        src={it.product.images[0]}
                        alt={it.product.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {lang === 'ml' ? it.product.title_ml : it.product.title}
                        </p>
                        <p className="text-[11px] text-[#A6B2AA]">
                          Qty: {it.quantity} · ₹{it.product.price.toLocaleString('en-IN')} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-time Order Tracking Visual Pipeline */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#00F58A] font-semibold">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Live Order Status: {ord.shipping_status}</span>
                    </div>
                    <span className="text-[11px] text-[#A6B2AA]">
                      Carrier: {ord.shipping_carrier}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00F58A] rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(ord.shipping_status)}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Actions & Price */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-[#A6B2AA]">Total Paid: </span>
                    <span className="font-display font-extrabold text-sm text-[#00F58A] tabular-nums">
                      ₹{ord.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[#A6B2AA] ml-2">
                      ({ord.payment_method.replace('_', ' ').toUpperCase()})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Tracking Action */}
                    <button
                      onClick={() => setSelectedOrderForTracking(ord)}
                      className="px-3 py-1.5 rounded-xl bg-[#00F58A]/10 hover:bg-[#00F58A]/20 text-[#00F58A] font-bold flex items-center gap-1.5 border border-[#00F58A]/30 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Track Shipment Live</span>
                    </button>

                    {/* Simulate Status Advance for Testing */}
                    {ord.shipping_status !== 'Delivered' && ord.shipping_status !== 'Cancelled' && (
                      <button
                        onClick={() => handleSimulateStatusAdvance(ord)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] font-semibold border border-white/10"
                        title="Simulate real-time status change"
                      >
                        Advance Step
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const invoiceData = `NEXDROP TAX INVOICE\nOrder: ${ord.order_number}\nCustomer: ${ord.customer_name}\nAddress: ${ord.shipping_address.street}, ${ord.shipping_address.district}, Kerala - ${ord.shipping_address.pin_code}\nSubtotal: INR ₹${ord.subtotal}\nKerala GST: INR ₹${ord.tax_amount}\nDelivery: INR ₹${ord.delivery_charge}\nTotal: INR ₹${ord.total_amount}\nAWB: ${ord.awb_number}`;
                        const blob = new Blob([invoiceData], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Invoice_${ord.order_number}.txt`;
                        a.click();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 border border-white/10"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    {/* Cancel Order Action */}
                    {(ord.shipping_status === 'Pending Payment' ||
                      ord.shipping_status === 'Payment Confirmed' ||
                      ord.shipping_status === 'Accepted') && (
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* Return & Refund Request */}
                    {ord.shipping_status === 'Delivered' && (
                      <button
                        onClick={() => handleOpenRefundModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return / Refund</span>
                      </button>
                    )}

                    <a
                      href={`https://wa.me/919037538732?text=Hello%20NEXDROP%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20order%20${ord.order_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Help</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistProducts.length === 0 ? (
            <div className="col-span-full p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-2">
              <Heart className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white">Your wishlist is empty</p>
              <p className="text-xs text-[#A6B2AA]">Tap the heart icon on any product to save it here.</p>
            </div>
          ) : (
            wishlistProducts.map((p) => (
              <div
                key={p.id}
                className="glass-panel p-4 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex gap-3"
              >
                <img
                  src={p.images[0]}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0 cursor-pointer"
                  onClick={() => onSelectProduct(p)}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => onSelectProduct(p)}
                      className="text-xs font-semibold text-white truncate cursor-pointer hover:text-[#00F58A]"
                    >
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-[#A6B2AA]">{p.seller_district}, Kerala</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-display font-bold text-sm text-[#00F58A]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onAddToCart(p, 1)}
                      className="px-2.5 py-1 rounded-lg bg-[#00F58A] text-black font-bold text-[11px] flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Saved Kerala Delivery Addresses</h2>
              <p className="text-xs text-[#A6B2AA]">
                Stored securely on Google Cloud Firestore with PIN codes and phone details.
              </p>
            </div>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#00F58A] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-white">
                      {addr.type}
                    </span>
                    {addr.is_default && (
                      <span className="px-2 py-0.5 rounded-md bg-[#00F58A]/10 text-[10px] font-bold text-[#00F58A] border border-[#00F58A]/30">
                        Default
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{addr.name}</h4>
                  <p className="text-xs text-[#A6B2AA] mt-1 leading-relaxed">{addr.street}</p>
                  <p className="text-xs text-[#A6B2AA] flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span>{addr.district}, Kerala -</span>
                    <span className="font-mono font-bold text-[#00F58A]">{addr.pin_code}</span>
                    {lookupKeralaPincodeSync(addr.pin_code) && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30 font-medium">
                        📍 {lookupKeralaPincodeSync(addr.pin_code)?.placeName}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-white/70 mt-1 font-mono">{addr.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Returns & Refunds */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Return & Refund Requests</h2>
            <span className="text-xs text-[#A6B2AA]">Processed within 24h</span>
          </div>

          {refunds.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-2">
              <RotateCcw className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white">No active refund requests</p>
              <p className="text-xs text-[#A6B2AA]">All your deliveries are intact and verified.</p>
            </div>
          ) : (
            refunds.map((ref) => (
              <div
                key={ref.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      Order {ref.order_number}
                    </span>
                    <span className="text-xs text-[#A6B2AA]">·</span>
                    <span className="font-display font-extrabold text-sm text-[#00F58A]">
                      ₹{ref.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.status === 'Approved' || ref.status === 'Refunded'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : ref.status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>
                <p className="text-xs text-[#A6B2AA]">Reason: {ref.reason}</p>
                <p className="text-[10px] text-white/40">Initiated on {ref.created_at}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === 'payments' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Payment & Settlement Log</h3>
              <p className="text-xs text-[#A6B2AA]">Razorpay UPI / NetBanking / Kerala COD records</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              100% Encrypted
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {orders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-white">{ord.order_number}</p>
                  <p className="text-[11px] text-[#A6B2AA]">
                    {ord.payment_method.replace('_', ' ').toUpperCase()} · Transaction ID:{' '}
                    <span className="font-mono text-white/60">{ord.payment_transaction_id}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-extrabold text-[#00F58A]">
                    ₹{ord.total_amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-emerald-400 uppercase font-bold">
                    {ord.payment_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return & Refund Request Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-3xl p-6 border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-white">Request Doorstep Return & Refund</h3>
            <p className="text-xs text-[#A6B2AA]">
              Order: <span className="font-mono text-white">{refundModalOrder.order_number}</span> · Refund Amount: ₹{refundModalOrder.total_amount}
            </p>

            <form onSubmit={handleSubmitRefund} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-[#A6B2AA]">Reason for Return</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                >
                  <option value="Damaged or wrong item delivered">Damaged or wrong item delivered</option>
                  <option value="Size/Fitting issue with apparel">Size/Fitting issue with apparel</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Packaging compromised in transit">Packaging compromised in transit</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-[#A6B2AA]">
                <p className="text-white font-medium">Pickup Address:</p>
                <p className="mt-0.5">
                  {refundModalOrder.shipping_address.street}, {refundModalOrder.shipping_address.district} - {refundModalOrder.shipping_address.pin_code}
                </p>
                <p className="text-[10px] text-[#00F58A] mt-1">Kerala reverse courier pickup will be arranged within 48h.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs"
                >
                  Submit Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit PIN Code & Profile Phone Modal (Firebase Connected) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-3xl p-6 border border-[#00F58A]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00F58A]" />
                <h3 className="text-base font-bold text-white">Update Kerala PIN Code & Phone</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A6B2AA]">
              Set your 6-digit postal PIN code for automated Kerala delivery calculation, doorstep logistics, and Firebase profile synchronization.
            </p>

            <form onSubmit={handleSavePinAndProfile} className="space-y-3.5">
              <div>
                <label className="text-xs text-[#A6B2AA] block font-medium">
                  Kerala Postal PIN Code (6 Digits)
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={profilePin}
                    onChange={(e) => handleProfilePinChange(e.target.value)}
                    placeholder="e.g. 682001"
                    className="w-full p-2.5 rounded-xl text-sm font-mono glass-input text-white tracking-widest font-bold"
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-[#00F58A] font-bold">
                    Kerala Zone
                  </span>
                </div>
              </div>

              {/* Identified Kerala Place Card */}
              {profilePlace && profilePlace.isKerala && (
                <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00F58A]" />
                      📍 Place Identified: {profilePlace.placeName}
                    </span>
                    <span className="font-mono text-[11px] text-[#00F58A] font-bold">
                      {profilePlace.pincode}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-1">
                    {profilePlace.district} District
                    {profilePlace.districtMalayalam && ` (${profilePlace.districtMalayalam})`}
                    {profilePlace.talukOrBlock && ` · ${profilePlace.talukOrBlock}`}
                    {' · '}
                    <span className="text-[#00F58A]">{profilePlace.deliverySpeed} Delivery</span>
                  </p>
                  {profilePlace.postOffices && profilePlace.postOffices.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {profilePlace.postOffices.slice(0, 3).map((po, i) => (
                        <span key={i} className="text-[10px] bg-black/40 text-white/80 px-1.5 py-0.5 rounded border border-white/5">
                          📮 {po}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-[#A6B2AA] block font-medium">
                  Contact Mobile Phone
                </label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 9037538732"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#A6B2AA] block font-medium">
                  Kerala District
                </label>
                <select
                  value={profileDistrict}
                  onChange={(e) => setProfileDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                >
                  <option value="Ernakulam">Ernakulam (Kochi Hub)</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram (Capital Hub)</option>
                  <option value="Kozhikode">Kozhikode (Malabar Hub)</option>
                  <option value="Thrissur">Thrissur (Cultural Hub)</option>
                  <option value="Kannur">Kannur</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Kottayam">Kottayam</option>
                  <option value="Alappuzha">Alappuzha</option>
                  <option value="Palakkad">Palakkad</option>
                  <option value="Malappuram">Malappuram</option>
                  <option value="Kollam">Kollam</option>
                  <option value="Pathanamthitta">Pathanamthitta</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Kasaragod">Kasaragod</option>
                </select>
              </div>

              {pinVerificationNotice && (
                <p className="text-xs text-rose-400 font-semibold">{pinVerificationNotice}</p>
              )}

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-[#A6B2AA] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>Google Cloud Firestore Verification</span>
                </div>
                <p>Changes are immediately written to your Firebase User Document ({user.id}).</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFirebase || profilePin.length !== 6}
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isSavingFirebase ? (
                    <span>Syncing Firebase...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save & Sync PIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-3xl p-6 border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-white">Add Kerala Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#A6B2AA]">Street / Building</label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="e.g. 12/A, Skyline Riverfront"
                  className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Kerala PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => handleNewAddressPinChange(e.target.value)}
                    placeholder="682001"
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Identified Kerala Place Feedback */}
              {newAddressPlace && newAddressPlace.isKerala && (
                <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00F58A]" />
                      📍 Place Identified: {newAddressPlace.placeName}
                    </span>
                    <span className="font-mono text-[11px] text-[#00F58A] font-bold">
                      {newAddressPlace.pincode}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-1">
                    {newAddressPlace.district} District
                    {newAddressPlace.districtMalayalam && ` (${newAddressPlace.districtMalayalam})`}
                    {newAddressPlace.talukOrBlock && ` · ${newAddressPlace.talukOrBlock}`}
                    {' · '}
                    <span className="text-[#00F58A]">{newAddressPlace.deliverySpeed} Delivery</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6B2AA]">Address Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl text-xs glass-input bg-[#101411] text-white mt-1"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs"
                >
                  Save Address & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Real-Time Shipment Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-panel-glow max-w-xl w-full rounded-3xl p-6 border border-white/20 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F58A] animate-ping" />
                  <h3 className="text-base font-bold text-white">Live Kerala Shipment Tracking</h3>
                </div>
                <p className="text-xs text-[#A6B2AA] mt-0.5">
                  Order <span className="font-mono text-white">{selectedOrderForTracking.order_number}</span> · Carrier: {selectedOrderForTracking.shipping_carrier}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Consignment Overview Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#A6B2AA]">AWB Consignment Number</span>
                <p className="font-mono font-bold text-[#00F58A] text-sm mt-0.5">
                  {selectedOrderForTracking.awb_number}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[#A6B2AA]">Real-Time Status</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  {selectedOrderForTracking.shipping_status}
                </p>
              </div>
              <div>
                <span className="text-[#A6B2AA]">Destination Kerala PIN</span>
                <p className="font-mono font-semibold text-white mt-0.5">
                  {selectedOrderForTracking.shipping_address.pin_code} ({selectedOrderForTracking.shipping_address.district})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[#A6B2AA]">Recipient Phone</span>
                <p className="font-mono font-semibold text-white mt-0.5">
                  {selectedOrderForTracking.customer_phone}
                </p>
              </div>
            </div>

            {/* Progress Stepper Visual */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A6B2AA]">Delivery Progress</span>
                <span className="font-mono text-xs text-[#00F58A] font-bold">
                  {getProgressPercentage(selectedOrderForTracking.shipping_status)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-[#00F58A] to-cyan-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${getProgressPercentage(selectedOrderForTracking.shipping_status)}%`,
                  }}
                />
              </div>
            </div>

            {/* Step-by-Step Checkpoint Timeline */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Logistics Timeline & Hub Checkpoints
              </h4>
              <div className="space-y-4">
                {selectedOrderForTracking.tracking_timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                        event.completed
                          ? 'bg-[#00F58A] text-black shadow-[0_0_10px_rgba(0,245,138,0.5)]'
                          : 'bg-white/20 text-white/40'
                      }`}
                    >
                      {event.completed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/40" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${event.completed ? 'text-white' : 'text-white/40'}`}>
                        {event.title}
                      </p>
                      <p className="text-[11px] text-[#A6B2AA] mt-0.5">{event.description}</p>
                      <p className="text-[10px] text-[#00F58A]/80 mt-1">
                        Hub Location: {event.location}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/50 shrink-0">{event.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              {selectedOrderForTracking.shipping_status !== 'Delivered' && (
                <button
                  onClick={() => handleSimulateStatusAdvance(selectedOrderForTracking)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#00F58A]/20 hover:bg-[#00F58A]/30 text-[#00F58A] font-bold text-xs border border-[#00F58A]/40 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Advance Status (Simulate)</span>
                </button>
              )}
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className={`${
                  selectedOrderForTracking.shipping_status !== 'Delivered' ? 'w-1/2' : 'w-full'
                } py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15`}
              >
                Close Live Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
