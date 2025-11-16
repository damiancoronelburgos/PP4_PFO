import React, { useState } from "react";
// Importaciones de componentes
import AlumnoSidebar from "../components/AlumnoSidebar"; 
import GestionAlumnos from "./administrador/GestionAlumnos";
import Constancias from "./administrador/Constancias";
import Notificaciones from "./administrador/Notificaciones";
import Preceptor from "./Preceptor"; // Usado para el caso "Calendario" si es la vista principal

// 🆕 NUEVOS COMPONENTES DE ALUMNO (Asumo rutas en ./alumnos/)
import Perfil from "./alumnos/Perfil"; 
import Inscripcion from "./alumnos/Inscripcion";
import Asistencias from "./alumnos/Asistencias"; 
import Calificaciones from "./alumnos/Calificaciones";
import Historial from "./alumnos/Historial"; 
import Contacto from "./alumnos/Contacto"; 
// Nota: 'Calendario' y 'Notificaciones' ya están importados/definidos (usamos Preceptor y Notificaciones)


// Estilos
import "../styles/alumnos.css";
import "../styles/Administrador.css";

export default function Administrador() {
  const [vistaActual, setVista] = useState("inicio");

  const renderVista = () => {
    switch (vistaActual) {
      // === Vistas Administrativas ===
      case "alumnos":
        return <GestionAlumnos />;
      case "constancias":
        return <Constancias />;

      // === Vistas Compartidas / Alumno ===
      case "notificaciones":
        return <Notificaciones />; 
      
      // Utilizamos el componente principal Preceptor para mostrar la vista de Calendario
      case "Calendario": 
        return <Preceptor />; 

      // === NUEVOS CASES AGREGADOS PARA EL ALUMNO ===
      case "perfil":
        return <Perfil />;
      case "inscripcion":
        return <Inscripcion />;
      case "asistencias":
        return <Asistencias />;
      case "calificaciones":
        return <Calificaciones />;
      case "historial":
        return <Historial />;
      case "contacto":
        return <Contacto />;

      default:
        return <h3 className="bienvenida">Seleccione una opción del menú</h3>
    }
  };

  return (
    <div className="administrador-container" style={{ display: "flex" }}>
      {/* Sidebar */}
      <AlumnoSidebar setVista={setVista} vistaActual={vistaActual} />

      {/* Contenido */}
      <div className="administrador-content" style={{ flex: 1, padding: "20px" }}>
        {renderVista()}
      </div>
    </div>
  );
}