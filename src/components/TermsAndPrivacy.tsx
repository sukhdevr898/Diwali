import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TermsAndPrivacy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'compliance'>('terms');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-sm font-bold font-['Cinzel'] transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'terms'
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" />
          Official Terms & Rules
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-sm font-bold font-['Cinzel'] transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-600" />
          Privacy Notice
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-sm font-bold font-['Cinzel'] transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'compliance'
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-600" />
          Security Safeguards
        </button>
      </div>

      {/* Terms Section */}
      {activeTab === 'terms' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              General Rules & Eligibility
            </span>
            <p className="text-sm font-medium text-slate-800">
              सभी भागीदार 18 वर्ष या उससे अधिक आयु के होने चाहिए। प्रति लकी टिकट ₹49 की दर से ऑनलाइन पेमेंट के माध्यम से बुक किया जाता है।
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 font-['Cinzel']">
              1. टिकट खरीद व सत्यापन
            </h3>
            <p>
              प्रत्येक टिकट को एक अनूठा अल्फ़ान्यूमेरिक सीरियल नंबर सौंपा जाता है जो सीधे आपके प्लेयर डैशबोर्ड में डिजिटल रूप से संग्रहीत होता है। UPI पेमेंट गेटवे द्वारा सत्यापित होने पर टिकट तुरंत लाइव हो जाता है।
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 font-['Cinzel']">
              2. 10 दोस्तों को शेयर करें कार्यक्रम
            </h3>
            <p>
              टिकट धारक अपने दोस्तों को व्हाट्सएप अथवा सोशल मीडिया पर शेयर कर सकते हैं। 10 दोस्तों को शेयर करने पर खिलाड़ी को VIP Lucky Booster बैज व अतिरिक्त ड्रा प्रविष्टि दी जाती है।
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 font-['Cinzel']">
              3. निष्पक्ष ड्रा व पुरस्कार वितरण
            </h3>
            <p>
              ड्रा निर्धारित तिथि पर निष्पक्ष रूप से सभी सत्यापित प्रविष्टियों से निकाला जाएगा। 1st प्राइज ₹2,50,000 + 10g Gold Coin विजेता के बैंक खाते व पते पर सीधे हस्तांतरित किया जाएगा।
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      {activeTab === 'privacy' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-slate-700 text-sm leading-relaxed">
          <h3 className="text-lg font-bold text-slate-900 font-['Cinzel']">
            डेटा सुरक्षा व गोपनीयता
          </h3>
          <p>
            हम आपके Google साइन-इन ईमेल, नाम व प्रोफाइल फोटो का उपयोग केवल आपके टिकटों और पुरस्कारों के प्रबंधन के लिए करते हैं। आपकी जानकारी किसी तीसरे पक्ष के साथ कभी साझा नहीं की जाती।
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>TLS / HTTPS एन्क्रिप्टेड ट्रांसमिशन</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Google Firebase सुरक्षित प्रमाणीकरण</span>
            </div>
          </div>
        </div>
      )}

      {/* Compliance */}
      {activeTab === 'compliance' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-slate-700 text-sm leading-relaxed">
          <h3 className="text-lg font-bold text-slate-900 font-['Cinzel']">
            सिस्टम ऑडिट व पारदर्शिता
          </h3>
          <p>
            सभी लेन-देन, टिकट सीरियल और ड्रा परिणाम क्लाउड डेटाबेस पर क्रिप्टोग्राफिक टाइमस्टैम्प के साथ दर्ज किए जाते हैं।
          </p>
        </div>
      )}
    </div>
  );
};
