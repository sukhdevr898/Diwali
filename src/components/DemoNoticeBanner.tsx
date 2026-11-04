import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const DemoNoticeBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-rose-950/80 to-amber-950/80 border-b border-amber-500/30 text-amber-100 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300 uppercase tracking-wider">
            Mandatory Demonstration Disclosure:
          </span>
          <span className="text-amber-200/90 truncate max-w-xl">
            Simulated contest environment. No real money collected, no real lottery tickets issued, zero cash value.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium underline underline-offset-2 shrink-0 ml-auto sm:ml-0"
        >
          {expanded ? 'Hide full notice' : 'View legal disclosure'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-500/20 text-amber-200/80 space-y-1.5 leading-relaxed">
          <p className="font-medium text-amber-100">
            “This website is a software demonstration. All orders, payments, tickets, draw outcomes and prize claims are simulated. No real payment is collected, no real lottery ticket is issued, and no real cash prize or gift is awarded through this demo. Demo records have no monetary value.”
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-amber-300/70 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Real Payments: DISABLED
            </span>
            <span>• Integer paise arithmetic (10,000 paise = ₹100 test value)</span>
            <span>• Server-side token verification & tamper-evident audit logs</span>
            <span>• Compliant with Indian software demonstration guidelines</span>
          </div>
        </div>
      )}
    </div>
  );
};
