import React from 'react';
import {
  Cpu,
  Shirt,
  ShoppingBag,
  Sparkles,
  Home,
  Zap,
  Footprints,
  Compass,
  Grid,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  lang: 'en' | 'ml';
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Cpu,
  Shirt,
  ShoppingBag,
  Sparkles,
  Home,
  Zap,
  Footprints,
  Compass,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  lang,
}) => {
  return (
    <section className="px-3 sm:px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
            {lang === 'ml' ? 'വിഭാഗങ്ങൾ പ്രകാരം ഷോപ്പ് ചെയ്യുക' : 'Shop by Category'}
          </h2>
          <span className="text-xs text-[#A6B2AA]">
            {categories.length} {lang === 'ml' ? 'വിഭാഗങ്ങൾ' : 'Categories Available'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
          {/* All Categories Button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all snap-start ${
              selectedCategory === 'all'
                ? 'bg-[#00F58A] text-[#050706] shadow-lg shadow-[#00F58A]/20 scale-105'
                : 'glass-panel hover:bg-white/10 text-white/90 border-white/10'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{lang === 'ml' ? 'എല്ലാം' : 'All Departments'}</span>
          </button>

          {/* Individual Category Buttons */}
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || ShoppingBag;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all snap-start ${
                  isSelected
                    ? 'bg-[#00F58A] text-[#050706] shadow-lg shadow-[#00F58A]/20 scale-105'
                    : 'glass-panel hover:bg-white/10 text-white/90 border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#050706]' : 'text-[#00F58A]'}`} />
                <span>{lang === 'ml' ? cat.name_ml : cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {cat.product_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
