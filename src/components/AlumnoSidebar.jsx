import React from "react";
import "../styles/alumnos.css";
import "../styles/AdminSidebar.css"; 

import { useNavigate } from "react-router-dom";

// ✅ Nombre del componente corregido
export default function AlumnoSidebar({ setVista, vistaActual }) {
  const navigate = useNavigate();

  const handleSalir = () => {
    // Mensaje de confirmación
    const confirmar = window.confirm("¿Desea cerrar sesión y volver al login?");
    if (confirmar) {
      // Limpiar datos de usuario si fuera necesario
      navigate("/"); // redirige a la ruta /login
    }
  };

  const menuItems = [

    
    // === Vistas del Alumno ===
    // Nota: Uso las claves minúsculas (excepto Calendario, si ese era tu caso anterior) 
    // para los nuevos ítems. Asegúrate de que los 'case' en Administrador.jsx coincidan.
    { key: "perfil", label: "Mi Perfil" },
    { key: "inscripcion", label: "Inscripción" },
    { key: "calificaciones", label: "Calificaciones" },
    { key: "asistencias", label: "Asistencias" },
    { key: "historial", label: "Historial Académico" },
    { key: "notificaciones", label: "Notificaciones" }, // Compartido
    { key: "Calendario", label: "Calendario" }, // Mantengo "Calendario" con mayúscula para coincidir con tu código anterior
    { key: "contacto", label: "Contacto" },
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