import React, { useState } from "react";
import "../../styles/docente.css";

export default function CargarNotas() {
  const [comision, setComision] = useState("");
  const [alumnos, setAlumnos] = useState([
    { dni: "11111111", nombre: "GOMEZ, Nicolás", curso: "Java Estándar 17", nota: 7 },
    { dni: "22222222", nombre: "LOPEZ, Manuel", curso: "Bases de Datos", nota: 5 },
    { dni: "33333333", nombre: "MARTÍNEZ, Gimena", curso: "Machine Learning", nota: 8 },
    { dni: "44444444", nombre: "PÉREZ, Fernanda", curso: "Intro a Python", nota: 9 },
  ]);

  const [busqueda, setBusqueda] = useState("");

  const handleBuscar = () => {
    if (busqueda.trim() === "") {
      alert("Ingrese un DNI, nombre o curso para buscar");
      return;
    }
    const resultados = alumnos.filter(
      (a) =>
        a.dni.includes(busqueda) ||
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.curso.toLowerCase().includes(busqueda.toLowerCase())
    );
    setAlumnos(resultados);
  };

  const handleModificarNota = (dni, nuevaNota) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.dni === dni ? { ...a, nota: nuevaNota } : a))
    );
  };

  const handleGuardar = () => {
    console.log("Notas guardadas:", alumnos);
    alert("Notas guardadas correctamente.");
  };

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Cargar Notas</h2>
      <div className="filtros">
        <select value={comision} onChange={(e) => setComision(e.target.value)}>
          <option value="">Seleccione comisión</option>
          <option value="Java Estándar 17">Java Estándar 17</option>
          <option value="Bases de Datos">Bases de Datos</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Intro a Python">Intro a Python</option>
        </select>
        <input
          type="text"
          placeholder="DNI, Nombre o Curso"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={handleBuscar}>Buscar</button>
      </div>

      <table className="tabla-docente">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Curso</th>
            <th>Nota</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a) => (
            <tr key={a.dni}>
              <td>{a.dni}</td>
              <td>{a.nombre}</td>
              <td>{a.curso}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={a.nota}
                  onChange={(e) =>
                    handleModificarNota(a.dni, Number(e.target.value))
                  }
                />
              </td>
              <td>
                <button className="btn-modificar" onClick={handleGuardar}>
                  Guardar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
