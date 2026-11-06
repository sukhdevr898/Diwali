import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, Ticket, Campaign, Draw } from '../types';
import { verifyOrderPayment, executeLotteryDraw } from '../lib/firestore-service';
import { queryRupayexOrderStatus } from '../lib/rupayex-service';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Ticket as TicketIcon, 
  Search, 
  AlertCircle, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  IndianRupee, 
  Zap,
  Trophy,
  Users,
  Calendar,
  Gift,
  ArrowRight,
  UserCheck,
  RefreshCw
} from 'lucide-react';

interface AdminPanelProps {
  campaign: Campaign;
  orders: Order[];
  tickets: Ticket[];
  draws: Draw[];
}

const PRIZE_OPTIONS = [
  '1st Mega Bumper: ₹2,50,000 Cash + 10g 24K Gold Coin',
  '2nd Bumper Prize: ₹50,000 Cash',
  '3rd Prize: ₹10,000 Cash',
  '4th Festive Gift: ₹5,000 Cash',
  'Consolation Prize: ₹1,000 Cash',
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  campaign,
  orders,
  tickets,
  draws,
}) => {
  const { user, isAdmin, login, loginWithRedirectMode, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'tickets' | 'draw'>('payments');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED'>('PENDING_VERIFICATION');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  
  // Ticket and Winner Selection State
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WINNER'>('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedPrize, setSelectedPrize] = useState<string>(PRIZE_OPTIONS[0]);
  const [customPrizeInput, setCustomPrizeInput] = useState<string>('');
  const [isCustomPrize, setIsCustomPrize] = useState<boolean>(false);

  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [checkingGatewayId, setCheckingGatewayId] = useState<string | null>(null);
  const [rejectionModalOrder, setRejectionModalOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('UTR transaction not found in bank statement');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [drawLoading, setDrawLoading] = useState<boolean>(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [drawSuccess, setDrawSuccess] = useState<Draw | null>(null);

  if (!isAdmin) {
    if (!user) {
      return (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-5 max-w-lg mx-auto my-12 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold font-['Cinzel'] text-slate-900">
              Admin Console Login
            </h3>
            <p className="text-xs text-slate-600">
              एडमिन पैनल केवल <strong>sukhdevr898@gmail.com</strong> के लिए अधिकृत है। कृपया अपने एडमिन Google खाते से लॉगिन करें।
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={login}
              disabled={authLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Shield className="w-4 h-4 text-amber-400" />}
              <span>Sign In with Admin Account</span>
            </button>
            <button
              onClick={loginWithRedirectMode}
              disabled={authLoading}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="Use if browser popups are blocked"
            >
              <span>Direct Redirect</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-200 text-center space-y-5 max-w-lg mx-auto my-12 shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold font-['Cinzel'] text-rose-900">
            Unauthorized Account
          </h3>
          <p className="text-xs text-slate-600">
            आप वर्तमान में <strong>{user.email}</strong> से लॉगिन हैं। एडमिन पैनल का एक्सेस केवल <strong>sukhdevr898@gmail.com</strong> को दिया गया है।
          </p>
        </div>
        <button
          onClick={logout}
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          Logout & Sign In as sukhdevr898@gmail.com
        </button>
      </div>
    );
  }

  // Financial & Inventory Stats
  const approvedOrders = orders.filter(o => o.status === 'APPROVED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING_VERIFICATION');
  const activeTickets = tickets.filter(t => t.status === 'ACTIVE');
  const winnerTickets = tickets.filter(t => t.status === 'WINNER');
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.totalAmountRupees, 0);
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + o.totalAmountRupees, 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (order: Order) => {
    setLoadingOrderId(order.id);
    try {
      await verifyOrderPayment(order, true);
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve order: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCheckGatewayStatus = async (order: Order) => {
    setCheckingGatewayId(order.id);
    try {
      const res = await queryRupayexOrderStatus(order.id);
      const data = res.data;
      if (data && data.payment_status === 'SUCCESS') {
        const utr = data.utr ? String(data.utr) : 'GATEWAY_VERIFIED';
        await verifyOrderPayment({ ...order, utrNumber: utr }, true);
        alert(`Gateway Verified! Payment is SUCCESS (UTR: ${utr}). Order ${order.id} has been approved and tickets issued!`);
      } else if (data && data.payment_status === 'PENDING') {
        alert(`Payment Gateway Status for ${order.id}:\nStatus: PENDING (Customer has not paid yet on UPI / QR).\nAmount: ₹${data.amount || order.totalAmountRupees}`);
      } else {
        alert(`Payment Gateway Status for ${order.id}:\nStatus: ${data?.payment_status || 'UNKNOWN'}\nDetails: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      alert('Failed to query Payment Gateway API: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCheckingGatewayId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModalOrder) return;
    setLoadingOrderId(rejectionModalOrder.id);
    try {
      await verifyOrderPayment(rejectionModalOrder, false, rejectionReason);
      setRejectionModalOrder(null);
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject order: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingOrderId(null);
    }
  };

  // Declare Winner Action (Supports Admin manual choice or Random)
  const handleDeclareWinner = async (manualChosenId?: string) => {
    const targetTicketId = manualChosenId || selectedTicketId;
    const finalPrize = isCustomPrize && customPrizeInput.trim() ? customPrizeInput.trim() : selectedPrize;

    if (activeTickets.length === 0) {
      setDrawError('No active confirmed tickets available to declare a winner!');
      return;
    }

    let targetTicket: Ticket | undefined;
    if (targetTicketId) {
      targetTicket = activeTickets.find(t => t.id === targetTicketId);
      if (!targetTicket) {
        setDrawError('Selected ticket is not active or already declared a winner.');
        return;
      }
    }

    const confirmMsg = targetTicket
      ? `Are you sure you want to declare Ticket ${targetTicket.ticketNumber} (${targetTicket.userName}) as the winner of:\n"${finalPrize}"?`
      : `Are you sure you want to pick a RANDOM winner from ${activeTickets.length} active tickets for:\n"${finalPrize}"?`;

    if (!window.confirm(confirmMsg)) return;

    setDrawLoading(true);
    setDrawError(null);
    try {
      const result = await executeLotteryDraw(campaign, activeTickets, targetTicket?.id, finalPrize);
      setDrawSuccess(result);
      setSelectedTicketId('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Winner declaration failed';
      setDrawError(msg);
    } finally {
      setDrawLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = paymentFilter === 'ALL' || o.status === paymentFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.utrNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.userName.toLowerCase().includes(orderSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      t.orderId.toLowerCase().includes(ticketSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedTicketObj = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="space-y-6">
      {/* Admin Header with User & Role */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Cinzel']">
                Admin Management Console
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <strong className="text-slate-700">{user?.email}</strong>
            </p>
          </div>
        </div>

        {/* Action quick badge */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ● Live System Connected
          </span>
        </div>
      </div>

      {/* 4 Overview Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Total Revenue</span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">{approvedOrders.length} Paid Orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Pending Review</span>
          <div className={`text-xl sm:text-2xl font-extrabold font-mono ${pendingOrders.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            ₹{pendingAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">{pendingOrders.length} Pending Orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Active Tickets</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {activeTickets.length}
          </div>
          <span className="text-[10px] text-slate-400 block">Eligible for Prize</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Declared Winners</span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono">
            {draws.length}
          </div>
          <span className="text-[10px] text-slate-400 block">Total Draws Conducted</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-['Cinzel'] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IndianRupee className="w-4 h-4 text-amber-600" />
          <span>Payment Orders</span>
          {pendingOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-['Cinzel'] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TicketIcon className="w-4 h-4 text-amber-600" />
          <span>All Tickets ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('draw')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-['Cinzel'] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'draw'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
              : 'text-amber-800 bg-amber-50/60 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-slate-950" />
          <span>🏆 Choose Winner Console</span>
          {draws.length > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-mono">
              {draws.length}
            </span>
          )}
        </button>
      </div>

      {/* 1. Payment Management View */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {(['PENDING_VERIFICATION', 'ALL', 'APPROVED', 'REJECTED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setPaymentFilter(status)}
                  className={`px-3 py-1.5 rounded-xl font-mono font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    paymentFilter === status
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {status === 'PENDING_VERIFICATION' ? `Pending Review (${pendingOrders.length})` : status}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search UTR, Order, Email, Name..."
                value={orderSearchTerm}
                onChange={e => setOrderSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 text-xs text-slate-500">
              No orders found matching the filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                          order.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : order.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{order.totalAmountRupees}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({order.quantity} Tickets × ₹49)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">PLAYER</span>
                      <span className="font-bold text-slate-900">{order.userName}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{order.userEmail}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">PAYMENT METHOD</span>
                      <span className="text-slate-800 font-semibold">{order.paymentMethod}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">UTR / REF NUMBER</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                        <span>{order.utrNumber}</span>
                        <button
                          onClick={() => copyToClipboard(order.utrNumber, order.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                          title="Copy UTR"
                        >
                          {copiedId === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">SUBMITTED ON</span>
                      <span className="text-slate-600 text-[11px]">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                      <strong>Customer Notes/Phone:</strong> {order.notes}
                    </div>
                  )}

                  {/* Actions for Pending Verification */}
                  {order.status === 'PENDING_VERIFICATION' && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleCheckGatewayStatus(order)}
                        disabled={checkingGatewayId === order.id}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        title="Query Gateway directly to verify payment"
                      >
                        {checkingGatewayId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>⚡ Check Gateway Status</span>
                      </button>

                      <button
                        onClick={() => handleApprove(order)}
                        disabled={loadingOrderId === order.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {loadingOrderId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>✓ Verify & Issue {order.quantity} Tickets</span>
                      </button>

                      <button
                        onClick={() => setRejectionModalOrder(order)}
                        disabled={loadingOrderId === order.id}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Lottery Tickets Management View */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Filter:</span>
              {(['ALL', 'ACTIVE', 'WINNER'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setTicketStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                    ticketStatusFilter === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status} ({status === 'ALL' ? tickets.length : status === 'ACTIVE' ? activeTickets.length : winnerTickets.length})
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, email, name..."
                value={ticketSearchTerm}
                onChange={e => setTicketSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTickets.map(ticket => {
              const isWinner = ticket.status === 'WINNER';
              return (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 text-xs shadow-xs ${
                    isWinner
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        isWinner
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-slate-700">
                    <div className="font-semibold text-slate-900 truncate">{ticket.userName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{ticket.userEmail}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Order: {ticket.orderId}</div>
                  </div>

                  {/* Winner Action shortcut */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>

                    {ticket.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setActiveTab('draw');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trophy className="w-3 h-3 text-amber-600" />
                        <span>Choose as Winner</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        ★ Winner Declared
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Choose & Declare Winner Console (User Feature) */}
      {activeTab === 'draw' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Cinzel'] text-slate-900">
                    Winner Selection & Declaration Room
                  </h3>
                  <p className="text-xs text-slate-600">
                    आप अपनी पसंद से किसी भी टिकट/प्लेयर को विजेता चुन सकते हैं या रैंडम लकी ड्रॉ कर सकते हैं।
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700">
                Eligible Tickets: {activeTickets.length}
              </div>
            </div>

            {drawError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{drawError}</span>
              </div>
            )}

            {drawSuccess && (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase">
                  <Sparkles className="w-4 h-4" />
                  Winner Declared Successfully!
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-wider">
                  {drawSuccess.winningTicketNumber}
                </div>
                <p className="text-sm text-slate-800">
                  Winner: <strong className="text-slate-950">{drawSuccess.winnerName}</strong> ({drawSuccess.winnerEmail})
                </p>
                <div className="text-xs text-emerald-800 font-mono font-semibold">
                  Prize: {drawSuccess.prizeDescription}
                </div>
              </div>
            )}

            {/* Step 1: Select the Winning Ticket */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Step 1: विजेता टिकट चुनें (Choose Winning Ticket)
              </label>

              {activeTickets.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  There are currently no active tickets available to select as winner.
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedTicketId}
                    onChange={e => setSelectedTicketId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Any Confirmed Ticket / Player --</option>
                    {activeTickets.map(ticket => (
                      <option key={ticket.id} value={ticket.id}>
                        {ticket.ticketNumber} — {ticket.userName} ({ticket.userEmail}) [Order: {ticket.orderId}]
                      </option>
                    ))}
                  </select>

                  {/* Details Card of Selected Candidate */}
                  {selectedTicketObj && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Selected Candidate Details</span>
                        </span>
                        <span className="font-mono text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded font-bold">
                          READY TO DECLARE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">TICKET NUMBER</span>
                          <span className="font-extrabold text-sm text-slate-900">{selectedTicketObj.ticketNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">PLAYER NAME</span>
                          <span className="font-semibold">{selectedTicketObj.userName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">EMAIL</span>
                          <span className="truncate block">{selectedTicketObj.userEmail}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">ORDER ID</span>
                          <span className="truncate block">{selectedTicketObj.orderId}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Choose Prize Tier */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Step 2: पुरस्कार श्रेणी चुनें (Choose Prize Tier)
              </label>

              <div className="space-y-2">
                <select
                  value={isCustomPrize ? 'CUSTOM' : selectedPrize}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomPrize(true);
                    } else {
                      setIsCustomPrize(false);
                      setSelectedPrize(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {PRIZE_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="CUSTOM">-- Type Custom Prize / अन्य पुरस्कार --</option>
                </select>

                {isCustomPrize && (
                  <input
                    type="text"
                    placeholder="उदा. ₹25,000 Special Diwali Cash"
                    value={customPrizeInput}
                    onChange={e => setCustomPrizeInput(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            </div>

            {/* Step 3: Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {/* Manual Selection Button */}
              <button
                onClick={() => handleDeclareWinner()}
                disabled={drawLoading || !selectedTicketId}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {drawLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Declaring Winner in Cloud Firestore...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>
                      {selectedTicketObj
                        ? `✓ Confirm & Declare Ticket ${selectedTicketObj.ticketNumber} as Winner`
                        : 'Choose a Ticket Above to Declare as Winner'}
                    </span>
                  </>
                )}
              </button>

              {/* Or Pick Random fallback */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>अगर आप सिस्टम से रैंडम चयन कराना चाहते हैं:</span>
                <button
                  type="button"
                  onClick={() => handleDeclareWinner(undefined)}
                  disabled={drawLoading || activeTickets.length === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  🎲 Pick Random Ticket ({activeTickets.length} candidates)
                </button>
              </div>
            </div>
          </div>

          {/* Declared Winners History Log */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm font-['Cinzel']">
                  घोषित विजेताओं का रिकॉर्ड (Winners History)
                </h4>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {draws.length} Total Winners
              </span>
            </div>

            {draws.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No winners have been declared yet. Select a ticket above to declare the first winner.
              </div>
            ) : (
              <div className="space-y-3">
                {draws.map(draw => (
                  <div
                    key={draw.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {draw.winningTicketNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          WINNER
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">
                        Player: <strong>{draw.winnerName}</strong> ({draw.winnerEmail})
                      </div>
                      <div className="text-amber-800 font-semibold text-[11px]">
                        Prize: {draw.prizeDescription}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <div>{new Date(draw.drawDate).toLocaleString()}</div>
                      <div>Drawn by: {draw.drawnBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-rose-900 font-['Cinzel']">
              Reject Order {rejectionModalOrder.id}
            </h4>
            <p className="text-xs text-slate-600">
              Specify the reason for payment rejection. The player will see this reason in their dashboard.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectionModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
