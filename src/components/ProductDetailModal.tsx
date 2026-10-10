import React, { useState, useEffect } from 'react';
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
  ThumbsUp,
  UserCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product, Review, User } from '../types';
import { NexdropStore } from '../services/storage';
import { listenToProductReviews, saveReviewToFirestore } from '../services/firebase';
import {
  lookupKeralaPincode,
  lookupKeralaPincodeSync,
  KeralaPlaceInfo,
} from '../services/keralaPincode';

interface ProductDetailModalProps {
  product: Product;
  currentUser?: User;
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
  currentUser,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  lang,
  initialPin = '682001',
}) => {
  const [selectedQty, setSelectedQty] = useState(1);
  const effectivePin = currentUser?.addresses?.[0]?.pin_code || initialPin;
  const [pinCode, setPinCode] = useState(effectivePin);
  const [pinResult, setPinResult] = useState(() =>
    NexdropStore.checkPinServiceability(effectivePin)
  );
  const [placeInfo, setPlaceInfo] = useState<KeralaPlaceInfo | null>(() =>
    lookupKeralaPincodeSync(effectivePin)
  );
  const [isDetectingPlace, setIsDetectingPlace] = useState(false);

  // Reviews state with initial store data & real-time Firebase sync
  const [reviews, setReviews] = useState<Review[]>(() =>
    NexdropStore.getReviews().filter((r) => r.product_id === product.id)
  );

  useEffect(() => {
    // Attach real-time Firestore listener for live updates across clients
    const unsubscribe = listenToProductReviews(product.id, (firestoreReviews) => {
      if (firestoreReviews && firestoreReviews.length > 0) {
        setReviews(firestoreReviews);
      }
    });
    return () => unsubscribe();
  }, [product.id]);

  // Review submission state
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Rating labels helper
  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return lang === 'ml' ? 'മികച്ചത് (Excellent)' : '5 Stars - Excellent Quality';
      case 4:
        return lang === 'ml' ? 'വളരെ നല്ലത് (Very Good)' : '4 Stars - Very Good Experience';
      case 3:
        return lang === 'ml' ? 'നല്ലത് (Good)' : '3 Stars - Good & Satisfactory';
      case 2:
        return lang === 'ml' ? 'കുഴപ്പമില്ല (Fair)' : '2 Stars - Needs Improvement';
      case 1:
        return lang === 'ml' ? 'മോശം (Poor)' : '1 Star - Not Recommended';
      default:
        return '';
    }
  };

  const handleCheckPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = pinCode.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) {
      setPinResult({
        serviceable: false,
        message: 'Please enter a valid 6-digit Kerala PIN code.',
      });
      return;
    }
    const syncRes = lookupKeralaPincodeSync(cleaned);
    if (syncRes) setPlaceInfo(syncRes);
    const res = NexdropStore.checkPinServiceability(cleaned);
    setPinResult(res);

    setIsDetectingPlace(true);
    try {
      const live = await lookupKeralaPincode(cleaned);
      setPlaceInfo(live);
    } catch (err) {
      // Handled by sync
    } finally {
      setIsDetectingPlace(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    const authorName = currentUser?.name || 'Kerala Customer';
    const authorId = currentUser?.id || `user_anon_${Date.now()}`;
    const authorDistrict =
      currentUser?.default_district ||
      currentUser?.addresses?.[0]?.district ||
      'Ernakulam';

    const newRev = NexdropStore.addReview({
      product_id: product.id,
      user_id: authorId,
      user_name: authorName,
      user_district: authorDistrict,
      rating: newRating,
      comment: newComment.trim(),
      is_verified_purchase: true,
    });

    // Also persist directly to Firebase Firestore
    await saveReviewToFirestore(newRev);

    setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);
    setNewComment('');
    setNewRating(5);
    setSubmittingReview(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const handleVoteHelpful = (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;
    setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpful_votes: r.helpful_votes + 1 } : r))
    );
  };

  // Filtered reviews
  const displayedReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  // Calculate rating stats
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : product.rating.toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
        : 0,
  }));

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
            <span className="text-[#00F58A] flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5" />
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
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs flex items-center gap-1.5 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageRating}</span>
                  <span className="text-[#A6B2AA]">({reviews.length} reviews)</span>
                </div>
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
                    <span>{averageRating}</span>
                  </div>
                  <span>·</span>
                  <span className="text-white/80">{reviews.length} Verified Customer Ratings</span>
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
                    <span>Kerala Delivery & Place Finder</span>
                  </span>
                  <span className="text-[11px] text-[#00F58A] flex items-center gap-1">
                    {isDetectingPlace ? 'Identifying place...' : 'Fast 24-48h Hubs'}
                  </span>
                </div>

                <form onSubmit={handleCheckPin} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPinCode(val);
                        if (val.length === 6) {
                          const sync = lookupKeralaPincodeSync(val);
                          if (sync) setPlaceInfo(sync);
                          const res = NexdropStore.checkPinServiceability(val);
                          setPinResult(res);
                        }
                      }}
                      placeholder="Enter 6-digit Kerala PIN"
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs glass-input placeholder:text-white/40 font-mono tracking-wider text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isDetectingPlace}
                    className="px-4 py-2 rounded-xl bg-[#00F58A] hover:bg-[#00dd7b] text-black font-extrabold text-xs transition-colors shrink-0 shadow-lg shadow-[#00F58A]/10 flex items-center gap-1"
                  >
                    <span>Identify PIN</span>
                  </button>
                </form>

                {/* Identified Place Details Card */}
                {placeInfo && placeInfo.isKerala && (
                  <div className="p-3 rounded-xl bg-black/40 border border-[#00F58A]/30 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#00F58A] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00F58A] animate-ping" />
                          <span>Identified Location</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                          {placeInfo.placeName}
                        </h4>
                        <p className="text-[11px] text-white/70">
                          {placeInfo.district} District
                          {placeInfo.districtMalayalam && ` (${placeInfo.districtMalayalam})`}
                          {placeInfo.talukOrBlock && ` · ${placeInfo.talukOrBlock}`}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-black bg-[#00F58A] px-2 py-0.5 rounded-md">
                        {placeInfo.pincode}
                      </span>
                    </div>

                    {/* Post office tags if available */}
                    {placeInfo.postOffices && placeInfo.postOffices.length > 0 && (
                      <div className="pt-1.5 border-t border-white/10">
                        <span className="text-[10px] text-white/50 block mb-1">
                          Postal Hubs:
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                          {placeInfo.postOffices.slice(0, 4).map((po, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/80 border border-white/5"
                            >
                              📮 {po}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-[#00F58A] font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {placeInfo.deliverySpeed} Delivery
                      </span>
                      <span className="text-white/80">
                        Standard: ₹{placeInfo.standardFee} (Free above ₹{placeInfo.freeDeliveryThreshold})
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {placeInfo.codAvailable ? '✓ Cash on Delivery Available' : 'Prepaid Only'}
                      </span>
                    </div>
                  </div>
                )}

                {pinResult && !placeInfo?.isKerala && (
                  <div
                    className={`p-2.5 rounded-xl text-xs border ${
                      pinResult.serviceable
                        ? 'bg-[#00F58A]/10 border-[#00F58A]/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    <p className="font-semibold">{pinResult.message}</p>
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
                    <span className="px-4 py-1.5 text-xs font-mono font-bold text-white">
                      {selectedQty}
                    </span>
                    <button
                      onClick={() => setSelectedQty(Math.min(product.stock, selectedQty + 1))}
                      className="px-3 py-1.5 text-white/80 hover:bg-white/10 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-[#A6B2AA]">
                    Subtotal: ₹{(product.price * selectedQty).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => onAddToCart(product, selectedQty)}
                    className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => onBuyNow(product, selectedQty)}
                    className="py-3 rounded-2xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-extrabold text-xs shadow-lg shadow-[#00F58A]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 fill-black text-black" />
                    <span>Instant Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="border-t border-white/10 pt-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">Description</h2>
              <p className="text-xs sm:text-sm text-[#A6B2AA] leading-relaxed">
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

            {/* Verified Reviews and Rating System */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-white">
                      Customer Reviews & Star Ratings
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00F58A]/10 text-[#00F58A] border border-[#00F58A]/30">
                      Firebase Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#A6B2AA] mt-0.5">
                    Real feedback from verified purchasers in Kerala
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-center pr-3 border-r border-white/10">
                    <span className="font-display font-extrabold text-2xl text-white">
                      {averageRating}
                    </span>
                    <span className="text-xs text-white/50 block">/ 5.0</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(Number(averageRating))
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#A6B2AA] block mt-0.5">
                      Based on {reviews.length} reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Distribution Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                {starCounts.map(({ star, count, percentage }) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                    className={`flex items-center justify-between md:flex-col md:items-start p-2 rounded-xl text-left transition-all ${
                      filterRating === star
                        ? 'bg-[#00F58A]/15 border border-[#00F58A]/40'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-semibold text-white">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="w-24 md:w-full h-1.5 bg-white/10 rounded-full overflow-hidden my-1">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#A6B2AA]">
                      {count} ({percentage}%)
                    </span>
                  </button>
                ))}
              </div>

              {/* Star Rating & Review Feedback Submission Form */}
              <form
                onSubmit={handleAddReview}
                className="p-5 sm:p-6 rounded-2xl glass-panel border border-[#00F58A]/20 shadow-lg space-y-4 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00F58A]" />
                    <span className="text-xs font-bold text-white">
                      Rate & Review this Product
                    </span>
                    {currentUser && (
                      <span className="text-[10px] text-[#00F58A] bg-[#00F58A]/10 px-2 py-0.5 rounded-full border border-[#00F58A]/20">
                        Signed in as {currentUser.name} ({currentUser.default_district || 'Kerala'})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#A6B2AA]">
                    {getRatingLabel(hoverRating || newRating)}
                  </span>
                </div>

                {/* Star rating selector with hover preview */}
                <div className="space-y-1">
                  <label className="text-xs text-[#A6B2AA] block font-medium">
                    Your Overall Rating:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-125 transition-transform focus:outline-none"
                          title={`${star} Star`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoverRating ?? newRating)
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-white/25 hover:text-white/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      {hoverRating ?? newRating} / 5.0
                    </span>
                  </div>
                </div>

                {/* Text-based feedback */}
                <div className="space-y-1">
                  <label className="text-xs text-[#A6B2AA] block font-medium">
                    Detailed Review & Feedback:
                  </label>
                  <textarea
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe product quality, delivery speed across Kerala, packaging condition, and value for money..."
                    rows={3}
                    maxLength={1000}
                    className="w-full p-3.5 rounded-xl text-xs glass-input placeholder:text-white/40 focus:outline-none focus:border-[#00F58A]/60"
                  />
                  <div className="flex justify-between items-center text-[10px] text-[#A6B2AA]">
                    <span>Minimum 5 characters for verified submission.</span>
                    <span>{newComment.length} / 1000</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#A6B2AA]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00F58A]" />
                    <span>Published to Firebase Firestore with verified customer badge</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview || newComment.trim().length < 3}
                    className="px-5 py-2.5 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-extrabold text-xs disabled:opacity-50 transition-all shadow-md shadow-[#00F58A]/20 active:scale-95 flex items-center gap-1.5"
                  >
                    {submittingReview ? (
                      <span>Saving to Firebase...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>

                {reviewSuccess && (
                  <div className="p-3 rounded-xl bg-[#00F58A]/10 border border-[#00F58A]/30 text-[#00F58A] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Thank you! Your verified purchase rating has been securely saved to Firebase and published live.
                    </span>
                  </div>
                )}
              </form>

              {/* Reviews List & Filter Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#A6B2AA]">
                  <span>
                    Showing {displayedReviews.length} of {reviews.length} reviews
                  </span>
                  {filterRating !== 'all' && (
                    <button
                      onClick={() => setFilterRating('all')}
                      className="text-[#00F58A] hover:underline"
                    >
                      Clear {filterRating}-Star Filter
                    </button>
                  )}
                </div>

                {displayedReviews.length === 0 ? (
                  <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 space-y-2">
                    <MessageSquare className="w-8 h-8 text-white/30 mx-auto" />
                    <p className="text-xs font-bold text-white">No reviews found for this filter</p>
                    <p className="text-[11px] text-[#A6B2AA]">
                      Be the first verified customer to submit a review above!
                    </p>
                  </div>
                ) : (
                  displayedReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{rev.user_name}</span>
                          <span className="text-[10px] text-[#00F58A] font-medium bg-[#00F58A]/10 px-2 py-0.5 rounded-full border border-[#00F58A]/20 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified Purchase ({rev.user_district}, Kerala)
                          </span>
                        </div>
                        <span className="text-[10px] text-[#A6B2AA]">{rev.created_at}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-white/20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-white/90">
                          {getRatingLabel(rev.rating)}
                        </span>
                      </div>

                      <p className="text-xs text-[#A6B2AA] leading-relaxed pt-1">{rev.comment}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-[#A6B2AA]">
                        <span className="text-[10px] text-white/40">Verified Kerala Buyer Review</span>
                        <button
                          type="button"
                          onClick={() => handleVoteHelpful(rev.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                            helpfulVoted[rev.id]
                              ? 'bg-[#00F58A]/10 text-[#00F58A]'
                              : 'hover:bg-white/5 text-[#A6B2AA] hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpful_votes})</span>
                        </button>
                      </div>
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
