import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API_BAS = import.meta.env.VITE_API_URL;

const RenewForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state; 

    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(true);
    const [allProducts, setAllProducts] = useState([]);
    
    // ✅ Handle both id and id for initial selection
    const initialProductId = data?.productId || data?.product?.id || data?.product?.id;
    const [selectedProductIds, setSelectedProductIds] = useState(initialProductId ? [initialProductId] : []);
    
    const [paidAmount, setPaidAmount] = useState(data?.paidAmount || 0);
    const [paymentType, setPaymentType] = useState(data?.paymentType || 'Full');

    useEffect(() => {
        const fetchProducts = async () => {
            setProductsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BAS}/api/products`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const fetchedProducts = Array.isArray(res.data) ? res.data : res.data.data;
                setAllProducts(fetchedProducts || []);
            } catch (err) {
                console.error("Fetch Error:", err);
                toast.error("Failed to load product list.");
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!data) {
            toast.error("Please settle payment in tracker first!");
            navigate('/admin/expiry-tracker');
        }
    }, [data, navigate]);

    // ✅ Calculation logic updated for SQL 'id'
    const calculateTotalBill = () => {
        if (!allProducts.length) return 0;
        const selected = allProducts.filter(p => {
            const pid = p.id || p.id;
            return selectedProductIds.includes(pid);
        });
        return selected.reduce((sum, p) => sum + Number(p.price || 0), 0);
    };

    const totalBill = calculateTotalBill();

    // ✅ Sync paidAmount when totalBill changes if payment is 'Full'
    useEffect(() => {
        if (paymentType === 'Full') {
            setPaidAmount(totalBill);
        }
    }, [totalBill, paymentType]);

    const handleProductToggle = (id) => {
        if (selectedProductIds.includes(id)) {
            if (selectedProductIds.length > 1) {
                setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
            } else {
                toast.error("At least one product must be selected");
            }
        } else {
            setSelectedProductIds([...selectedProductIds, id]);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // ✅ Prepare clean payload for Sequelize backend
            const payload = {
                saleId: data.saleId || data.id,
                clientId: data.clientId,
                productIds: selectedProductIds, // Already an array
                agentId: data.agentId,
                commissionLabel: 5, 
                paymentType: paymentType,
                paidAmount: paymentType === 'Full' ? totalBill : Number(paidAmount),
                isRenewal: true
            };

            const response = await axios.post(`${API_BAS}/api/admin/sales/settle-renew`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Renewal Successful!");
                navigate('/admin/sales/history');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Process Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 min-h-screen bg-[#f8fafc]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-2xl border border-[#e2e8f0] overflow-hidden"
            >
                {/* Top Banner */}
                <div className="bg-[#526179] p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Renewal Engine</h2>
                        <p className="text-blue-300 text-xs font-bold uppercase">Customer: {data?.clientName || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Payable</p>
                        <p className="text-3xl font-black text-[#00a669]">₹{totalBill.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Section */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Packages to Renew/Add</h3>
                        {productsLoading ? (
                            <div className="text-center p-10 italic text-slate-400">Loading...</div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {allProducts.map((p) => {
                                    const pid = p.id || p.id;
                                    const isSelected = selectedProductIds.includes(pid);
                                    return (
                                        <div 
                                            key={pid}
                                            onClick={() => handleProductToggle(pid)}
                                            className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex justify-between items-center ${
                                                isSelected ? 'border-[#00a669] bg-[#00a669]/5 shadow-md' : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            <div>
                                                <p className="font-bold text-[#1e293b]">{p.name}</p>
                                                <p className="text-[10px] font-black text-[#00a669]">₹{Number(p.price).toLocaleString()}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 bg-[#00a669] rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="bg-[#f8fafc] p-8 rounded-[32px] border border-slate-100 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Payment Strategy</label>
                                <select 
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className="w-full p-4 rounded-2xl border-none shadow-sm font-bold text-[#1e293b] outline-none"
                                >
                                    <option value="Full">Full Settlement</option>
                                    <option value="Partial">Partial Settlement</option>
                                </select>
                            </div>

                            {paymentType === 'Partial' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Amount Received (₹)</label>
                                    <input 
                                        type="number"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        className="w-full p-4 rounded-2xl border-2 border-[#00a669] font-black text-xl outline-none"
                                    />
                                    <div className="mt-4 p-4 bg-orange-50 rounded-xl">
                                        <p className="text-[10px] text-orange-600 font-bold uppercase">Balance</p>
                                        <p className="text-xl font-black text-orange-700">₹{(totalBill - Number(paidAmount)).toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                            <button 
                                type="submit"
                                disabled={loading || productsLoading}
                                className="w-full bg-[#00a669] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Finalize Renewal"}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="w-full text-slate-400 text-[10px] font-black uppercase hover:text-red-500">
                                Cancel & Exit
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default RenewForm;