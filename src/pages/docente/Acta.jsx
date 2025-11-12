import React, { useState } from "react";
import "../../styles/docente.css";

export default function Acta() {
  const [alumnos, setAlumnos] = useState([
    { nombre: "GOMEZ, Nicolás", fecha: "10/10/2025", asistencia: 90, condicion: "Promociona", nota: 9, resultado: "Promociona" },
    { nombre: "LOPEZ, Manuel", fecha: "10/10/2025", asistencia: 75, condicion: "Regular", nota: 7, resultado: "Regular" },
    { nombre: "MARTÍNEZ, Gimena", fecha: "10/10/2025", asistencia: 50, condicion: "Insuficiente", nota: 4, resultado: "Desaprobado" },
  ]);

  const [busqueda, setBusqueda] = useState("");

  const handleCondicionChange = (index, nuevaCondicion) => {
    const nuevoResultado = nuevaCondicion;
    const nuevos = [...alumnos];
    nuevos[index].condicion = nuevaCondicion;
    nuevos[index].resultado = nuevoResultado;
    setAlumnos(nuevos);
  };

  const handleBuscar = () => {
    const filtrados = alumnos.filter((a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setAlumnos(filtrados);
  };

  const handleLimpiar = () => window.location.reload();

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Acta de Cursada</h2>

      <table className="tabla-docente">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Fecha</th>
            <th>Asistencia (%)</th>
            <th>Condición</th>
            <th>Nota</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a, i) => (
            <tr key={i}>
              <td>{a.nombre}</td>
              <td>{a.fecha}</td>
              <td>{a.asistencia}</td>
              <td>
                <select
                  value={a.condicion}
                  onChange={(e) => handleCondicionChange(i, e.target.value)}
                >
                  <option>Promociona</option>
                  <option>Regular</option>
                  <option>Insuficiente</option>
                  <option>Abandonó</option>
                  <option>Libre</option>
                </select>
              </td>
              <td>{a.nota}</td>
              <td>
                <input type="text" value={a.resultado} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="acciones-form">
        <button className="btn-guardar" onClick={() => alert("Acta guardada!")}>
          Guardar
        </button>
        <input
          type="text"
          placeholder="Buscar por apellido"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={handleBuscar}>Buscar</button>
        <button className="btn-limpiar" onClick={handleLimpiar}>
          Limpiar
        </button>
      </div>
    </div>
  );
}
