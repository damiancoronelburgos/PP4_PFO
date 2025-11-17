import React, { useEffect, useState, useMemo } from "react";
import { apiGet } from "../../../lib/api";

export default function AlumnoCalificaciones() {
  const [rows, setRows] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // ============================
  // CARGAR DESDE BACKEND REAL
  // ============================
  useEffect(() => {
    cargarCalificaciones();
  }, []);

  async function cargarCalificaciones() {
    try {
      const data = await apiGet("/api/calificaciones");
      setRows(data || []);
    } catch (error) {
      console.error("Error cargando calificaciones:", error);
    }
  }

  // ============================
  // FILTRO POR NOMBRE DE MATERIA
  // ============================
  const filtrado = useMemo(() => {
    if (!busqueda.trim()) return rows;

    const b = busqueda.toLowerCase();
    return rows.filter((r) =>
      r.materiaNombre?.toLowerCase().includes(b)
    );
  }, [busqueda, rows]);

  return (
    <div className="grades-wrap">
      <div className="enroll-card grades-card">
        {/* ENCABEZADO */}
        <div className="enroll-header">
          <h2 className="enroll-title">Calificaciones</h2>
        </div>

        {/* BUSCADOR */}
        <div className="grades-filter">
          <input
            type="text"
            className="grades-input"
            placeholder="Buscar materia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* TABLA */}
        <div className="grades-table-wrap">
          {filtrado.length === 0 ? (
            <p style={{ color: "#fff" }}>No se encontraron calificaciones.</p>
          ) : (
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Comisión</th>
                  <th>P1</th>
                  <th>P2</th>
                  <th>P3</th>
                  <th>Estado</th>
                  <th>Observación</th>
                </tr>
              </thead>

              <tbody>
                {filtrado.map((c) => (
                  <tr key={c.id}>
                    <td>{c.materiaNombre}</td>
                    <td>{c.comisionNombre}</td>
                    <td>{c.parciales?.p1 ?? "-"}</td>
                    <td>{c.parciales?.p2 ?? "-"}</td>
                    <td>{c.parciales?.p3 ?? "-"}</td>
                    <td>{c.estado}</td>
                    <td>{c.observacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

