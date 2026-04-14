import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientNavbar from './ClientNavbar'; // Aapka Navbar component

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fe]">
      {/* Navbar yahan humesha rahega */}
      <ClientNavbar />

      {/* Outlet ka matlab hai ki baki saare pages yahan load honge */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Agar aap Footer chahte hain toh wo bhi yahan add kar sakte hain */}
    </div>
  );
}