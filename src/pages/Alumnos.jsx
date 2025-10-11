import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";

// Librerías para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Datos mock
import materiasData from "../data/materias.json";
import calificacionesData from "../data/calificaciones.json";

export default function Alumnos() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const alumnoId = 1; // Sabrina (demo)

  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
  ];

  const handleLogout = () => navigate("/");

  // ====== Mapeo de materias ======
  const materiaById = useMemo(
    () => Object.fromEntries(materiasData.map((m) => [m.id, m])),
    []
  );

  // ====== INSCRIPCIÓN ======
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

  // ====== CALIFICACIONES ======
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

  // ====== HISTORIAL ACADÉMICO ======
  const historial = useMemo(() => {
    return calificacionesData
      .filter((c) => c.alumnoId === alumnoId)
      .map((c) => {
        const m = materiaById[c.materiaId];
        const parciales = Object.values(c.parciales || {}).filter(
          (n) => typeof n === "number"
        );
        const promedio =
          parciales.length > 0
            ? (parciales.reduce((a, b) => a + b, 0) / parciales.length).toFixed(1)
            : "--";
        const fecha = c.anio
          ? `${String(c.cuatrimestre).padStart(2, "0")}/${c.anio}`
          : "--";
        return {
          materia: m?.nombre || c.materiaId,
          comision: c.comision,
          nota: promedio,
          fecha,
          estado: c.estado,
        };
      });
  }, [materiaById]);

  // ====== GENERAR PDF HISTORIAL (versión sin banner, firma y sello arriba) ======
const generarPDF = () => {
  const doc = new jsPDF();

  // 📁 Recursos desde /public
  const logo = "/Logo.png";    // logo institucional
  const firma = "/firma.png";  // firma institucional
  const sello = "/sello.png";  // sello institucional

  // 🧾 Encabezado
  doc.addImage(logo, "PNG", 12, 8, 18, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Instituto Superior Prisma", 35, 16);
  doc.setFontSize(13);
  doc.text("Certificado de Historial Académico", 35, 24);

  // 👩 Alumno
  const alumnoNombre = "Sabrina Choque";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `El presente certificado acredita que la alumna/o ${alumnoNombre} ha cursado y/o aprobado las asignaturas detalladas a continuación, conforme a los registros académicos del Instituto Superior Prisma.`,
    15,
    40,
    { maxWidth: 180 }
  );

  // 📊 Tabla
  const materiasValidas = historial.filter(
    (h) => h.estado === "Aprobado" || h.estado === "En curso"
  );

  autoTable(doc, {
    head: [["Materia", "Comisión", "Nota Final", "Fecha", "Estado"]],
    body: materiasValidas.map((h) => [
      h.materia,
      h.comision,
      h.nota,
      h.fecha,
      h.estado,
    ]),
    startY: 52,
    theme: "grid",
    headStyles: { fillColor: [40, 40, 90], textColor: 255, fontStyle: "bold" },
    styles: { halign: "center", valign: "middle" },
  });

  // 🖋 Firma y sello (alineados y con texto arriba)
  const baseY = doc.lastAutoTable.finalY + 25;
  const fecha = new Date().toLocaleDateString("es-AR");

  doc.setFont("helvetica", "bold");
  doc.text("Firma:", 35, baseY);
  doc.text("Sello:", 145, baseY);

  // imágenes debajo de los títulos
  doc.addImage(firma, "PNG", 20, baseY + 3, 60, 25);
  doc.addImage(sello, "PNG", 145, baseY + 3, 35, 35);

  // textos aclaratorios
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Aclaración: Dirección Institucional", 25, baseY + 38);
  doc.text(`Emitido el: ${fecha}`, 150, baseY + 38);

  // 💾 Guardar PDF
  doc.save("Certificado_Historial.pdf");
};

  // ====== RENDER ======
  const renderPanel = () => {
    // --- INSCRIPCIÓN ---
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
              <div className="enroll-col">
                <div className="enroll-col__head">Materias disponibles</div>
                <div className="enroll-list">
                  {materiasDisponibles.length === 0 ? (
                    <p>No hay materias disponibles.</p>
                  ) : (
                    materiasDisponibles.map((m) => (
                      <div className="enroll-item" key={m.id}>
                        <h4>{m.nombre}</h4>
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

    // --- CALIFICACIONES ---
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

            <div className="grades-filter">
              <label className="grades-filter__label">
                Filtrar por materia:&nbsp;
              </label>
              <input
                className="grades-input"
                type="text"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                placeholder="Ej: Matemáticas"
              />
            </div>

            <div className="grades-table-wrap">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Comisión</th>
                    <th>Parcial I</th>
                    <th>Parcial II</th>
                    <th>Parcial III</th>
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
                        <td>{r.comision}</td>
                        <td className="num">{r.parciales?.p1 ?? "—"}</td>
                        <td className="num">{r.parciales?.p2 ?? "—"}</td>
                        <td className="num">{r.parciales?.p3 ?? "—"}</td>
                        <td>{r.estado}</td>
                        <td>{r.observacion || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // --- HISTORIAL ACADÉMICO ---
    if (active === "historial") {
      return (
        <div className="historial-wrap">
          <div className="historial-card">
            <div className="historial-header">
              <h2 className="historial-title">Historial Académico</h2>
              <button className="btn" onClick={() => setActive(null)}>
                Volver
              </button>
            </div>

            <div className="historial-table-wrap">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Comisión</th>
                    <th>Nota Final</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h, i) => (
                    <tr key={i}>
                      <td>{h.materia}</td>
                      <td>{h.comision}</td>
                      <td>{h.nota}</td>
                      <td>{h.fecha}</td>
                      <td>{h.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="historial-footer">
              <button className="btn btn-success" onClick={generarPDF}>
                Descargar Certificado
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ====== UI GENERAL ======
  return (
    <div className="alumnos-page">
      {/* Fondo */}
      <div className="full-bg">
        <img src="/prisma.png" alt="Fondo" className="bg-img" />
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__inner">
          <div className="sb-profile">
            <img src="/alumno.jpg" alt="Sabrina Choque" className="sb-avatar" />
            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">Sabrina Choque</p>
          </div>

          <div className="sb-menu">
            {items.map((it) => {
              const locked = active !== null && active !== it.id;
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

          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <span>Salir</span>
              <span className="sb-logout-x">×</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Marca */}
      <div className="brand">
        <div className="brand__circle">
          <img src="/Logo.png" alt="Logo Prisma" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {renderPanel()}
    </div>
  );
}
