import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeCampaign,
  subscribeUserTickets,
  subscribeUserOrders,
  subscribeAllOrders,
  subscribeAllTickets,
  subscribeDraws,
  verifyOrderPayment,
  CAMPAIGN_ID,
  TICKET_RATE_RUPEES,
} from './lib/firestore-service';
import { queryRupayexOrderStatus } from './lib/rupayex-service';
import { Campaign, Order, Ticket, Draw } from './types';
import { Navbar } from './components/Navbar';
import { CampaignHero } from './components/CampaignHero';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { DrawResults } from './components/DrawResults';
import { TermsAndPrivacy } from './components/TermsAndPrivacy';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { PrizeBoard } from './components/PrizeBoard';
import { TestimonialsReviews } from './components/TestimonialsReviews';
import { RecentBuyerToast } from './components/RecentBuyerToast';
import { ShareWithFriendsModal } from './components/ShareWithFriendsModal';
import { AuthErrorModal } from './components/AuthErrorModal';
import { Sparkles, Gift } from 'lucide-react';

const DEFAULT_CAMPAIGN: Campaign = {
  id: CAMPAIGN_ID,
  title: 'Mahabumper Lucky Draw 2026',
  status: 'active',
  ticketPriceRupees: TICKET_RATE_RUPEES,
  prizeDescription: '₹2,50,000 Grand Cash + 10g 24K Gold Coin',
  grandPrize: '₹2,50,000 Cash + 10g 24K Gold Coin',
  secondPrize: '₹50,000 Cash (3 Lucky Winners)',
  thirdPrize: '₹10,000 Cash (10 Lucky Winners)',
  totalTicketsSold: 0,
  createdAt: new Date().toISOString(),
};

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('campaign');
  const [isPurchaseOpen, setIsPurchaseOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareData, setShareData] = useState<{ orderId?: string; ticketCount?: number }>({});

  // Firestore real-time state
  const [campaign, setCampaign] = useState<Campaign>(DEFAULT_CAMPAIGN);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);

  // Subscribe to Campaign and Draws
  useEffect(() => {
    const unsubCampaign = subscribeCampaign(setCampaign);
    const unsubDraws = subscribeDraws(setDraws);
    return () => {
      unsubCampaign();
      unsubDraws();
    };
  }, []);

  // Subscribe to user tickets and orders
  useEffect(() => {
    if (!user) {
      setUserTickets([]);
      setUserOrders([]);
      return;
    }

    const unsubTickets = subscribeUserTickets(user.uid, setUserTickets);
    const unsubOrders = subscribeUserOrders(user.uid, setUserOrders);

    return () => {
      unsubTickets();
      unsubOrders();
    };
  }, [user]);

  // If Admin, subscribe to all orders and all tickets
  useEffect(() => {
    if (!isAdmin) {
      setAllOrders([]);
      setAllTickets([]);
      return;
    }

    const unsubAllOrders = subscribeAllOrders(setAllOrders);
    const unsubAllTickets = subscribeAllTickets(setAllTickets);

    return () => {
      unsubAllOrders();
      unsubAllTickets();
    };
  }, [isAdmin]);

  const pendingOrdersCount = allOrders.filter(o => o.status === 'PENDING_VERIFICATION').length;
  const latestDraw = draws[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'admin' || params.get('admin') === 'true') {
      setActiveTab('admin');
    }

    const returnedOrderId = params.get('order_id');
    if (returnedOrderId) {
      setActiveTab('dashboard');
      queryRupayexOrderStatus(returnedOrderId)
        .then(res => {
          const data = res.data;
          if (data && data.payment_status === 'SUCCESS') {
            const matchingOrder = userOrders.find(o => o.id === returnedOrderId);
            if (matchingOrder && matchingOrder.status !== 'APPROVED') {
              verifyOrderPayment({ ...matchingOrder, utrNumber: String(data.utr || 'ONLINE_VERIFIED') }, true);
              setShareData({ orderId: returnedOrderId, ticketCount: matchingOrder.quantity });
              setIsShareModalOpen(true);
            }
          }
        })
        .catch(err => console.warn('Payment return status error:', err));
    }
  }, [userOrders]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans flex flex-col overflow-x-hidden">
      {/* Live Recent Buyer Toast Notification */}
      <RecentBuyerToast />

      {/* Authentication Error & Domain Diagnostic Modal */}
      <AuthErrorModal />

      {/* Top Banner */}
      <div className="relative z-30 bg-amber-500 border-b border-amber-600/30 text-slate-950 text-xs py-2 px-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="font-extrabold uppercase tracking-wider">
              Mahabumper Lucky Draw:
            </span>
            <span className="font-medium truncate">
              अपना लक आज़माओ! सिर्फ ₹49 में टिकट लो • 1st प्राइज ₹2,50,000 + 10g Gold Coin • सुरक्षित UPI पेमेंट
            </span>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950 text-white font-bold text-[11px] shrink-0 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Share (10 Friends)</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'campaign' && (
          <CampaignHero
            campaign={campaign}
            latestDraw={latestDraw}
            onOpenPurchase={() => setIsPurchaseOpen(true)}
            onViewTickets={() => setActiveTab('dashboard')}
            onViewPrizeBoard={() => setActiveTab('prizeboard')}
            onOpenShare={() => setIsShareModalOpen(true)}
          />
        )}

        {activeTab === 'prizeboard' && (
          <PrizeBoard
            onBuyTickets={() => setIsPurchaseOpen(true)}
          />
        )}

        {activeTab === 'reviews' && (
          <TestimonialsReviews />
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard
            tickets={userTickets}
            orders={userOrders}
            draws={draws}
            onOpenPurchase={() => setIsPurchaseOpen(true)}
            onOpenShare={() => setIsShareModalOpen(true)}
          />
        )}

        {activeTab === 'draws' && (
          <DrawResults
            draws={draws}
            campaign={campaign}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            campaign={campaign}
            orders={allOrders}
            tickets={allTickets}
            draws={draws}
          />
        )}

        {activeTab === 'terms' && (
          <TermsAndPrivacy />
        )}
      </main>

      {/* Buy Ticket Modal */}
      {isPurchaseOpen && (
        <TicketPurchaseModal
          campaign={campaign}
          onClose={() => setIsPurchaseOpen(false)}
          onSuccess={() => {
            setActiveTab('dashboard');
          }}
          onOpenShareModal={(orderId, count) => {
            setShareData({ orderId, ticketCount: count });
            setIsShareModalOpen(true);
          }}
        />
      )}

      {/* Share with 10 Friends Modal */}
      <ShareWithFriendsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        orderId={shareData.orderId}
        ticketCount={shareData.ticketCount}
      />

      {/* Clean White Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-slate-900 font-['Cinzel']">
                Mahabumper Lucky Draw
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-mono font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Rate: ₹49 / Ticket
              </span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-md">
              Powered by Cloud Firestore real-time database with verified online payments and cryptographic draw records.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('campaign')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Lottery Home
            </button>
            <button
              onClick={() => setActiveTab('prizeboard')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Win Prize Board
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Reviews (4.9★)
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-amber-700 font-bold hover:text-amber-800 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Share with 10 Friends
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('draws')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Draw Results
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Official Rules & Terms
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-rose-600 hover:text-rose-800 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Admin Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
