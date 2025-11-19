import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";

// ==== Datos viejos solo para nombre visible ====
import alumnosData from "../data/alumnos.json";
import notificacionesData from "../data/notificaciones.json";

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

  // ⭐ AHORA EMPIEZA EN null (no muestra ningún panel)
  const [active, setActive] = useState(null);

  // =====================================================================
  // SOLO USAMOS JSON PARA MOSTRAR NOMBRE (TODO LO DEMÁS VIENE DEL BACK)
  // =====================================================================
  const alumnoId = 1;
  const alumno = alumnosData.find((a) => a.id === alumnoId);
  const nombreCompleto =
    alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno/a";

  // =====================================================================
  // CONTADOR DE NOTIFICACIONES DEL JSON (TEMPORAL)
  // =====================================================================
  const unreadCount = useMemo(() => {
    const readRaw = localStorage.getItem(`notes_read_${alumnoId}`) || "[]";
    let readParsed = [];
    try {
      readParsed = JSON.parse(readRaw);
    } catch {}

    const readSet = new Set(readParsed);

    return notificacionesData.filter((n) => {
      const visible =
        n.destino === "todos" ||
        (n.destino === "alumno" &&
          (!n.usuarioId || n.usuarioId === alumnoId));

      return visible && !readSet.has(n.id);
    }).length;
  }, []);

  // =====================================================================
  // PANEL DINÁMICO
  // =====================================================================
  const renderPanel = () => {
    switch (active) {
      case "perfil":
        return <AlumnoPerfil setActive={setActive} />;

      case "inscripcion":
        return <AlumnoInscripcion />;

      case "calificaciones":
        return <AlumnoCalificaciones />;

      case "historial":
        return <AlumnoHistorial setActive={setActive} />;

      case "notificaciones":
        return <AlumnoNotificaciones alumnoId={alumnoId} />;

      case "asistencias":
        return (
          <AlumnoAsistenciasYJustificaciones setActive={setActive} />
        );

      case "calendario":
        return <AlumnoCalendario />;

      case "contacto":
        return <AlumnoContacto />;

      default:
        return null; // ⭐ MUY IMPORTANTE: NO CARGAR PERFIL AUTOMÁTICAMENTE
    }
  };

  // =====================================================================
  // ITEMS DEL MENÚ
  // =====================================================================
  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "asistencias", label: "Asistencias y Justificaciones" },
    { id: "calendario", label: "Calendario" },
    { id: "contacto", label: "Contacto" },
  ];

  return (
    <div className="alumnos-page">
      {/* ===================== FONDO ===================== */}
      <div className="full-bg">
        <img src="/prisma.png" className="bg-img" alt="fondo" />
      </div>

      {/* ===================== SIDEBAR ===================== */}
      <aside className="sidebar">
        <div className="sidebar__inner">

          {/* PERFIL (SB-PROFILE) */}
          <div className="sb-profile">
            {/* Engranaje que abre PERFIL */}
            <button
              className="sb-gear"
              onClick={() => setActive("perfil")}
            >
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXhoMTA2dGpuM28wcXNlY2pocTJzZWlsamdvcjhqeXk3OXlpam41aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/n7ZWr1Q6a49MTei2v1/giphy.gif"
                alt="Config"
              />
            </button>

            {/* Foto clickeable que abre PERFIL */}
            <img
              src="/alumno.jpg"
              className="sb-avatar"
              onClick={() => setActive("perfil")}
              style={{ cursor: "pointer" }}
            />

            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">{nombreCompleto}</p>
          </div>

          {/* ===================== MENÚ ===================== */}
          <div className="sb-menu">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setActive(it.id)}
                className={
                  "sb-item" + (active === it.id ? " is-active" : "")
                }
              >
                <span className="sb-item__icon" />
                <span className="sb-item__text">{it.label}</span>

                {it.id === "notificaciones" && unreadCount > 0 && (
                  <span className="counter">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* ===================== CERRAR SESIÓN ===================== */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={() => navigate("/")}>
              <span>cerrar sesión</span>
              <span className="sb-logout-x">×</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===================== LOGO ===================== */}
      <div className="brand">
        <div className="brand__circle">
          <img src="/Logo.png" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {/* ===================== PANEL PRINCIPAL ===================== */}
      <div className="panel-visor">{renderPanel()}</div>
    </div>
  );
}
