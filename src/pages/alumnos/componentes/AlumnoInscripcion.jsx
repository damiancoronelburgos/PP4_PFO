import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../../../lib/api";

export default function AlumnoInscripcion({ setActive }) {
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [inscripto, setInscripto] = useState([]);
  const [materiaById, setMateriaById] = useState({});
  const [showEnrollOk, setShowEnrollOk] = useState(false);

  // ============================
  // CARGAR DATOS DESDE EL BACKEND
  // ============================
  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const disp = await apiGet("/api/alumnos/oferta");
      const insc = await apiGet("/api/alumnos/inscripciones");

      setMateriasDisponibles(disp || []);
      setInscripto(insc?.map((i) => i.comisionId) || []);

      const dict = {};
      disp.forEach((m) => (dict[m.id] = m));
      setMateriaById(dict);
    } catch (error) {
      console.error("Error cargando inscripción:", error);
    }
  }

  // ============================
  // REGISTRARSE
  // ============================
  async function handleRegister(comisionId) {
    try {
      const res = await apiPost("/api/alumnos/inscripciones", {
        comisionId,
      });

      if (res?.ok) {
        setShowEnrollOk(true);
        setTimeout(() => setShowEnrollOk(false), 2000);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al inscribir:", error);
    }
  }

  // ============================
  // ELIMINAR INSCRIPCIÓN
  // ============================
  async function handleUnregister(id) {
    try {
      const res = await apiDelete(`/api/alumnos/inscripciones/${id}`);

      if (res?.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al eliminar inscripción:", error);
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="enroll-wrap">
      <div className="enroll-card">
        {/* HEADER */}
        <div className="enroll-header">
          <h2 className="enroll-title">Inscripción a Materias</h2>
          
        </div>

        {/* COLUMNAS */}
        <div className="enroll-cols">
          {/* ========================= */}
          {/* MATERIAS DISPONIBLES */}
          {/* ========================= */}
          <div className="enroll-col">
            <div className="enroll-col__head">Materias disponibles</div>

            <div className="enroll-list">
              {materiasDisponibles.length === 0 ? (
                <p>No hay materias disponibles.</p>
              ) : (
                materiasDisponibles.map((m) => (
                  <div className="enroll-item" key={m.id}>
                    <h4>{m.materiaNombre || m.nombre}</h4>

                    <p className="enroll-meta">Comisión: {m.comision}</p>
                    <p className="enroll-meta">Horario: {m.horario}</p>
                    <p className="enroll-meta">Cupo: {m.cupo}</p>

                    <div className="enroll-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRegister(m.id)}
                      >
                        Registrarse
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ========================== */}
          {/* MIS INSCRIPCIONES */}
          {/* ========================== */}
          <div className="enroll-col">
            <div className="enroll-col__head">Mis inscripciones</div>

            <div className="enroll-list">
              {inscripto.length === 0 ? (
                <p>Aún no tienes inscripciones.</p>
              ) : (
                inscripto.map((id) => {
                  const m = materiaById[id];

                  return (
                    <div className="enroll-item" key={id}>
                      <h4>{m?.materiaNombre || m?.nombre || id}</h4>

                      <p className="enroll-meta">Comisión: {m?.comision}</p>
                      <p className="enroll-meta">Horario: {m?.horario}</p>

                      <div className="enroll-actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleUnregister(id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {showEnrollOk && (
                <p className="enroll-success">¡Inscripción exitosa!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
