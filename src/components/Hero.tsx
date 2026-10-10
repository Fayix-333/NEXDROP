import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Truck, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface HeroProps {
  lang: 'en' | 'ml';
  onShopNow: () => void;
  onExploreCategories: () => void;
  selectedDistrict: string;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onShopNow,
  onExploreCategories,
  selectedDistrict,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="relative px-3 sm:px-6 pt-2 pb-8 sm:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-2xl min-h-[480px] sm:min-h-[540px] flex items-center">
          {/* Background Generated Hero Imagery */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/hero_nexdrop_kerala_1791605686596.jpg"
              alt="NEXDROP Liquid Glass Marketplace showcase"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
            />
            {/* Liquid Glass Gradients & Vignette Scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050706] via-[#050706]/85 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-transparent to-transparent z-10" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00F58A]/15 rounded-full blur-[100px] pointer-events-none z-10" />
          </div>

          {/* Hero Content */}
          <div className="relative z-20 max-w-2xl px-6 sm:px-12 py-12">
            {/* Official Brand Identity on Front Page */}
            <div className="flex items-center gap-3.5 mb-5">
              <img
                src="/logo.jpg"
                alt="NEXDROP Kerala Official Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-black border border-[#00F58A]/50 p-1 shadow-[0_0_30px_rgba(0,245,138,0.35)] shrink-0"
              />
              <div className="inline-flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#00F58A]/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#00F58A] animate-pulse" />
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    {lang === 'ml'
                      ? `ഡെലിവറി: ${selectedDistrict}`
                      : `Official Kerala Commerce · Delivery to ${selectedDistrict}`}
                  </span>
                </div>
                <span className="text-[11px] text-[#00F58A] font-semibold mt-1 tracking-wider uppercase font-mono">
                  NEXDROP — Kerala E-Commerce Marketplace
                </span>
              </div>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-4 text-balance">
              {lang === 'ml' ? (
                <>
                  കേരളത്തിന്റെ ഔദ്യോഗിക{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F58A] to-[#00C875]">
                    ഷോപ്പിംഗ് പ്ലാറ്റ്ഫോം.
                  </span>
                </>
              ) : (
                <>
                  The Official Marketplace{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F58A] to-[#00C875]">
                    of Kerala.
                  </span>
                </>
              )}
            </h1>

            {/* Supporting Prose */}
            <p className="text-sm sm:text-base text-[#A6B2AA] mb-8 max-w-xl leading-relaxed">
              {lang === 'ml'
                ? 'വയനാടൻ മലയോര സുഗന്ധവ്യഞ്ജനങ്ങൾ, ബാലരാമപുരം കൈത്തറികൾ, ഓട്ടുപാത്രങ്ങൾ എന്നിവ പൂർണ്ണ സുരക്ഷിതത്വത്തോടെ കേരളത്തിലെവിടെയും 24-48 മണിക്കൂറിനുള്ളിൽ എത്തിക്കുന്നു.'
                : 'Directly connecting consumers across all 14 Kerala districts to verified regional producers, handloom cooperatives, and authentic consumer electronics with verified courier tracking.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <button
                onClick={onShopNow}
                className="px-6 py-3.5 rounded-2xl bg-[#00F58A] hover:bg-[#00C875] text-[#050706] font-extrabold text-sm flex items-center gap-2 shadow-[0_0_30px_rgba(0,245,138,0.3)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>{t.shopNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreCategories}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95"
              >
                {t.exploreCategories}
              </button>
            </div>

            {/* Trust Markers Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <p className="font-display font-bold text-lg sm:text-xl text-white tabular-nums">
                  14
                </p>
                <p className="text-[11px] text-[#A6B2AA] uppercase tracking-wider font-semibold">
                  Districts Covered
                </p>
              </div>
              <div>
                <p className="font-display font-bold text-lg sm:text-xl text-[#00F58A] tabular-nums">
                  24–48h
                </p>
                <p className="text-[11px] text-[#A6B2AA] uppercase tracking-wider font-semibold">
                  SpeedPost Transit
                </p>
              </div>
              <div>
                <p className="font-display font-bold text-lg sm:text-xl text-white tabular-nums">
                  100%
                </p>
                <p className="text-[11px] text-[#A6B2AA] uppercase tracking-wider font-semibold">
                  GST Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
