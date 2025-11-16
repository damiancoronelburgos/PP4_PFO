import React from "react";
import "../styles/alumnos.css";
import "../styles/AdminSidebar.css";

import { useNavigate } from "react-router-dom";

export default function AdminSidebar({ setVista, vistaActual }) {
  const navigate = useNavigate();

  const handleSalir = () => {
    // Mensaje de confirmación
    const confirmar = window.confirm("¿Desea cerrar sesión y volver al login?");
    if (confirmar) {
      // Limpiar datos de usuario si fuera necesario
      navigate("/"); // redirige a la ruta /logi
    }
  };

  const menuItems = [
    { key: "alumnos", label: "Gestionar Alumnos" },
    { key: "oferta", label: "Configurar Oferta Académica" },
    { key: "constancias", label: "Emitir Constancias" },
    { key: "notificaciones", label: "Notificaciones" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-top">
        <img src="/administrativo.jpg" alt="perfil" className="sidebar-logo" />
      </div>

      <h2>Administración</h2>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.key}
            role="button"
            className={vistaActual === item.key ? "active" : ""}
            onClick={() => setVista(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleSalir}>
          Salir
        </button>
      </div>
    </div>
  );
}
