import React from 'react';
import { Trophy, Gift, Award, Sparkles, Star, ShieldCheck, Ticket, ArrowRight } from 'lucide-react';

interface PrizeBoardProps {
  onBuyTickets: () => void;
}

export const PrizeBoard: React.FC<PrizeBoardProps> = ({ onBuyTickets }) => {
  const prizeTiers = [
    {
      rank: '1st Mega Bumper',
      badge: 'Grand Bumper',
      amount: '₹2,50,000',
      extra: '+ 10g 24K Pure Gold Coin',
      winners: '1 Lucky Winner',
      highlight: true,
    },
    {
      rank: '2nd Bumper Prize',
      badge: 'Silver Tier',
      amount: '₹50,000',
      extra: 'Each Winner',
      winners: '3 Lucky Winners (Total ₹1,50,000)',
      highlight: false,
    },
    {
      rank: '3rd Prize',
      badge: 'Bronze Tier',
      amount: '₹10,000',
      extra: 'Each Winner',
      winners: '10 Lucky Winners (Total ₹1,00,000)',
      highlight: false,
    },
    {
      rank: '4th Lucky Gift',
      badge: 'Lucky Special',
      amount: '₹5,000',
      extra: 'Each Winner',
      winners: '20 Lucky Winners (Total ₹1,00,000)',
      highlight: false,
    },
    {
      rank: 'Consolation Prizes',
      badge: 'Cash Draw',
      amount: '₹1,000',
      extra: 'Each Winner',
      winners: '50 Lucky Winners (Total ₹50,000)',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Official Mahabumper Prize Board
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Cinzel']">
          Total Prize Pool ₹6,50,000+
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          अपना लक आज़माओ! Transparent lottery draw powered by verified Cloud Firestore records. 84 total lucky winners will be drawn.
        </p>
      </div>

      {/* Prize Board Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {prizeTiers.map((tier, idx) => (
          <div
            key={idx}
            className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
              tier.highlight
                ? 'bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border-2 border-amber-400 shadow-xl shadow-amber-500/10 md:col-span-2 lg:col-span-1'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-bold border ${
                  tier.highlight
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {tier.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  Tier {idx + 1}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Cinzel']">
                  {tier.rank}
                </h3>
                <div className={`text-3xl font-extrabold font-mono mt-1 ${
                  tier.highlight ? 'text-amber-700' : 'text-slate-900'
                }`}>
                  {tier.amount}
                </div>
                <div className="text-xs font-semibold text-amber-800 mt-0.5">
                  {tier.extra}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Winners:</span>
                <span className="font-bold text-slate-900">{tier.winners}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-4">
        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Cinzel']">
          ★ सबसे बड़ा मौका — अपना लक आज़माओ! ★
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          सिर्फ ₹49 में अपना लकी टिकट बुक करें। तुरंत UPI / QR से पेमेंट करें और पाएं अपना वेरिफाइड लॉटरी टिकट नंबर।
        </p>
        <button
          onClick={onBuyTickets}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Ticket className="w-5 h-5 text-slate-950" />
          <span>अपना लक आज़माओ — ₹49 में टिकट लो</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
