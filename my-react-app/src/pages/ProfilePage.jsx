import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, Calendar, ShieldCheck, 
  CreditCard, Landmark, Fingerprint, Hash 
} from 'lucide-react';

const API_BAS = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BAS}/api/client/clientProfile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.data);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fe]">
      <div className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">
        Fetching Secure KYC Data...
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#f4f7fe] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* --- TOP HEADER CARD --- */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full -mr-20 -mt-20 z-0 opacity-50" />
          
          <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile?.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 justify-center md:justify-start">
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> {profile?.role} account
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                ID: {profile?._id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT COLUMN: PERSONAL & CONTACT --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-slate-800 text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <User size={16} className="text-purple-600" /> Basic Details
              </h3>
              <div className="space-y-4">
                <InfoBox label="Email" value={profile?.email} icon={<Mail size={14}/>} />
                <InfoBox label="Mobile" value={profile?.mobile} icon={<Phone size={14}/>} />
                <InfoBox 
                  label="Date of Birth" 
                  value={profile?.Date_of_Birth ? new Date(profile.Date_of_Birth).toLocaleDateString('en-GB') : "N/A"} 
                  icon={<Calendar size={14}/>} 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-slate-800 text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Fingerprint size={16} className="text-indigo-600" /> Identity (KYC)
              </h3>
              <div className="space-y-4">
                <InfoBox label="PAN Card" value={profile?.Pan_card_Number} icon={<CreditCard size={14}/>} />
                <InfoBox label="Aadhar Number" value={profile?.Adhar_card_Number} icon={<Hash size={14}/>} />
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: BANKING DETAILS --- */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-800 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Landmark size={18} className="text-emerald-600" /> Settlement Bank Account
                </h3>
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded">SECURE</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BankItem label="Account Holder Name" value={profile?.Bank_Account_Name} />
                <BankItem label="Bank Account Number" value={profile?.Bank_Account_Number} isNumeric />
                <BankItem label="IFSC Code" value={profile?.IFSC_Code} />
                <BankItem label="Bank Branch / Code" value={profile?.Bank_Branch} />
              </div>

              <div className="mt-10 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                <div className="text-blue-600 mt-1"><ShieldCheck size={18}/></div>
                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                  Note: These banking details are used for all your investment settlements. 
                  To update your bank info, please raise a request with **Kuber Support**.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components for better organization
function InfoBox({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="text-slate-300 group-hover:text-purple-500 transition-colors">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value || '---'}</p>
      </div>
    </div>
  );
}

function BankItem({ label, value, isNumeric }) {
  return (
    <div className="border-b border-slate-50 pb-2">
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{label}</p>
      <p className={`text-base font-black text-slate-800 ${isNumeric ? 'tracking-wider' : ''}`}>
        {value || 'Not Updated'}
      </p>
    </div>
  );
}