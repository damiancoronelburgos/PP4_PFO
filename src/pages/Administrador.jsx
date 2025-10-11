import React from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import "../styles/Administrador.css";

export default function Administrador() {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Panel de Administración</h1>
        <p>Bienvenido al área administrativa del sistema.</p>
      </div>
    </div>
  );
}
