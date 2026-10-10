import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { CartItem } from '../types';
import { NexdropStore } from '../services/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onProceedCheckout: () => void;
  couponCode: string;
  setCouponCode: (c: string) => void;
  appliedDiscount: number;
  setAppliedDiscount: (d: number) => void;
  lang: 'en' | 'ml';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onProceedCheckout,
  couponCode,
  setCouponCode,
  appliedDiscount,
  setAppliedDiscount,
  lang,
}) => {
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const estimatedTax = Math.round(subtotal * 0.18);
  const total = Math.max(0, subtotal + estimatedTax - appliedDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = NexdropStore.validateCoupon(couponInput, subtotal);
    if (res.valid) {
      setCouponCode(couponInput.toUpperCase());
      setAppliedDiscount(res.discount);
      setCouponMsg({ text: res.message, error: false });
    } else {
      setCouponMsg({ text: res.message, error: true });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedDiscount(0);
    setCouponInput('');
    setCouponMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full glass-panel-glow border-l border-white/15 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#00F58A]" />
            <h2 className="font-display text-base font-bold text-white">Your Shopping Cart</h2>
            <span className="text-xs text-[#A6B2AA]">({cart.length} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-semibold text-white text-base">Your cart is empty</p>
              <p className="text-xs text-[#A6B2AA] max-w-xs">
                Browse our curated selection of Kerala handloom, Wayanad spices, and next-gen audio devices.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#00F58A] text-black font-bold text-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate">
                      {lang === 'ml' ? item.product.title_ml : item.product.title}
                    </h4>
                    <p className="text-[11px] text-[#A6B2AA]">
                      ₹{item.product.price.toLocaleString('en-IN')}{' '}
                      <span className="text-white/40">· {item.product.seller_district}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center rounded-lg border border-white/15 bg-white/5 overflow-hidden">
                      <button
                        onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
                        className="px-2 py-0.5 text-white/70 hover:bg-white/10 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-white text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                        className="px-2 py-0.5 text-white/70 hover:bg-white/10 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onUpdateQty(item.product_id, 0)}
                      className="text-white/40 hover:text-rose-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Coupon, Summary & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-white/10 space-y-4 shrink-0 bg-[#0A0E0B]/80 backdrop-blur-xl">
            {/* Coupon Section */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-xs">
                  <div className="flex items-center gap-1.5 text-[#00F58A] font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Applied: {couponCode} (-₹{appliedDiscount})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-white/60 hover:text-white underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon (e.g. KERALA100, NEXDROPNEW)"
                    className="flex-1 px-3 py-2 rounded-xl text-xs glass-input placeholder:text-white/40 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponMsg && (
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    couponMsg.error ? 'text-red-400' : 'text-[#00F58A]'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#A6B2AA]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-white font-semibold tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kerala GST (CGST 9% + SGST 9%)</span>
                <span className="text-white font-semibold tabular-nums">
                  ₹{estimatedTax.toLocaleString('en-IN')}
                </span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-[#00F58A]">
                  <span>Promotional Savings</span>
                  <span className="font-bold tabular-nums">-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Estimated Total</span>
                <span className="font-display text-base text-[#00F58A] tabular-nums">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,245,138,0.25)] transition-all hover:scale-[1.01] active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
