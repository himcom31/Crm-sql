import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Mail, Phone, Edit, Trash2, Search, Plus, Download, X, Key, UserCheck, MapPin, User, Smartphone, Hash, Check, Landmark, CreditCard, Calendar } from "lucide-react";
const API_BAS = import.meta.env.VITE_API_URL;
import * as XLSX from 'xlsx';

export default function ClientList() {
  const { clients, setClients, addNotification } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BAS}/api/admin/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data.data || response.data);
      } catch (error) {
        addNotification("❌ Could not load clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filtered = Array.isArray(clients) ? clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const deleteClient = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BAS}/api/admin/client/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clients.filter((c) => c.id !== id));
      addNotification("✅ Client deleted");
    } catch (error) {
      addNotification("❌ Delete failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BAS}/api/admin/client/${editingClient.id}`,
        editingClient,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setClients(clients.map(c => c.id === editingClient.id ? response.data.data : c));
        addNotification("✅ Client updated");
        setEditingClient(null);
      }
    } catch (error) {
      addNotification("❌ Update failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const exportToExcel = () => {
    if (clients.length === 0) {
      alert("No any client!");
      return;
    }

    // 1. Data ko format karein (Excel headers ke hisaab se)
    const excelData = clients.map((client, index) => ({
      "S.No": index + 1,
      "Client Name": client.name,
      "Email": client.email,
      "Mobile": client.mobile,
      "PAN Card": client.Pan_card_Number,
      "Aadhar No": client.Adhar_card_Number,
      "D.O.B": client.Date_of_Birth,
      "Bank Name": client.Bank_Account_Name,
      "Bank A/C No": client.Bank_Account_Number,
      "IFSC Code": client.IFSC_Code,
      "Branch": client.Bank_Branch,
      "Status": client.status || "Active"
    }));

    // 2. Worksheet banayein
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 3. Workbook banayein
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    // 4. File download karwayein
    XLSX.writeFile(workbook, `Kuber Support_Clients_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] font-sans pb-10">
      <div className="w-full px-4 md:px-8 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
          <div>
            <h1 className="text-3xl font-bold  text-[#344767] tracking-tight">Clients</h1>
            <p className="text-[#1d222c]  font-medium text-xl">Manage your client relationships</p>
          </div>

        </div>

 {/* --- ACTION BAR (Search & Export) --- */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 px-2">
  
  {/* Left Side: Search Bar */}
  <div className="relative w-full max-w-[400px]">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#adb5bd]">
      <Search size={20} />
    </div>
    <input
      type="text"
      placeholder="Search contacts..."
      className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2dce89]/20 transition-all font-medium text-slate-600"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* Right Side: Export Button */}
  <button
    onClick={exportToExcel}
    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 active:scale-95 whitespace-nowrap"
  >
    <Download size={16} /> Export Clients (.xlsx)
  </button>
  
</div>
        {loading ? (
          <div className="flex justify-center  py-20 text-[#31343c] font-bold animate-pulse">SYNCHRONIZING...</div>
        ) : (
          /* GRID: Yahan grid-cols ko 2 ya 3 rakha hai taaki card rectangle bane */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative flex flex-col justify-between min-h-[180px]"
              >
                {/* Actions Button */}
                <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingClient(c); }}
                    className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 font-serif hover:text-white transition-all shadow-sm"
                  ><Edit size={14} /></button>
                  <button
                    onClick={(e) => deleteClient(e, c.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  ><Trash2 size={14} /></button>
                </div>

                {/* Inner Content in Flex Row for Rectangle Shape */}
                <div className="flex items-center gap-6">
                  {/* Avatar Section */}
                  <div className="h-16 font-serif w-16 shrink-0 rounded-2xl bg-[#e8f5e9] text-[#2dce89] flex items-center justify-center text-2xl font-black border border-[#c8e6c9] shadow-inner">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl  font-bold text-[#181d24] truncate leading-tight mb-1">{c.name}</h3>
                    <p className="text-sm  font-bold text-[#181d24] truncate leading-tight mb-1">Investor Profile</p>
                    <div className="space-y-2">
                      <div className="flex  items-center gap-3 text-[13px] text-slate-700 font-medium">
                        <Mail size={14} className="opacity-50 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-3  text-[13px] text-slate-700 font-medium">
                        <Phone size={14} className="opacity-50 shrink-0" />
                        <span>{c.mobile}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4  border-t border-slate-50 flex justify-between items-center text-[13px] font-black text-slate-700 uppercase ">
                  <span>Joined: {formatDate(c.createdAt)}</span>
                  <span className="text-[#2dce89] bg-[#e8f5e9] px-2 py-0.5  rounded-md">Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- EDIT MODAL --- */}
        {editingClient && (
          <div className="fixed inset-0 bg-slate-900/60  backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
              <div className="p-8 bg-[#344767] text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif font-black">Edit Profile</h2>
                  <p className="text-slate-300 text-xs uppercase font-bold tracking-widest mt-1">Record ID: {editingClient.id}</p>
                </div>
                <button onClick={() => setEditingClient(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X /></button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EditInput label="Full Name" value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} />
                  <EditInput label="Email Address" value={editingClient.email} onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })} />
                  <EditInput label="Mobile Number" value={editingClient.mobile} onChange={(e) => setEditingClient({ ...editingClient, mobile: e.target.value })} />
                  <EditInput label="Date of Birth" type="date" value={editingClient.Date_of_Birth?.split('T')[0]} onChange={(e) => setEditingClient({ ...editingClient, Date_of_Birth: e.target.value })} />
                  <EditInput label="PAN Card No." value={editingClient.Pan_card_Number} onChange={(e) => setEditingClient({ ...editingClient, Pan_card_Number: e.target.value })} />
                  <EditInput label="Aadhar No." value={editingClient.Adhar_card_Number} onChange={(e) => setEditingClient({ ...editingClient, Adhar_card_Number: e.target.value })} />
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Landmark size={14} /> Banking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditInput label="Account Number" value={editingClient.Bank_Account_Number} onChange={(e) => setEditingClient({ ...editingClient, Bank_Account_Number: e.target.value })} />
                    <EditInput label="IFSC Code" value={editingClient.IFSC_Code} onChange={(e) => setEditingClient({ ...editingClient, IFSC_Code: e.target.value })} />
                    <EditInput label="Bank Branch" value={editingClient.Bank_Branch} onChange={(e) => setEditingClient({ ...editingClient, Bank_Branch: e.target.value })} />
                    <EditInput label="Bank Holder Name" value={editingClient.Bank_Account_Name} onChange={(e) => setEditingClient({ ...editingClient, Bank_Account_Name: e.target.value })} />
                  </div>
                </div>

                <button type="submit" disabled={btnLoading} className="w-full py-4 bg-[#2dce89] text-white rounded-2xl font-black text-lg shadow-xl hover:bg-[#28b87b] transition-all flex justify-center items-center gap-2">
                  {btnLoading ? "Syncing..." : <><Check size={20} /> Update Record</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- DETAIL VIEW MODAL --- */}
        {selectedClient && !editingClient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            {/* Modal Container: Added max-height and scrolling */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">

              {/* Header (Sticky) */}
              <div className="bg-[#344767] p-8 text-white relative shrink-0">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-4xl font-black border border-white/20 shadow-inner">
                    {selectedClient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedClient.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Verified Investor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                {/* Personal & Identity Section */}
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={12} className="text-indigo-500" /> Personal Intelligence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow icon={<CreditCard size={14} />} label="PAN Card" value={selectedClient.Pan_card_Number} />
                    <DetailRow icon={<Check size={14} />} label="Aadhar No" value={selectedClient.Adhar_card_Number} />
                    <DetailRow icon={<Smartphone size={14} />} label="Mobile No" value={selectedClient.mobile} />
                    <DetailRow icon={<Calendar size={14} />} label="D.O.B" value={selectedClient.Date_of_Birth} />
                    <DetailRow icon={<Mail size={14} />} label="Email ID" value={selectedClient.email} />
                  </div>
                </div>

                {/* Bank & Financial Section */}
                <div className="pt-6 border-t border-slate-50">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Landmark size={12} className="text-emerald-500" /> Settlement Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow icon={<Hash size={14} />} label="Bank A/C" value={selectedClient.Bank_Account_Number} />
                    <DetailRow icon={<Key size={14} />} label="IFSC Code" value={selectedClient.IFSC_Code} />
                    <DetailRow icon={<UserCheck size={14} />} label="Account Holder" value={selectedClient.Bank_Account_Name} />
                    <DetailRow icon={<MapPin size={14} />} label="Bank Branch" value={selectedClient.Bank_Branch} />
                  </div>
                </div>

              </div>

              {/* Footer (Sticky) */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function EditInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:ring-2 focus:ring-[#2dce89] outline-none transition-all"
      />
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-3">
      <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs">
        {icon} <span>{label}</span>
      </div>
      <span className="text-slate-800 font-black text-sm">{value || "N/A"}</span>
    </div>
  );
}