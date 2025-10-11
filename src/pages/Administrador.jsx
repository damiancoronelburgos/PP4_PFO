import React from "react";
import "../styles/AdminSidebar.css";

export default function AdminSidebar({ setVista, vistaActual }) {
  const menuItems = [
    // Opción de Inicio añadida
    { key: "inicio", label: "Inicio" }, 
    { key: "alumnos", label: "Gestionar Alumnos" },
    { key: "oferta", label: "Configurar Oferta Académica" },
    { key: "constancias", label: "Emitir Constancias" },
    { key: "notificaciones", label: "Notificaciones" },
  ];

  return (
    <div className="admin-sidebar">
      <h2>Administración</h2>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.key}
            // Añadido role="button" para accesibilidad
            role="button" 
            className={vistaActual === item.key ? "active" : ""}
            onClick={() => setVista(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}