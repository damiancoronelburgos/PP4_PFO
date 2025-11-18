/*
import React, { useState } from "react";

// Componentes
import AlumnoSidebar from "../components/AlumnoSidebar";

// Vistas administrativas
import GestionAlumnos from "./administrador/GestionAlumnos";
import Constancias from "./administrador/Constancias";
import ComuniocacionesAdmin from "./administrador/Comunicaciones";
import Preceptor from "./Preceptor";

// Vistas de alumno
import Perfil from "./alumnos/Perfil";
import Inscripcion from "./alumnos/Inscripcion";
import Asistencias from "./alumnos/Asistencias";
import Calificaciones from "./alumnos/Calificaciones";
import Historial from "./alumnos/Historial";
import Contacto from "./alumnos/Contacto";

// Estilos
import "../styles/alumnos.css";
import "../styles/Administrador.css";

export default function Alumnos() {
  const [vistaActual, setVista] = useState("inicio");

  const renderVista = () => {
    switch (vistaActual) {
      // === Vistas Administrativas ===
      case "alumnos":
        return <GestionAlumnos />;

      case "constancias":
        return <Constancias />;

      case "notificaciones":
        return <ComuniocacionesAdmin />;

      // Calendario usando la vista principal de Preceptor
      case "Calendario":
        return <Preceptor />;

      // === Vistas de Alumno ===
      case "perfil":
        return <Perfil />;

      case "inscripcion":
        return <Inscripcion />;

      case "asistencias":
        return <Asistencias />;

      case "calificaciones":
        return (
          <Calificaciones
            setActive={(view) => setVista(view || "inicio")}
          />
        );

      case "historial":
        return (
          <Historial
            setActive={(view) => setVista(view || "inicio")}
            historial={[]}
            generarPDF={() =>
              alert(
                "La descarga del historial en PDF aún no está implementada desde esta vista."
              )
            }
          />
        );

      case "contacto":
        return (
          <Contacto
            setActive={(view) => setVista(view || "inicio")}
          />
        );

      default:
        return (
          <h3 className="bienvenida">
            Seleccione una opción del menú
          </h3>
        );
    }
  };

  return (
    <div className="administrador-container" style={{ display: "flex" }}>
      <AlumnoSidebar setVista={setVista} vistaActual={vistaActual} />

      <div
        className="administrador-content"
        style={{ flex: 1, padding: "20px" }}
      >
        {renderVista()}
      </div>
    </div>
  );
}*/
//src/pages/Alumnos.jsx
// src/pages/Alumnos.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";

// === Datos locales para perfil / notificaciones ===
import alumnosData from "../data/alumnos.json";
import notificacionesData from "../data/notificaciones.json";

// === Componentes ===
import AlumnoPerfil from "./alumnos/componentes/AlumnoPerfil.jsx";
import AlumnoInscripcion from "./alumnos/componentes/AlumnoInscripcion.jsx";
import AlumnoCalificaciones from "./alumnos/componentes/AlumnoCalificaciones.jsx";
import AlumnoHistorial from "./alumnos/componentes/AlumnoHistorial.jsx";
import AlumnoNotificaciones from "./alumnos/componentes/AlumnoNotificaciones.jsx";
import AlumnoCalendario from "./alumnos/componentes/AlumnoCalendario.jsx";
import AlumnoContacto from "./alumnos/componentes/AlumnoContacto.jsx";

// ⭐ NUEVO COMPONENTE UNIFICADO
import AlumnoAsistenciasYJustificaciones from "./alumnos/componentes/AlumnoAsistenciasYJustificaciones.jsx";

export default function Alumnos() {
  const navigate = useNavigate();
  const [active, setActive] = useState("perfil");

  const alumnoId = 1;
  const alumno = alumnosData.find((a) => a.id === alumnoId);
  const nombreCompleto =
    alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno/a";

  // =================== CONTADOR NOTIFICACIONES =====================
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

  // =================== RENDERIZAR PANEL =====================
  const renderPanel = () => {
    switch (active) {
      case "perfil":
        return <AlumnoPerfil alumno={alumno} setActive={setActive} />;

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
          <AlumnoAsistenciasYJustificaciones
            setActive={setActive}
          />
        );

      case "calendario":
        return <AlumnoCalendario />;

      case "contacto":
        return <AlumnoContacto />;

      default:
        return <AlumnoPerfil alumno={alumno} setActive={setActive} />;
    }
  };

  // =================== ITEMS MENÚ =====================
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
          {/* PERFIL */}
          <div className="sb-profile">
            <button
              className="sb-gear"
              onClick={() => setActive("perfil")}
            />
            <img src="/alumno.jpg" className="sb-avatar" />
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

      {/* ===================== LOGO ===================== */}
      <div className="brand">
        <div className="brand__circle">
          <img src="/Logo.png" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {/* ===================== PANEL CONTENIDO ===================== */}
      <div className="panel-visor">{renderPanel()}</div>
    </div>
  );
}
