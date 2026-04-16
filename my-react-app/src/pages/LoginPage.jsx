import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BAS = import.meta.env.VITE_API_URL;

export default function AdminLoginPage() {
  const { setUserRole, setCurrentUser, addNotification, setEmail } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Role yahan fixed "admin" rahega
  const role = "admin";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(`${API_BAS}/api/auth/admin/login`, {
        email,
        password,
        role
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);

      setUserRole(user.role);
      setCurrentUser(user);
      setEmail(user.email);
      addNotification(`Welcome back, Administrator ${user.name}!`);

      // Admin page par navigate karein
      navigate("/admin");

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Admin access denied. Please check credentials.";
      addNotification(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 p-4">
      {/* Subtle Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/30">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              ADMIN PORTAL
            </h2>
            <p className="text-indigo-200/60 text-sm mt-2">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-indigo-300/50" size={20} />
              <input
                name="email"
                type="email"
                required
                placeholder="Admin Email"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-indigo-300/50" size={20} />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Enter Dashboard"}
            </motion.button>
          </form>

          {/* Client Login Link - Redirects to Client Login Page */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button 
              onClick={() => navigate("/client-pages")} // Aapka client login route yahan aayega
              className="text-indigo-300 hover:text-white text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors group"
            >
              Are you a Client? <span className="underline">Client Login</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-black/20 text-center text-[10px] text-gray-500 uppercase tracking-widest">
          Secure System Access &copy; 2026
        </div> 
      </motion.div>
    </div>
  );
}