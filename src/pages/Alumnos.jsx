import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";

// Mocks
import materiasData from "../data/materias.json";
import calificacionesData from "../data/calificaciones.json";

export default function Alumnos() {
  const navigate = useNavigate();

  // Panel activo (sidebar)
  const [active, setActive] = useState(null);

  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
  ];

  const handleLogout = () => navigate("/");

  // ===== Mapeos / datos =====
  const materiaById = useMemo(
    () => Object.fromEntries(materiasData.map((m) => [m.id, m])),
    []
  );

  const alumnoId = 1; // Sabrina (demo)

  // Materias que NO debe ver para inscribirse: si ya está "En curso" o "Aprobado"
  const materiasDisponibles = useMemo(() => {
    return materiasData.filter((m) => {
      const yaCursaOAprobo = calificacionesData.some(
        (c) =>
          c.alumnoId === alumnoId &&
          c.materiaId === m.id &&
          (c.estado === "En curso" || c.estado === "Aprobado")
      );
      return !yaCursaOAprobo;
    });
  }, []);

  // ===== Estado local para Inscripción (demo local; no persiste) =====
  // Guardamos ids de materias que el usuario agregó en esta sesión
  const [inscripto, setInscripto] = useState([]);
  const [showEnrollOk, setShowEnrollOk] = useState(false);

  const handleRegister = (id) => {
    if (!id) return;
    if (inscripto.includes(id)) return;
    setInscripto((prev) => [...prev, id]);
    setShowEnrollOk(true);
    setTimeout(() => setShowEnrollOk(false), 1500);
  };

  const handleUnregister = (id) => {
    if (!id) return;
    const ok = window.confirm("¿Seguro que quieres eliminar esta inscripción?");
    if (!ok) return;
    setInscripto((prev) => prev.filter((x) => x !== id));
  };

  // ===== Estado local para Calificaciones =====
  const [gradeFilter, setGradeFilter] = useState("");

  const gradesFiltered = useMemo(() => {
    const q = gradeFilter.trim().toLowerCase();
    if (!q) return calificacionesData.filter((c) => c.alumnoId === alumnoId);
    return calificacionesData.filter((r) => {
      if (r.alumnoId !== alumnoId) return false;
      const nombreMat = materiaById[r.materiaId]?.nombre || r.materiaId;
      return nombreMat.toLowerCase().includes(q);
    });
  }, [gradeFilter, materiaById]);

  // ===== Render exclusivo por panel =====
  const renderPanel = () => {
    if (active === "inscripcion") {
      return (
        <div className="enroll-wrap">
          <div className="enroll-card">
            <div className="enroll-header">
              <h2 className="enroll-title">Inscripción a Materias</h2>
              <button className="btn" onClick={() => setActive(null)}>
                Volver
              </button>
            </div>

            <div className="enroll-cols">
              {/* Columna izquierda: materias disponibles */}
              <div className="enroll-col">
                <div className="enroll-col__head">Materias</div>
                <div className="enroll-list">
                  {materiasDisponibles.length === 0 ? (
                    <p>No hay materias disponibles.</p>
                  ) : (
                    materiasDisponibles.map((m) => (
                      <div className="enroll-item" key={m.id}>
                        <h4>{m.nombre}</h4>
                        {/* Si no tienes docentes.json, deja “Docente desconocido” */}
                        <p className="enroll-meta">Prof: Docente desconocido</p>
                        <p className="enroll-meta">Comisión: {m.comision}</p>
                        <p className="enroll-meta">Horarios: {m.horario}</p>
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

              {/* Columna derecha: mis inscripciones (solo locales) */}
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
                          <h4>{m?.nombre || id}</h4>
                          <p className="enroll-meta">Comisión: {m?.comision || "-"}</p>
                          <p className="enroll-meta">Horario: {m?.horario || "-"}</p>
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

    if (active === "calificaciones") {
      return (
        <div className="grades-wrap">
          <div className="enroll-card grades-card">
            <div className="enroll-header">
              <h2 className="enroll-title">Calificaciones</h2>
              <button className="btn" onClick={() => setActive(null)}>
                Volver
              </button>
            </div>

            {/* Filtro */}
            <div className="grades-filter">
              <label className="grades-filter__label">Filtrar por materia:&nbsp;</label>
              <input
                className="grades-input"
                type="text"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                placeholder="Ej: Matemáticas"
              />
              <button className="btn grades-btn" onClick={() => {}}>
                Buscar
              </button>
            </div>

            {/* Tabla */}
            <div className="grades-table-wrap">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Comisión</th>
                    <th>Nota Parcial I</th>
                    <th>Nota Parcial II</th>
                    <th>Nota Parcial III</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gradesFiltered.map((r, i) => {
                    const m = materiaById[r.materiaId];
                    return (
                      <tr key={i}>
                        <td>{m?.nombre || r.materiaId}</td>
                        <td>{r.comision || "-"}</td>
                        <td className="num">{r.parciales?.p1 ?? "—"}</td>
                        <td className="num">{r.parciales?.p2 ?? "—"}</td>
                        <td className="num">{r.parciales?.p3 ?? "—"}</td>
                        <td>{r.estado || "—"}</td>
                        <td>{r.observacion || "—"}</td>
                      </tr>
                    );
                  })}
                  {gradesFiltered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", opacity: 0.8 }}>
                        No hay registros para ese filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="alumnos-page">
      {/* Fondo */}
      <div className="full-bg">
        <img src="/prisma.png" alt="Prisma" className="bg-img" />
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__inner">
          {/* Perfil */}
          <div className="sb-profile">
            <img src="/alumno.jpg" alt="Sabrina Choque" className="sb-avatar" />
            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">Sabrina Choque</p>
          </div>

          {/* Menú (cambia panel sin “Volver”) */}
          <div className="sb-menu">
  {items.map((it) => {
    const locked = active !== null && active !== it.id; // si hay panel abierto y no es este item

    return (
      <button
        key={it.id}
        type="button"
        disabled={locked}
        onClick={() => {
          if (!locked) setActive(it.id);
        }}
        className={
          "sb-item" +
          (active === it.id ? " is-active" : "") +
          (locked ? " is-disabled" : "")
        }
      >
        <span className="sb-item__icon" />
        <span className="sb-item__text">{it.label}</span>
      </button>
    );
  })}
</div>


          {/* Footer: botón Salir */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <span>Salir</span>
              <span className="sb-logout-x">×</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Marca fija arriba */}
      <div className="brand">
        <div className="brand__circle">
          <img src="/Logo.png" alt="Logo Prisma" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {/* Panel actual (exclusivo) */}
      {renderPanel()}
    </div>
  );
}
