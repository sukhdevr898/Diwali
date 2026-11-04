import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createTicketOrder, verifyOrderPayment, TICKET_RATE_RUPEES } from '../lib/firestore-service';
import { initiateRupayexOrder, queryRupayexOrderStatus } from '../lib/rupayex-service';
import { Campaign, Order } from '../types';
import {
  X,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  Zap,
  RefreshCw,
  Sparkles,
  Smartphone,
  MessageCircle,
  Copy,
  Check,
  Send,
  Users,
  Award
} from 'lucide-react';

interface TicketPurchaseModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
  onOpenShareModal?: (orderId: string, count: number) => void;
}

const STORAGE_KEY = 'mahabumper_shared_friends_count';
const MAX_SHARE_TARGET = 10;

export const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({
  campaign,
  onClose,
  onSuccess,
  onOpenShareModal,
}) => {
  const { user, login } = useAuth();
  const [quantity, setQuantity] = useState<number>(1);
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Share with 10 friends state inside the modal
  const [shareCount, setShareCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Math.min(parseInt(saved, 10), MAX_SHARE_TARGET) : 0;
    } catch {
      return 0;
    }
  });
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // Gateway Order State
  const [activeGatewayOrder, setActiveGatewayOrder] = useState<{
    orderId: string;
    amount: number;
    paymentUrl?: string;
    status: 'CREATED' | 'CHECKING' | 'SUCCESS' | 'FAILED';
    utr?: string;
  } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const totalAmount = quantity * TICKET_RATE_RUPEES;

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleIncrementShare = () => {
    setShareCount(prev => {
      const next = Math.min(prev + 1, MAX_SHARE_TARGET);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleWhatsAppShare = () => {
    handleIncrementShare();
    const appUrl = window.location.origin;
    const shareText = `🎉 मैंने Mahabumper Lucky Draw में ₹49 का टिकट खरीदा है! 1st प्राइज ₹2,50,000 Cash + 10g Gold Coin है।\n\nआप भी अपना लक आज़माओ सिर्फ ₹49 में 👉 ${appUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyLink = () => {
    handleIncrementShare();
    const appUrl = window.location.origin;
    const shareText = `🎉 मैंने Mahabumper Lucky Draw में ₹49 का टिकट खरीदा है! 1st प्राइज ₹2,50,000 Cash + 10g Gold Coin है। आप भी अपना लक आज़माओ 👉 ${appUrl}`;
    navigator.clipboard.writeText(shareText);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Initiate Online Payment
  const handleInitiatePayment = async () => {
    if (!user) {
      await login();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const orderId = `ORD${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      // 1. Create pending order in database
      await createTicketOrder({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email?.split('@')[0] || 'Player',
        quantity,
        paymentMethod: 'UPI',
        utrNumber: 'ONLINE_GATEWAY_PENDING',
        notes: customerMobile ? `Mobile: ${customerMobile}` : '',
        orderId,
        paymentGateway: 'RUPAYEX',
      });

      // 2. Call Payment Gateway
      const res = await initiateRupayexOrder({
        amount: totalAmount,
        orderId,
        customerMobile: customerMobile.trim(),
        remark1: `Lottery: ${quantity} Tickets`,
      });

      const paymentUrl =
        (res.data?.payment_url as string) ||
        (res.data?.qr_url as string) ||
        (typeof res.data?.data === 'string' ? res.data.data : undefined);

      if (paymentUrl) {
        try {
          window.open(paymentUrl, '_blank');
        } catch {
          // Popup blocked fallback
        }
      }

      setActiveGatewayOrder({
        orderId,
        amount: totalAmount,
        paymentUrl,
        status: 'CREATED',
      });

      // Start automatic polling every 4 seconds
      startStatusPolling(orderId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Payment Gateway';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const startStatusPolling = (orderId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      await checkPaymentStatus(orderId, false);
    }, 4000);
  };

  const checkPaymentStatus = async (orderId: string, manualClick = false) => {
    if (manualClick) setLoading(true);
    try {
      const res = await queryRupayexOrderStatus(orderId);
      const data = res.data;

      // Strictly approve only when payment_status === 'SUCCESS'
      if (data && data.payment_status === 'SUCCESS') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        const utr = data.utr ? String(data.utr) : 'UPI_VERIFIED';

        setActiveGatewayOrder(prev => (prev ? { ...prev, status: 'SUCCESS', utr } : null));

        // Automatically approve and issue tickets in Firestore
        const fullOrder: Order = {
          id: orderId,
          userId: user?.uid || '',
          userEmail: user?.email || '',
          userName: user?.displayName || 'Player',
          campaignId: campaign.id,
          quantity,
          ticketPriceRupees: TICKET_RATE_RUPEES,
          totalAmountRupees: totalAmount,
          status: 'PENDING_VERIFICATION',
          paymentMethod: 'UPI',
          utrNumber: utr,
          paymentGateway: 'RUPAYEX',
          createdAt: new Date().toISOString(),
        };

        await verifyOrderPayment(fullOrder, true);
        onSuccess();
      } else if (data && data.payment_status === 'FAILED') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setActiveGatewayOrder(prev => (prev ? { ...prev, status: 'FAILED' } : null));
      } else if (data && data.payment_status === 'PENDING') {
        if (manualClick) {
          alert(`Payment Status: PENDING\n\nPayment has not been completed yet on UPI / QR. Please complete payment of ₹${totalAmount} and click 'Check Now'.`);
        }
      }
    } catch (err) {
      console.warn('Status poll warning:', err);
    } finally {
      if (manualClick) setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-1.5 font-['Cinzel']">
                <span>Mahabumper: अपना लक आज़माओ!</span>
              </h3>
              <p className="text-xs text-slate-500">
                सिर्फ ₹{TICKET_RATE_RUPEES} प्रति टिकट • 1st प्राइज ₹2.5 लाख + 10g Gold Coin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success State with Integrated Share With 10 Friends */}
        {activeGatewayOrder && activeGatewayOrder.status === 'SUCCESS' ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl font-bold font-['Cinzel'] text-emerald-800">
                पेमेंट सफल! टिकट एक्टिव हो गए हैं 🎉
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                ₹{totalAmount} का पेमेंट वेरिफाई हो गया है। आपके <strong>{quantity} लकी लॉटरी टिकट</strong> आपके डैशबोर्ड में जोड़ दिए गए हैं।
              </p>
            </div>

            {/* Order Details Receipt */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="text-slate-900 font-bold">{activeGatewayOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR / Ref:</span>
                <span className="text-emerald-700 font-bold">{activeGatewayOrder.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-bold">CONFIRMED (TICKETS ISSUED)</span>
              </div>
            </div>

            {/* Integrated Share With 10 Friends Feature */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 border border-amber-300 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span className="font-extrabold text-xs text-slate-900">
                    10 दोस्तों को शेयर करें (VIP लकी बोनस):
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-700">
                  {shareCount} / {MAX_SHARE_TARGET}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((shareCount / MAX_SHARE_TARGET) * 100)}%` }}
                />
              </div>

              {/* 10 dots */}
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: MAX_SHARE_TARGET }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 rounded-md flex items-center justify-center text-[9px] font-bold border ${
                      i < shareCount
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {i < shareCount ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
                  </div>
                ))}
              </div>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर शेयर करें (+1 Count)</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>लिंक कॉपी करके भी शेयर कर सकते हैं:</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                >
                  {linkCopied ? 'Copied (+1)!' : 'Copy Share Link (+1)'}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer text-xs uppercase tracking-wider shadow-sm"
            >
              अपने लकी टिकट देखें (View My Tickets)
            </button>
          </div>
        ) : activeGatewayOrder && activeGatewayOrder.status === 'CREATED' ? (
          /* Payment Processing State */
          <div className="space-y-6 py-2">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Payment Gateway Ready
              </div>

              <div className="text-2xl font-extrabold text-slate-900">
                Amount to Pay: ₹{totalAmount}
              </div>
              <p className="text-xs text-slate-600">
                Order ID: <span className="font-mono text-slate-900 font-bold">{activeGatewayOrder.orderId}</span>
              </p>
            </div>

            {activeGatewayOrder.paymentUrl && (
              <div className="space-y-3">
                <a
                  href={activeGatewayOrder.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all text-center cursor-pointer"
                >
                  <span>👉 Open UPI / QR Payment Page (₹{totalAmount})</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                  <span className="text-slate-500">If window didn't open:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeGatewayOrder.paymentUrl) {
                        navigator.clipboard.writeText(activeGatewayOrder.paymentUrl);
                        alert('Payment link copied to clipboard!');
                      }
                    }}
                    className="text-amber-700 hover:text-amber-900 underline text-[11px] font-semibold cursor-pointer"
                  >
                    Copy Payment Link
                  </button>
                </div>
              </div>
            )}

            {/* Status checking */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Checking payment status on gateway...</span>
                </div>
                <button
                  type="button"
                  onClick={() => checkPaymentStatus(activeGatewayOrder.orderId, true)}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>Check Now</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                <span>Payment Status:</span>
                <span className="font-mono font-bold text-amber-700 uppercase">PENDING (Pay on UPI)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                GPay, PhonePe, Paytm या UPI से पेमेंट पूरा करने के तुरंत बाद आपके टिकट ऑटोमैटिक जारी हो जाएंगे।
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (pollingRef.current) clearInterval(pollingRef.current);
                setActiveGatewayOrder(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel / Back
            </button>
          </div>
        ) : (
          /* Selection Step */
          <div className="space-y-6">
            {/* Step 1: Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                लकी टिकट संख्या चुनें (सिर्फ ₹{TICKET_RATE_RUPEES} प्रति टिकट)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`py-3 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
                      quantity === qty
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20 font-extrabold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>{qty} {qty === 1 ? 'Ticket' : 'Tickets'}</div>
                    <div className="text-[10px] opacity-80">₹{qty * TICKET_RATE_RUPEES}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp / मोबाइल नंबर (जीतने पर संपर्क के लिए)
              </label>
              <input
                type="tel"
                placeholder="उदा. 9876543210 (वैकल्पिक)"
                value={customerMobile}
                onChange={e => setCustomerMobile(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Payment Mode Highlight */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Instant Online Payment (UPI / QR / GPay / PhonePe / Paytm)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                जैसे ही आप पेमेंट करेंगे, सिस्टम ऑटोमैटिक रूप से आपके आधिकारिक लॉटरी टिकट जारी कर देगा।
              </p>
            </div>

            {/* Price Summary */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">कुल राशि ({quantity} टिकट × ₹{TICKET_RATE_RUPEES})</span>
              <span className="text-base font-extrabold text-amber-700">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>पेमेंट गेटवे खुल रहा है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>अपना लक आज़माओ — Pay ₹{totalAmount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
