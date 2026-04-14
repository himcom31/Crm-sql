import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Package, IndianRupee, Clock, TrendingUp, 
  ArrowUpRight, Layers, ChevronRight, Filter, 
  Download, AlertCircle, Wallet, Activity, 
  ArrowUp, Globe, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Backend URL integration
const API_BAS = import.meta.env.VITE_API_URL;

export default function App() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BAS}/api/client/my-sales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Aapki API ka actual data: res.data.data
        setSales(res.data.data || []);
      } catch (err) {
        console.error("API Fetch Error:", err);
      } finally {
        // Smooth loading transition
        setTimeout(() => setLoading(false), 1200);
      }
    };
    fetchClientData();
  }, []);

  // API Data Calculations
  //const totalInvestment = useMemo(() => sales.reduce((sum, item) => sum + item.totalAmount, 0), [sales]);
  const activeAssets = useMemo(() => sales.filter(item => item.status === "Active").length, [sales]);
  const totalInvestment = useMemo(() => {
  return sales.reduce((sum, item) => {
    // Number() function ensure karega ki calculation hamesha math ho, string join nahi
    const amount = Number(item.totalAmount || 0);
    return sum + amount;
  }, 0);
}, [sales]);

  // Sales array mein se sabse kareeb wali expiry date dhoondna
const upcomingExpiries = sales
    .filter(sale => new Date(sale.expiryDate) > new Date()) // Sirf future dates
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // Choti date se badi date (Ascending)

const nextExpiryDate = upcomingExpiries.length > 0 
    ? new Date(upcomingExpiries[0].expiryDate).toLocaleDateString('en-GB') 
    : 'No Upcoming';
  // Dynamic Graph: Grouping by investmentDate month
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = months.reduce((acc, m) => ({ ...acc, [m]: 0 }), {});
    
    sales.forEach(item => {
      if (item.investmentDate) {
        const date = new Date(item.investmentDate);
        const month = date.toLocaleString('default', { month: 'short' });
        if (monthlyMap[month] !== undefined) monthlyMap[month] += item.totalAmount;
      }
    });
    
    return months.map(name => ({ name, value: monthlyMap[name] }));
  }, [sales]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-slate-900 to-fuchsia-900/20" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], borderRadius: ["20%", "50%", "20%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] mb-8"
      />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-indigo-300 font-black uppercase tracking-[0.3em] text-[10px]">
        Syncing Kuber Support Systems
      </motion.p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-20 relative overflow-hidden">
      
      {/* --- BG ANIMATION --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity }} className="absolute bottom-[0%] -right-[10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.main variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Navigation */}

        {/* Header */}
        <div className="mb-10">
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white  leading-none mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-green-400"> Client Dashboard</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-200 font-medium max-w-md">
            Kuber Support - Real-time asset maturation and capital distribution analysis.
          </motion.p>
        </div>

        {/* Summary Cards */}
 

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: 'Total Portfolio', value: `₹${totalInvestment.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-indigo-400', label: 'Balance' },
            { title: 'Active Assets', value: activeAssets, icon: Activity, color: 'text-emerald-400', label: 'Positions' },
            { 
    title: 'Next Expiry', 
    // Humne upar calculate kiya hua variable use kiya
    value: nextExpiryDate, 
    icon: Clock, 
    color: 'text-fuchsia-400', 
    label: 'Upcoming' 
},
          ].map((card, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8 }} className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-slate-600/70 border border-white/5 ${card.color}`}><card.icon size={25}/></div>
                <div className={`text-[10px] font-black px-2 py-1 rounded-md bg-white/5 ${card.color}`}>Stable</div>
              </div>
              <p className="text-[10px] font-black text-green-300 uppercase tracking-[0.2em] mb-1">{card.title}</p>
              <h3 className="text-1xl font-black text-slate-300  mb-4">{card.value}</h3>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-indigo-500 to-green-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Graph & Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-10">Performance Trajectory</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} dy={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff' }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Investment']} />
                  <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] border border-white/10 p-8 text-white relative shadow-2xl overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-400">Latest Assets</h3>
            <div className="space-y-6">
              {sales.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400"><Layers size={18} /></div>
                    <div>
                      <p className="text-xs font-black truncate w-24 md:w-32">{item.productName}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(item.investmentDate).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black">₹{item.totalAmount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Full Inventory Table */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-black text-white text-lg tracking-tight">Asset Inventory</h3>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 gap-1">
               {['all', 'Active', 'Expired'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{tab}</button>
               ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/30 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-6">Asset Name</th>
                  <th className="px-10 py-6">Capital</th>
                  <th className="px-10 py-6">Investment</th>
                  <th className="px-10 py-6">Expiry</th>
                  <th className="px-10 py-6">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode='popLayout'>
                  {sales.filter(item => activeTab === 'all' || item.status === activeTab).map((item) => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/5 transition-all">
                      <td className="px-10 py-6">
                        <p className="font-black text-white text-sm">{item.productName}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">AGENT: {item.agentName}</p>
                      </td>
                      <td className="px-10 py-6 font-black text-white text-base">₹{item.totalAmount.toLocaleString()}</td>
                      <td className="px-10 py-6 text-slate-400 text-xs font-bold">{new Date(item.investmentDate).toLocaleDateString('en-GB')}</td>
                      <td className="px-10 py-6 text-fuchsia-400 text-xs font-black">{new Date(item.expiryDate).toLocaleDateString('en-GB')}</td>
                      <td className="px-10 py-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase w-fit ${item.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          <ShieldCheck size={12} /> {item.status}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}