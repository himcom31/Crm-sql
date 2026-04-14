import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { 
  Package, Search, Edit3, Trash2, IndianRupee, 
  Tag, ShieldCheck, Plus, X, Check, FileText, Download,
  Calendar, Landmark, Info
} from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';

const API_BAS = import.meta.env.VITE_API_URL;

export default function ProductList() {
  const { products, setProducts, addNotification } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // ✅ View Modal State

  const API_URL = `${API_BAS}/api/products`;
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // 🔄 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/");
        setProducts(response.data);

        const catRes = await axios.get(`${API_BAS}/api/admin/category/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(catRes.data)) {
          setDbCategories(catRes.data);
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    };
    fetchData();
  }, [token]);

  // 🗑 2. Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/${id}`);
      setProducts(products.filter((p) => (p._id || p.id) !== id));
      addNotification("🗑 Product Deleted Successfully");
    } catch (err) {
      addNotification("❌ Failed to delete product");
    }
  };

  // 💾 3. Save Edit
  const saveEdit = async () => {
    if (!editData.name || !editData.price) {
      alert("Name and Price are required");
      return;
    }
    setLoading(true);
    try {
      const response = await api.put(`/${editId}`, editData);
      setProducts(products.map((p) => 
        (p._id === editId || p.id === editId) ? response.data : p
      ));
      setEditId(null);
      addNotification("✏️ Product Updated Successfully");
    } catch (err) {
      addNotification("❌ Error updating product");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditId(product._id || product.id);
    setEditData({ ...product, Category: product.Category || product.category });
  };

  // 🔍 Search Logic
  const filtered = Array.isArray(products) ? products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    (p.Category || p.category)?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  // 📊 Excel Export
  const exportToExcel = () => {
    if (products.length === 0) {
      alert("No data to export!");
      return;
    }
    const excelData = products.map((product, index) => ({
      "S.No": index + 1,
      "Product Name": product.name,
      "Price": product.price,
      "Category": product.Category,
      "Mature Amount": product.Mature_Amount,
      "Maturity Date": product.Date_Mature ? new Date(product.Date_Mature).toLocaleDateString('en-GB') : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `Products_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans antialiased">
      
      {/* HEADER SECTION */}
      <div className="w-full flex items-center justify-between mb-8 px-2">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Inventory</h1>
        <Link to="/admin/inventory/add-product" className="flex items-center gap-2 bg-[#2dce89] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 hover:scale-105 transition-all active:scale-95 uppercase">
          <Plus size={16} strokeWidth={3} /> Add Product
        </Link>
      </div>

      {/* SEARCH & EXPORT BAR */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 mb-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-emerald-50 text-[#2dce89] rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner">
            <Package size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#344767]">Asset Portfolio</h2>
            <p className="text-[#67748e] text-sm font-medium">Total {products.length} investment assets live.</p>
          </div>
        </div>

        <div className="flex flex-1 max-w-2xl w-full gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-bold text-slate-600 shadow-inner"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={exportToExcel} className="bg-[#2dce89] border border-slate-200 text-slate-100 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {filtered.map((p) => {
          const currentId = p._id || p.id;
          const isEditing = editId === currentId;

          return (
            <div 
              key={currentId} 
              onClick={() => !isEditing && setSelectedProduct(p)} // ✅ View Modal Toggle
              className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative cursor-pointer flex flex-col justify-between min-h-[240px]"
            >
              {!isEditing && (
                <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={14}/></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteProduct(currentId); }} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                </div>
              )}

              <div className="flex items-start gap-5">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 flex items-center justify-center text-2xl font-black border border-slate-100 transition-colors shadow-inner uppercase">
                  {p.name?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <input className="w-full p-2 text-sm font-bold border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                      <select className="w-full p-2 text-xs font-bold border rounded-xl bg-slate-50" value={editData.Category} onChange={(e) => setEditData({...editData, Category: e.target.value})}>
                        {dbCategories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-black text-slate-800 truncate mb-1">{p.name}</h3>
                      <span className="inline-block text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg mb-4">
                        {p.Category || p.category || "General"}
                      </span>
                    </>
                  )}
                  
                  <div className="flex items-center gap-2 text-lg font-black text-slate-800 mt-2">
                    <IndianRupee size={16} className="text-slate-300" />
                    {isEditing ? (
                      <input type="number" className="border rounded-xl px-2 w-full text-sm" value={editData.price} onChange={(e) => setEditData({...editData, price: e.target.value})} onClick={(e) => e.stopPropagation()}/>
                    ) : (
                      <span>{p.price?.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                {isEditing ? (
                  <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                    <button onClick={saveEdit} disabled={loading} className="flex-1 bg-[#2dce89] text-white py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 shadow-md shadow-emerald-100">
                      {loading ? "..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditId(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Active Plan</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">#{String(currentId).slice(-6)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ PRODUCT VIEW MODAL */}
      {selectedProduct && !editId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="bg-[#344767] p-8 text-white relative">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={18} /></button>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl font-black border border-white/20 shadow-inner">
                  {selectedProduct.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight leading-none">{selectedProduct.name}</h2>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Asset Intelligence</p>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-2 gap-8 bg-white">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Tag size={10}/> Category</p>
                <p className="text-sm font-bold text-slate-700">{selectedProduct.Category || "Standard"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><IndianRupee size={10}/> Base Price</p>
                <p className="text-sm font-black text-emerald-600">₹{selectedProduct.price?.toLocaleString('en-IN')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Landmark size={10}/> Mature Amount</p>
                <p className="text-sm font-black text-indigo-600">₹{selectedProduct.Mature_Amount?.toLocaleString('en-IN') || "0"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> Maturity Date</p>
                <p className="text-sm font-bold text-slate-700">{selectedProduct.Date_Mature ? new Date(selectedProduct.Date_Mature).toLocaleDateString('en-GB') : "Not Set"}</p>
              </div>
              <div className="col-span-2 space-y-2 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Info size={10}/> Asset Terms & Description</p>
                <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedProduct.description || "This asset follows the standard terms and conditions of Chaudhary & Sons Web Solutions. No additional description provided."}
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setSelectedProduct(null)} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95">
                Close Intelligence View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <Package size={64} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">No Assets Found</p>
        </div>
      )}
    </div>
  );
}