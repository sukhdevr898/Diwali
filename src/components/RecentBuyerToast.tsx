import React, { useState, useEffect } from 'react';
import { Ticket, Sparkles } from 'lucide-react';

const RECENT_BUYERS = [
  { name: 'Pooja***', city: 'Delhi', qty: 2, time: 'just now' },
  { name: 'Rahul***', city: 'Jaipur', qty: 5, time: '1 min ago' },
  { name: 'Amit***', city: 'Lucknow', qty: 1, time: '2 mins ago' },
  { name: 'Sunita***', city: 'Ahmedabad', qty: 3, time: '4 mins ago' },
  { name: 'Vikram***', city: 'Mumbai', qty: 10, time: '5 mins ago' },
  { name: 'Deepak***', city: 'Chandigarh', qty: 2, time: '6 mins ago' },
  { name: 'Ananya***', city: 'Kolkata', qty: 4, time: '8 mins ago' },
  { name: 'Rajesh***', city: 'Patna', qty: 1, time: '10 mins ago' },
  { name: 'Manish***', city: 'Indore', qty: 5, time: '12 mins ago' },
];

export const RecentBuyerToast: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % RECENT_BUYERS.length);
        setVisible(true);
      }, 400);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const buyer = RECENT_BUYERS[index];

  return (
    <div
      className={`fixed top-18 right-4 z-40 transition-all duration-400 ease-out transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'
      }`}
    >
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-md text-xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
          <Ticket className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">{buyer.name}</span>
            <span className="text-[11px] text-slate-500 font-medium">({buyer.city})</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <span>Bought <strong className="text-slate-900 font-semibold">{buyer.qty} {buyer.qty === 1 ? 'ticket' : 'tickets'}</strong> (₹{buyer.qty * 49})</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">{buyer.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
