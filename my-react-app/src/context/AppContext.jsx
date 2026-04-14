// src/context/AppContext.js
import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState(null);

  const [notifications, setNotifications] = useState([]);

  // ✅ Restore login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userData");
    const storedRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("email");

    if (token && storedUser && storedRole) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setUserRole(storedRole);
        setEmail(storedEmail);
      } catch (err) {
        console.error("Auth Restoration Error:", err);
        handleLogout();
      }
    }

    setLoading(false);
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");

    setCurrentUser(null);
    setUserRole(null);
  };

  // ✅ Notification system
  const addNotification = (msg) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        email,
        setUserRole,
        setEmail,
        currentUser,
        setCurrentUser,
        clients,
        setClients,
        products,
        setProducts,
        notifications,
        addNotification,
        loading,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}