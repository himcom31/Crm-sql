import { useState, useEffect } from "react";
import axios from "axios";
import { 
  History, Search, IndianRupee, Users, 
  TrendingUp, Calendar, Package, ArrowUpRight, 
  ShieldCheck, Filter ,Download
} from "lucide-react";
const API_BAS = import.meta.env.VITE_API_URL;
import * as XLSX from 'xlsx';


export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BAS}/api/admin/sales/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSales(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = Array.isArray(sales) ? sales.filter(s => 
    s.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.agent?.name?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // Totals Calculation
  // const totalBusiness = filteredSales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  // const totalCommission = filteredSales.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
  // Number() use karne se values mathematically add hongi
const totalBusiness = filteredSales.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
const totalCommission = filteredSales.reduce((acc, curr) => acc + Number(curr.commissionAmount || 0), 0);

const exportToExcel = () => {
    if (sales.length === 0) {
      alert("No transaction data available to export!");
      return;
    }

    // 1. Prepare formatted data for Excel
    const excelData = filteredSales.map((sale, index) => ({
      "S.No": index + 1,
      "Transaction ID": String(sale.id || "").toUpperCase(),
      "Date": new Date(sale.investmentDate).toLocaleDateString('en-IN'),
      "Investor Name": sale.client?.name || "N/A",
      "Investor Email": sale.client?.email || "N/A",
      "Product Name": sale.product?.name || "Multiple Products",
      "Total Investment": sale.totalAmount || 0,
      "Authorized Agent": sale.agent?.name || "N/A",
      "Commission (%)": sale.commissionPercentage || sale.commissionLabel || 0,
      "Payout Amount": sale.commissionAmount || 0,
    }));

    // 2. Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales History");

    // 3. Download the file
    XLSX.writeFile(workbook, `Sales_History_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans">
      
      {/* --- TOP BREADCRUMB --- */}
      <div className="w-full flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
        </div>
        <div className="flex items-center gap-2 text-[#2dce89] font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          <ShieldCheck size={14} /> Audit Ready
        </div>
      </div>

      {/* --- SUMMARY STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard 
          label="Total Revenue" 
          value={`₹${totalBusiness.toLocaleString('en-IN')}`} 
          icon={<IndianRupee size={20}/>}
          color="bg-white"
          textColor="text-[#344767]"
          accent="bg-blue-500"
        />
        <SummaryCard 
          label="Total Payouts" 
          value={`₹${totalCommission.toLocaleString('en-IN')}`} 
          icon={<TrendingUp size={20}/>}
          color="bg-white"
          textColor="text-[#344767]"
          accent="bg-[#2dce89]"
        />
        <SummaryCard 
          label="Total Entries" 
          value={filteredSales.length} 
          icon={<History size={20}/>}
          color="bg-[#344767]"
          textColor="text-white"
          accent="bg-white/20"
        />
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
               <Filter size={18} />
            </div>
            <h3 className="font-bold text-[#344767]">Transaction Logs</h3>
         </div>
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Search by client or agent name..."
              className="w-full pl-12 pr-4 py-3 bg-[#f8f9fa] rounded-xl border border-slate-200 outline-none focus:border-[#2dce89] focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-semibold shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 active:scale-95 whitespace-nowrap"
            >
              <Download size={16} /> Export CSV
            </button>
      </div>

      {/* --- DATA TABLE CARD --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#2dce89]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#adb5bd] text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="p-6">Execution Date</th>
                  <th className="p-6">Investor Details</th>
                  <th className="p-6">Asset Packages</th>
                  <th className="p-6">Authorized Agent</th>
                  <th className="p-6 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-[#f8f9fa] transition-colors">
                    {/* Investment Date */}
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                         <Calendar size={14} className="text-slate-300" />
                         <div>
                            <p className="text-sm font-bold text-[#344767]">{formatDate(sale.investmentDate)}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tighter">TXN: {String(sale.id).slice(-8).toUpperCase()}</p>
                         </div>
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xs font-black border border-blue-100 uppercase">
                          {sale.client?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#344767]">{sale.client?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{sale.client?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Product (Multi-Product Support) */}
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        {/* Note: Handling single product for now, but layout supports lists */}
                        <div className="flex items-center gap-2">
                           <Package size={14} className="text-[#2dce89]" />
                           <span className="text-xs font-bold text-slate-600">{sale.product?.name || "Multiple Products"}</span>
                        </div>
                        <p className="text-[10px] font-black text-blue-500 uppercase">Valuation: ₹{sale.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    </td>

                    {/* Agent Name */}
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-[#2dce89] rounded-full shadow-[0_0_8px_#2dce89]"></div>
                        <p className="text-sm font-bold text-slate-600">{sale.agent?.name}</p>
                      </div>
                    </td>

                    {/* Commission Amount */}
                    <td className="p-6 text-right">
                      <div className="inline-block text-right">
                         <p className="text-sm font-black text-[#344767]">₹{sale.commissionAmount?.toLocaleString('en-IN')}</p>
                         <span className="text-[10px] font-black text-[#2dce89] bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                           {sale.commissionPercentage || sale.commissionLabel}% Payout
                         </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-20 bg-slate-50/20">
                <History size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">No transaction records found in the current filter.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
        <p></p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="hover:text-slate-800 cursor-pointer transition-colors"></span>
          <span className="hover:text-slate-800 cursor-pointer transition-colors"></span>
          <span className="hover:text-slate-800 cursor-pointer transition-colors"></span>
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENT ---
function SummaryCard({ label, value, icon, color, textColor, accent }) {
  return (
    <div className={`${color} p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <p className={`text-2xl font-black ${textColor}`}>{value}</p>
        </div>
        <div className={`${accent} p-3 rounded-2xl text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      {/* Decorative Background Element */}
      <div className="absolute -bottom-2 -right-2 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
}