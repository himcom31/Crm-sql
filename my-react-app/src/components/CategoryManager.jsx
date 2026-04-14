import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Tag, Trash2, Plus, LayoutGrid, ShieldCheck, Search, AlertCircle } from "lucide-react";

const API_BAS = import.meta.env.VITE_API_URL;

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { addNotification } = useContext(AppContext);
  const token = localStorage.getItem("token");

  const API_BASE = `${API_BAS}/api/admin/category`;
  const FETCH_URL = `${API_BASE}/all`;
  const ADD_URL = `${API_BASE}/form`;

  // 🔄 1. Fetch Categories
  const fetchCats = async () => {
    try {
      const res = await axios.get(FETCH_URL, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Fetch error:", err.response?.data || err.message); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if(token) fetchCats(); 
  }, [token]);

  // ➕ 2. Add Category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    setBtnLoading(true);
    try {
      await axios.post(ADD_URL, { name }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setName("");
      fetchCats(); 
      addNotification("✅ Category Added Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding category");
    } finally { setBtnLoading(false); }
  };

  // 🗑 3. Delete Category
  const handleDelete = async (catName) => {
  if (!window.confirm(`Are you sure you want to delete "${catName}"?`)) return;
  
  try {
    // Correct URL: http://localhost:5000/api/admin/category/all/Laptops
    await axios.delete(`${API_BASE}/all/${catName}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    // Local state se turant remove karein taaki UI fast lage
    setCategories(categories.filter(c => c.name !== catName));
    addNotification("🗑 Category Removed Successfully");
  } catch (err) { 
    console.error("Delete error:", err.response?.data || err.message);
    alert("Failed to delete category. Check if it's being used by products."); 
  }
};

  const filtered = categories.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans">
      
      {/* --- TOP BREADCRUMB --- */}
      <div className="w-full flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
        </div>
        <div className="flex items-center gap-2 text-[#2dce89] font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          <ShieldCheck size={14} /> Master Data Secured
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: ADD CATEGORY FORM --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-50 text-[#2dce89] rounded-2xl border border-emerald-100 shadow-inner">
                <Plus size={24} strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#344767]">New Entry</h2>
                <p className="text-[#67748e] text-xs font-medium uppercase tracking-widest">Create Classification</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Name</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#2dce89] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. Fixed Assets"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#f8f9fa] border border-transparent rounded-2xl focus:bg-white focus:border-[#2dce89] focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
              <button 
                disabled={btnLoading}
                className="w-full py-4 bg-[#2dce89] hover:bg-[#28b87b] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:shadow-emerald-200 transition-all active:scale-95 disabled:bg-slate-200"
              >
                {btnLoading ? "Processing..." : "Add to Registry"}
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT: CATEGORY LIST --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
            
            {/* Header with Search */}
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <LayoutGrid size={20} />
                  </div>
                  <h3 className="font-bold text-[#344767]">Active Categories</h3>
               </div>
               <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search categories..."
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#2dce89] transition-all shadow-inner"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <div className="h-10 w-10 border-4 border-slate-50 border-t-[#2dce89] rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Master Data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((cat) => (
                    <div key={cat._id || cat.name} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-xl transition-all group animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-[#2dce89] shadow-sm font-black border border-slate-100 uppercase text-xl">
                          {cat.name?.charAt(0)}
                        </div>
                        <div>
                           <span className="font-bold text-[#344767] block leading-none mb-1">{cat.name}</span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Verified Category</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(cat.name)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold italic text-sm tracking-widest uppercase">No classifications found.</p>
                </div>
              )}
            </div>

            {/* Footer Information */}
            <footer className="mt-auto p-6 bg-[#f8f9fa]/50 border-t border-slate-100 text-center">
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
}