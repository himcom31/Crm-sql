import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Package, Tag, IndianRupee, FileText, 
  TrendingUp, Calendar, Plus, ShieldCheck 
} from "lucide-react";
const API_BAS = import.meta.env.VITE_API_URL;

export default function ProductForm() {
  const { setProducts, addNotification } = useContext(AppContext);
  const navigate = useNavigate();
  const [dbCategories, setDbCategories] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCats = async () => {
      try {
        if (!token) return;
        const res = await axios.get(`${API_BAS}/api/admin/category/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) setDbCategories(res.data);
      } catch (err) { console.error("Fetch error:", err.message); }
    };
    fetchCats();
  }, [token]);

  const [form, setForm] = useState({
    name: "", price: "", description: "", Category: "", Mature_Amount: "", Date_Mature: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price || !form.Category || !form.Mature_Amount || !form.Date_Mature) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      if (!token) { navigate("/login"); return; }
      const response = await fetch(`${API_BAS}/api/admin/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: Number(form.price), Mature_Amount: Number(form.Mature_Amount) }),
      });
      const data = await response.json();
      if (response.ok) {
        setProducts((prev) => [...prev, data.product || data]);
        addNotification("📦 Product Registered Successfully");
        navigate("/admin/inventory/view-inventory");
      } else { setError(data.message || "Failed."); }
    } catch (err) { setError("Server connection failed."); } finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] p-2 md:p-4 font-sans overflow-y-auto">
      
      <div className="max-w-7xl mx-auto w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header - Minimal Height */}
        <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-lg font-black !text-black leading-none">Product Registry</h1>
            <p className="text-[17px] text-[#2dce89] mt-1 uppercase ">New Scheme Onboarding</p>
          </div>
          <div className="flex items-center gap-1 text-[#2dce89] font-black text-[9px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <ShieldCheck size={10} /> Database Secure
          </div>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-100 flex items-center gap-2">
              <ShieldCheck className="rotate-180" size={12} /> {error}
            </div>
          )}

          {/* Section 1: Basic Info (3 Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <div className="md:col-span-2">
              <FormInput label="Product Name" name="name" icon={<Package size={12}/>} value={form.name} onChange={handleChange} placeholder="Scheme Name" required />
            </div>
            
            <div className="flex flex-col gap-0.5">
              <label className="text-[14px] font-black !text-[#333333] uppercase  ml-1">Category</label>
              <div className="relative group">
                <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2dce89]" />
                <select 
                  name="Category" value={form.Category} onChange={handleChange}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2dce89] font-bold text-[11px] !text-black appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Category</option>
                  {dbCategories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Financials (3 Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-50">
            <FormInput label="Base Price (₹)" name="price" type="number" icon={<IndianRupee size={12}/>} value={form.price} onChange={handleChange} placeholder="0.00" required />
            <FormInput label="Mature Amount (₹)" name="Mature_Amount" type="number" icon={<TrendingUp size={12}/>} value={form.Mature_Amount} onChange={handleChange} placeholder="Final Value" required />
            <FormInput label="Maturity Date" name="Date_Mature" type="date" icon={<Calendar size={12}/>} value={form.Date_Mature} onChange={handleChange} required />
          </div>

          {/* Section 3: Description (Compact Area) */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[14px] font-black !text-[#3c3d3d] uppercase  ml-1">Brief Description</label>
            <div className="relative group">
              <FileText size={12} className="absolute left-2.5 top-3 text-slate-400 group-focus-within:text-[#2dce89]" />
              <textarea 
                name="description" rows="2" value={form.description} onChange={handleChange}
                placeholder="Key highlights..."
                className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2dce89] font-bold text-[11px] !text-black shadow-none resize-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-1">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-1.5 bg-[#2dce89] hover:bg-[#28b87b] text-white px-5 py-1.5 rounded-md font-black text-[10px] shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? "..." : <><Plus size={12} strokeWidth={4} /> Save Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- ULTRA SHRINK COMPONENT WITH BLACK LABELS ---
function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-black !text-[#313131] uppercase  ml-1">
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
          onClick={(e) => props.type === "date" && e.target.showPicker()}
          className={`
            w-full py-1.5 pr-2 bg-white border border-slate-300 rounded focus:outline-none 
            focus:border-[#2dce89] focus:ring-1 focus:ring-emerald-500/5 
            transition-all font-bold text-[12px] !text-black placeholder:text-slate-200
            ${icon ? "pl-8" : "pl-2"} 
            ${props.type === "date" ? "cursor-pointer text-[10px]" : ""}
          `}
        />
      </div>
    </div>
  );
}