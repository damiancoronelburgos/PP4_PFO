import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminSidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <div className="admin-sidebar">
      <h2>Administración</h2>
      <ul>
        <li onClick={() => navigate("/administracion/gestionar-alumnos")}>
          Gestionar Alumnos
        </li>
        <li onClick={() => navigate("/administracion/oferta-academica")}>
          Configurar Oferta Académica
        </li>
        <li onClick={() => navigate("/administracion/constancias")}>
          Emitir Constancias
        </li>
        <li onClick={() => navigate("/administracion/notificaciones")}>
          Notificaciones
        </li>
      </ul>
    </div>
  );
}
