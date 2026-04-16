import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, Mail, Phone, Shield, Briefcase, 
  UserCheck, AlertCircle, ChevronDown, ShieldCheck 
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;


export default function AgentForm() {
  const { addNotification } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Office Agent",
    status: "Active",
    Emr_phone: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = ["Office Agent","Field Agent",];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.Emr_phone) {
      setError("Fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const response = await fetch(`${API_BASE}/api/admin/agent/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        addNotification("✅ Agent Registered");
        navigate("/admin/agents/view");
      } else { setError(data.message || "Failed"); }
    } catch (err) { setError("Server connection failed."); } finally { setLoading(false); }
  };

  return (
    <div className="w-full h-full bg-[#f8f9fa] p-2 md:p-4 font-sans overflow-hidden">
      
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header - Minimal Height */}
        <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-lg font-black !text-black leading-none">Agent Registration</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">New Staff Onboarding</p>
          </div>
          <div className="flex items-center gap-1 text-[#2dce89] font-black text-[9px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <ShieldCheck size={10} /> Secure Network
          </div>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-100 flex items-center gap-2">
              <AlertCircle size={12} /> {error}
            </div>
          )}

          {/* Section: Identity (3 Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <FormInput label="Full Name" name="name" icon={<Briefcase size={12}/>} value={form.name} onChange={handleChange} placeholder="Full Name" required />
            <FormInput label="Email" name="email" type="email" icon={<Mail size={12}/>} value={form.email} onChange={handleChange} placeholder="agent@co.com" required />
            <FormInput label="Contact No" name="phone" icon={<Phone size={12}/>} value={form.phone} onChange={handleChange} placeholder="+91 XXX" required />
          </div>

          {/* Section: Emergency & Roles (4 Column Grid) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-50 items-end">
            <FormInput label="Emergency Phone" name="Emr_phone" icon={<Phone size={12}/>} value={form.Emr_phone} onChange={handleChange} placeholder="Secondary No" required />
            
            {/* Role Select */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[14px] font-black !text-[#343333] uppercase  ml-1">Role</label>
              <div className="relative group">
                <Shield size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2dce89]" />
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange}
                  className="w-full pl-8 pr-6 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2dce89] font-bold text-[11px] !text-black appearance-none cursor-pointer"
                >
                  {roles.map((role, i) => <option key={i} value={role}>{role}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[14px] font-black !text-[#414242] uppercase  ml-1">Work Status</label>
              <div className="relative group">
                <UserCheck size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2dce89]" />
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  className="w-full pl-8 pr-6 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2dce89] font-bold text-[11px] !text-black appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Action Button - Placed inside grid to save space */}
          </div>
          
                      <div className="flex justify-center items-center h-full">
  <button 
    type="submit" 
    disabled={loading}
    
    className="px-4 py-1.5 bg-[#2dce89] hover:bg-[#28b87b] text-white rounded font-black text-[10px] shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-tighter flex items-center justify-center gap-1.5"
  >
    {loading ? "..." : (
      <>
        <UserPlus size={12} strokeWidth={4} /> 
        <span>Save Agent</span>
      </>
    )}
  </button>
</div>

        </form>

        <footer className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
           <p className="text-[#67748e] text-[9px] font-bold uppercase tracking-widest"></p>
        </footer>
      </div>
    </div>
  );
}

// --- ULTRA COMPACT INPUT WITH BLACK LABELS ---
function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[14px] font-black !text-[#3a3b3b] uppercase  ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2dce89] pointer-events-none z-10 transition-colors">
            {icon}
          </div>
        )}
        <input 
          {...props} 
          className={`
            w-full py-1.5 pr-2 bg-white border border-slate-300 rounded focus:outline-none 
            focus:border-[#2dce89] focus:ring-1 focus:ring-emerald-500/5 
            transition-all font-bold text-[12px] !text-black placeholder:text-slate-200
            ${icon ? "pl-8" : "pl-2"} 
          `}
        />
      </div>
    </div>
  );
}