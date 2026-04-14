import { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, ShieldCheck, Calendar, Briefcase, MapPin, Loader2 ,Phone} from "lucide-react";

const API_BAS = import.meta.env.VITE_API_URL;

export default function AdminProfile() {
    const [adminData, setAdminData] = useState(null); // Initial data null rakhein
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem("token"); // Auth token lein
                const response = await axios.get(`${API_BAS}/api/admin/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Agar API response mein data milta hai
                setAdminData(response.data);
            } catch (error) {
                console.error("Profile fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    // Jab tak data load ho raha hai, Loading spinner dikhayein
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Syncing Intelligence...</p>
            </div>
        );
    }

    // Agar data nahi mila (Error handling)
    if (!adminData) {
        return <div className="p-10 text-center font-bold text-red-400">Failed to load admin profile.</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10 font-sans antialiased">
            {/* HEADER */}
            <div className="max-w-4xl mx-auto mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Intelligence</h1>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Management Profile</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in duration-500">

                {/* LEFT CARD: AVATAR */}
                <div className="md:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="h-32 w-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-emerald-200 mb-6 uppercase">
                        {adminData.name?.charAt(0)}
                    </div>
                    <h2 className="text-xl font-black text-slate-800">{adminData.name}</h2>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 border border-emerald-100">
                        {adminData.role || "Super Admin"}
                    </span>
                </div>

                {/* RIGHT CARD: DETAILED INFO */}
                <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">
                        Personal Credentials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <InfoItem icon={<Mail size={18} />} label="Primary Email" value={adminData.email} />
                        <InfoItem icon={<Phone size={18} />} label="Primary Phone" value={adminData.mobile} />

                        <InfoItem icon={<Briefcase size={18} />} label="Organization" value={adminData.company} />
                        <InfoItem icon={<MapPin size={18} />} label="Base Location" value={adminData.location} />
                        <InfoItem icon={<Calendar size={18} />} label="Access Since" value={new Date(adminData.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} />
                        <InfoItem icon={<ShieldCheck size={18} />} label="System Status" value="Authorized & Verified" />
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50">
                        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
                            Edit Account Security
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-700">{value || "Not Available"}</p>
            </div>
        </div>
    );
}