import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Docente() {
  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Panel del Docente</h1>

      <nav className="flex gap-4 mb-6">
        <Link to="panel" className="text-blue-600 hover:underline">Inicio</Link>
        <Link to="cargar-notas" className="text-blue-600 hover:underline">Cargar Notas</Link>
        <Link to="asistencia" className="text-blue-600 hover:underline">Asistencia</Link>
        <Link to="acta" className="text-blue-600 hover:underline">Acta de Cursada</Link>
        <Link to="notificaciones" className="text-blue-600 hover:underline">Notificaciones</Link>
      </nav>

      <Outlet />
    </div>
  );
}
