import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Lock, Mail, User, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BAS = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const { setUserRole, setCurrentUser, addNotification, setEmail } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // Backend API call - Yahan role humne "client" fixed kar diya hai
      const response = await axios.post(`${API_BAS}/api/auth/client/login`, {
        email,
        password,
        role: "client" 
      });

      const { token, user } = response.data;

      // Token aur user data save karein
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("userRole", user.role); 

      // Context states update 
      setUserRole(user.role);
      setCurrentUser(user);
      setEmail(user.email);
      addNotification(`Welcome back, ${user.name}!`);

      // Seedha client dashboard par bhejien
      navigate("/client");

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
      addNotification(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 text-purple-600 mb-4">
              <User size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              CLIENT LOGIN
            </h2>
            <p className="text-gray-500 text-sm mt-2">Enter your credentials to access your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-600 to-pink-600 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
            </motion.button>
          </form>
        </div>

        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
          Secure Client Portal &copy; 2026
        </div> 
      </motion.div>
    </div>
  );
}