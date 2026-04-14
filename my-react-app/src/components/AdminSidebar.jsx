import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users, Package, LayoutDashboard, ChevronDown, ChevronLeft,
  UserPlus, Database, PlusCircle, LayoutList, Tag,
  Users2, TrendingUp, Settings, BookOpen, X, Menu,
  Briefcase, CreditCard, LogOut, User
} from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // ✅ Profile Dropdown State

  const [openMenus, setOpenMenus] = useState({
    clients: false,
    agents: false,
    inventory: false,
    sales: false
  });

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleMenu = (menu) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* --- MOBILE TOGGLE --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- MAIN SIDEBAR --- */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40 bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-72"}
      `}>

        {/* LOGO SECTION */}
        <div className={`p-6 flex items-center border-b border-slate-50 relative ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 bg-emerald-600 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">H</div>
            {!isCollapsed && (
              <span className="font-black text-slate-800 tracking-tight text-xl italic whitespace-nowrap animate-in fade-in duration-500">
                Kuber Support
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-16 h-6 w-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:bg-slate-50 z-50"
          >
            <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">

          <SidebarItem
            to="/admin/dash/main"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={isActive("/admin/dash/main")}
            collapsed={isCollapsed}
          />

          {/* 1. CLIENTS */}
          <div className="space-y-1">
            <DropdownHeader
              icon={<Users size={20} />}
              label="Clients"
              isOpen={openMenus.clients}
              onClick={() => toggleMenu('clients')}
              active={location.pathname.includes('clients')}
              collapsed={isCollapsed}
            />
            {!isCollapsed && openMenus.clients && (
              <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <SubItem to="/admin/clients/add" label="Add Client" active={isActive("/admin/clients/add")} />
                <SubItem to="/admin/clients/view" label="Client List" active={isActive("/admin/clients/view")} />
              </div>
            )}
          </div>

          {/* 2. AGENTS */}
          <div className="space-y-1">
            <DropdownHeader
              icon={<Users2 size={20} />}
              label="Agents"
              isOpen={openMenus.agents}
              onClick={() => toggleMenu('agents')}
              active={location.pathname.includes('agents')}
              collapsed={isCollapsed}
            />
            {!isCollapsed && openMenus.agents && (
              <div className="ml-9 space-y-1 animate-in slide-in-from-top-2">
                <SubItem to="/admin/agents/add" label="Register Agent" active={isActive("/admin/agents/add")} />
                <SubItem to="/admin/agents/view" label="Agent Database" active={isActive("/admin/agents/view")} />
              </div>
            )}
          </div>

          {/* 3. PRODUCTS/INVENTORY */}
          <div className="space-y-1">
            <DropdownHeader
              icon={<Package size={20} />}
              label="Products"
              isOpen={openMenus.inventory}
              onClick={() => toggleMenu('inventory')}
              active={location.pathname.includes('inventory')}
              collapsed={isCollapsed}
            />
            {!isCollapsed && openMenus.inventory && (
              <div className="ml-9 space-y-1 animate-in slide-in-from-top-2">
                <SubItem to="/admin/inventory/add-product" label="New Product" active={isActive("/admin/inventory/add-product")} />
                <SubItem to="/admin/inventory/view-inventory" label="View Products" active={isActive("/admin/inventory/view-inventory")} />
              </div>
            )}
          </div>

          {/* 4. SALES */}
          <div className="space-y-1">
            <DropdownHeader
              icon={<CreditCard size={20} />}
              label="Sales"
              isOpen={openMenus.sales}
              onClick={() => toggleMenu('sales')}
              active={location.pathname.includes('sales')}
              collapsed={isCollapsed}
            />
            {!isCollapsed && openMenus.sales && (
              <div className="ml-9 space-y-1 animate-in slide-in-from-top-2">
                <SubItem to="/admin/sales/add" label="New Sale" active={isActive("/admin/sales/add")} />
                <SubItem to="/admin/sales/history" label="Sales History" active={isActive("/admin/sales/history")} />
                <SubItem to="/admin/sales/expire" label="Renew" active={isActive("/admin/sales/history")} />

              </div>
            )}
          </div>

          {/* 5. CATEGORIES (Single Item) */}
          <div className="space-y-1">
            <Link
              to="/admin/inventory/manage-categories"
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${location.pathname.includes('category')
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50'
                } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Tag size={20} className={`${location.pathname.includes('category') ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'}`} />
              {!isCollapsed && <span className="font-bold text-sm">Categories</span>}
            </Link>
          </div>
        </div>

        {/* --- PROFILE FOOTER WITH DROPDOWN --- */}

        {/* --- PROFILE FOOTER WITH DROPDOWN --- */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 relative">
          {isProfileOpen && !isCollapsed && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute bottom-full left-4 right-4 mb-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 z-20 animate-in slide-in-from-bottom-4 duration-300">

                {/* Profile Option */}
                <Link
                  to="/admin/profile" // ✅ Ye naye page par le jayega
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all group"
                >
                  <div className="p-2 bg-slate-50 group-hover:bg-white rounded-lg"><User size={16} /></div>
                  My Profile
                </Link>

                <div className="h-px bg-slate-100 my-1 mx-2" />

                {/* Logout Option */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                >
                  <div className="p-2 bg-red-50 group-hover:bg-white rounded-lg"><LogOut size={16} /></div>
                  Sign Out
                </button>
              </div>
            </>
          )}

          <div
            onClick={() => !isCollapsed && setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${!isCollapsed ? "hover:bg-white cursor-pointer" : "justify-center"}`}
          >
            <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-emerald-200 shrink-0">
              HC
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Super Admin</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ to, icon, label, active, collapsed }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-slate-50'} ${collapsed ? "justify-center px-0" : ""}`}>
      <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} shrink-0`}>{icon}</span>
      {!collapsed && <span className="font-bold text-sm whitespace-nowrap animate-in fade-in">{label}</span>}
    </Link>
  );
}

function DropdownHeader({ icon, label, isOpen, onClick, active, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active && !isOpen ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'} ${collapsed ? "justify-center px-0" : ""}`}
    >
      <span className={`${active ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600'} shrink-0`}>{icon}</span>
      {!collapsed && (
        <>
          <span className="font-bold text-sm flex-1 text-left whitespace-nowrap animate-in fade-in">{label}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </>
      )}
    </button>
  );
}

function SubItem({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`block px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${active ? 'text-emerald-600 bg-emerald-50/50 border-l-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
    >
      {label}
    </Link>
  );
}