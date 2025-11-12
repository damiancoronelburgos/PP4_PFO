import React, { useState } from "react";
import DocenteSidebar from "../components/DocenteSidebar";
import CargarNotas from "./docente/CargarNotas";
import Asistencia from "./docente/Asistencia";
import Acta from "./docente/Acta";
import Notificaciones from "./docente/Notificaciones";
import "../styles/docente.css";

export default function Docente() {
  const [activeItem, setActiveItem] = useState("inicio");

  const renderVista = () => {
    switch (activeItem) {
      case "notas":
        return <CargarNotas />;
      case "asistencia":
        return <Asistencia />;
      case "actas":
        return <Acta />;
      case "notificaciones":
        return <Notificaciones />;
      default:
        return <h3 className="bienvenida">Seleccione una opción del menú</h3>;
    }
  };

  return (
    <div className="docente-container" style={{ display: "flex" }}>
      {/* Sidebar */}
      <DocenteSidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      {/* Contenido */}
      <div className="docente-content" style={{ flex: 1, padding: "20px" }}>
        {renderVista()}
      </div>
    </div>
  );
}
