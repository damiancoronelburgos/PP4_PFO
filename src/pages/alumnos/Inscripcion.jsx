import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function Inscripcion() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(false);

  // Cargar materias disponibles (comisiones)
  const fetchMaterias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/alumnos/materias");
      setMaterias(data);
    } catch (err) {
      console.error("Error trayendo materias:", err);
      setError("No se pudieron cargar las materias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const inscribir = async (comisionId) => {
    if (!window.confirm("¿Desea inscribirse en esta materia/comisión?")) return;

    setInscribiendo(true);
    try {
      await apiFetch("/alumnos/inscribir", {
        method: "POST",
        body: { materiaId: comisionId },
      });

      alert("Inscripción realizada con éxito.");
      await fetchMaterias();
    } catch (err) {
      console.error("Error al inscribirse:", err);
      alert(
        err.message || "No se pudo inscribir. Intente nuevamente."
      );
    } finally {
      setInscribiendo(false);
    }
  };

  if (loading) return <p>Cargando materias...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Materias / Comisiones disponibles</h2>

      {materias.length === 0 ? (
        <p>No hay comisiones disponibles para inscribirse.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID Comisión</th>
              <th>Código</th>
              <th>Materia</th>
              <th>Comisión</th>
              <th>Horario</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.codigo}</td>
                <td>{m.nombre}</td>
                <td>{m.comision}</td>
                <td>{m.horario || "-"}</td>
                <td>
                  {m.inscripto ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Ya inscripto
                    </span>
                  ) : (
                    <button
                      onClick={() => inscribir(m.id)}
                      disabled={inscribiendo}
                    >
                      {inscribiendo ? "Inscribiendo..." : "Inscribirse"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}