import React, { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';

// 140 Diverse Indian Girls & Boys ticket buyers across India
const RECENT_BUYERS = [
  // Girls
  { name: 'Pooja***', city: 'Delhi', qty: 2, time: 'just now' },
  { name: 'Neha***', city: 'Jaipur', qty: 3, time: '1 min ago' },
  { name: 'Priya***', city: 'Lucknow', qty: 5, time: '2 mins ago' },
  { name: 'Anjali***', city: 'Patna', qty: 1, time: '2 mins ago' },
  { name: 'Sneha***', city: 'Mumbai', qty: 4, time: '3 mins ago' },
  { name: 'Riya***', city: 'Kolkata', qty: 2, time: '3 mins ago' },
  { name: 'Simran***', city: 'Chandigarh', qty: 10, time: '4 mins ago' },
  { name: 'Tanvi***', city: 'Pune', qty: 3, time: '4 mins ago' },
  { name: 'Shreya***', city: 'Indore', qty: 5, time: '5 mins ago' },
  { name: 'Divya***', city: 'Ahmedabad', qty: 2, time: '5 mins ago' },
  { name: 'Megha***', city: 'Bhopal', qty: 1, time: '6 mins ago' },
  { name: 'Swati***', city: 'Kanpur', qty: 4, time: '6 mins ago' },
  { name: 'Kavita***', city: 'Varanasi', qty: 2, time: '7 mins ago' },
  { name: 'Muskan***', city: 'Agra', qty: 6, time: '7 mins ago' },
  { name: 'Khushi***', city: 'Dehradun', qty: 3, time: '8 mins ago' },
  { name: 'Sakshi***', city: 'Ranchi', qty: 5, time: '8 mins ago' },
  { name: 'Nisha***', city: 'Surat', qty: 2, time: '9 mins ago' },
  { name: 'Deepika***', city: 'Bengaluru', qty: 10, time: '9 mins ago' },
  { name: 'Aarti***', city: 'Nagpur', qty: 1, time: '10 mins ago' },
  { name: 'Komal***', city: 'Jodhpur', qty: 4, time: '10 mins ago' },
  { name: 'Shilpa***', city: 'Kota', qty: 3, time: '11 mins ago' },
  { name: 'Rashmi***', city: 'Ludhiana', qty: 2, time: '11 mins ago' },
  { name: 'Ankita***', city: 'Amritsar', qty: 5, time: '12 mins ago' },
  { name: 'Jyoti***', city: 'Gorakhpur', qty: 1, time: '12 mins ago' },
  { name: 'Sonam***', city: 'Meerut', qty: 2, time: '13 mins ago' },
  { name: 'Mansi***', city: 'Ghaziabad', qty: 4, time: '13 mins ago' },
  { name: 'Preeti***', city: 'Faridabad', qty: 3, time: '14 mins ago' },
  { name: 'Payal***', city: 'Gurugram', qty: 6, time: '14 mins ago' },
  { name: 'Kajal***', city: 'Noida', qty: 2, time: '15 mins ago' },
  { name: 'Suman***', city: 'Bikaner', qty: 1, time: '15 mins ago' },
  { name: 'Pallavi***', city: 'Udaipur', qty: 5, time: '16 mins ago' },
  { name: 'Ritu***', city: 'Gwalior', qty: 2, time: '16 mins ago' },
  { name: 'Pragya***', city: 'Prayagraj', qty: 3, time: '17 mins ago' },
  { name: 'Ishita***', city: 'Bareilly', qty: 4, time: '17 mins ago' },
  { name: 'Ruchi***', city: 'Aligarh', qty: 2, time: '18 mins ago' },
  { name: 'Kritika***', city: 'Moradabad', qty: 5, time: '18 mins ago' },
  { name: 'Dolly***', city: 'Saharanpur', qty: 1, time: '19 mins ago' },
  { name: 'Tanya***', city: 'Jalandhar', qty: 3, time: '19 mins ago' },
  { name: 'Garima***', city: 'Rohtak', qty: 2, time: '20 mins ago' },
  { name: 'Monika***', city: 'Panipat', qty: 4, time: '20 mins ago' },
  { name: 'Shivani***', city: 'Hisar', qty: 5, time: '21 mins ago' },
  { name: 'Nandini***', city: 'Karnal', qty: 1, time: '21 mins ago' },
  { name: 'Ananya***', city: 'Kolkata', qty: 10, time: '22 mins ago' },
  { name: 'Bhavna***', city: 'Ajmer', qty: 2, time: '22 mins ago' },
  { name: 'Gunjan***', city: 'Bhilwara', qty: 3, time: '23 mins ago' },
  { name: 'Rashi***', city: 'Alwar', qty: 4, time: '23 mins ago' },
  { name: 'Mahak***', city: 'Mathura', qty: 2, time: '24 mins ago' },
  { name: 'Lavanya***', city: 'Haridwar', qty: 5, time: '24 mins ago' },
  { name: 'Harsha***', city: 'Haldwani', qty: 1, time: '25 mins ago' },
  { name: 'Yashika***', city: 'Shimla', qty: 3, time: '25 mins ago' },
  { name: 'Deepali***', city: 'Jammu', qty: 2, time: '26 mins ago' },
  { name: 'Vanshika***', city: 'Raipur', qty: 6, time: '26 mins ago' },
  { name: 'Palak***', city: 'Bilaspur', qty: 2, time: '27 mins ago' },
  { name: 'Saloni***', city: 'Dhanbad', qty: 4, time: '27 mins ago' },
  { name: 'Charu***', city: 'Jamshedpur', qty: 3, time: '28 mins ago' },
  { name: 'Vidhi***', city: 'Bhubaneswar', qty: 5, time: '28 mins ago' },
  { name: 'Isha***', city: 'Cuttack', qty: 1, time: '29 mins ago' },
  { name: 'Srishti***', city: 'Guwahati', qty: 2, time: '29 mins ago' },
  { name: 'Barkha***', city: 'Siliguri', qty: 4, time: '30 mins ago' },
  { name: 'Nidhi***', city: 'Muzaffarpur', qty: 3, time: '30 mins ago' },
  { name: 'Vaishali***', city: 'Bhagalpur', qty: 2, time: '31 mins ago' },
  { name: 'Jyotsna***', city: 'Gaya', qty: 5, time: '31 mins ago' },
  { name: 'Chhavi***', city: 'Darbhanga', qty: 1, time: '32 mins ago' },
  { name: 'Heena***', city: 'Ujjain', qty: 3, time: '32 mins ago' },
  { name: 'Rekha***', city: 'Sagar', qty: 2, time: '33 mins ago' },
  { name: 'Usha***', city: 'Satna', qty: 4, time: '33 mins ago' },
  { name: 'Sarita***', city: 'Rewa', qty: 2, time: '34 mins ago' },
  { name: 'Sunita***', city: 'Ahmedabad', qty: 3, time: '34 mins ago' },

  // Boys
  { name: 'Rahul***', city: 'Jaipur', qty: 5, time: 'just now' },
  { name: 'Amit***', city: 'Lucknow', qty: 2, time: '1 min ago' },
  { name: 'Vikram***', city: 'Mumbai', qty: 10, time: '1 min ago' },
  { name: 'Deepak***', city: 'Chandigarh', qty: 3, time: '2 mins ago' },
  { name: 'Rajesh***', city: 'Patna', qty: 1, time: '2 mins ago' },
  { name: 'Manish***', city: 'Indore', qty: 5, time: '3 mins ago' },
  { name: 'Rohit***', city: 'Delhi', qty: 4, time: '3 mins ago' },
  { name: 'Abhishek***', city: 'Bhopal', qty: 2, time: '4 mins ago' },
  { name: 'Aryan***', city: 'Pune', qty: 6, time: '4 mins ago' },
  { name: 'Aarav***', city: 'Ahmedabad', qty: 3, time: '5 mins ago' },
  { name: 'Kunal***', city: 'Kanpur', qty: 1, time: '5 mins ago' },
  { name: 'Gaurav***', city: 'Varanasi', qty: 4, time: '6 mins ago' },
  { name: 'Sunny***', city: 'Agra', qty: 5, time: '6 mins ago' },
  { name: 'Saurabh***', city: 'Dehradun', qty: 2, time: '7 mins ago' },
  { name: 'Nitin***', city: 'Ranchi', qty: 3, time: '7 mins ago' },
  { name: 'Mohit***', city: 'Surat', qty: 8, time: '8 mins ago' },
  { name: 'Pankaj***', city: 'Nagpur', qty: 2, time: '8 mins ago' },
  { name: 'Sandeep***', city: 'Jodhpur', qty: 1, time: '9 mins ago' },
  { name: 'Ajay***', city: 'Kota', qty: 5, time: '9 mins ago' },
  { name: 'Vijay***', city: 'Ludhiana', qty: 4, time: '10 mins ago' },
  { name: 'Suresh***', city: 'Amritsar', qty: 2, time: '10 mins ago' },
  { name: 'Ramesh***', city: 'Gorakhpur', qty: 3, time: '11 mins ago' },
  { name: 'Ankit***', city: 'Meerut', qty: 7, time: '11 mins ago' },
  { name: 'Akash***', city: 'Ghaziabad', qty: 2, time: '12 mins ago' },
  { name: 'Vivek***', city: 'Faridabad', qty: 4, time: '12 mins ago' },
  { name: 'Vikas***', city: 'Gurugram', qty: 5, time: '13 mins ago' },
  { name: 'Manoj***', city: 'Noida', qty: 1, time: '13 mins ago' },
  { name: 'Sanjay***', city: 'Bikaner', qty: 3, time: '14 mins ago' },
  { name: 'Alok***', city: 'Udaipur', qty: 2, time: '14 mins ago' },
  { name: 'Sunil***', city: 'Gwalior', qty: 6, time: '15 mins ago' },
  { name: 'Rakesh***', city: 'Prayagraj', qty: 2, time: '15 mins ago' },
  { name: 'Ashish***', city: 'Bareilly', qty: 4, time: '16 mins ago' },
  { name: 'Sumit***', city: 'Aligarh', qty: 3, time: '16 mins ago' },
  { name: 'Tarun***', city: 'Moradabad', qty: 5, time: '17 mins ago' },
  { name: 'Varun***', city: 'Saharanpur', qty: 1, time: '17 mins ago' },
  { name: 'Harsh***', city: 'Jalandhar', qty: 2, time: '18 mins ago' },
  { name: 'Aman***', city: 'Rohtak', qty: 4, time: '18 mins ago' },
  { name: 'Shubham***', city: 'Panipat', qty: 5, time: '19 mins ago' },
  { name: 'Mayank***', city: 'Hisar', qty: 3, time: '19 mins ago' },
  { name: 'Yash***', city: 'Karnal', qty: 2, time: '20 mins ago' },
  { name: 'Prateek***', city: 'Kolkata', qty: 6, time: '20 mins ago' },
  { name: 'Ravi***', city: 'Ajmer', qty: 1, time: '21 mins ago' },
  { name: 'Naveen***', city: 'Bhilwara', qty: 4, time: '21 mins ago' },
  { name: 'Chetan***', city: 'Alwar', qty: 3, time: '22 mins ago' },
  { name: 'Rishabh***', city: 'Mathura', qty: 5, time: '22 mins ago' },
  { name: 'Dev***', city: 'Haridwar', qty: 2, time: '23 mins ago' },
  { name: 'Arjun***', city: 'Haldwani', qty: 8, time: '23 mins ago' },
  { name: 'Karan***', city: 'Shimla', qty: 2, time: '24 mins ago' },
  { name: 'Vishal***', city: 'Jammu', qty: 4, time: '24 mins ago' },
  { name: 'Sahil***', city: 'Raipur', qty: 3, time: '25 mins ago' },
  { name: 'Suraj***', city: 'Bilaspur', qty: 1, time: '25 mins ago' },
  { name: 'Prince***', city: 'Dhanbad', qty: 5, time: '26 mins ago' },
  { name: 'Himanshu***', city: 'Jamshedpur', qty: 2, time: '26 mins ago' },
  { name: 'Govind***', city: 'Bhubaneswar', qty: 4, time: '27 mins ago' },
  { name: 'Hemant***', city: 'Cuttack', qty: 3, time: '27 mins ago' },
  { name: 'Bharat***', city: 'Guwahati', qty: 6, time: '28 mins ago' },
  { name: 'Lokesh***', city: 'Siliguri', qty: 1, time: '28 mins ago' },
  { name: 'Mukesh***', city: 'Muzaffarpur', qty: 3, time: '29 mins ago' },
  { name: 'Dinesh***', city: 'Bhagalpur', qty: 2, time: '29 mins ago' },
  { name: 'Kamlesh***', city: 'Gaya', qty: 5, time: '30 mins ago' },
  { name: 'Pawan***', city: 'Darbhanga', qty: 4, time: '30 mins ago' },
  { name: 'Jitendra***', city: 'Ujjain', qty: 2, time: '31 mins ago' },
  { name: 'Rajat***', city: 'Sagar', qty: 3, time: '31 mins ago' },
  { name: 'Paras***', city: 'Satna', qty: 5, time: '32 mins ago' },
  { name: 'Tushar***', city: 'Rewa', qty: 1, time: '32 mins ago' },
  { name: 'Ayush***', city: 'Bengaluru', qty: 4, time: '33 mins ago' },
  { name: 'Shivam***', city: 'Hyderabad', qty: 7, time: '33 mins ago' },
  { name: 'Lakshay***', city: 'Delhi', qty: 2, time: '34 mins ago' },
  { name: 'Nakul***', city: 'Jaipur', qty: 3, time: '34 mins ago' },
  { name: 'Dhruv***', city: 'Lucknow', qty: 5, time: '35 mins ago' },
];

export const RecentBuyerToast: React.FC = () => {
  // Random start index to provide organic variations for every visitor
  const [index, setIndex] = useState(() => Math.floor(Math.random() * RECENT_BUYERS.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % RECENT_BUYERS.length);
        setVisible(true);
      }, 400);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const buyer = RECENT_BUYERS[index];

  return (
    <div
      className={`fixed top-18 right-4 z-40 transition-all duration-400 ease-out transform pointer-events-none ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'
      }`}
    >
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-md text-xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
          <Ticket className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">{buyer.name}</span>
            <span className="text-[11px] text-slate-500 font-medium">({buyer.city})</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <span>
              Bought <strong className="text-slate-900 font-semibold">{buyer.qty} {buyer.qty === 1 ? 'ticket' : 'tickets'}</strong> (₹{buyer.qty * 49})
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
              {buyer.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
