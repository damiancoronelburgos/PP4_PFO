import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";
import materiasData from "../data/materias.json";
import docentesData from "../data/docentes.json";

export default function Alumnos() {
  const navigate = useNavigate();

  // Arranca SIN selección de panel
  const [active, setActive] = useState(null);

  // Datos desde JSON
  const [materias, setMaterias] = useState(materiasData);
  const [docentes] = useState(docentesData);

  // Mis inscripciones (en memoria)
  const [misInsc, setMisInsc] = useState([]);
  const [msgOK, setMsgOK] = useState("");

  // Helpers
  const profeNombre = (docenteId) => {
    const d = docentes.find((x) => x.id === docenteId);
    return d ? `${d.nombre} ${d.apellido ?? ""}`.trim() : "—";
  };

  // Acciones
  const handleEnroll = (id) => {
    const m = materias.find((x) => x.id === id);
    if (!m) return;
    const ya = misInsc.some((i) => i.id === id);
    if (ya || m.cupo <= 0) return;

    setMisInsc((prev) => [
      ...prev,
      {
        id: m.id,
        nombre: m.nombre,
        profesor: profeNombre(m.docenteId),
        comision: m.comision,
        horario: m.horario,
      },
    ]);

    setMaterias((prev) =>
      prev.map((x) => (x.id === id ? { ...x, cupo: x.cupo - 1 } : x))
    );

    setMsgOK("¡Inscripción exitosa!");
    setTimeout(() => setMsgOK(""), 1500);
  };

  // Confirmar eliminación
  const handleRemove = (id) => {
    const ok = window.confirm("¿Seguro que quieres eliminar esta inscripción?");
    if (!ok) return;

    // devolver cupo si existe en el catálogo
    if (materias.some((x) => x.id === id)) {
      setMaterias((prev) =>
        prev.map((x) => (x.id === id ? { ...x, cupo: x.cupo + 1 } : x))
      );
    }
    setMisInsc((prev) => prev.filter((x) => x.id !== id));
  };

  const handleLogout = () => navigate("/");
  const handleBack = () => setActive(null);

  // Menú lateral
  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
  ];

  return (
    <div className="alumnos-page">
      {/* Fondo principal */}
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

          {/* Menú (solo selección visual) */}
          <div className="sb-menu">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setActive(it.id)}
                className={"sb-item" + (active === it.id ? " is-active" : "")}
              >
                <span className="sb-item__icon" />
                <span className="sb-item__text">{it.label}</span>
              </button>
            ))}
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

      {/* Panel: Inscripción a materias (solo si el usuario lo elige) */}
      {active === "inscripcion" && (
        <section className="enroll-wrap">
          <div className="enroll-card">
            <div className="enroll-header">
              <h2 className="enroll-title">Inscripción a Materias</h2>
              <button className="btn" onClick={handleBack}>Volver</button>
            </div>

            <div className="enroll-cols">
              {/* Catálogo de materias */}
              <div className="enroll-col">
                <div className="enroll-col__head">Materias</div>
                <div className="enroll-list">
                  {materias.map((m) => {
                    const ya = misInsc.some((x) => x.id === m.id);
                    return (
                      <article key={m.id} className="enroll-item">
                        <h4>{m.nombre}</h4>
                        <p className="enroll-meta">Prof: {profeNombre(m.docenteId)}</p>
                        <p className="enroll-meta">Comisión: {m.comision}</p>
                        <p className="enroll-meta">Horarios: {m.horario}</p>
                        <p className="enroll-meta">Cupo: {m.cupo}</p>

                        <div className="enroll-actions">
                          <button
                            className="btn btn-primary"
                            disabled={m.cupo <= 0 || ya}
                            onClick={() => handleEnroll(m.id)}
                          >
                            Registrarse
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Mis inscripciones */}
              <div className="enroll-col">
                <div className="enroll-col__head">Mis inscripciones</div>
                <div className="enroll-list">
                  {misInsc.length === 0 && (
                    <p className="enroll-meta" style={{ textAlign: "center", opacity: 0.85 }}>
                      Aún no tienes inscripciones.
                    </p>
                  )}

                  {misInsc.map((m) => (
                    <article key={m.id} className="enroll-item">
                      <h4>{m.nombre}</h4>
                      <p className="enroll-meta">Prof: {m.profesor}</p>
                      <p className="enroll-meta">Comisión: {m.comision}</p>
                      <p className="enroll-meta">{m.horario}</p>

                      <div className="enroll-actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemove(m.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}

                  {msgOK && <p className="enroll-success">{msgOK}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
