import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, MapPin, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  lang: 'en' | 'ml';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  lang,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col rounded-3xl glass-panel glass-panel-hover overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-white/10"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0D0B]">
        {imageLoaded ? (
          <img
            src={product.images[0]}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#121613] to-[#0A0D0B] text-[#A6B2AA]">
            <ShoppingBag className="w-8 h-8 text-[#00F58A]/60 mb-2" />
            <span className="text-xs text-center font-medium">{product.title}</span>
          </div>
        )}

        {/* Liquid Glass Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101411] via-transparent to-transparent opacity-80" />

        {/* Top Badges: Discount & Kerala Origin */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.discount_percent > 0 ? (
            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[#00F58A] font-extrabold text-[11px] tabular-nums">
              {product.discount_percent}% OFF
            </span>
          ) : <span />}

          {/* Wishlist Button (Interactive) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-all ${
              isWishlisted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70 border border-white/10'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#00F58A]" />
            <span className="text-[11px] font-medium hidden sm:inline">Quick View</span>
          </span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#A6B2AA] mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#00F58A]">
              {product.brand}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[10px] text-white/80 font-medium">
              <MapPin className="w-3 h-3 text-[#00F58A]" />
              Authorized {product.seller_district} Hub
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#00F58A] transition-colors line-clamp-2 leading-snug">
            {lang === 'ml' ? product.title_ml : product.title}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mt-2 text-xs text-[#A6B2AA]">
            <div className="flex items-center gap-1 text-amber-400 font-bold tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
            <span aria-hidden="true">·</span>
            <span>({product.review_count} verified ratings)</span>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-base sm:text-lg text-white tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price > product.price && (
                <span className="text-xs text-[#A6B2AA] line-through tabular-nums">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/50 font-medium">
              Incl. State & Central GST · {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isAdded
                ? 'bg-[#00F58A] text-black shadow-lg shadow-[#00F58A]/30'
                : 'bg-white/10 hover:bg-[#00F58A] text-white hover:text-black border border-white/15'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
