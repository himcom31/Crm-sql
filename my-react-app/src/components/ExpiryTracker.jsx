import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_BAS = import.meta.env.VITE_API_URL;

const ExpiryTracker = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('day');
    const [customDate, setCustomDate] = useState('');
    
    // Row wise local state management
    const [rowState, setRowState] = useState({}); 
    const navigate = useNavigate();

    // Data Fetching Logic (Upto Date Filter)
    const fetchExpiringSales = async (type, dateValue = '') => {
        setLoading(true);
        setFilter(type);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_BAS}/api/admin/sales/expiry?filterType=${type}`;
            if (type === 'custom' && dateValue) url += `&customDate=${dateValue}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSales(response.data.data);
        } catch (error) {
            toast.error("Problem in data fetching!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpiringSales('day'); }, []);

    const updateLocalRow = (id, field, value) => {
        setRowState(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    // OK Button Logic: Settle Payment and Update DB
    
    
const handleSettlePayment = async (sale) => {
    const currentId = sale.id || sale._id;
    const state = rowState[currentId];
    
    if (!state?.mode) return toast.error("Please select payment mode first!");

    try {
        const token = localStorage.getItem('token');
        
        // Backend Payload: productIds ko array mein bhejna zaroori hai
        const payload = {
            saleId: currentId,
            clientId: sale.clientId || sale.client?.id, // Backend checks for clientId
            productIds: [sale.productId || sale.product?.id], // Array format required by your controller
            agentId: sale.agentId || sale.agent?.id,
            paymentType: state.mode,
            paidAmount: state.mode === 'Full' ? (sale.product?.price || sale.totalAmount) : Number(state.amount),
            isRenewal: false 
        };

        // API URL check karein (Aapke backend mein 'settle-renew' hai ya 'process-settlement'?)
        const res = await axios.post(`${API_BAS}/api/admin/sales/settle-renew`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            // ... baaki success logic same rahega
            toast.success("Settlement Successful!");
            updateLocalRow(currentId, 'confirmed', true);
        }
    } catch (error) {
        console.error("Settlement Error Details:", error.response?.data);
        toast.error(error.response?.data?.message || "Settlement failed!");
    }
};

    // Renew Redirect: Data transfer to Renew Form
    const handleRenewRedirect = (sale) => {
        const state = rowState[sale.id];
        navigate('/admin/sales/renewForm', { 
            state: { 
                saleId: sale.id,
                clientId: sale.client?.id,
                clientName: sale.client?.name,
                productId: sale.product?.id,
                productName: sale.product?.name,
                agentId: sale.agent?.id,
                totalAmount: sale.product?.price,
                paymentType: state.mode,
                paidAmount: state.mode === 'Full' ? sale.product?.price : state.amount,
                isRenewal: true
            } 
        });
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#f8fafc] text-[#334155]">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-[#1e293b] tracking-tight">Maturity & Settlement</h2>
                        <p className="text-[#64748b] text-sm font-medium">Process payments and renew customer assets.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-[#374e6b]">
                        <span className="text-[10px] font-black uppercase text-[#94a3b8] px-2">Expiry UpTo:</span>
                        <input 
                            type="date" value={customDate} 
                            onChange={(e) => { setCustomDate(e.target.value); fetchExpiringSales('custom', e.target.value); }}
                            className="bg-[#4f5860] border-none rounded-lg px-3 py-1.5 text-sm font-bold text-[#1e293b]"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[32px] shadow-sm border border-[#e2e8f0] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">Customer / Agent</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">Package Details</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">Expiry Date</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">Payment Mode</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase text-center text-[#94a3b8]">Execution</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {sales.length > 0 ? sales.map((sale) => {
                                        const state = rowState[sale.id] || {};
                                        const isExpired = new Date(sale.product?.Date_Mature) < new Date();

                                        return (
                                            <motion.tr key={sale.id} className="border-b border-[#f1f5f9] hover:bg-[#fcfdfd] transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-[#1e293b]">{sale.client?.name}</p>
                                                    <p className="text-[10px] text-[#00a669] font-extrabold uppercase tracking-tighter">Agent: {sale.agent?.name}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-semibold text-[#475569]">{sale.product?.name}</p>
                                                    <p className="text-[11px] font-black text-[#1e293b]">₹{sale.product?.price}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                        {new Date(sale.product?.Date_Mature).toLocaleDateString('en-GB')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2">
                                                        <select 
                                                            disabled={state.confirmed}
                                                            className="text-[11px] font-bold p-2 bg-[#f1f5f9] rounded-lg border-none outline-none cursor-pointer"
                                                            onChange={(e) => updateLocalRow(sale.id, 'mode', e.target.value)}
                                                        >
                                                            <option value="">Choose Mode</option>
                                                            <option value="Full">Full Payment</option>
                                                            <option value="Partial">Partial Payment</option>
                                                        </select>
                                                        {state.mode === 'Partial' && (
                                                            <input 
                                                                disabled={state.confirmed}
                                                                type="number" placeholder="Amt Received"
                                                                className="p-1.5 text-[11px] border border-[#00a669] rounded-lg outline-none"
                                                                onChange={(e) => updateLocalRow(sale.id, 'amount', e.target.value)}
                                                            />
                                                        )}
                                                        {state.balance !== undefined && (
                                                            <span className="text-[10px] text-orange-600 font-bold italic">Due Balance: ₹{state.balance}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {!state.confirmed ? (
                                                        <button 
                                                            onClick={() => handleSettlePayment(sale)}
                                                            className="bg-[#1e293b] hover:bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                                                        >
                                                            Settle (OK)
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleRenewRedirect(sale)}
                                                            className="bg-[#00a669] hover:bg-[#008f5a] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00a669]/20 animate-pulse transition-all active:scale-95"
                                                        >
                                                            Process Renewal
                                                        </button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center text-[#94a3b8] italic font-medium">
                                                No expiring records found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExpiryTracker;