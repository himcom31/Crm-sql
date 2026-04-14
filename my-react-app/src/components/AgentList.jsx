import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
  Search, UserCheck, Mail, Phone, Trash2, Edit3,
  ShieldCheck, Plus, AlertCircle, Briefcase, X, Download
} from "lucide-react";
import { Link } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_URL;
import * as XLSX from 'xlsx';

export default function AgentList() {
  const { addNotification } = useContext(AppContext);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Update States ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const API_URL = `${API_BASE}/api/admin/agent/all`;
  const token = localStorage.getItem("token");

  // ✅ Fetch Agents
  const fetchAgents = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(response.data);
    } catch (err) {
      console.error("Fetch error:", err.message);
      addNotification("❌ Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAgents();
  }, [token]);

  // 🗑 Delete Agent
  const deleteAgent = async (e, email) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this agent?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/agent/all/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(agents.filter((a) => a.email !== email));
      addNotification("🗑 Agent Removed Successfully");
    } catch (err) {
      addNotification("❌ Failed to delete agent");
    }
  };

  // ✍️ Open Edit Modal
  const openEdit = (e, agent) => {
    e.stopPropagation();
    setSelectedAgent(agent);
    setIsEditOpen(true);
  };

  // Filter Logic
  const filteredAgents = Array.isArray(agents) ? agents.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const exportToExcel = () => {
    if (agents.length === 0) {
      alert("No any client!");
      return;
    }

    const excelData = agents.map((agent, index) => ({
      "S.No": index + 1,
      "Agent Name": agent.name,
      "Email": agent.email,
      "Mobile": agent.phone,
      "Role": agent.role,
      "status": agent.status,
      "Emr Pho.": agent.Emr_phone,

    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agents");
    XLSX.writeFile(workbook, `Kuber Support_Agents_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans">

      {/* --- 1. TOP BREADCRUMB NAV --- */}
      <div className="w-full flex items-center justify-between mb-8 px-2">
        <Link
          to="/admin/agents/add"
          className="flex items-center gap-2 bg-[#2dce89] text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 uppercase tracking-wider"
        >
          <Plus size={16} strokeWidth={3} /> Add Agent
        </Link>
      </div>

      {/* --- 2. STATS & SEARCH SECTION --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-emerald-50 text-[#2dce89] rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner">
            <UserCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#344767]">Agents Network</h2>
            <p className="text-[#67748e] text-xs font-medium">Manage and monitor your authorized system agents.</p>
          </div>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-[#f8f9fa] rounded-xl border border-slate-200 outline-none focus:border-[#2dce89] focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-semibold text-slate-600 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={exportToExcel}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 active:scale-95 whitespace-nowrap"
        >
          <Download size={16} /> Export Agents (.xlsx)
        </button>
      </div>

      {/* --- 3. AGENT CARDS GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 border-4 border-slate-100 border-t-[#2dce89] rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {filteredAgents.map((agent) => (
            <div
              key={agent.email}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative flex flex-col justify-between min-h-[190px]"
            >
              {/* Floating Actions on Hover */}
              <div className=" absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 ">
                <button
                  onClick={(e) => openEdit(e, agent)}
                  className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => deleteAgent(e, agent.email)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-[#e8f5e9] text-[#2dce89] flex items-center justify-center text-2xl font-black border border-[#c8e6c9] shadow-inner uppercase">
                  {agent.name?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#344767] truncate leading-tight">{agent.name}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-[#67748e] text-[10px] font-black mb-3 flex items-center gap-1 opacity-70 uppercase tracking-widest">
                    <Briefcase size={12} /> {agent.role}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                      <Mail size={12} className="text-slate-300 shrink-0" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                      <Phone size={12} className="text-slate-300 shrink-0" />
                      <span>{agent.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Verified Agent</span>
                </div>
                <span>ID: {agent._id?.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Empty State */}
      {!loading && filteredAgents.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Registry search returned 0 results.</p>
        </div>
      )}

      {/* --- 5. UPDATE MODAL OVERLAY --- */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-[#f8f9fa]">
              <h2 className="text-xl font-black text-[#344767]">Update Profile</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`http://localhost:5000/api/admin/agent/update/${selectedAgent.email}`, selectedAgent, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  addNotification("✅ Agent Updated Successfully");
                  fetchAgents();
                  setIsEditOpen(false);
                } catch (err) { addNotification("❌ Update Failed"); }
              }}
              className="p-6 space-y-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-black uppercase ml-1">Agent Name</label>
                <input
                  value={selectedAgent.name}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                  className="w-full p-3 bg-[#f8f9fa] border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#2dce89]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-black uppercase ml-1">Contact Phone</label>
                <input
                  value={selectedAgent.phone}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, phone: e.target.value })}
                  className="w-full p-3 bg-[#f8f9fa] border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#2dce89]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Role</label>
                  <select
                    value={selectedAgent.role}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, role: e.target.value })}
                    className="p-3 bg-[#f8f9fa] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Sales Agent">Sales Agent</option>
                    <option value="Manager">Manager</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Status</label>
                  <select
                    value={selectedAgent.status}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, status: e.target.value })}
                    className="p-3 bg-[#f8f9fa] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-[#2dce89] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 mt-4 hover:bg-[#28b87b] transition-all active:scale-95">
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}