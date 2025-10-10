import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";   // ← nuevo import

export default function Alumnos() {
  const navigate = useNavigate();
  const [active, setActive] = useState("inscripcion");

  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
  ];

  const handleLogout = () => navigate("/");

  return (
    <div className="alumnos-page">
      {/* Fondo principal */}
      <div className="full-bg">
        <img src="/prisma.png" alt="Prisma" className="bg-img" />
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__inner">
          {/* Perfil */}
          <div className="sb-profile">
            <img src="/alumno.jpg" alt="Sabrina Choque" className="sb-avatar" />
            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">Sabrina Choque</p>
          </div>

          {/* Menú (solo selección visual) */}
          <div className="sb-menu">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setActive(it.id)}
                className={"sb-item" + (active === it.id ? " is-active" : "")}
              >
                <span className="sb-item__icon" />
                <span className="sb-item__text">{it.label}</span>
              </button>
            ))}
          </div>

          {/* Footer: botón Salir */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <span>Salir</span>
              <span className="sb-logout-x">×</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Marca fija arriba */}
      <div className="brand">
        <div className="brand__circle">
          <img src="/Logo.png" alt="Logo Prisma" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>
    </div>
  );
}
