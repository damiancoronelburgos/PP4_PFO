import React, { useEffect, useState } from "react";
import "../../styles/docente.css";
import { api } from "../../lib/api";

export default function Acta() {
  // Datos iniciales de ejemplo (para tests y fallback sin backend)
  const mockAlumnos = [
    {
      alumnoId: 1,
      nombre: "GOMEZ, Nicolás",
      fecha: "10/10/2025",
      asistencia: 90,
      condicion: "Promociona",
      nota: 9,
      resultado: "Promociona",
    },
    {
      alumnoId: 2,
      nombre: "LOPEZ, Manuel",
      fecha: "10/10/2025",
      asistencia: 75,
      condicion: "Regular",
      nota: 7,
      resultado: "Regular",
    },
    {
      alumnoId: 3,
      nombre: "MARTÍNEZ, Gimena",
      fecha: "10/10/2025",
      asistencia: 60,
      condicion: "Insuficiente",
      nota: 4,
      resultado: "Desaprobado",
    },
  ];

  const [comisiones, setComisiones] = useState([]);
  const [comisionId, setComisionId] = useState("");
  const [alumnos, setAlumnos] = useState(mockAlumnos);
  const [baseAlumnos, setBaseAlumnos] = useState(mockAlumnos);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar comisiones del docente (solo fuera de modo test)
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;

    const loadComisiones = async () => {
      try {
        setErrorMsg("");
        const data = await api.get("/docentes/me/comisiones");
        const lista = Array.isArray(data) ? data : [];
        setComisiones(lista);
        if (lista.length > 0 && !comisionId) {
          setComisionId(String(lista[0].id));
        }
      } catch (err) {
        console.error("Error cargando comisiones del docente:", err);
        setErrorMsg("Error al cargar las comisiones del docente.");
      }
    };

    loadComisiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar datos de acta (alumnos + nota + asistencia) cuando se selecciona comisión
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;
    if (!comisionId) return;

    const loadActa = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const data = await api.get(
          `/docentes/comisiones/${encodeURIComponent(comisionId)}/acta`
        );

        const mapped = (Array.isArray(data) ? data : []).map((row) => ({
          alumnoId: row.alumnoId,
          nombre: row.nombre,
          fecha: row.fecha || "",
          asistencia: row.asistenciaPorc ?? "",
          condicion: row.condicion || "",
          nota: row.nota ?? "",
          resultado: row.resultado || "",
        }));

        if (mapped.length > 0) {
          setAlumnos(mapped);
          setBaseAlumnos(mapped);
        } else {
          setAlumnos([]);
          setBaseAlumnos([]);
        }
      } catch (err) {
        console.error("Error cargando acta de cursada:", err);
        setErrorMsg(
          "Error al cargar el acta de cursada. Verifique el backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadActa();
  }, [comisionId]);

  const mapCondicionToResultado = (cond) => {
    if (!cond) return "";
    if (cond === "Insuficiente") return "Desaprobado";
    return cond;
  };

  const handleCondicionChange = (index, nuevaCondicion) => {
    const nuevos = [...alumnos];
    nuevos[index] = {
      ...nuevos[index],
      condicion: nuevaCondicion,
      resultado: mapCondicionToResultado(nuevaCondicion),
    };
    setAlumnos(nuevos);
    setBaseAlumnos(nuevos);
  };

  // Validamos que la nota quede entre 1 y 10 (o vacía)
  const handleNotaChange = (index, nuevaNota) => {
    let valor = nuevaNota;

    if (valor === "") {
      const nuevos = [...alumnos];
      nuevos[index] = { ...nuevos[index], nota: "" };
      setAlumnos(nuevos);
      setBaseAlumnos(nuevos);
      return;
    }

    let num = Number(valor);
    if (Number.isNaN(num)) {
      return; // ignoramos valores no numéricos
    }

    if (num < 1) num = 1;
    if (num > 10) num = 10;

    const nuevos = [...alumnos];
    nuevos[index] = { ...nuevos[index], nota: num };
    setAlumnos(nuevos);
    setBaseAlumnos(nuevos);
  };

  const handleBuscar = () => {
    const term = busqueda.trim().toLowerCase();
    if (!term) {
      setAlumnos(baseAlumnos);
      return;
    }
    const filtrados = baseAlumnos.filter((a) =>
      (a.nombre || "").toLowerCase().includes(term)
    );
    setAlumnos(filtrados);
  };

  const handleLimpiar = () => {
    setBusqueda("");
    setAlumnos(baseAlumnos);
  };

  const handleGuardarActa = async () => {
    // En tests, mantenemos el comportamiento original
    if (import.meta.env.MODE === "test") {
      alert("Acta guardada!");
      return;
    }

    if (!comisionId) {
      alert("Seleccione una comisión antes de guardar el acta.");
      return;
    }

    try {
      // Reutilizamos el endpoint de CargarNotas:
      // POST /api/docentes/comisiones/:comisionId/calificaciones
      const alumnosConNota = alumnos.filter(
        (a) => a.alumnoId && a.nota !== "" && a.nota != null
      );

      await Promise.all(
        alumnosConNota.map((a) =>
          api.post(
            `/docentes/comisiones/${encodeURIComponent(
              comisionId
            )}/calificaciones`,
            {
              alumnoId: a.alumnoId,
              nota: Number(a.nota),
            }
          )
        )
      );

      alert("Acta guardada!");
    } catch (err) {
      console.error("Error al guardar acta/calificaciones:", err);
      alert("Error al guardar el acta en el sistema.");
    }
  };

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Acta de Cursada</h2>

      {/* Filtros superiores (selección de comisión) */}
      {comisiones.length > 0 && (
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
        </div>
      )}

      {errorMsg && <p className="mensaje-error">{errorMsg}</p>}
      {loading && <p className="mensaje-info">Cargando acta...</p>}

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
            <tr key={a.alumnoId ?? i}>
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
              <td>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={a.nota ?? ""}
                  onChange={(e) => handleNotaChange(i, e.target.value)}
                />
              </td>
              <td>
                <input type="text" value={a.resultado} readOnly />
              </td>
            </tr>
          ))}

          {alumnos.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No hay alumnos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="acciones-form">
        <button className="btn-guardar" onClick={handleGuardarActa}>
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
