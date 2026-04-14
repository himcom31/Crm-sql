import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Line, LineChart 
} from 'recharts';
import { 
  IndianRupee, Users, Briefcase, 
  TrendingUp, Target 
} from 'lucide-react';

const API_BAS = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalAgents: 0, 
    totalClients: 0, 
    chartData: [], 
    agents: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BAS}/api/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Backend keys handle karne ke liye fallback logic
        const data = res.data;
        setStats({
          totalRevenue: data.totalRevenue || data.revenue || 0,
          totalAgents: data.totalAgents || data.agentsCount || 0,
          totalClients: data.totalClients || data.clientsCount || 0,
          chartData: Array.isArray(data.chartData) ? data.chartData : [],
          agents: Array.isArray(data.agents) ? data.agents : []
        });
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    getDashboardData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#2dce89] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Syncing Intelligence...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#f8f9fa] min-h-screen font-sans">
      
      {/* --- TOP 3 CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Gross Revenue" 
          value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`} 
          growth="+12.5%"
          icon={<IndianRupee size={22} className="text-emerald-500" />} 
          color="emerald"
        />
        <StatCard 
          title="Active Field Agents" 
          value={stats.totalAgents} 
          growth="Active"
          icon={<Briefcase size={22} className="text-blue-500" />} 
          color="blue"
        />
        <StatCard 
          title="Client Ecosystem" 
          value={stats.totalClients} 
          growth="Total"
          icon={<Users size={22} className="text-indigo-500" />} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CHART SECTION --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-[12px] text-slate-800 uppercase tracking-[0.2em]">Growth Intelligence</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Monthly Revenue Overview</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} 
                    dy={15}
                  />
                  <YAxis hide={true} />
                  <Tooltip 
                    cursor={{ stroke: '#2dce89', strokeWidth: 2, strokeDasharray: '5 5' }}
                    content={<CustomTooltip />}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2dce89" 
                    strokeWidth={5} 
                    dot={{ r: 6, fill: '#fff', stroke: '#2dce89', strokeWidth: 3 }} 
                    activeDot={{ r: 10, fill: '#2dce89', strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <Target className="animate-bounce" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Chart Data...</p>
              </div>
            )}
          </div>
        </div>

        {/* --- TOP AGENTS SECTION --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-[12px] text-slate-800 uppercase tracking-[0.2em] mb-8">Top Performers</h3>
          <div className="space-y-8">
            {stats.agents.map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-700 uppercase group-hover:bg-[#2dce89] group-hover:text-white transition-all">
                    {item.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{item.deals || 0} Deals Won</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-slate-800">₹{Number(item.revenue || 0).toLocaleString('en-IN')}</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase">Total Sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Fixed Custom Tooltip to avoid render issues
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-black text-slate-800">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

function StatCard({ title, value, growth, icon, color }) {
  const colorMap = {
    emerald: "shadow-emerald-100 group-hover:bg-emerald-50",
    blue: "shadow-blue-100 group-hover:bg-blue-50",
    indigo: "shadow-indigo-100 group-hover:bg-indigo-50"
  };

  return (
    <div className="group bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h2>
        <div className="flex items-center gap-2 mt-2">
           <div className="flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
             <TrendingUp size={10} className="text-emerald-500" />
             <span className="text-[10px] font-black text-emerald-600">{growth}</span>
           </div>
        </div>
      </div>
      <div className={`w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center transition-all duration-500 ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}