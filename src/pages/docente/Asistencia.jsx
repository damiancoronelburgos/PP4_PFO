import React, { useState } from "react";
import "../../styles/docente.css";

export default function Asistencia() {
  const [alumnos, setAlumnos] = useState([
    { apellido: "Bonifacio", nombre: "Alejandra", dni: "55555555", estado: "" },
    { apellido: "Aguirre", nombre: "Valentín", dni: "33333333", estado: "" },
  ]);

  const cambiarEstado = (dni, nuevoEstado) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.dni === dni ? { ...a, estado: nuevoEstado } : a))
    );
  };

  const todosPresentes = alumnos.every((a) => a.estado === "P");

  const toggleMarcarTodos = () => {
    if (todosPresentes) {
      // Si ya todos están presentes, limpiar los estados
      setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "" })));
    } else {
      // Si no, marcarlos todos como presentes
      setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "P" })));
    }
  };

  const handleGuardar = () => {
    console.log("Asistencia guardada:", alumnos);
    alert("Asistencia registrada correctamente.");
  };

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Asistencia</h2>

      <table className="tabla-docente">
        <thead>
          <tr>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a) => (
            <tr key={a.dni}>
              <td>{a.apellido}</td>
              <td>{a.nombre}</td>
              <td>{a.dni}</td>
              <td>
                <div className="estado-btns">
                  {["P", "A", "T", "J"].map((estado) => (
                    <button
                      key={estado}
                      className={`btn-estado ${
                        a.estado === estado ? `activo-${estado}` : ""
                      }`}
                      onClick={() => cambiarEstado(a.dni, estado)}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="acciones-form acciones-derecha">
        <button className="btn-guardar" onClick={handleGuardar}>
          Guardar
        </button>
        <button className={`btn-marcar-todos ${todosPresentes ? "modo-desmarcar" : "modo-marcar"}`} onClick={toggleMarcarTodos}>
          {todosPresentes
            ? "Desmarcar todos"
            : "Marcar todos como presentes"}
        </button>
      </div>
    </div>
  );
}
