import React from 'react';
import { Campaign, Draw } from '../types';
import { Sparkles, Gift, Ticket, ArrowRight, ShieldCheck, Zap, Trophy, MessageCircle, Users, Award } from 'lucide-react';

interface CampaignHeroProps {
  campaign: Campaign;
  latestDraw?: Draw;
  onOpenPurchase: () => void;
  onViewTickets: () => void;
  onViewPrizeBoard: () => void;
  onOpenShare: () => void;
}

export const CampaignHero: React.FC<CampaignHeroProps> = ({
  campaign,
  latestDraw,
  onOpenPurchase,
  onViewTickets,
  onViewPrizeBoard,
  onOpenShare,
}) => {
  return (
    <div className="space-y-8">
      {/* Grand Clean White Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Mahabumper Lucky Draw • आधिकारिक लॉटरी
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-block px-3 py-1 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-sm sm:text-base font-extrabold font-['Cinzel'] tracking-wide">
                ✨ अपना लक आज़माओ — सिर्फ ₹49 में! ✨
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-['Cinzel'] tracking-tight leading-tight">
                सिर्फ ₹49 में बनो लखपति
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-amber-700 font-['Cinzel'] flex items-center gap-2">
                <span>1st प्राइज: ₹2,50,000 Cash + 10g 24K Gold Coin</span>
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              किस्मत का पहिया कभी भी घूम सकता है! अपना लक आज़माओ, सिर्फ ₹49 में अपना भाग्यशाली टिकट बुक करो। 100% सुरक्षित ऑनलाइन UPI पेमेंट और तुरंत जारी होने वाला सीरियल नंबर!
            </p>

            {/* Quick highlight pills (without live ticket count) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 uppercase font-mono block">लकी टिकट रेट</span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
                  ₹{campaign.ticketPriceRupees}
                </span>
                <span className="text-[10px] text-slate-400 block">सस्ता और आसान प्रवेश</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 uppercase font-mono block">कुल प्राइज पूल</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                  ₹6.5L+
                </span>
                <span className="text-[10px] text-slate-500 block font-semibold">84 कुल विजेता अवसर</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPurchase}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <Ticket className="w-5 h-5 text-slate-950" />
                <span>अपना लक आज़माओ — टिकट लें (₹49)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onViewPrizeBoard}
                className="px-5 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Win Prize Board</span>
              </button>

              <button
                onClick={onOpenShare}
                className="px-5 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <Users className="w-4 h-4 text-emerald-700" />
                <span>10 दोस्तों को शेयर करें</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean White Prize Board Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-3xl bg-slate-50/90 border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">
                <Gift className="w-7 h-7" />
              </div>

              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">
                  महाबंपर प्राइज पूल
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Cinzel'] mt-1">
                  ₹6,50,000 कुल इनाम
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-amber-300 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs shadow-xs">
                      1st
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">1st Mega Bumper</div>
                      <div className="text-[10px] text-amber-700 font-medium">+ 10g 24K Pure Gold Coin</div>
                    </div>
                  </div>
                  <span className="font-extrabold text-amber-700 text-base">₹2,50,000</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      2nd
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">2nd Prize (3 Winners)</div>
                      <div className="text-[10px] text-slate-500">₹50,000 प्रत्येक</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-xs">₹1,50,000</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      3rd
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">3rd Prize (10 Winners)</div>
                      <div className="text-[10px] text-slate-500">₹10,000 प्रत्येक</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-xs">₹1,00,000</span>
                </div>
              </div>

              {latestDraw && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase">
                    <Award className="w-4 h-4 text-emerald-600" />
                    विजेता घोषित!
                  </div>
                  <p className="text-sm font-mono text-emerald-950 font-bold">
                    टिकट: {latestDraw.winningTicketNumber}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    विजेता: {latestDraw.winnerName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share with 10 Friends Banner Callout */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-emerald-500/10 border border-amber-300/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>10 दोस्तों को शेयर करें & लकी VIP बोनस पाएं!</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                फ्री बोनस
              </span>
            </h4>
            <p className="text-xs text-slate-600">
              टिकट खरीदने के बाद या सीधे अपने WhatsApp ग्रुप्स में 10 दोस्तों को शेयर करें और लकी ड्रॉ में अतिरिक्त लाभ प्राप्त करें।
            </p>
          </div>
        </div>

        <button
          onClick={onOpenShare}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" />
          <span>शेयर करें (0/10 Friends)</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-['Cinzel']">
              Instant Online Ticket Delivery
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              पेमेंट के तुरंत बाद आपका अद्वितीय सीरियल नंबर टिकट और QR कोड डैशबोर्ड में एक्टिव हो जाता है।
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-['Cinzel']">
              अपना लक आज़माओ (सिर्फ ₹49)
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              कम कीमत, बड़ा इनाम। ₹49 में अपनी किस्मत आज़माने और ₹2,50,000 + 10g Gold Coin जीतने का सुनहरा अवसर।
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-['Cinzel']">
              100% पारदर्शी लाइव ड्रॉ
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              क्रिप्टोग्राफिक सुरक्षा और क्लाउड डेटाबेस पर दर्ज रिकॉर्ड्स के साथ सभी टिकटों का निष्पक्ष लाइव ड्रॉ।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
