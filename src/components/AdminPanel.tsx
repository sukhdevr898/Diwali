import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, Ticket, Campaign, Draw } from '../types';
import { 
  verifyOrderPayment, 
  executeLotteryDraw, 
  deleteLotteryDraw, 
  updateLotteryDraw, 
  updateCampaignSettings, 
  createManualTicketOrder, 
  deleteOrder 
} from '../lib/firestore-service';
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
  RefreshCw,
  Trash2,
  Edit3,
  Sliders,
  Download,
  PlusCircle,
  Play,
  RotateCcw,
  CheckCheck,
  FileSpreadsheet,
  X,
  FileText
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
  
  // Navigation tabs: Payments, Tickets, Winners & Draws, Settings, Export
  const [activeTab, setActiveTab] = useState<'payments' | 'tickets' | 'draw' | 'settings' | 'export'>('payments');
  
  // Orders & Payment Filters
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED'>('PENDING_VERIFICATION');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  
  // Tickets Directory State
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WINNER'>('ALL');

  // Winner Selection & Draw State
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedPrize, setSelectedPrize] = useState<string>(PRIZE_OPTIONS[0]);
  const [customPrizeInput, setCustomPrizeInput] = useState<string>('');
  const [isCustomPrize, setIsCustomPrize] = useState<boolean>(false);
  const [drawLoading, setDrawLoading] = useState<boolean>(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [drawSuccess, setDrawSuccess] = useState<Draw | null>(null);

  // Animated Draw Wheel / Rolling Simulation State
  const [isRollingAnimation, setIsRollingAnimation] = useState<boolean>(false);
  const [rollingCandidateNumber, setRollingCandidateNumber] = useState<string>('MB-******');

  // Edit Winner Modal State
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null);
  const [editPrizeDesc, setEditPrizeDesc] = useState<string>('');
  const [editClaimStatus, setEditClaimStatus] = useState<'PENDING_CLAIM' | 'DISPATCHED' | 'DELIVERED'>('PENDING_CLAIM');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Delete Winner Modal State
  const [deletingDraw, setDeletingDraw] = useState<Draw | null>(null);
  const [confirmDeleting, setConfirmDeleting] = useState<boolean>(false);

  // Manual Offline / Cash Ticket Issue Modal State
  const [isManualTicketModalOpen, setIsManualTicketModalOpen] = useState<boolean>(false);
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [manualCustomerMobile, setManualCustomerMobile] = useState<string>('');
  const [manualQuantity, setManualQuantity] = useState<number>(1);
  const [manualNotes, setManualNotes] = useState<string>('Cash counter sales');
  const [manualIssuing, setManualIssuing] = useState<boolean>(false);
  const [manualIssuedResult, setManualIssuedResult] = useState<{ orderId: string; ticketNumbers: string[] } | null>(null);

  // Campaign Settings Edit State
  const [campaignTitle, setCampaignTitle] = useState<string>(campaign.title);
  const [campaignTicketPrice, setCampaignTicketPrice] = useState<number>(campaign.ticketPriceRupees);
  const [campaignGrandPrize, setCampaignGrandPrize] = useState<string>(campaign.grandPrize);
  const [campaignSecondPrize, setCampaignSecondPrize] = useState<string>(campaign.secondPrize || '₹50,000 Cash (3 Lucky Winners)');
  const [campaignThirdPrize, setCampaignThirdPrize] = useState<string>(campaign.thirdPrize || '₹10,000 Cash (10 Lucky Winners)');
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'closed' | 'drawn'>(campaign.status);
  const [savingCampaign, setSavingCampaign] = useState<boolean>(false);
  const [campaignSavedNotice, setCampaignSavedNotice] = useState<boolean>(false);

  // General Action Loading States
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [checkingGatewayId, setCheckingGatewayId] = useState<string | null>(null);
  const [rejectionModalOrder, setRejectionModalOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('UTR transaction not found in bank statement');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setCampaignTitle(campaign.title);
    setCampaignTicketPrice(campaign.ticketPriceRupees);
    setCampaignGrandPrize(campaign.grandPrize);
    setCampaignSecondPrize(campaign.secondPrize || '');
    setCampaignThirdPrize(campaign.thirdPrize || '');
    setCampaignStatus(campaign.status);
  }, [campaign]);

  // Auth Guard
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
              यह पैनल केवल अधिकृत एडमिन (Authorized Administrator) के लिए सुरक्षित है। कृपया अपने अधिकृत एडमिन Google खाते से लॉगिन करें।
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
            आप वर्तमान में <strong>{user.email}</strong> से लॉगिन हैं। आपके पास इस एडमिन कंसोल का एक्सेस नहीं है। कृपया अधिकृत एडमिन खाते से साइन इन करें।
          </p>
        </div>
        <button
          onClick={logout}
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          Logout & Switch to Admin Account
        </button>
      </div>
    );
  }

  // Financial & Inventory Statistics
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

  // Filtered Orders
  const filteredOrders = orders
    .filter(order => {
      if (paymentFilter === 'ALL') return true;
      return order.status === paymentFilter;
    })
    .filter(order => {
      if (!orderSearchTerm) return true;
      const term = orderSearchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(term) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(term)) ||
        (order.userName && order.userName.toLowerCase().includes(term)) ||
        (order.utrNumber && order.utrNumber.toLowerCase().includes(term))
      );
    });

  // Filtered Tickets
  const filteredTickets = tickets
    .filter(ticket => {
      if (ticketStatusFilter === 'ALL') return true;
      return ticket.status === ticketStatusFilter;
    })
    .filter(ticket => {
      if (!ticketSearchTerm) return true;
      const term = ticketSearchTerm.toLowerCase();
      return (
        ticket.ticketNumber.toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term) ||
        (ticket.userEmail && ticket.userEmail.toLowerCase().includes(term)) ||
        (ticket.userName && ticket.userName.toLowerCase().includes(term)) ||
        ticket.orderId.toLowerCase().includes(term)
      );
    });

  // Handle Verify Order Payment
  const handleVerify = async (order: Order, approved: boolean, reason?: string) => {
    setLoadingOrderId(order.id);
    try {
      await verifyOrderPayment(order, approved, reason);
    } catch (err) {
      console.error('Verify error:', err);
      alert('Verification failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingOrderId(null);
    }
  };

  // Check RupayEx Order Gateway Status
  const handleCheckGateway = async (order: Order) => {
    setCheckingGatewayId(order.id);
    try {
      const res = await queryRupayexOrderStatus(order.id);
      if (res && res.data && res.data.payment_status === 'SUCCESS') {
        const utr = res.data.utr ? String(res.data.utr) : order.utrNumber;
        await verifyOrderPayment({ ...order, utrNumber: utr }, true);
        alert(`Gateway Confirmed Payment! Order ${order.id} automatically approved.`);
      } else {
        const status = res?.data?.payment_status || 'NOT_COMPLETED';
        alert(`Gateway status for ${order.id}: ${status}`);
      }
    } catch (err) {
      alert('Failed to query gateway: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCheckingGatewayId(null);
    }
  };

  // Rejection Confirmation
  const handleReject = async () => {
    if (!rejectionModalOrder) return;
    await handleVerify(rejectionModalOrder, false, rejectionReason);
    setRejectionModalOrder(null);
  };

  // Delete an Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Delete order ${orderId}? This cannot be undone.`)) return;
    try {
      await deleteOrder(orderId);
    } catch (err) {
      alert('Failed to delete order: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Declare Winner with Roller Simulator Animation
  const handleDeclareWinner = async (ticketIdToUse?: string) => {
    setDrawError(null);
    setDrawSuccess(null);

    const prize = isCustomPrize && customPrizeInput.trim()
      ? customPrizeInput.trim()
      : selectedPrize;

    if (activeTickets.length === 0) {
      setDrawError('No active confirmed tickets available to draw!');
      return;
    }

    const candidateId = ticketIdToUse || selectedTicketId || undefined;

    // Start 2.5-second visual shuffle animation
    setIsRollingAnimation(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randTicket = activeTickets[Math.floor(Math.random() * activeTickets.length)];
      if (randTicket) {
        setRollingCandidateNumber(randTicket.ticketNumber);
      }
      counter += 1;
      if (counter > 20) {
        clearInterval(interval);
      }
    }, 120);

    setDrawLoading(true);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const result = await executeLotteryDraw(campaign, activeTickets, candidateId, prize);
        setDrawSuccess(result);
        setSelectedTicketId('');
        setIsRollingAnimation(false);
      } catch (err) {
        setDrawError(err instanceof Error ? err.message : 'Draw failed');
        setIsRollingAnimation(false);
      } finally {
        setDrawLoading(false);
      }
    }, 2500);
  };

  // Open Edit Winner Modal
  const handleOpenEditWinner = (draw: Draw) => {
    setEditingDraw(draw);
    setEditPrizeDesc(draw.prizeDescription || '');
    setEditClaimStatus(draw.claimStatus || 'PENDING_CLAIM');
    setEditRemarks(draw.remarks || '');
  };

  // Save Edit Winner
  const handleSaveEditWinner = async () => {
    if (!editingDraw) return;
    setSavingEdit(true);
    try {
      await updateLotteryDraw(editingDraw.id, {
        prizeDescription: editPrizeDesc,
        claimStatus: editClaimStatus,
        remarks: editRemarks,
      });
      setEditingDraw(null);
    } catch (err) {
      alert('Failed to update winner: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Declared Winner
  const handleConfirmDeleteWinner = async () => {
    if (!deletingDraw) return;
    setConfirmDeleting(true);
    try {
      await deleteLotteryDraw(deletingDraw.id, deletingDraw.winningTicketId, deletingDraw.campaignId);
      setDeletingDraw(null);
      if (drawSuccess?.id === deletingDraw.id) {
        setDrawSuccess(null);
      }
    } catch (err) {
      alert('Failed to delete winner: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setConfirmDeleting(false);
    }
  };

  // Issue Offline/Cash Ticket
  const handleIssueManualTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualQuantity < 1) return;
    setManualIssuing(true);
    setManualIssuedResult(null);
    try {
      const res = await createManualTicketOrder({
        customerName: manualCustomerName.trim() || 'Offline Counter Player',
        customerMobile: manualCustomerMobile.trim(),
        quantity: manualQuantity,
        notes: manualNotes,
        ticketPrice: campaignTicketPrice,
      });
      setManualIssuedResult(res);
      setManualCustomerName('');
      setManualCustomerMobile('');
      setManualQuantity(1);
    } catch (err) {
      alert('Failed to issue manual tickets: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setManualIssuing(false);
    }
  };

  // Save Campaign Settings
  const handleSaveCampaignSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCampaign(true);
    setCampaignSavedNotice(false);
    try {
      await updateCampaignSettings(campaign.id, {
        title: campaignTitle.trim(),
        ticketPriceRupees: Number(campaignTicketPrice),
        grandPrize: campaignGrandPrize.trim(),
        secondPrize: campaignSecondPrize.trim(),
        thirdPrize: campaignThirdPrize.trim(),
        status: campaignStatus,
      });
      setCampaignSavedNotice(true);
      setTimeout(() => setCampaignSavedNotice(false), 3000);
    } catch (err) {
      alert('Failed to update campaign: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingCampaign(false);
    }
  };

  // CSV Export Utility
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrders = () => {
    const headers = ['Order ID', 'Player Name', 'Email', 'Quantity', 'Amount (INR)', 'Status', 'UTR #', 'Payment Gateway', 'Date'];
    const rows = orders.map(o => [
      o.id,
      o.userName || '',
      o.userEmail || '',
      o.quantity,
      o.totalAmountRupees,
      o.status,
      o.utrNumber || '',
      o.paymentGateway || 'MANUAL',
      new Date(o.createdAt).toLocaleString(),
    ]);
    exportToCSV('mahabumper_orders', headers, rows);
  };

  const handleExportTickets = () => {
    const headers = ['Ticket Number', 'Ticket ID', 'Order ID', 'Player Name', 'Email', 'Status', 'Issued Date'];
    const rows = tickets.map(t => [
      t.ticketNumber,
      t.id,
      t.orderId,
      t.userName || '',
      t.userEmail || '',
      t.status,
      new Date(t.createdAt).toLocaleString(),
    ]);
    exportToCSV('mahabumper_tickets', headers, rows);
  };

  const handleExportWinners = () => {
    const headers = ['Draw ID', 'Winning Ticket', 'Winner Name', 'Email', 'Prize Description', 'Claim Status', 'Remarks', 'Draw Date', 'Drawn By'];
    const rows = draws.map(d => [
      d.id,
      d.winningTicketNumber,
      d.winnerName,
      d.winnerEmail,
      d.prizeDescription,
      d.claimStatus || 'PENDING_CLAIM',
      d.remarks || '',
      new Date(d.drawDate).toLocaleString(),
      d.drawnBy,
    ]);
    exportToCSV('mahabumper_winners', headers, rows);
  };

  const selectedTicketObj = activeTickets.find(t => t.id === selectedTicketId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Cinzel']">
                Super Admin Console
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Live Firestore
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage UPI payments, serialized tickets, winner draws, live campaign settings & data exports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsManualTicketModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue Offline Ticket</span>
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* 5 Financial & Inventory KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Verified Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{approvedOrders.length} approved orders</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending UPI</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono mt-1">
            ₹{pendingAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{pendingOrders.length} pending review</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Tickets</span>
            <TicketIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {activeTickets.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Eligible for draws</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Winners Declared</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {draws.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{winnerTickets.length} winning tickets</div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ticket Price</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
            ₹{campaign.ticketPriceRupees}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Status: {campaign.status}</div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Payment Orders</span>
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TicketIcon className="w-4 h-4" />
          <span>Tickets Directory</span>
          <span className="font-mono text-[10px] opacity-70">({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('draw')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'draw'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Winner Draws & Console</span>
          {draws.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
              {draws.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Campaign Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'export'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>CSV Export</span>
        </button>
      </div>

      {/* 1. PAYMENT ORDERS TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              {(['ALL', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setPaymentFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    paymentFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {filter} ({orders.filter(o => filter === 'ALL' || o.status === filter).length})
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search order ID, email, UTR..."
                value={orderSearchTerm}
                onChange={e => setOrderSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 text-xs">
              No orders found matching the filter "{paymentFilter}".
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        {order.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          order.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">PLAYER</span>
                        <span className="font-semibold text-slate-900 truncate block">
                          {order.userName || 'Anonymous'}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {order.userEmail}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">TICKETS & AMOUNT</span>
                        <span className="font-bold text-slate-900">
                          {order.quantity} Tickets
                        </span>
                        <span className="text-emerald-700 font-extrabold block">
                          ₹{order.totalAmountRupees}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">UTR / REF NUMBER</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                          <span className="truncate max-w-[130px]">{order.utrNumber}</span>
                          <button
                            onClick={() => copyToClipboard(order.utrNumber, order.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">GATEWAY</span>
                        <span className="font-mono text-slate-600">
                          {order.paymentGateway || 'MANUAL'}
                        </span>
                      </div>
                    </div>

                    {order.rejectionReason && (
                      <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                        <strong>Rejection Reason:</strong> {order.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {order.paymentGateway === 'RUPAYEX' && (
                      <button
                        onClick={() => handleCheckGateway(order)}
                        disabled={checkingGatewayId === order.id}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {checkingGatewayId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        <span>Check Gateway Status</span>
                      </button>
                    )}

                    {order.status === 'PENDING_VERIFICATION' && (
                      <>
                        <button
                          onClick={() => handleVerify(order, true)}
                          disabled={loadingOrderId === order.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {loadingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Approve & Issue {order.quantity} Tickets</span>
                        </button>

                        <button
                          onClick={() => setRejectionModalOrder(order)}
                          disabled={loadingOrderId === order.id}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {order.status === 'REJECTED' && (
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete rejected order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. TICKETS DIRECTORY TAB */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              {(['ALL', 'ACTIVE', 'WINNER'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setTicketStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors ${
                    ticketStatusFilter === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status} ({status === 'ALL' ? tickets.length : status === 'ACTIVE' ? activeTickets.length : winnerTickets.length})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
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

              <button
                onClick={() => setIsManualTicketModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Issue Ticket</span>
              </button>
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
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
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
                        ★ Official Winner
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. WINNER DRAWS & CONSOLE TAB */}
      {activeTab === 'draw' && (
        <div className="space-y-6">
          {/* Main Draw Console Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Cinzel'] text-slate-900">
                    Lucky Draw Execution & Winner Room
                  </h3>
                  <p className="text-xs text-slate-600">
                    Declare winners manually by choosing any confirmed ticket, or run the animated randomizer wheel!
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700">
                Eligible Active Tickets: {activeTickets.length}
              </div>
            </div>

            {drawError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{drawError}</span>
              </div>
            )}

            {/* Rolling Animation Indicator */}
            {isRollingAnimation && (
              <div className="p-8 rounded-3xl bg-slate-950 text-white text-center space-y-3 animate-pulse shadow-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Drawing Lucky Winner Ticket...</span>
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-extrabold text-amber-400 tracking-widest">
                  {rollingCandidateNumber}
                </div>
                <p className="text-xs text-slate-400">
                  Selecting candidate from {activeTickets.length} confirmed active tickets...
                </p>
              </div>
            )}

            {/* Success Winner Card */}
            {drawSuccess && !isRollingAnimation && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 text-center space-y-3 shadow-md animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Winner Declared & Recorded in Firestore!</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-950 tracking-wider">
                  {drawSuccess.winningTicketNumber}
                </div>
                <p className="text-sm text-slate-800 font-medium">
                  Player: <strong className="text-slate-950">{drawSuccess.winnerName}</strong> ({drawSuccess.winnerEmail})
                </p>
                <div className="text-xs text-emerald-900 font-mono font-bold bg-white/70 py-1.5 px-3 rounded-xl border border-emerald-200 inline-block">
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

                  {selectedTicketObj && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Candidate Ready for Declaration</span>
                        </span>
                        <span className="font-mono text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded font-bold">
                          READY
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">TICKET #</span>
                          <span className="font-extrabold text-sm text-slate-900">{selectedTicketObj.ticketNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">PLAYER</span>
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
                <span>या रैंडम लकी ड्रॉ स्पिनर का उपयोग करें:</span>
                <button
                  type="button"
                  onClick={() => handleDeclareWinner(undefined)}
                  disabled={drawLoading || activeTickets.length === 0}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>Spin & Pick Random Ticket ({activeTickets.length} candidates)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Declared Winners History & Management Log */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-['Cinzel']">
                    Declared Winners Management (विजेता प्रबंधन)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Edit prize tier, update claim status, add admin notes, or delete a declared winner.
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
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
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {draw.winningTicketNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                          WINNER
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          draw.claimStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : draw.claimStatus === 'DISPATCHED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {draw.claimStatus || 'PENDING_CLAIM'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(draw.drawDate).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-800 font-medium">
                        Player: <strong className="text-slate-950">{draw.winnerName}</strong> ({draw.winnerEmail})
                      </div>

                      <div className="text-amber-800 font-semibold text-xs flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Prize: {draw.prizeDescription}</span>
                      </div>

                      {draw.remarks && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200 max-w-xl">
                          <strong>Admin Remarks:</strong> {draw.remarks}
                        </div>
                      )}
                    </div>

                    {/* Actions: Edit & Delete Winner */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditWinner(draw)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Edit Winner</span>
                      </button>

                      <button
                        onClick={() => setDeletingDraw(draw)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Winner</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CAMPAIGN SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-['Cinzel'] text-slate-900">
                Live Campaign Configuration & Pricing
              </h3>
              <p className="text-xs text-slate-500">
                Edit ticket price, campaign title, prizes, and draw status in real time.
              </p>
            </div>
            {campaignSavedNotice && (
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Firestore!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCampaignSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Campaign Title:
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Ticket Rate (₹ INR):
                </label>
                <input
                  type="number"
                  min="1"
                  value={campaignTicketPrice}
                  onChange={e => setCampaignTicketPrice(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                1st Mega Grand Prize:
              </label>
              <input
                type="text"
                value={campaignGrandPrize}
                onChange={e => setCampaignGrandPrize(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  2nd Prize Description:
                </label>
                <input
                  type="text"
                  value={campaignSecondPrize}
                  onChange={e => setCampaignSecondPrize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  3rd Prize Description:
                </label>
                <input
                  type="text"
                  value={campaignThirdPrize}
                  onChange={e => setCampaignThirdPrize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                Campaign Status:
              </label>
              <select
                value={campaignStatus}
                onChange={e => setCampaignStatus(e.target.value as 'active' | 'closed' | 'drawn')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
              >
                <option value="active">Active (Ticket sales open)</option>
                <option value="closed">Closed (Sales paused)</option>
                <option value="drawn">Drawn (Winners declared)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingCampaign}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingCampaign ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
                <span>Save Campaign Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. CSV EXPORT & REPORTING TAB */}
      {activeTab === 'export' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold font-['Cinzel'] text-slate-900">
              Data Export & Auditing Suite
            </h3>
            <p className="text-xs text-slate-500">
              Download complete spreadsheets in standard CSV format for accounting, taxation, and legal record keeping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Orders Master CSV</span>
              </div>
              <p className="text-xs text-slate-500">
                Exports all {orders.length} orders with player details, UTR numbers, amounts, approval timestamps, and payment methods.
              </p>
              <button
                onClick={handleExportOrders}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Orders ({orders.length})</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <TicketIcon className="w-5 h-5 text-indigo-600" />
                <span>Tickets Master CSV</span>
              </div>
              <p className="text-xs text-slate-500">
                Exports all {tickets.length} serialized tickets (MB-XXXXXX) with associated user email, order ID, and status.
              </p>
              <button
                onClick={handleExportTickets}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Tickets ({tickets.length})</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Winners Master CSV</span>
              </div>
              <p className="text-xs text-slate-500">
                Exports all {draws.length} declared draws with winning ticket numbers, prize tiers, claim statuses, and draw dates.
              </p>
              <button
                onClick={handleExportWinners}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Winners ({draws.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WINNER MODAL */}
      {editingDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 font-['Cinzel']">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Edit Winner Declaration ({editingDraw.winningTicketNumber})</span>
              </div>
              <button
                onClick={() => setEditingDraw(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Prize Description:
                </label>
                <input
                  type="text"
                  value={editPrizeDesc}
                  onChange={e => setEditPrizeDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Claim Status:
                </label>
                <select
                  value={editClaimStatus}
                  onChange={e => setEditClaimStatus(e.target.value as 'PENDING_CLAIM' | 'DISPATCHED' | 'DELIVERED')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="PENDING_CLAIM">Pending Claim (Winner to submit bank details)</option>
                  <option value="DISPATCHED">Dispatched (Gold Coin/Cheque dispatched)</option>
                  <option value="DELIVERED">Delivered & Completed (Payment settled)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Admin Remarks / Notes:
                </label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                  placeholder="e.g., Verified bank details, NEFT UTR #12345678, Gold coin couriered..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDraw(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditWinner}
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Updates</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE WINNER CONFIRMATION MODAL */}
      {deletingDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-rose-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="font-bold text-base text-rose-900 font-['Cinzel']">
                Delete Winner Declaration?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete the winner record for Ticket{' '}
                <strong className="text-slate-900 font-mono">{deletingDraw.winningTicketNumber}</strong> ({deletingDraw.winnerName})?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="font-bold">What will happen:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                <li>The draw record will be completely erased from Firestore.</li>
                <li>Ticket {deletingDraw.winningTicketNumber} will revert back to <strong>ACTIVE</strong> status.</li>
                <li>Campaign status will be restored to <strong>active</strong>.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDraw(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteWinner}
                disabled={confirmDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {confirmDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete Winner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL / OFFLINE TICKET ISSUANCE MODAL */}
      {isManualTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 font-['Cinzel']">
                <TicketIcon className="w-5 h-5 text-amber-600" />
                <span>Issue Offline / Cash Tickets</span>
              </div>
              <button
                onClick={() => {
                  setIsManualTicketModalOpen(false);
                  setManualIssuedResult(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {manualIssuedResult ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    {manualIssuedResult.ticketNumbers.length} Tickets Issued Successfully!
                  </h4>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-xs text-slate-900 flex flex-wrap gap-2 justify-center max-h-36 overflow-y-auto">
                    {manualIssuedResult.ticketNumbers.map((num, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 font-bold">
                        {num}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setManualIssuedResult(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    Issue More Tickets
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIssueManualTickets} className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block">
                      Customer / Player Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={manualCustomerName}
                      onChange={e => setManualCustomerName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase tracking-wider block">
                        Mobile Number:
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={manualCustomerMobile}
                        onChange={e => setManualCustomerMobile(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase tracking-wider block">
                        Ticket Quantity:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={manualQuantity}
                        onChange={e => setManualQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        required
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-600">Total Cash Collected:</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      ₹{manualQuantity * campaignTicketPrice} ({manualQuantity} × ₹{campaignTicketPrice})
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block">
                      Notes / Tag:
                    </label>
                    <input
                      type="text"
                      value={manualNotes}
                      onChange={e => setManualNotes(e.target.value)}
                      placeholder="e.g., Counter cash, VIP sponsor"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsManualTicketModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={manualIssuing}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {manualIssuing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TicketIcon className="w-3.5 h-3.5" />}
                      <span>Issue {manualQuantity} Tickets Now</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
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
