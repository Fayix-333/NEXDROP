import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  lang: 'en' | 'ml';
  district: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  lang,
  district,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const defaultPhone = '919847012345'; // Configured Kerala support desk number

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim() || `Hello NEXDROP Kerala Support, I need assistance in ${district}.`;
    const url = `https://wa.me/${defaultPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <div className="mb-3 w-80 glass-panel-glow rounded-3xl p-4 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">NEXDROP Kerala Desk</p>
                <p className="text-[10px] text-[#00F58A]">Online · Typically replies in 2m</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/60 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-[#A6B2AA] mb-3 leading-relaxed">
            {lang === 'ml'
              ? `നമസ്കാരം! ${district} ഓർഡറുകൾ, ഡെലിവറി സംശയങ്ങൾ എന്നിവയ്ക്ക് ഞങ്ങളുമായി നേരിട്ട് ചാറ്റ് ചെയ്യാം.`
              : `Hi there! Have questions about delivery in ${district}, order tracking, or local Kerala seller products? Chat with our team directly.`}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-xl text-xs glass-input text-white placeholder:text-white/40"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#00F58A] hover:bg-[#00C875] text-black font-bold transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-tr from-emerald-600 to-[#00F58A] text-black font-extrabold text-xs shadow-[0_0_25px_rgba(0,245,138,0.35)] hover:scale-105 active:scale-95 transition-all"
        title="WhatsApp Support for Kerala"
      >
        <MessageCircle className="w-4 h-4 fill-black" />
        <span className="hidden sm:inline">WhatsApp Support</span>
      </button>
    </div>
  );
};
