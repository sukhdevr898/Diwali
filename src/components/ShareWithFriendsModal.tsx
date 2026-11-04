import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageCircle, 
  Send, 
  Gift, 
  Trophy, 
  X, 
  Sparkles,
  Users,
  Award
} from 'lucide-react';

interface ShareWithFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  ticketCount?: number;
}

const STORAGE_KEY = 'mahabumper_shared_friends_count';
const MAX_TARGET = 10;

export const ShareWithFriendsModal: React.FC<ShareWithFriendsModalProps> = ({
  isOpen,
  onClose,
  orderId,
  ticketCount,
}) => {
  const [shareCount, setShareCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Math.min(parseInt(saved, 10), MAX_TARGET) : 0;
    } catch {
      return 0;
    }
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(shareCount));
    } catch {
      // ignore
    }
  }, [shareCount]);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  const shareText = `🎉 मैंने Mahabumper Lucky Draw में ₹49 का टिकट खरीदा है! 1st प्राइज ₹2,50,000 Cash + 10g Gold Coin है।\n\nआप भी अपना लक आज़माओ सिर्फ ₹49 में 👇\n${appUrl}`;

  const handleIncrementShare = () => {
    setShareCount(prev => Math.min(prev + 1, MAX_TARGET));
  };

  const handleWhatsAppShare = () => {
    handleIncrementShare();
    const encoded = encodeURIComponent(shareText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    handleIncrementShare();
    const encodedText = encodeURIComponent(shareText);
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    handleIncrementShare();
    navigator.clipboard.writeText(`${shareText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const progressPercent = Math.round((shareCount / MAX_TARGET) * 100);
  const isComplete = shareCount >= MAX_TARGET;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header Pattern */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
            <Gift className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-['Cinzel'] tracking-tight">
            Share with 10 Friends
          </h3>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            10 दोस्तों को शेयर करें और पाएं <strong>VIP Lucky Bonus Badge</strong> व एक्स्ट्रा लकी एंट्री का मौका!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Recent Ticket Info if bought */}
          {ticketCount && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  आपका टिकट सफलतापूर्वक बुक हो गया! <strong>({ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'})</strong>
                </span>
              </div>
              {orderId && (
                <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-md font-bold">
                  {orderId.slice(-6)}
                </span>
              )}
            </div>
          )}

          {/* Progress Tracker Bar */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-4 h-4 text-amber-600" />
                Friends Shared:
              </span>
              <span className={`font-mono text-sm ${isComplete ? 'text-emerald-600 font-extrabold' : 'text-amber-600'}`}>
                {shareCount} / {MAX_TARGET} friends
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 10 Visual Friends Indicator Avatars */}
            <div className="grid grid-cols-10 gap-1.5 pt-2">
              {Array.from({ length: MAX_TARGET }).map((_, i) => {
                const filled = i < shareCount;
                return (
                  <div
                    key={i}
                    className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                      filled
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {filled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : i + 1}
                  </div>
                );
              })}
            </div>

            {isComplete ? (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  बधाई हो! 10 दोस्तों को शेयर पूरा हुआ! आपका VIP Lucky Booster अनलॉक हो गया है।
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 text-center pt-1">
                बस <strong>{MAX_TARGET - shareCount}</strong> और दोस्तों को शेयर करें और लकी बोनस अनलॉक करें!
              </p>
            )}
          </div>

          {/* Action Sharing Buttons */}
          <div className="space-y-3">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share on WhatsApp (+1)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Telegram Button */}
              <button
                onClick={handleTelegramShare}
                className="py-3 px-3 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Telegram (+1)</span>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied (+1)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Link (+1)</span>
                  </>
                )}
              </button>
            </div>

            {/* Manual increment button */}
            {!isComplete && (
              <button
                onClick={handleIncrementShare}
                className="w-full text-center py-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                मैंने किसी अन्य तरीके से दोस्त को शेयर किया (+1 काउंट करें)
              </button>
            )}
          </div>

          {/* Bottom Done Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {isComplete ? 'Done / जारी रखें' : 'Later / बाद में शेयर करें'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
