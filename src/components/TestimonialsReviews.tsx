import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  prizeWon?: string;
  verified: boolean;
}

const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Pooja Sharma',
    location: 'New Delhi',
    rating: 5,
    date: '2 days ago',
    comment: 'पिछली बार मुझे ₹50,000 का 2nd प्राइज मिला था! बैंक अकाउंट में सीधा ट्रांसफर हुआ। इस बार भी मैंने 5 टिकट लिए हैं। अपना लक आज़माओ दोस्तों, सच में बहुत फेयर और पारदर्शी सिस्टम है!',
    prizeWon: 'Won ₹50,000 Cash Bumper',
    verified: true,
  },
  {
    id: 'rev_2',
    name: 'Rahul Verma',
    location: 'Jaipur, Rajasthan',
    rating: 5,
    date: '3 days ago',
    comment: 'UPI से पेमेंट किया और तुरंत टिकट सीरियल नंबर के साथ डैशबोर्ड में आ गया। कोई फ्रॉड नहीं, कोई छुपा हुआ चार्ज नहीं। ₹49 में इतना बड़ा मौका बार-बार नहीं मिलता।',
    verified: true,
  },
  {
    id: 'rev_3',
    name: 'Sunita Patel',
    location: 'Ahmedabad, Gujarat',
    rating: 5,
    date: '5 days ago',
    comment: 'अपनी किस्मत आज़माने का सबसे भरोसेमंद प्लेटफॉर्म है। हर टिकट का सीरियल नंबर और QR कोड मिलता है। ड्रॉ भी लाइव होता है।',
    verified: true,
  },
  {
    id: 'rev_4',
    name: 'Amit Kumar',
    location: 'Lucknow, Uttar Pradesh',
    rating: 5,
    date: '1 week ago',
    comment: 'मैंने और मेरे पूरे परिवार ने टिकट लिए हैं। पेमेंट एकदम फास्ट है और एडमिन वेरिफिकेशन तुरंत हो जाता है। 5 स्टार सर्विस!',
    verified: true,
  },
  {
    id: 'rev_5',
    name: 'Vikram Mehta',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    date: '1 week ago',
    comment: 'Customer support is awesome. Payment verification is 100% real and automated. Highly recommended!',
    verified: true,
  },
  {
    id: 'rev_6',
    name: 'Deepak Sandhu',
    location: 'Amritsar, Punjab',
    rating: 5,
    date: '2 weeks ago',
    comment: 'महाबंपर: अपना लक आज़माओ! ₹49 कुछ भी नहीं है, पर अगर 1st प्राइज निकल गया तो ₹2.5 लाख और सोने का सिक्का मिलेगा!',
    prizeWon: 'Won ₹10,000 3rd Prize (2025)',
    verified: true,
  },
];

export const TestimonialsReviews: React.FC = () => {
  const [filterRating] = useState<number | 'ALL'>('ALL');

  const filteredReviews = filterRating === 'ALL'
    ? REVIEWS
    : REVIEWS.filter(r => r.rating === filterRating);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & Rating Overview */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          Customer Ratings & Verified Feedback
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Cinzel']">
          Player Reviews & Trust
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Over 14,800+ players have participated in our transparent prize draws across India. Here is what our community says.
        </p>
      </div>

      {/* Aggregate Score Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:border-r border-slate-200 md:pr-6 space-y-1">
          <div className="text-5xl font-extrabold text-slate-900 font-mono">
            4.9
          </div>
          <div className="flex justify-center gap-1 text-amber-400 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Based on 14,820+ Ratings
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-center">
            <span className="text-2xl font-bold text-emerald-600">99.8%</span>
            <span className="text-[11px] text-slate-600 block">Instant Payment Success</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-center">
            <span className="text-2xl font-bold text-amber-600">100%</span>
            <span className="text-[11px] text-slate-600 block">Transparent Live Draws</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-center">
            <span className="text-2xl font-bold text-slate-800">24/7</span>
            <span className="text-[11px] text-slate-600 block">Automated Ticket Delivery</span>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.map(rev => (
          <div
            key={rev.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm font-['Cinzel'] shadow-xs">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{rev.name}</span>
                      {rev.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{rev.location}</span>
                  </div>
                </div>

                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {rev.prizeWon && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{rev.prizeWon}</span>
                </div>
              )}

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{rev.date}</span>
              <span className="text-amber-700 font-bold">#ApnaLuckAzmaao</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
