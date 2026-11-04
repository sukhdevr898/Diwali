import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Ticket, LogIn, LogOut, Trophy, Star, Gift, Share2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingOrdersCount: number;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount,
  onOpenShare,
}) => {
  const { user, profile, isAdmin, login, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('campaign')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform font-bold">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 font-['Cinzel'] tracking-wide">
                  Mahabumper Draw
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full">
                  ₹49 Only
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans hidden sm:block">
                अपना लक आज़माओ • Official ₹49 Prize Lottery
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('campaign')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'campaign'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lottery Home
            </button>
            <button
              onClick={() => setActiveTab('prizeboard')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'prizeboard'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Win Prize Board</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>Reviews (4.9★)</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>My Tickets</span>
            </button>
            <button
              onClick={() => setActiveTab('draws')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'draws'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Draw Results</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`relative px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-rose-50 text-rose-900 border border-rose-300 font-bold'
                    : 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                }`}
              >
                <Shield className="w-4 h-4 text-rose-600" />
                <span>Admin</span>
                {pendingOrdersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Action Bar (Share + Auth) */}
          <div className="flex items-center gap-2.5">
            {/* Share with 10 friends quick header button */}
            <button
              onClick={onOpenShare}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-sm shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Share (10 Friends)</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {profile?.displayName || user.displayName || 'Player'}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600">
                    {isAdmin ? '★ Admin' : 'Verified'}
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-2 border-t border-slate-200 bg-slate-50/80 text-xs">
        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
            activeTab === 'campaign' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('prizeboard')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
            activeTab === 'prizeboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Prize Board
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          My Tickets
        </button>
        <button
          onClick={() => setActiveTab('draws')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
            activeTab === 'draws' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Draw Results
        </button>
        <button
          onClick={onOpenShare}
          className="px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer bg-emerald-600 text-white font-bold flex items-center gap-1"
        >
          <Gift className="w-3 h-3" />
          <span>Share (10)</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeTab === 'admin' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700 font-semibold'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin ({pendingOrdersCount})</span>
          </button>
        )}
      </div>
    </header>
  );
};
