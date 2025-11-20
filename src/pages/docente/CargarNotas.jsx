import React, { useEffect, useState } from "react";
import "../../styles/docente.css";
import { api } from "../../lib/api";

export default function CargarNotas() {
  const [comisiones, setComisiones] = useState([]);
  const [comisionId, setComisionId] = useState("");

  // Datos iniciales de ejemplo (mock), para que la vista no quede vacía
  const [alumnos, setAlumnos] = useState([
    {
      alumnoId: 1,
      dni: "11111111",
      nombre: "GOMEZ, Nicolás",
      curso: "Java Estándar 17",
      nota: 7,
    },
    {
      alumnoId: 2,
      dni: "22222222",
      nombre: "LOPEZ, Manuel",
      curso: "Bases de Datos",
      nota: 5,
    },
    {
      alumnoId: 3,
      dni: "33333333",
      nombre: "MARTÍNEZ, Gimena",
      curso: "Machine Learning",
      nota: 8,
    },
    {
      alumnoId: 4,
      dni: "44444444",
      nombre: "PÉREZ, Fernanda",
      curso: "Intro a Python",
      nota: 9,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState(""); // término de búsqueda aplicado
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar comisiones del docente al montar
  useEffect(() => {
  // En modo test no llamamos a la API real
  if (import.meta.env.MODE === "test") return;

  const loadComisiones = async () => {
    try {
      setErrorMsg("");
      const data = await api.get("/docentes/me/comisiones");
      setComisiones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando comisiones del docente:", err);
      setErrorMsg("Error al cargar las comisiones del docente.");
    }
  };

  loadComisiones();
}, []);


  // Cargar alumnos+notas cuando se elige una comisión
  const loadAlumnos = async (id) => {
    if (!id) {
      setAlumnos([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const data = await api.get(
        `/docentes/comisiones/${encodeURIComponent(
          id
        )}/alumnos-calificaciones`
      );

      const mapeados = (Array.isArray(data) ? data : []).map((row) => ({
        alumnoId: row.alumnoId,
        dni: row.dni,
        nombre: row.nombre,
        curso:
          row.materiaNombre && row.comisionCodigo
            ? `${row.materiaNombre} (${row.comisionCodigo})`
            : row.comisionCodigo || row.materiaNombre || "",
        nota: row.nota ?? "",
      }));

      setAlumnos(mapeados);
    } catch (err) {
      console.error("Error cargando alumnos de la comisión:", err);
      setErrorMsg(
        "Error al cargar los alumnos de la comisión. Verifique el backend."
      );
      // Si falla, dejamos los datos que hubiera (por ejemplo, los mock iniciales)
    } finally {
      setLoading(false);
    }
  };

  const handleChangeComision = (e) => {
    const value = e.target.value;
    setComisionId(value);
    if (value) {
      loadAlumnos(value);
    } else {
      setAlumnos([]);
    }
  };

  const handleBuscar = () => {
    setFiltro(busqueda.trim());
  };

  const handleChangeNota = (alumnoId, nuevaNota) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.alumnoId === alumnoId ? { ...a, nota: nuevaNota } : a
      )
    );
  };

  const handleGuardarNota = async (alumno) => {
    if (!comisionId) {
      alert("Primero seleccione una comisión.");
      return;
    }

    try {
      await api.post(
        `/docentes/comisiones/${encodeURIComponent(
          comisionId
        )}/calificaciones`,
        {
          alumnoId: alumno.alumnoId,
          nota: alumno.nota === "" ? null : Number(alumno.nota),
        }
      );

      alert("Nota guardada correctamente.");
    } catch (err) {
      console.error("Error guardando la nota:", err);
      alert("Error al guardar la nota.");
    }
  };

  const alumnosFiltrados = alumnos.filter((a) => {
    if (!filtro) return true;
    const term = filtro.toLowerCase();
    return (
      (a.dni || "").toLowerCase().includes(term) ||
      (a.nombre || "").toLowerCase().includes(term) ||
      (a.curso || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Cargar Notas</h2>

      <div className="filtros">
        <select value={comisionId} onChange={handleChangeComision}>
          <option value="">Seleccione comisión</option>
          {comisiones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.materia?.nombre
                ? `${c.materia.nombre} (${c.codigo})`
                : c.codigo}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="DNI, Nombre o Curso"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button onClick={handleBuscar}>Buscar</button>
      </div>

      {errorMsg && <p className="mensaje-error">{errorMsg}</p>}
      {loading && <p className="mensaje-info">Cargando alumnos...</p>}

      <table className="tabla-docente">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Curso / Comisión</th>
            <th>Nota</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {alumnosFiltrados.map((a) => (
            <tr key={`${a.alumnoId}-${a.dni}`}>
              <td>{a.dni}</td>
              <td>{a.nombre}</td>
              <td>{a.curso}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={a.nota ?? ""}
                  onChange={(e) =>
                    handleChangeNota(a.alumnoId, e.target.value)
                  }
                />
              </td>
              <td>
                <button
                  className="btn-modificar"
                  onClick={() => handleGuardarNota(a)}
                >
                  Guardar
                </button>
              </td>
            </tr>
          ))}

          {alumnosFiltrados.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No hay alumnos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
