import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar"; // tu sidebar
import GestionAlumnos from "./administrador/GestionAlumnos";
import OfertaAcademica from "./administrador/OfertaAcademica";
import Constancias from "./administrador/Constancias";
import Notificaciones from "./administrador/Notificaciones";
import "../styles/Alumnos.css";
import "../styles/Administrador.css";

export default function Administrador() {
  const [vistaActual, setVista] = useState("inicio");

  const renderVista = () => {
    switch (vistaActual) {
      case "alumnos":
        return <GestionAlumnos />;
      case "oferta":
        return <OfertaAcademica />;
      case "constancias":
        return <Constancias />;
      case "notificaciones":
        return <Notificaciones />;
      default:
        return <h3>Seleccione una opción del menú</h3>;
    }
  };

  return (
    <div className="administrador-container" style={{ display: "flex" }}>
      {/* Sidebar */}
      <AdminSidebar setVista={setVista} vistaActual={vistaActual} />

      {/* Contenido */}
      <div className="administrador-content" style={{ flex: 1, padding: "20px" }}>
        {renderVista()}
      </div>
    </div>
  );
}
