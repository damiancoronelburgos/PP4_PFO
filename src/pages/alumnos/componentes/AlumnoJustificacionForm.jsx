import React, { useState } from "react";
import "../../../styles/alumnos.css";
import { sendAlumnoJustificacion } from "../../../lib/alumnos.api";

export default function AlumnoJustificacionForm({ asistencia, setActive }) {
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMsg("");

    if (!motivo) {
      setError("Debe seleccionar un motivo.");
      return;
    }

    try {
      setEnviando(true);

      const formData = new FormData();
      formData.append("motivo", motivo);
      formData.append("descripcion", descripcion);
      formData.append("comisionId", asistencia.comision_id);
      if (archivo) formData.append("documento", archivo);

      const res = await sendAlumnoJustificacion(formData);

      if (res.ok) {
        setOkMsg("Justificación enviada correctamente.");
        setTimeout(() => setActive(null), 1500);
      } else {
        setError(res.error || "No se pudo enviar.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al enviar la justificación.");
    } finally {
      setEnviando(false);
    }
  }

  if (!asistencia) {
    return (
      <div className="jus-wrap">
        <div className="jus-card">
          <p>No se encontró información de la asistencia.</p>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const fecha = new Date(asistencia.fecha).toLocaleDateString("es-AR");

  return (
    <div className="jus-wrap">
      <div className="jus-card">
        <h2 className="jus-title">Justificar ausencia</h2>

        <p>
          <strong>Fecha:</strong> {fecha}
          <br />
          <strong>Materia:</strong> {asistencia.materia}
        </p>

        {error && <p style={{ color: "salmon" }}>{error}</p>}
        {okMsg && <p style={{ color: "lightgreen" }}>{okMsg}</p>}

        <form className="jus-form" onSubmit={handleSubmit}>
          {/* MOTIVO */}
          <div className="jus-field">
            <label>Motivo:</label>
            <select
              className="jus-input"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            >
              <option value="">Seleccione…</option>
              <option value="Enfermedad">Enfermedad</option>
              <option value="Trámite">Trámite</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* DESCRIPCIÓN SI MOTIVO = OTRO */}
          {motivo === "Otro" && (
            <div className="jus-field">
              <label>Descripción:</label>
              <textarea
                className="jus-textarea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalle aquí el motivo…"
              />
            </div>
          )}

          {/* ARCHIVO */}
          <div className="jus-field">
            <label>Adjuntar archivo (PDF o imagen):</label>
            <input
              type="file"
              className="jus-input"
              accept=".pdf,image/*"
              onChange={(e) => setArchivo(e.target.files[0])}
            />
          </div>

          <button className="btn" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar Justificación"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setActive(null)}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
