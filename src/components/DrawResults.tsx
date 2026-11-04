import React from 'react';
import { Draw, Campaign } from '../types';
import { Award, Sparkles, Calendar, User, Trophy, ShieldCheck } from 'lucide-react';

interface DrawResultsProps {
  draws: Draw[];
  campaign: Campaign;
}

export const DrawResults: React.FC<DrawResultsProps> = ({ draws, campaign }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold uppercase">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          Official Winner Bulletin
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cinzel']">
          Mahabumper Draw Results
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          All draws are executed transparently from verified tickets and permanently preserved in Cloud Firestore.
        </p>
      </div>

      {draws.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3 shadow-xs">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 font-['Cinzel']">
            No Draws Conducted Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The live grand bumper draw will be conducted by the administrator once ticket entries are verified.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Scheduled Date: {campaign.drawDate ? new Date(campaign.drawDate).toLocaleDateString() : 'Official Draw Night'}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => (
            <div
              key={draw.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg relative overflow-hidden space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-['Cinzel'] text-base">
                      {campaign.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Draw ID: {draw.id}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{new Date(draw.drawDate).toLocaleString()}</span>
                </div>
              </div>

              {/* Winning Ticket Display */}
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-300 text-center space-y-2">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-800 font-bold">
                  Winning Lottery Ticket Number
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold font-mono text-slate-900 tracking-wider">
                  {draw.winningTicketNumber}
                </div>
                <div className="text-sm font-bold text-amber-900 pt-1">
                  Prize: {draw.prizeDescription}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <User className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">LUCKY WINNER</span>
                    <span className="font-bold text-slate-900">{draw.winnerName}</span>
                    <span className="text-[11px] text-slate-500 block">{draw.winnerEmail}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">TRANSPARENCY</span>
                    <span className="text-slate-800">Drawn from {draw.totalEligibleTickets} Tickets</span>
                    <span className="text-[11px] text-slate-500 block">Verified by Admin</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
