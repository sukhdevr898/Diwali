import React from 'react';
import { Sparkles, Gift, Award, Flame, HeartHandshake, Share2, Ticket, Trophy } from 'lucide-react';

interface FestiveWishesBannerProps {
  onOpenPurchase: () => void;
  onOpenShare: () => void;
}

export const FestiveWishesBanner: React.FC<FestiveWishesBannerProps> = ({
  onOpenPurchase,
  onOpenShare,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-300 shadow-md p-6 sm:p-8 space-y-6">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-400/10 to-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-rose-400/10 to-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Diya and Wishes */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
            <span className="text-base leading-none">🪔</span>
            <span>शुभ धनतेरस व दीपावली महापर्व</span>
            <span className="text-base leading-none">✨</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cinzel'] tracking-tight">
            Happy Dhanteras & Shubh Deepawali!
          </h2>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-medium">
            माँ लक्ष्मी, भगवान गणेश एवं कुबेर देव आपके जीवन में सुख, शांति, समृद्धि और महा-भाग्य का संचार करें। 
            इस पावन धनतेरस और दिवाली पर सिर्फ ₹49 में अपना लक आजमाएं और घर लाएं सोने का मंगल शगुन व लाखों का कैश प्राइज!
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="text-center space-y-1">
            <div className="text-2xl">🪙 🪔 🎁</div>
            <div className="text-[11px] font-bold text-amber-900 uppercase font-mono tracking-wider">
              त्योहारी महा-बंपर
            </div>
            <div className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              ₹49 एंट्री
            </div>
          </div>
        </div>
      </div>

      {/* 3 Auspicious Festive Wins Highlights */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Dhanteras Gold Win */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/70 to-white border border-amber-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🪙</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              धनतेरस स्पेशल
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base font-['Cinzel']">
              10g 24K Gold Coin
            </h4>
            <p className="text-xs text-amber-800 font-semibold mt-0.5">
              100% शुद्ध प्रमाणित हॉलमार्क सोना
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              धनतेरस पर सोने का पावन शगुन, 1st प्राइज विजेता के नाम!
            </p>
          </div>
        </div>

        {/* Diwali Mega Cash Win */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-yellow-50/70 to-white border border-yellow-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🪔</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              दीपावली बंपर
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base font-['Cinzel']">
              ₹2,50,000 Grand Cash
            </h4>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">
              सीधे बैंक अकाउंट में RTGS/UPI ट्रांसफर
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              दिवाली की रात चमकेगा आपका भाग्य, बनिए महाबंपर लखपति!
            </p>
          </div>
        </div>

        {/* Lakshmi Kripa Prize Pool */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-50/60 to-white border border-rose-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🎁</span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              84+ कुल विजेता
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base font-['Cinzel']">
              लक्ष्मी कृपा प्राइज पूल
            </h4>
            <p className="text-xs text-rose-700 font-semibold mt-0.5">
              2nd प्राइज ₹50,000 (3) • 3rd प्राइज ₹10,000 (10)
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              हर टिकट पर जीतने का सुनहरा अवसर, पारदर्शी व क्रिप्टोग्राफिक ड्रा!
            </p>
          </div>
        </div>
      </div>

      {/* Festive Call To Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 text-center sm:text-left">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>शुभ मुहूर्त में टिकट लें और अपने 10 प्रियजनों को भी शुभकामना संदेश भेजें!</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenPurchase}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>शुभ टिकट लें (₹49)</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>दिवाली-धनतेरस विशेज शेयर करें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
