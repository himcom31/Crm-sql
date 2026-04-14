import React, { useState, useContext } from 'react';
import { AppContext } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, ChevronDown, Settings, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientNavbar() {
  const { currentUser, setUserRole, setCurrentUser } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    setUserRole(null);
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-100 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* --- Brand Logo --- */}
      <Link to="/client" className="flex items-center gap-2 outline-none">
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-lg">
          <Shield className="text-white" size={20} />
        </div>
        <span className="font-black text-green-700 tracking-tighter text-lg uppercase">
          Kuber<span className="text-purple-600"> Support</span>
        </span>
      </Link>

      {/* --- Profile & Logout Section --- */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 rounded-full transition-all border border-slate-100"
        >
          {/* User Avatar Initials */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs">
            {currentUser?.name?.charAt(0).toUpperCase() || "C"}
          </div>
          
          <div className="hidden md:block text-left">
            <p className="text-[11px] font-black text-slate-800 leading-tight">
              {currentUser?.name || "Client User"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Verified Client
            </p>
          </div>
          
          <ChevronDown className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={14} />
        </button>

        {/* --- Dropdown Menu --- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.email}</p>
              </div>

              <div className="p-2">
                <button 
                  onClick={() => { navigate("/client/profile"); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-colors"
                >
                  <User size={18} />
                  My Profile
                </button>
                
                <button 
                  onClick={() => { navigate("/client/settings"); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-colors"
                >
                  <Settings size={18} />
                  Settings
                </button>

                <div className="h-px bg-slate-100 my-2 mx-2" />

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Logout Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}