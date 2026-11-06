import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  ShieldAlert, 
  ArrowRight,
  Globe
} from 'lucide-react';

export const AuthErrorModal: React.FC = () => {
  const { authError, clearAuthError, login, loginWithRedirectMode } = useAuth();
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!authError) return null;

  const currentHostname = window.location.hostname;
  const isUnauthorizedDomain = authError.code === 'auth/unauthorized-domain';
  const isPopupBlocked = authError.code === 'auth/popup-blocked';

  const firebaseSettingsUrl = 
    'https://console.firebase.google.com/project/gen-lang-client-0910909909/authentication/settings';

  const handleCopyHostname = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRetryPopup = async () => {
    setRetrying(true);
    try {
      await login();
    } finally {
      setRetrying(false);
    }
  };

  const handleRetryRedirect = async () => {
    setRetrying(true);
    try {
      await loginWithRedirectMode();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true" 
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isUnauthorizedDomain ? 'bg-amber-500 text-slate-950' : 'bg-rose-600 text-white'
            }`}>
              {isUnauthorizedDomain ? <Globe className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg font-['Cinzel']">
                {isUnauthorizedDomain
                  ? 'Render Host Authorization Required'
                  : isPopupBlocked
                  ? 'Browser Popup Blocked'
                  : 'Google Sign-In Error'}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {isUnauthorizedDomain
                  ? 'Firebase Console में अपना Render डोमेन ऑथराइज़ करें'
                  : 'Login verification status'}
              </p>
            </div>
          </div>
          <button
            onClick={clearAuthError}
            className="p-1.5 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {isUnauthorizedDomain ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Google Login is blocked because this Render domain is not registered yet.</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Firebase Authentication सुरक्षा कारणों से सिर्फ अधिकृत (Authorized) डोमेन पर Google Login अनुमति देता है। इस एरर को ठीक करने के लिए नीचे दिए गए डोमेन को <strong>Firebase Console</strong> में एक बार Add कर दीजिए।
                </p>
              </div>

              {/* Hostname Copy Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Current Host Domain (कॉपी करें):
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-100 border border-slate-300">
                  <code className="text-sm font-mono font-bold text-slate-900 flex-1 px-2 select-all break-all">
                    {currentHostname}
                  </code>
                  <button
                    onClick={handleCopyHostname}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Domain'}</span>
                  </button>
                </div>
              </div>

              {/* Steps Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                  Authorized Domains कहाँ मिलेगा? (Step-by-Step):
                </span>
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-900">
                      👉 <strong>तरीका 1 (Direct 1-Click Link):</strong>
                    </p>
                    <p>
                      नीचे दिए गए <strong>"Open Firebase Console Settings"</strong> बटन को दबाएं। यह आपको सीधे <strong>Settings</strong> टैब पर ले जाएगा जहाँ नीचे <strong>"Authorized domains"</strong> की लिस्ट है।
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-900">
                      👉 <strong>तरीका 2 (अगर आप पहले से Firebase Console में हैं):</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Left Menu में <strong>Build → Authentication</strong> पर जाएं।</li>
                      <li>
                        स्क्रीन के ऊपर 5 टैब दिखेंगे: 
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] ml-1">
                          Users | Sign-in method | Templates | Usage | <strong>Settings</strong>
                        </span>
                      </li>
                      <li>सबसे दाईं तरफ वाले <strong>"Settings"</strong> टैब पर क्लिक करें।</li>
                      <li>अब आपको <strong>"Authorized domains"</strong> सेक्शन दिखेगा।</li>
                      <li><strong>"Add domain"</strong> बटन दबाएं और <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold text-[11px]">{currentHostname || 'diwali-e2fq.onrender.com'}</code> पेस्ट करके <strong>Add</strong> पर क्लिक करें।</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Open Firebase Console Settings</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={handleRetryPopup}
                  disabled={retrying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                  <span>Try Login Again</span>
                </button>
              </div>
            </div>
          ) : isPopupBlocked ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
                <p className="text-slate-700 leading-relaxed">
                  आपके ब्राउज़र ने Google Sign-In पॉपअप विंडो को ब्लॉक कर दिया है (विशेषकर मोबाइल या इन-ऐप ब्राउज़र में)।
                  कृपया नीचे <strong>"Sign In via Redirect"</strong> का उपयोग करें।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  onClick={handleRetryRedirect}
                  disabled={retrying}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Sign In via Direct Redirect</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                <span className="font-bold text-rose-900 block font-mono">
                  {authError.code}
                </span>
                <p className="text-slate-700">{authError.message}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={clearAuthError}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleRetryPopup}
                  disabled={retrying}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                  <span>Retry Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
