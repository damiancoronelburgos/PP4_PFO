import React from "react";
import "../styles/docente.css";
import "../styles/AdminSidebar.css";
import { useNavigate } from "react-router-dom";

export default function DocenteSidebar({ setActiveItem, activeItem }) {
  const navigate = useNavigate();

  const handleSalir = () => {
    if (window.confirm("¿Desea cerrar sesión y volver al login?")) {
      navigate("/");
    }
  };

  const menuItems = [
    { key: "notas", label: "Cargar Notas" },
    { key: "asistencia", label: "Asistencia" },
    { key: "actas", label: "Acta de Cursada" },
    { key: "notificaciones", label: "Notificaciones" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-top">
        <img src="/docente.jpg" alt="perfil" className="sidebar-logo" />
      </div>

      <h2>Docente</h2>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.key}
            role="button"
            className={activeItem === item.key ? "active" : ""}
            onClick={() => setActiveItem(item.key)}
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
