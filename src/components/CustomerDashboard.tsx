import React, { useState } from 'react';
import {
  Package,
  MapPin,
  Heart,
  RotateCcw,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { Order, User, Product, OrderStatus } from '../types';
import { NexdropStore } from '../services/storage';

interface CustomerDashboardProps {
  user: User;
  onSelectProduct: (p: Product) => void;
  lang: 'en' | 'ml';
  onBackToStore: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  onSelectProduct,
  lang,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>(() =>
    NexdropStore.getOrders().filter((o) => o.customer_id === user.id)
  );
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [statusActionMsg, setStatusActionMsg] = useState<string | null>(null);

  const wishlistProducts = NexdropStore.getProducts().filter((p) =>
    user.wishlist.includes(p.id)
  );

  const handleCancelOrder = (orderId: string) => {
    NexdropStore.updateOrderStatus(orderId, 'Cancelled', 'Customer requested cancellation before dispatch.');
    setOrders(NexdropStore.getOrders().filter((o) => o.customer_id === user.id));
    setStatusActionMsg('Order cancellation submitted successfully.');
    setTimeout(() => setStatusActionMsg(null), 3000);
  };

  const handleRequestReturn = (orderId: string) => {
    NexdropStore.updateOrderStatus(orderId, 'Return Requested', 'Customer initiated 7-day doorstep return in Kerala.');
    setOrders(NexdropStore.getOrders().filter((o) => o.customer_id === user.id));
    setStatusActionMsg('Return requested! Our Kerala reverse-courier partner will contact you.');
    setTimeout(() => setStatusActionMsg(null), 3000);
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
              {user.email} · {user.phone} · Delivering to {user.default_district}, Kerala
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wishlist'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'addresses'
              ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/20'
              : 'text-[#A6B2AA] hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({user.addresses.length})</span>
        </button>
      </div>

      {statusActionMsg && (
        <div className="p-3.5 rounded-2xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold animate-in fade-in">
          {statusActionMsg}
        </div>
      )}

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
              <Package className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white">No active orders found</p>
              <p className="text-xs text-[#A6B2AA]">
                Shop authentic spices, audio devices, and handloom apparel across Kerala.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
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
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
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
                    {/* View Tracking Button */}
                    <button
                      onClick={() => setSelectedOrderForTracking(ord)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-1.5 border border-white/10"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#00F58A]" />
                      <span>Track Shipment</span>
                    </button>

                    {/* Download Invoice */}
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

                    {/* Cancel / Return Actions */}
                    {ord.shipping_status === 'Payment Confirmed' && (
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30"
                      >
                        Cancel Order
                      </button>
                    )}

                    {ord.shipping_status === 'Delivered' && (
                      <button
                        onClick={() => handleRequestReturn(ord.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
                    )}

                    {/* Kerala WhatsApp support for order */}
                    <a
                      href={`https://wa.me/919847012345?text=Hello%20NEXDROP%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20order%20${ord.order_number}`}
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
                onClick={() => onSelectProduct(p)}
                className="glass-panel p-4 rounded-3xl border border-white/10 hover:border-white/20 transition-all cursor-pointer flex gap-3"
              >
                <img
                  src={p.images[0]}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate">{p.title}</h4>
                    <p className="text-[11px] text-[#A6B2AA]">{p.seller_district}, Kerala</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-display font-bold text-sm text-[#00F58A]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-white/60">View details →</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.addresses.map((addr) => (
            <div
              key={addr.id}
              className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00F58A]" />
                  {addr.name} ({addr.type})
                </span>
                {addr.is_default && (
                  <span className="px-2 py-0.5 rounded-full bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30 text-[10px] font-bold">
                    Primary Address
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80">{addr.street}</p>
              <p className="text-xs text-[#A6B2AA]">
                District: <span className="text-white font-medium">{addr.district}</span> · PIN:{' '}
                <span className="font-mono text-white">{addr.pin_code}</span>
              </p>
              <p className="text-[11px] text-[#A6B2AA]">Phone: {addr.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-lg w-full rounded-3xl p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Live Kerala Shipment Tracking</h3>
                <p className="text-xs text-[#A6B2AA]">
                  Order: <span className="font-mono text-white">{selectedOrderForTracking.order_number}</span> · Carrier: {selectedOrderForTracking.shipping_carrier}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-[#A6B2AA]">AWB Consignment Number</span>
                <p className="font-mono font-bold text-[#00F58A]">{selectedOrderForTracking.awb_number}</p>
              </div>
              <div className="text-right">
                <span className="text-[#A6B2AA]">Current Status</span>
                <p className="font-bold text-white">{selectedOrderForTracking.shipping_status}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pt-2">
              {selectedOrderForTracking.tracking_timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                      event.completed
                        ? 'bg-[#00F58A] ring-4 ring-[#00F58A]/20'
                        : 'bg-white/20'
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`font-bold ${event.completed ? 'text-white' : 'text-white/40'}`}>
                      {event.title}
                    </p>
                    <p className="text-[11px] text-[#A6B2AA]">{event.description}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Location: {event.location}</p>
                  </div>
                  <span className="text-[10px] text-white/50">{event.timestamp}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
