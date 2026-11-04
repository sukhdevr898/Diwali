import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket as TicketType, Order, Draw } from '../types';
import { Ticket, Clock, CheckCircle2, Award, Copy, Check, Sparkles, Users, Gift, Share2, ArrowRight } from 'lucide-react';

interface UserDashboardProps {
  tickets: TicketType[];
  orders: Order[];
  draws: Draw[];
  onOpenPurchase: () => void;
  onOpenShare: () => void;
}

const STORAGE_KEY = 'mahabumper_shared_friends_count';
const MAX_SHARE_TARGET = 10;

export const UserDashboard: React.FC<UserDashboardProps> = ({
  tickets,
  orders,
  draws,
  onOpenPurchase,
  onOpenShare,
}) => {
  const { user, profile, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [shareCount, setShareCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Math.min(parseInt(saved, 10), MAX_SHARE_TARGET) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setShareCount(Math.min(parseInt(saved, 10), MAX_SHARE_TARGET));
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!user) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4 my-8">
        <Ticket className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold font-['Cinzel'] text-slate-900">
          Sign In to Access Your Tickets
        </h3>
        <p className="text-xs text-slate-600">
          Sign in with your Google account to view your purchased lottery tickets, pending orders, and draw winnings.
        </p>
        <button
          onClick={login}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  const winningTicket = tickets.find(t => t.status === 'WINNER');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* User Header Profile */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-14 h-14 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl font-['Cinzel'] shadow-sm">
              {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-['Cinzel']">
                {profile?.displayName || user.displayName || 'Player'}
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {profile?.role || 'user'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenShare}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-300 transition-colors cursor-pointer"
          >
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Share (10 Friends)</span>
          </button>

          <button
            onClick={onOpenPurchase}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Ticket className="w-4 h-4" />
            <span>Buy More Tickets (₹49)</span>
          </button>
        </div>
      </div>

      {/* Share with 10 Friends Live Progress Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-left w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Share with 10 Friends & Unlock VIP Lucky Booster
            </h4>
          </div>
          <p className="text-xs text-slate-600">
            अपने 10 दोस्तों को WhatsApp पर शेयर करें और लकी ड्रॉ में एक्स्ट्रा एंट्री बोनस पाएं!
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-48 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((shareCount / MAX_SHARE_TARGET) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">
              {shareCount} / {MAX_SHARE_TARGET} Shared
            </span>
          </div>
        </div>

        <button
          onClick={onOpenShare}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Share2 className="w-4 h-4" />
          <span>शेयर करें और बोनस लें</span>
        </button>
      </div>

      {/* Winner Notification Banner */}
      {winningTicket && (
        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3 relative overflow-hidden shadow-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            🏆 Congratulations! You Won!
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-['Cinzel']">
            Winning Ticket: {winningTicket.ticketNumber}
          </h3>
          <p className="text-xs text-emerald-800 max-w-lg mx-auto">
            Your ticket was selected in the official Mahabumper draw! Our team will contact your email ({user.email}) for prize distribution.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-sm font-bold font-['Cinzel'] transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4 text-amber-600" />
          My Active Tickets ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-sm font-bold font-['Cinzel'] transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          My Orders & Payments ({orders.length})
        </button>
      </div>

      {/* Tickets List */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 font-['Cinzel']">
                No Active Lottery Tickets
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                जैसे ही आप UPI से ₹49 का टिकट पेमेंट पूरा करेंगे, आपका आधिकारिक सीरियल नंबर तुरंत यहां एक्टिव हो जाएगा!
              </p>
              <button
                onClick={onOpenPurchase}
                className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
              >
                Buy ₹49 Ticket Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map(ticket => {
                const isWinner = ticket.status === 'WINNER';
                return (
                  <div
                    key={ticket.id}
                    className={`relative overflow-hidden rounded-2xl p-5 border transition-all ${
                      isWinner
                        ? 'bg-amber-50/80 border-amber-400 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          isWinner
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        CONFIRMED TICKET
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500 uppercase font-mono">
                        Ticket Number
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-extrabold font-mono text-slate-900 tracking-wider">
                          {ticket.ticketNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(ticket.ticketNumber, ticket.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                          title="Copy ticket number"
                        >
                          {copiedId === ticket.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500 font-mono">
                      <div className="flex justify-between">
                        <span>Issued To:</span>
                        <span className="text-slate-800 font-medium truncate max-w-[140px]">{ticket.userName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Purchase Date:</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="truncate max-w-[120px]">{ticket.orderId}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[10px] text-center text-amber-700 font-bold uppercase tracking-widest font-mono border-t border-slate-100 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>OFFICIAL MAHABUMPER DRAW</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-300 text-xs text-slate-500">
              No orders found.
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        order.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : order.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {order.status === 'PENDING_VERIFICATION' ? 'VERIFICATION PENDING' : order.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-base text-slate-900">
                      ₹{order.totalAmountRupees}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      ({order.quantity} × ₹49)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono">
                  <div>
                    <span className="text-slate-400 block">Payment Method</span>
                    <span className="text-slate-800 font-semibold">{order.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">UTR / Ref Number</span>
                    <span className="text-slate-800 font-semibold">{order.utrNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Created At</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {order.status === 'REJECTED' && order.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <strong>Rejection Reason:</strong> {order.rejectionReason}
                  </div>
                )}

                {order.status === 'PENDING_VERIFICATION' && (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Payment submitted. Administrator is verifying your bank/UPI transaction.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
