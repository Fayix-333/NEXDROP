import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  MapPin,
  Heart,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { Product, Review } from '../types';
import { NexdropStore } from '../services/storage';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
  onBuyNow: (product: Product, qty: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  lang: 'en' | 'ml';
  initialPin?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  lang,
  initialPin = '682001',
}) => {
  const [selectedQty, setSelectedQty] = useState(1);
  const [pinCode, setPinCode] = useState(initialPin);
  const [pinResult, setPinResult] = useState(() => NexdropStore.checkPinServiceability(initialPin));
  const [reviews, setReviews] = useState<Review[]>(() =>
    NexdropStore.getReviews().filter((r) => r.product_id === product.id)
  );

  // New review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newDistrict, setNewDistrict] = useState('Ernakulam');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleCheckPin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = NexdropStore.checkPinServiceability(pinCode);
    setPinResult(res);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    const added = NexdropStore.addReview({
      product_id: product.id,
      user_id: 'user_cust_default',
      user_name: 'Fayiz Mohammed',
      user_district: newDistrict,
      rating: newRating,
      comment: newComment.trim(),
      is_verified_purchase: true,
    });
    setReviews([added, ...reviews]);
    setNewComment('');
    setSubmittingReview(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-panel-glow rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#A6B2AA]">
            <span>{product.category.toUpperCase()}</span>
            <span>·</span>
            <span>{product.brand}</span>
            <span>·</span>
            <span className="text-[#00F58A] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {product.seller_district}, Kerala
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isWishlisted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Product Media Gallery */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 border border-white/10 relative">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                {product.discount_percent > 0 && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-[#00F58A]/30 text-[#00F58A] font-extrabold text-xs">
                    {product.discount_percent}% OFF
                  </span>
                )}
              </div>

              {/* Verified Seller Trust Box */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A6B2AA]">Sold & Fulfilled by</p>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    {product.seller_name}
                    <ShieldCheck className="w-4 h-4 text-[#00F58A]" />
                  </p>
                  <p className="text-[11px] text-[#A6B2AA] mt-0.5">
                    Registered Merchant · {product.seller_district}, Kerala
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30 text-[11px] font-semibold">
                  GST Verified
                </span>
              </div>
            </div>

            {/* Right: Contiguous Purchase Module */}
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  {lang === 'ml' ? product.title_ml : product.title}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-3 mt-2 text-xs text-[#A6B2AA]">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span>·</span>
                  <span>{product.review_count} verified ratings</span>
                  <span>·</span>
                  <span className="text-[#00F58A] font-semibold">In Stock ({product.stock} units)</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-extrabold text-white tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-base text-[#A6B2AA] line-through tabular-nums">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-[#00F58A] font-bold">
                    You save ₹{(product.original_price - product.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#A6B2AA] mt-1">
                  Inclusive of all Kerala State GST taxes (CGST 9% + SGST 9%)
                </p>
              </div>

              {/* Kerala PIN Code Delivery Checker */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#00F58A]" />
                    Delivery Serviceability Checker
                  </span>
                  <span className="text-[11px] text-[#00F58A]">Kerala Network</span>
                </div>

                <form onSubmit={handleCheckPin} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="flex-1 px-3 py-2 rounded-xl text-xs glass-input placeholder:text-white/40 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-colors"
                  >
                    Check
                  </button>
                </form>

                {pinResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs border ${
                      pinResult.serviceable
                        ? 'bg-[#00F58A]/10 border-[#00F58A]/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    <p className="font-semibold">{pinResult.message}</p>
                    {pinResult.info && (
                      <p className="text-[11px] text-white/70 mt-1">
                        Standard Fee: ₹{pinResult.info.standard_delivery_fee} · Free above ₹
                        {pinResult.info.min_free_delivery_threshold} · Cash on Delivery:{' '}
                        {pinResult.info.cod_allowed ? 'Available' : 'Unavailable'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Buy Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A6B2AA] font-medium">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-white/15 bg-white/5 overflow-hidden">
                    <button
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      className="px-3 py-1.5 text-white/80 hover:bg-white/10 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-white text-xs font-bold tabular-nums">
                      {selectedQty}
                    </span>
                    <button
                      onClick={() => setSelectedQty(Math.min(product.stock, selectedQty + 1))}
                      className="px-3 py-1.5 text-white/80 hover:bg-white/10 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      onAddToCart(product, selectedQty);
                      onClose();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#00F58A]" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      onBuyNow(product, selectedQty);
                      onClose();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,245,138,0.25)] transition-all active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description, Key Features & Specifications */}
          <div className="pt-6 border-t border-white/10 space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">Description</h2>
              <p className="text-sm text-[#A6B2AA] leading-relaxed">
                {lang === 'ml' ? product.description_ml : product.description}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white mb-3">Key Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/90"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00F58A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications Table */}
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-3">Technical Specifications</h2>
              <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 px-4 py-3 text-xs">
                    <span className="text-[#A6B2AA] font-medium">{k}</span>
                    <span className="col-span-2 text-white font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Verified Customer Reviews
                  </h2>
                  <p className="text-xs text-[#A6B2AA]">
                    Reviews from verified buyers across Kerala
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating} / 5.0</span>
                </div>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleAddReview} className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Write a Review</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with delivery speed, product quality in Kerala..."
                  rows={2}
                  className="w-full p-3 rounded-xl text-xs glass-input placeholder:text-white/40 focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs glass-input bg-[#101411] text-white"
                  >
                    <option value="Ernakulam">Ernakulam</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Wayanad">Wayanad</option>
                    <option value="Kannur">Kannur</option>
                  </select>

                  <button
                    type="submit"
                    disabled={submittingReview || !newComment.trim()}
                    className="px-4 py-2 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-bold text-xs disabled:opacity-50 transition-all"
                  >
                    Submit Review
                  </button>
                </div>
                {reviewSuccess && (
                  <p className="text-xs text-[#00F58A] font-semibold">
                    Thank you! Your verified purchase review has been published.
                  </p>
                )}
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[#A6B2AA] py-4 text-center">
                    No reviews yet. Be the first verified purchaser to leave feedback!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{rev.user_name}</span>
                          <span className="text-[10px] text-[#00F58A] font-medium bg-[#00F58A]/10 px-2 py-0.5 rounded-full border border-[#00F58A]/20">
                            Verified Purchase ({rev.user_district})
                          </span>
                        </div>
                        <span className="text-[10px] text-[#A6B2AA]">{rev.created_at}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#A6B2AA] leading-relaxed pt-1">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
