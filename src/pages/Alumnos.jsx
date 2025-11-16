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
}