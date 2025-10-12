import React from "react";
import "../styles/AdminSidebar.css";

export default function AdminSidebar({ setVista }) {
  return (
    <div className="admin-sidebar">
      <h2>Administración</h2>
      <ul>
        <li onClick={() => setVista("alumnos")}>Gestionar Alumnos</li>
        <li onClick={() => setVista("oferta")}>Configurar Oferta Académica</li>
        <li onClick={() => setVista("constancias")}>Emitir Constancias</li>
        <li onClick={() => setVista("notificaciones")}>Notificaciones</li>
      </ul>
    </div>
  );
}

