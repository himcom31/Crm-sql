import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { 
  User, Calendar, CreditCard, Landmark, 
  Mail, Phone, Lock, ChevronDown, Plus, ShieldCheck 
} from "lucide-react";
const API_BAS = import.meta.env.VITE_API_URL;

export default function ClientForm() {
  const { setClients, addNotification } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", mobile: "", password: "",
    Date_of_Birth: "", Date_of_Investment: "",
    Pan_card_Number: "", Adhar_card_Number: "",
    Bank_Account_Number: "", IFSC_Code: "",
    Bank_Account_Name: "", Bank_Branch: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  console.log(API_BAS);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BAS}/api/admin/create-client`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setClients((prev) => [...prev, response.data.client]);
        addNotification("✅ Client Created Successfully");
        setForm({
          name: "", email: "", mobile: "", password: "",
          Date_of_Birth: "", Date_of_Investment: "",
          Pan_card_Number: "", Adhar_card_Number: "",
          Bank_Account_Number: "", IFSC_Code: "",
          Bank_Account_Name: "", Bank_Branch: ""
        });
      }
    } catch (error) {
      addNotification(`❌ ${error.response?.data?.message || "Failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#f8f9fa] p-2 md:p-4 font-sans overflow-hidden">
      
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Compact Header */}
        <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-lg font-black text-black leading-none">Client Registration</h1>
            <p className="text-[10px] text-[#28b87b] mt-1 uppercase tracking-tighter">New Investor Onboarding</p>
          </div>
          <div className="flex items-center gap-1 text-[#2dce89] font-bold text-[9px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <ShieldCheck size={10} /> Secure
          </div>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          
          {/* Section: Personal (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <FormInput className=""label="Full Name" name="name" icon={<User size={12}/>} value={form.name} onChange={handleChange} placeholder="John Doe" required />
            <FormInput label="Email" name="email" type="email" icon={<Mail size={12}/>} value={form.email} onChange={handleChange} placeholder="john@ex.com" required />
            <FormInput label="Mobile" name="mobile" icon={<Phone size={12}/>} value={form.mobile} onChange={handleChange} placeholder="9876543210" required />
            <FormInput label="DOB" name="Date_of_Birth" type="date" icon={<Calendar size={12}/>} value={form.Date_of_Birth} onChange={handleChange} required />
            <FormInput label="Password" name="password" type="password" icon={<Lock size={12}/>} value={form.password} onChange={handleChange} placeholder="••••" required />
            <FormInput label="PANCARD" name="Pan_card_Number" icon={<CreditCard size={12}/>} value={form.Pan_card_Number} onChange={handleChange} placeholder="ABCDE1234F" required />
          </div>

          {/* Identity & Investment (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-3">
             <FormInput label="Aadhar" name="Adhar_card_Number" icon={<CreditCard size={12}/>} value={form.Adhar_card_Number} onChange={handleChange} placeholder="1234 5678 9012" required />
          </div>

          {/* Section: Banking (Collapsed by default to save space) */}
          <section className={`rounded-lg border transition-all ${showBankDetails ? "bg-slate-50 border-slate-200 p-3" : "bg-white border-transparent p-0"}`}>
            <button 
              type="button" 
              onClick={() => setShowBankDetails(!showBankDetails)}
              className="flex items-center gap-2 text-[17px] font-black text-[#28b87b] uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              <Landmark size={14} className={showBankDetails ? "text-blue-500" : ""} />
              {showBankDetails ? "Hide Bank Info" : "Show Banking Info (+)"}
            </button>

            {showBankDetails && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 animate-in fade-in duration-300">
                <FormInput label="Acc No" name="Bank_Account_Number" value={form.Bank_Account_Number} onChange={handleChange} />
                <FormInput label="IFSC" name="IFSC_Code" value={form.IFSC_Code} onChange={handleChange} />
                <FormInput label="Bank" name="Bank_Account_Name" value={form.Bank_Account_Name} onChange={handleChange} />
                <FormInput label="Branch" name="Bank_Branch" value={form.Bank_Branch} onChange={handleChange} />
              </div>
            )}
          </section>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-[#2dce89] hover:bg-[#28b87b] text-white px-6 py-2 rounded-lg font-black text-[10px] shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? "..." : <><Plus size={12} strokeWidth={4} /> Save Client</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// --- ULTRA COMPACT INPUT ---
function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between px-1">
        <label className="text-[14px] font-black text-[#454444] uppercase ">
          {label}
        </label>
      </div>
      <div className="relative group">
        {icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2dce89] transition-colors z-10">
            {icon}
          </div>
        )}
        <input 
          {...props} 
          onClick={(e) => props.type === "date" && e.target.showPicker()}
          className={`
            w-full py-1.5 pr-2 bg-white border border-slate-200 rounded-md 
            focus:outline-none focus:border-[#2dce89] focus:ring-1 focus:ring-emerald-500/10 
            transition-all font-bold text-[12px] text-slate-700 placeholder:text-slate-200
            ${icon ? "pl-8" : "pl-2"} 
            ${props.type === "date" ? "cursor-pointer text-[10px]" : ""}
          `}
        />
      </div>
    </div>
  );
}