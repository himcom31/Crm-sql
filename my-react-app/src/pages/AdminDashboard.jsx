import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

// Components Import
import AdminSidebar from "../components/AdminSidebar";
import ClientForm from "../components/ClientForm";
import ClientList from "../components/ClientList";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import AgentForm from "../components/AgentForm";
import AgentList from "../components/AgentList";
import CategoryManager from "../components/CategoryManager";
import Sales from "../components/Sales";
import SalesList from "../components/SalesList";
import Dashboard from "../components/DashboardLayout";
import AdminProfile from "./AdminProfile";
import ExpiryTracker from "../components/ExpiryTracker";
import RenewForm from "../components/RenewForm";

export default function AdminDashboard() {
  const location = useLocation();

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  return (
    /* 1. 'h-screen' aur 'overflow-hidden' sabse zaroori hai sidebar fix karne ke liye */
    <div className="flex h-screen w-full font-sans overflow-hidden bg-[#f8f9fa]">

      {/* --- BACKGROUND MESH (Fixed behind everything) --- */}
      <div className="fixed inset-0 -z-10 premium-mesh-bg">
        {/* Noise texture for premium look */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      {/* --- SIDEBAR (Now stays fixed due to parent h-screen) --- */}
      <AdminSidebar />

      {/* --- MAIN CONTENT AREA (Independently Scrollable) --- */}
      <main className="flex-1 h-full overflow-y-auto relative custom-scrollbar bg-[#f8f9fa]">

        {/* Subtle Gradient Overlay inside main area */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none -z-10"></div>

        <div className="w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...pageTransition}
              className="w-full"
            >
              <Routes>
                {/* Clients Section */}
                <Route path="clients/add" element={<ClientForm />} />
                <Route path="clients/view" element={<ClientList />} />

                {/* Agents Section */}
                <Route path="agents/add" element={<AgentForm />} />
                <Route path="agents/view" element={<AgentList />} />

                {/* Products Section */}
                <Route path="inventory/add-product" element={<ProductForm />} />
                <Route path="inventory/view-inventory" element={<ProductList />} />

                {/* Categories Management */}
                <Route path="inventory/manage-categories" element={<CategoryManager />} />

                {/* Admin profile */}
                <Route path="/profile" element={<AdminProfile />} />


                {/* Sales */}
                <Route path="sales/add" element={<Sales />} />
                <Route path="sales/history" element={<SalesList />} />
                <Route path="sales/expire" element={<ExpiryTracker />} />
                <Route path="sales/renewForm" element={<RenewForm />} />


                <Route path="dash/main" element={<Dashboard />} />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="clients/view" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}