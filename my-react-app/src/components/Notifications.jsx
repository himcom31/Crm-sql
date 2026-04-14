// src/components/Notifications.js
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Notifications() {
  const { notifications } = useContext(AppContext);

  return (
    <div className="fixed top-5 right-5">
      {notifications.map((n) => (
        <div key={n.id} className="bg-black text-white p-2 m-1">
          {n.msg}
        </div>
      ))}
    </div>
  );
}