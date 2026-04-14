import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Lock, Mail, User, ShieldCheck, Loader2, Users } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 1. useNavigate import karein
const API_BAS = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  // setView ko hata diya gaya hai
  const { setUserRole, setCurrentUser, addNotification , setEmail} = useContext(AppContext);
  const [role, setRole] = useState("client"); 
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); // 2. Navigate function initialize karein

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // Backend API call
      const response = await axios.post(`${API_BAS}/api/auth/login`, {
        email,
        password,
        role 
      });

      const { token, user } = response.data;

      // Token aur user data save karein
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("userRole", user.role); 
      //localStorage.setItem("email",user.email)// Role persistence ke liye zaruri hai

      // Context states update 
      setUserRole(user.role);
      setCurrentUser(user);
      setEmail(user.email); // Email context mein set karein
      addNotification(`Welcome back, ${user.name}!`);

      // 3. setView ki jagah navigate() ka use karein
      if (user.role === "admin") {
        navigate("/admin"); // Admin route par bhejein
      } else {
        navigate("/client"); // Client route par bhejein
      }

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Login failed. Please try again.";
      addNotification(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Background shapes fixed positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex border-b">
          <button 
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 py-4 text-sm font-semibold transition-all ${role === "client" ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Client Access
          </button>
          <button 
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-4 text-sm font-semibold transition-all ${role === "admin" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Admin Portal
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div 
              key={role}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block p-4 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-600 mb-4"
            >
              {role === "admin" ? <ShieldCheck size={32} /> : <User size={32} />}
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {role === "admin" ? "ADMIN LOGIN" : "CLIENT LOGIN"}
            </h2>
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
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                role === "admin" 
                ? "bg-gradient-to-r from-indigo-600 to-blue-600" 
                : "bg-gradient-to-r from-purple-600 to-pink-600"
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
            </motion.button>
          </form>
        </div>

        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
          Secure CRM Access &copy; 2026
        </div>
      </motion.div>
    </div>
  );
}