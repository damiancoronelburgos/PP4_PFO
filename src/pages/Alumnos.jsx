import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";

import {
  fetchAlumnoMe,
  fetchAlumnoNotificaciones
} from "../lib/alumnos.api";

// ==== Componentes ====
import AlumnoPerfil from "./alumnos/componentes/AlumnoPerfil.jsx";
import AlumnoInscripcion from "./alumnos/componentes/AlumnoInscripcion.jsx";
import AlumnoCalificaciones from "./alumnos/componentes/AlumnoCalificaciones.jsx";
import AlumnoHistorial from "./alumnos/componentes/AlumnoHistorial.jsx";
import AlumnoNotificaciones from "./alumnos/componentes/AlumnoNotificaciones.jsx";
import AlumnoCalendario from "./alumnos/componentes/AlumnoCalendario.jsx";
import AlumnoContacto from "./alumnos/componentes/AlumnoContacto.jsx";
import AlumnoAsistenciasYJustificaciones from "./alumnos/componentes/AlumnoAsistenciasYJustificaciones.jsx";

export default function Alumnos() {
  const navigate = useNavigate();

  const [active, setActive] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const [alumnoId, setAlumnoId] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);

  // ================================================================
  // CARGAR DATOS DEL ALUMNO REAL
  // ================================================================
  useEffect(() => {
    async function cargarDatos() {
      const data = await fetchAlumnoMe();
      if (data) {
        setAlumno(data);
        setAlumnoId(data.id);
      }

      // Notificaciones REALES desde el backend
      const notifs = await fetchAlumnoNotificaciones();
      setNotificaciones(notifs);
    }

    cargarDatos();
  }, []);

  // ================================================================
  // CONTADOR DE NOTIFICACIONES NO LEÍDAS
  // ================================================================
  const unreadCount = useMemo(() => {
    return notificaciones.filter((n) => !n.leida).length;
  }, [notificaciones]);

  // ================================================================
  // PANEL PRINCIPAL
  // ================================================================
  const renderPanel = () => {
    if (!alumnoId) return null; // Evita errores mientras carga

    switch (active) {
      case "perfil":
        return <AlumnoPerfil setActive={setActive} />;

      case "inscripcion":
        return <AlumnoInscripcion alumnoId={alumnoId} />;

      case "calificaciones":
        return <AlumnoCalificaciones alumnoId={alumnoId} />;

      case "historial":
        return <AlumnoHistorial alumnoId={alumnoId} setActive={setActive} />;

      case "notificaciones":
        return <AlumnoNotificaciones alumnoId={alumnoId} />;

      case "asistencias":
        return <AlumnoAsistenciasYJustificaciones alumnoId={alumnoId} />;

      case "calendario":
        return <AlumnoCalendario alumnoId={alumnoId} />;

      case "contacto":
        return <AlumnoContacto alumnoId={alumnoId} />;

      default:
        return null;
    }
  };

  // ================================================================
  // MENÚ
  // ================================================================
  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "asistencias", label: "Asistencias y Justificaciones" },
    { id: "calendario", label: "Calendario" },
    { id: "contacto", label: "Contacto" },
  ];

  const nombreCompleto = alumno
    ? `${alumno.nombre} ${alumno.apellido}`
    : "Alumno/a";

  return (
    <div className="alumnos-page">
      {/* ===================== FONDO ===================== */}
      <div className="full-bg">
        <img src="/prisma.png" className="bg-img" alt="fondo" />
      </div>

      {/* ===================== SIDEBAR ===================== */}
      <aside className="sidebar">
        <div className="sidebar__inner">

          {/* PERFIL */}
          <div className="sb-profile">
            <button className="sb-gear" onClick={() => setActive("perfil")}>
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXhoMTA2dGpuM28wcXNlY2pocTJzZWlsamdvcjhqeXk3OXlpam41aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/n7ZWr1Q6a49MTei2v1/giphy.gif"
                alt="Config"
              />
            </button>

            <img
              src={alumno?.avatarUrl || "/alumno.jpg"}
              className="sb-avatar"
              onClick={() => setActive("perfil")}
              style={{ cursor: "pointer" }}
            />

            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">{nombreCompleto}</p>
          </div>

          {/* MENÚ */}
          <div className="sb-menu">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setActive(it.id)}
                className={"sb-item" + (active === it.id ? " is-active" : "")}
              >
                <span className="sb-item__icon" />
                <span className="sb-item__text">{it.label}</span>

                {it.id === "notificaciones" && unreadCount > 0 && (
                  <span className="counter">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* CERRAR SESIÓN */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={() => navigate("/")}>
              <span>cerrar sesión</span>
              <span className="sb-logout-x">×</span>
            </button>
          </div>
        </div>
      </aside>

      {/* LOGO */}
      <div className="brand">
        <div className="brand__circle">
          <img src="/Logo.png" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {/* PANEL PRINCIPAL */}
      <div className="panel-visor">{renderPanel()}</div>
    </div>
  );
}
