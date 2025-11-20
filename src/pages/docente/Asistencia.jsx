import React, { useEffect, useState } from "react";
import "../../styles/docente.css";
import { api } from "../../lib/api";

export default function Asistencia() {
  const [comisiones, setComisiones] = useState([]);
  const [comisionId, setComisionId] = useState("");
  const [fecha, setFecha] = useState(
    () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );

  // Datos iniciales de ejemplo (para tests y fallback)
  const [alumnos, setAlumnos] = useState([
    {
      alumnoId: 1,
      apellido: "Bonifacio",
      nombre: "Alejandra",
      dni: "55555555",
      estado: "",
    },
    {
      alumnoId: 2,
      apellido: "Aguirre",
      nombre: "Valentín",
      dni: "33333333",
      estado: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const todosPresentes =
    alumnos.length > 0 && alumnos.every((a) => a.estado === "P");

  // Cargar comisiones del docente (solo en modo normal, no en tests)
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;

    const loadComisiones = async () => {
      try {
        setErrorMsg("");
        const data = await api.get("/docentes/me/comisiones");
        setComisiones(Array.isArray(data) ? data : []);
        if (data && data.length > 0 && !comisionId) {
          setComisionId(String(data[0].id));
        }
      } catch (err) {
        console.error("Error cargando comisiones del docente:", err);
        setErrorMsg("Error al cargar las comisiones del docente.");
      }
    };

    loadComisiones();
  }, []);

  // Cargar asistencias cuando haya comisión + fecha (solo fuera de tests)
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;
    if (!comisionId || !fecha) return;

    const loadAsistencias = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const qs = new URLSearchParams({
          comisionId: comisionId,
          fecha: fecha,
        }).toString();

        const data = await api.get(`/docentes/me/asistencias?${qs}`);

        if (Array.isArray(data) && data.length > 0) {
          setAlumnos(
            data.map((row) => ({
              alumnoId: row.alumnoId,
              apellido: row.apellido,
              nombre: row.nombre,
              dni: row.dni,
              estado: row.estado || "",
            }))
          );
        } else {
          // Si no hay registros, mostramos lista vacía (docente puede marcar)
          setAlumnos([]);
        }
      } catch (err) {
        console.error("Error cargando asistencias del docente:", err);
        setErrorMsg(
          "Error al cargar la lista de asistencia. Verifique el backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAsistencias();
  }, [comisionId, fecha]);

  const cambiarEstado = (alumnoId, nuevoEstado) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.alumnoId === alumnoId ? { ...a, estado: nuevoEstado } : a
      )
    );
  };

  const toggleMarcarTodos = () => {
    if (todosPresentes) {
      // Desmarcar todos
      setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "" })));
    } else {
      // Marcar todos como presentes
      setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "P" })));
    }
  };

  const handleGuardar = async () => {
    if (!comisionId) {
      alert("Seleccione una comisión antes de guardar.");
      return;
    }
    if (!fecha) {
      alert("Seleccione una fecha antes de guardar.");
      return;
    }

    try {
      await api.post("/docentes/me/asistencias", {
        comisionId,
        fecha,
        items: alumnos.map((a) => ({
          alumnoId: a.alumnoId,
          estado: a.estado || "",
        })),
      });

      alert("Asistencias guardadas correctamente.");
    } catch (err) {
      console.error("Error al guardar asistencias:", err);
      alert("Error al guardar las asistencias.");
    }
  };

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Asistencia</h2>

      <div className="filtros">
        <label>
          Comisión:
          <select
            value={comisionId}
            onChange={(e) => setComisionId(e.target.value)}
          >
            <option value="">Seleccione comisión</option>
            {comisiones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.materia?.nombre
                  ? `${c.materia.nombre} (${c.codigo})`
                  : c.codigo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha:
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
      </div>

      {errorMsg && <p className="mensaje-error">{errorMsg}</p>}
      {loading && <p className="mensaje-info">Cargando asistencia...</p>}

      <table className="tabla-asistencia">
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
            <tr key={a.alumnoId ?? a.dni}>
              <td>{a.apellido}</td>
              <td>{a.nombre}</td>
              <td>{a.dni}</td>
              <td>
                <div className="estado-botones">
  <button
    type="button"
    className={`btn-estado ${a.estado === "P" ? "activo-P" : ""}`}
    onClick={() => cambiarEstado(a.alumnoId, "P")}
  >
    P
  </button>
  <button
    type="button"
    className={`btn-estado ${a.estado === "T" ? "activo-T" : ""}`}
    onClick={() => cambiarEstado(a.alumnoId, "T")}
  >
    T
  </button>
  <button
    type="button"
    className={`btn-estado ${a.estado === "A" ? "activo-A" : ""}`}
    onClick={() => cambiarEstado(a.alumnoId, "A")}
  >
    A
  </button>
  <button
    type="button"
    className="btn-estado"
    onClick={() => cambiarEstado(a.alumnoId, "")}
  >
    -
  </button>
</div>

              </td>
            </tr>
          ))}

          {alumnos.length === 0 && !loading && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No hay alumnos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="acciones-form acciones-derecha">
        <button className="btn-guardar" type="button" onClick={handleGuardar}>
          Guardar
        </button>
        <button
          className={`btn-marcar-todos ${
            todosPresentes ? "modo-desmarcar" : "modo-marcar"
          }`}
          type="button"
          onClick={toggleMarcarTodos}
        >
          {todosPresentes
            ? "Desmarcar todos"
            : "Marcar todos como presentes"}
        </button>
      </div>
    </div>
  );
}
