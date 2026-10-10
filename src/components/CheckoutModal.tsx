import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertCircle,
  QrCode,
  Banknote,
} from 'lucide-react';
import { CartItem, User, Address, Order, PaymentMethod } from '../types';
import { NexdropStore } from '../services/storage';
import { KERALA_DISTRICTS } from '../data/mockData';
import {
  lookupKeralaPincode,
  lookupKeralaPincodeSync,
  KeralaPlaceInfo,
} from '../services/keralaPincode';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: User;
  couponCode: string;
  appliedDiscount: number;
  onOrderCompleted: (order: Order) => void;
  lang: 'en' | 'ml';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  user,
  couponCode,
  appliedDiscount,
  onOrderCompleted,
  lang,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address & Shipping, 2: Payment, 3: Success Confirmation
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isExpress, setIsExpress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay_upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Address form toggle if adding new
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState(user.default_district || 'Ernakulam');
  const [newAddrPin, setNewAddrPin] = useState('682001');
  const [newAddrPhone, setNewAddrPhone] = useState(user.phone || '+91 9037538732');
  const [detectedNewPlace, setDetectedNewPlace] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync('682001')
  );

  const handleNewPinChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setNewAddrPin(cleaned);
    if (cleaned.length === 6) {
      const syncRes = lookupKeralaPincodeSync(cleaned);
      if (syncRes && syncRes.isKerala) {
        setDetectedNewPlace(syncRes);
        setNewAddrDistrict(syncRes.district);
      }
      try {
        const live = await lookupKeralaPincode(cleaned);
        if (live && live.isKerala) {
          setDetectedNewPlace(live);
          setNewAddrDistrict(live.district);
        }
      } catch (err) {
        // sync handled
      }
    }
  };

  const currentAddress = user.addresses[selectedAddressIndex] || {
    id: 'temp_addr',
    name: user.name,
    phone: newAddrPhone,
    street: newAddrStreet || 'Marine Drive, Kochi',
    district: newAddrDistrict,
    pin_code: newAddrPin,
    is_default: true,
    type: 'Home',
  };

  // Check PIN serviceability
  const pinStatus = NexdropStore.checkPinServiceability(currentAddress.pin_code);

  const subtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const baseDeliveryFee = pinStatus.info ? (subtotal >= pinStatus.info.min_free_delivery_threshold ? 0 : pinStatus.info.standard_delivery_fee) : 50;
  const deliveryCharge = isExpress ? (pinStatus.info?.express_delivery_fee || 90) : baseDeliveryFee;
  const totalAmount = Math.max(0, subtotal + tax + deliveryCharge - appliedDiscount);

  const handleCreateNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrPin) return;
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      name: user.name,
      phone: newAddrPhone,
      street: newAddrStreet,
      district: newAddrDistrict,
      pin_code: newAddrPin,
      is_default: false,
      type: 'Home',
    };
    user.addresses.push(newAddress);
    NexdropStore.saveUser(user);
    setSelectedAddressIndex(user.addresses.length - 1);
    setIsAddingAddress(false);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    // Simulate backend verification and Razorpay/COD authorization
    setTimeout(() => {
      const order = NexdropStore.createOrder({
        customer: user,
        items: cart,
        shipping_address: currentAddress,
        delivery_charge: deliveryCharge,
        coupon_code: couponCode || undefined,
        discount_amount: appliedDiscount,
        payment_method: paymentMethod,
        is_express: isExpress,
      });

      NexdropStore.clearCart();
      setCreatedOrder(order);
      setIsProcessing(false);
      setStep(3);
      onOrderCompleted(order);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F58A]" />
            <h2 className="font-display text-base font-bold text-white">
              {step === 3 ? 'Order Confirmed' : 'NEXDROP Kerala Secure Checkout'}
            </h2>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-Step Checkout Flow */}
        <div className="overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-[#A6B2AA] border-b border-white/5 pb-3">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#00F58A] text-black font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Delivery Address & Courier
                </span>
                <span className="text-white/40">Step 1 of 2</span>
              </div>

              {/* Delivery Address Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Select Kerala Delivery Address</h3>
                  <button
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="text-xs text-[#00F58A] font-semibold hover:underline"
                  >
                    {isAddingAddress ? 'Cancel' : '+ Add New Address'}
                  </button>
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleCreateNewAddress} className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
                    <div>
                      <label className="text-[11px] text-[#A6B2AA]">Street Address / House / Flat</label>
                      <input
                        type="text"
                        required
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        placeholder="e.g. 14/B, Silver Palms, Kaloor"
                        className="w-full p-2.5 rounded-xl text-xs glass-input mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#A6B2AA]">Kerala District</label>
                        <select
                          value={newAddrDistrict}
                          onChange={(e) => setNewAddrDistrict(e.target.value)}
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
                        <label className="text-[11px] text-[#A6B2AA]">6-Digit Kerala PIN Code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddrPin}
                          onChange={(e) => handleNewPinChange(e.target.value)}
                          placeholder="e.g. 682001"
                          className="w-full p-2.5 rounded-xl text-xs glass-input mt-1 font-mono tracking-wider"
                        />
                      </div>
                    </div>

                    {/* Identified Kerala Place Feedback */}
                    {detectedNewPlace && detectedNewPlace.isKerala && (
                      <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00F58A]" />
                            📍 Place Identified: {detectedNewPlace.placeName}
                          </span>
                          <span className="font-mono text-[11px] text-[#00F58A] bg-black/40 px-2 py-0.5 rounded font-bold">
                            {detectedNewPlace.pincode}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/70 mt-1">
                          {detectedNewPlace.district} District
                          {detectedNewPlace.districtMalayalam && ` (${detectedNewPlace.districtMalayalam})`}
                          {detectedNewPlace.talukOrBlock && ` · ${detectedNewPlace.talukOrBlock}`}
                          {' · '}
                          <span className="text-[#00F58A]">{detectedNewPlace.deliverySpeed} Delivery</span>
                        </p>
                        {detectedNewPlace.postOffices && detectedNewPlace.postOffices.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {detectedNewPlace.postOffices.slice(0, 3).map((po, i) => (
                              <span key={i} className="text-[10px] bg-black/40 text-white/80 px-1.5 py-0.5 rounded border border-white/5">
                                📮 {po}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#00F58A] text-black font-bold text-xs"
                    >
                      Save & Use Address
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressIndex === idx
                            ? 'bg-[#00F58A]/10 border-[#00F58A] text-white shadow-lg shadow-[#00F58A]/10'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-[#A6B2AA]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#00F58A]" />
                            {addr.name} ({addr.type})
                          </span>
                          {selectedAddressIndex === idx && (
                            <CheckCircle2 className="w-4 h-4 text-[#00F58A]" />
                          )}
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2">{addr.street}</p>
                        <p className="text-[11px] text-[#A6B2AA] mt-1">
                          {addr.district}, Kerala - <span className="font-mono text-white/90">{addr.pin_code}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Courier Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Select Delivery Speed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsExpress(false)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      !isExpress
                        ? 'bg-[#00F58A]/10 border-[#00F58A]'
                        : 'bg-white/[0.02] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Kerala Standard Courier</span>
                      <span className="text-xs font-semibold text-[#00F58A] tabular-nums">
                        {baseDeliveryFee === 0 ? 'FREE' : `₹${baseDeliveryFee}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A6B2AA]">
                      Delivery in {pinStatus.info?.estimated_days || 2}-3 days via Kerala State Surface Logistics.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      if (pinStatus.info?.express_available) {
                        setIsExpress(true);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !pinStatus.info?.express_available
                        ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5'
                        : isExpress
                        ? 'bg-[#00F58A]/10 border-[#00F58A] cursor-pointer'
                        : 'bg-white/[0.02] border-white/10 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Kerala Express Priority</span>
                      <span className="text-xs font-semibold text-white tabular-nums">
                        ₹{pinStatus.info?.express_delivery_fee || 90}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A6B2AA]">
                      {pinStatus.info?.express_available
                        ? 'Guaranteed 24-hour express courier dispatch from Aluva hub.'
                        : 'Express not available for this rural PIN.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary Strip */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#A6B2AA]">Final Payable</span>
                  <p className="font-display text-xl font-extrabold text-[#00F58A] tabular-nums">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!pinStatus.serviceable}
                  className="px-6 py-3 rounded-xl bg-[#00F58A] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 hover:bg-[#00C875] transition-all disabled:opacity-40"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-[#A6B2AA] border-b border-white/5 pb-3">
                <button
                  onClick={() => setStep(1)}
                  className="font-medium text-white/70 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Address
                </button>
                <span className="font-bold text-white">Step 2: Choose Payment Method</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                {/* Razorpay UPI */}
                <div
                  onClick={() => setPaymentMethod('razorpay_upi')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay_upi'
                      ? 'bg-[#00F58A]/10 border-[#00F58A]'
                      : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Instant UPI via Razorpay</h4>
                        <p className="text-[11px] text-[#A6B2AA]">
                          Google Pay · PhonePe · Paytm · BHIM (Zero gateway fees)
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'razorpay_upi' && (
                      <CheckCircle2 className="w-4 h-4 text-[#00F58A]" />
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div
                  onClick={() => setPaymentMethod('razorpay_card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay_card'
                      ? 'bg-[#00F58A]/10 border-[#00F58A]'
                      : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Credit / Debit Card</h4>
                        <p className="text-[11px] text-[#A6B2AA]">
                          Visa · Mastercard · RuPay · Federal / SBI / HDFC Bank
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'razorpay_card' && (
                      <CheckCircle2 className="w-4 h-4 text-[#00F58A]" />
                    )}
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => {
                    if (pinStatus.info?.cod_allowed) {
                      setPaymentMethod('cod');
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all ${
                    !pinStatus.info?.cod_allowed
                      ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5'
                      : paymentMethod === 'cod'
                      ? 'bg-[#00F58A]/10 border-[#00F58A] cursor-pointer'
                      : 'bg-white/[0.02] border-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Cash on Delivery (Kerala COD)</h4>
                        <p className="text-[11px] text-[#A6B2AA]">
                          {pinStatus.info?.cod_allowed
                            ? 'Pay cash or UPI directly to delivery agent on arrival.'
                            : 'COD unavailable for this specific PIN code.'}
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && (
                      <CheckCircle2 className="w-4 h-4 text-[#00F58A]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Order Itemized Final Bill */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2 text-xs text-[#A6B2AA]">
                <div className="flex justify-between">
                  <span>Items Subtotal ({cart.length} items)</span>
                  <span className="text-white font-medium tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kerala GST (CGST 9% + SGST 9%)</span>
                  <span className="text-white font-medium tabular-nums">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kerala Delivery Fee</span>
                  <span className="text-white font-medium tabular-nums">
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#00F58A]">
                    <span>Coupon Savings ({couponCode})</span>
                    <span className="font-bold tabular-nums">-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="font-display text-base text-[#00F58A] tabular-nums">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,245,138,0.3)] transition-all active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Kerala Payment Gateway...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 fill-black text-[#00F58A]" />
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} & Confirm Order</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 3 && createdOrder && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#00F58A]/20 border border-[#00F58A] text-[#00F58A] flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(0,245,138,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#00F58A] uppercase tracking-wider">
                  Payment Confirmed · Gateway Verified
                </span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">
                  Thank You for Shopping on NEXDROP!
                </h3>
                <p className="text-xs text-[#A6B2AA] mt-1">
                  Order <span className="font-mono text-white font-bold">{createdOrder.order_number}</span> has been routed to our Kerala fulfillment center.
                </p>
              </div>

              {/* Live Tracking Card */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div>
                    <span className="text-[11px] text-[#A6B2AA]">Carrier & AWB</span>
                    <p className="text-xs font-bold text-white">{createdOrder.shipping_carrier}</p>
                    <p className="text-[10px] font-mono text-[#00F58A]">{createdOrder.awb_number}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#A6B2AA]">Status</span>
                    <p className="text-xs font-bold text-[#00F58A]">{createdOrder.shipping_status}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 pt-1">
                  {createdOrder.tracking_timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          event.completed ? 'bg-[#00F58A]' : 'bg-white/20'
                        }`}
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${event.completed ? 'text-white' : 'text-white/40'}`}>
                          {event.title}
                        </p>
                        <p className="text-[11px] text-[#A6B2AA]">{event.description}</p>
                      </div>
                      <span className="text-[10px] text-white/50">{event.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const invoiceData = `NEXDROP TAX INVOICE\nOrder: ${createdOrder.order_number}\nDate: ${new Date().toLocaleDateString()}\nCustomer: ${createdOrder.customer_name}\nAddress: ${createdOrder.shipping_address.street}, ${createdOrder.shipping_address.district}, Kerala - ${createdOrder.shipping_address.pin_code}\nTotal Amount: INR ₹${createdOrder.total_amount}\nPayment: ${createdOrder.payment_method}\nTransaction ID: ${createdOrder.payment_transaction_id}\n\nGSTIN: 32AABCN9988Z1Z5 (Kerala State Tax Registered)`;
                    const blob = new Blob([invoiceData], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Invoice_${createdOrder.order_number}.txt`;
                    a.click();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-[#00F58A]" />
                  <span>Download GST Invoice</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-bold text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
