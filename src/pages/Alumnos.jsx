import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumnos.css";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Datos mock
import materiasData from "../data/materias.json";
import calificacionesData from "../data/calificaciones.json";
import notificacionesData from "../data/notificaciones.json";
import asistenciasData from "../data/asistencias.json";
import justificacionesData from "../data/justificaciones.json";
import eventosData from "../data/eventos_calendario.json";
import contactoInst from "../data/instituto_contacto.json";
import docentes from "../data/docentes.json";

export default function Alumnos() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const alumnoId = 1; // Sabrina (demo)

  const items = [
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial académico" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "asistencias", label: "Asistencias y Justificaciones" },
    { id: "calendario", label: "Calendario" },
    { id: "contacto", label: "Contacto" },
  ];

  const handleLogout = () => {
    const ok = window.confirm("¿Seguro que deseas cerrar sesión?");
    if (ok) navigate("/");
  };

  // ====== MAPEO DE MATERIAS ======
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
    if (!id || inscripto.includes(id)) return;
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

  // ====== GENERAR PDF HISTORIAL ======
  const generarPDF = () => {
    const doc = new jsPDF();
    const logo = "/Logo.png";
    const firma = "/firma.png";
    const sello = "/sello.png";

    doc.addImage(logo, "PNG", 12, 8, 18, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Instituto Superior Prisma", 35, 16);
    doc.setFontSize(13);
    doc.text("Certificado de Historial Académico", 35, 24);

    const alumnoNombre = "Sabrina Choque";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      `El presente certificado acredita que la alumna/o ${alumnoNombre} ha cursado y/o aprobado las asignaturas detalladas a continuación, conforme a los registros académicos del Instituto Superior Prisma.`,
      15,
      40,
      { maxWidth: 180 }
    );

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

    const baseY = doc.lastAutoTable.finalY + 25;
    const fecha = new Date().toLocaleDateString("es-AR");

    doc.setFont("helvetica", "bold");
    doc.text("Firma:", 35, baseY);
    doc.text("Sello:", 145, baseY);
    doc.addImage(firma, "PNG", 20, baseY + 3, 60, 25);
    doc.addImage(sello, "PNG", 145, baseY + 3, 35, 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Aclaración: Dirección Institucional", 25, baseY + 38);
    doc.text(`Emitido el: ${fecha}`, 150, baseY + 38);

    doc.save("Certificado_Historial.pdf");
  };

  // ====== NOTIFICACIONES ======
  const [noteFilter, setNoteFilter] = useState("");
  const [notesMode, setNotesMode] = useState("all"); // all | fav | unread

  const STORAGE_KEY_DISMISSED = `notes_dismissed_${alumnoId}`;
  const STORAGE_KEY_READ = `notes_read_${alumnoId}`;
  const STORAGE_KEY_FAV = `notes_fav_${alumnoId}`;

  const [dismissed, setDismissed] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem(STORAGE_KEY_DISMISSED) || "[]")
      );
    } catch {
      return new Set();
    }
  });
  const [readSet, setReadSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_READ) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [favSet, setFavSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || "[]"));
    } catch {
      return new Set();
    }
  });

  const role = "alumno";
  const userId = alumnoId;

  const notesAll = useMemo(() => {
    const q = noteFilter.trim().toLowerCase();

    let arr = notificacionesData
      .filter((n) => {
        if (dismissed.has(n.id)) return false;
        if (n.destino === "todos") return true;
        if (n.destino !== role) return false;
        if (n.usuarioId != null && n.usuarioId !== userId) return false;
        return true;
      })
      .filter(
        (n) =>
          !q ||
          n.titulo.toLowerCase().includes(q) ||
          n.detalle.toLowerCase().includes(q) ||
          n.fecha.toLowerCase().includes(q)
      );

    if (notesMode === "fav") arr = arr.filter((n) => favSet.has(n.id));
    else if (notesMode === "unread") arr = arr.filter((n) => !readSet.has(n.id));

    arr.sort((a, b) => {
      const af = favSet.has(a.id) ? 1 : 0;
      const bf = favSet.has(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return b.fecha.localeCompare(a.fecha);
    });

    return arr;
  }, [noteFilter, notesMode, dismissed, role, userId, favSet, readSet]);

  const unreadCount = useMemo(
    () => notesAll.filter((n) => !readSet.has(n.id)).length,
    [notesAll, readSet]
  );

  const markAsRead = (id) => {
    if (readSet.has(id)) return;
    const next = new Set(readSet);
    next.add(id);
    setReadSet(next);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(next)));
  };
  const toggleRead = (id) => {
    const next = new Set(readSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setReadSet(next);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(next)));
  };
  const toggleFav = (id) => {
    const next = new Set(favSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavSet(next);
    localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify(Array.from(next)));
  };
  const removeNote = (id) => {
    const ok = window.confirm("¿Eliminar esta notificación?");
    if (!ok) return;
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem(
      STORAGE_KEY_DISMISSED,
      JSON.stringify(Array.from(next))
    );
  };

  const [expanded, setExpanded] = useState(() => new Set());
  const toggleExpand = (id) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
    markAsRead(id);
  };

  // ====== ASISTENCIAS & JUSTIFICACIONES ======
  const ESTADOS = { P: "Presente", A: "Ausente", T: "Tarde", J: "Justificado" };
  const MOTIVOS = [
    "Enfermedad",
    "Turno médico",
    "Fallecimiento",
    "Trámite personal",
    "Otro",
  ];

  const asistencias = useMemo(
    () => asistenciasData.filter((a) => a.alumnoId === alumnoId),
    []
  );

  const [jusList, setJusList] = useState(() =>
    justificacionesData.filter((j) => j.alumnoId === alumnoId)
  );

  const resumen = useMemo(() => {
    const base = { P: 0, A: 0, T: 0, J: 0 };
    for (const a of asistencias) base[a.estado] = (base[a.estado] || 0) + 1;
    return base;
  }, [asistencias]);

  const ausenciasOTardes = useMemo(
    () => asistencias.filter((a) => a.estado === "A" || a.estado === "T"),
    [asistencias]
  );

  const yaJustificada = (fila) =>
    jusList.some(
      (j) =>
        j.fecha === fila.fecha &&
        j.materiaId === fila.materiaId &&
        j.comision === fila.comision
    );

  const [jusForm, setJusForm] = useState({
    fecha: "",
    materiaId: "",
    comision: "",
    motivo: "",
    motivoOtro: "",
    archivo: null,
  });

  const onPickTarget = (val) => {
    const [fecha, materiaId, comision] = val.split("|");
    setJusForm((f) => ({ ...f, fecha, materiaId, comision }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0] || null;
    setJusForm((f) => ({ ...f, archivo: file }));
  };

  const onSubmitJus = (e) => {
    e.preventDefault();
    const { fecha, materiaId, comision, motivo, motivoOtro, archivo } = jusForm;

    const motivoFinal = motivo === "Otro" ? (motivoOtro || "").trim() : motivo;

    if (!fecha || !materiaId || !comision || !motivoFinal || !archivo) {
      alert("Completa todos los campos, incluido el motivo, y adjunta el certificado.");
      return;
    }

    const nuevo = {
      id: Date.now(),
      alumnoId,
      fecha,
      materiaId,
      comision,
      motivo: motivoFinal,
      estado: "pendiente",
      documentoUrl: URL.createObjectURL(archivo), // demo/local
    };

    setJusList((prev) => [nuevo, ...prev]);
    setJusForm({
      fecha: "",
      materiaId: "",
      comision: "",
      motivo: "",
      motivoOtro: "",
      archivo: null,
    });
    alert("Justificación enviada. Queda en estado 'pendiente'.");
  };

  // === CALENDARIO (mini) ===
  const [calBase, setCalBase] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const y = calBase.getFullYear(),
    m = calBase.getMonth();
  const first = new Date(y, m, 1),
    off = (first.getDay() + 6) % 7,
    start = new Date(y, m, 1 - off);

  const eventosPorDia = useMemo(() => {
    const map = {};
    (eventosData || []).forEach((e) => {
      (map[e.fecha] ??= []).push(e);
    });
    return map;
  }, []);

  const [diaSel, setDiaSel] = useState(null);
  const shiftMonth = (d) => {
    const n = new Date(calBase);
    n.setMonth(n.getMonth() + d);
    setCalBase(n);
  };

  // ====== CONTACTO (estado + filtro) ======
  const [qContacto, setQContacto] = useState("");
  const docentesFiltrados = useMemo(() => {
    const q = qContacto.trim().toLowerCase();
    if (!q) return docentes;
    return (docentes || []).filter((d) => {
      const base = [
        d.nombre,
        d.apellido,
        d.email,
        d.telefono,
        ...(d.materiasAsignadas || []).flatMap((m) => [
          m.nombre,
          m.comision,
          m.horario,
        ]),
      ]
        .filter(Boolean)
        .map(String)
        .map((s) => s.toLowerCase());
      return base.some((s) => s.includes(q));
    });
  }, [qContacto]);

  // ====== RENDER ======
  const renderPanel = () => {
    // ---------- INSCRIPCIÓN ----------
    if (active === "inscripcion") {
      return (
        <div className="enroll-wrap">
          <div className="enroll-card">
            <div className="enroll-header">
              <h2 className="enroll-title">Inscripción a Materias</h2>
              <button className="btn" onClick={() => setActive(null)}>Volver</button>
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
                          <button className="btn btn-primary" onClick={() => handleRegister(m.id)}>
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
                            <button className="btn btn-danger" onClick={() => handleUnregister(id)}>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {showEnrollOk && <p className="enroll-success">¡Inscripción exitosa!</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ---------- CALIFICACIONES ----------
    if (active === "calificaciones") {
      return (
        <div className="grades-wrap">
          <div className="enroll-card grades-card">
            <div className="enroll-header">
              <h2 className="enroll-title">Calificaciones</h2>
              <button className="btn" onClick={() => setActive(null)}>Volver</button>
            </div>

            <div className="grades-filter">
              <label className="grades-filter__label">Filtrar por materia:&nbsp;</label>
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
                    <th>Materia</th><th>Comisión</th><th>Parcial I</th><th>Parcial II</th>
                    <th>Parcial III</th><th>Estado</th><th>Observaciones</th>
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

    // ---------- HISTORIAL ----------
    if (active === "historial") {
      return (
        <div className="historial-wrap">
          <div className="historial-card">
            <div className="historial-header">
              <h2 className="historial-title">Historial Académico</h2>
              <button className="btn" onClick={() => setActive(null)}>Volver</button>
            </div>

            <div className="historial-table-wrap">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Materia</th><th>Comisión</th><th>Nota Final</th><th>Fecha</th><th>Estado</th>
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

    // ---------- NOTIFICACIONES ----------
    if (active === "notificaciones") {
      return (
        <div className="notes-wrap">
          <div className="notes-card">
            <div className="notes-header">
              <h2 className="notes-title">
                Notificaciones{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </h2>
              <div className="notes-toolbar">
                <div className="pill-group">
                  <button className={"pill" + (notesMode === "all" ? " is-active" : "")} onClick={() => setNotesMode("all")}>Todos</button>
                  <button className={"pill" + (notesMode === "fav" ? " is-active" : "")} onClick={() => setNotesMode("fav")}>⭐ Favoritos</button>
                  <button className={"pill" + (notesMode === "unread" ? " is-active" : "")} onClick={() => setNotesMode("unread")}>No leídas</button>
                </div>

                {unreadCount > 0 && (
                  <span className="badge"><span className="badge-dot" /> {unreadCount} sin leer</span>
                )}

                <button className="btn" onClick={() => setActive(null)}>Volver</button>
              </div>
            </div>

            <div className="notes-search">
              <label style={{ alignSelf: "center" }}>Filtrar:&nbsp;</label>
              <input
                className="notes-input"
                type="text"
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value)}
                placeholder="Ej: Matemáticas, inscripción, 01/2025…"
              />
            </div>

            <div>
              {notesAll.length === 0 ? (
                <p>No hay notificaciones para mostrar.</p>
              ) : (
                notesAll.map((n) => {
                  const isExpanded = expanded.has(n.id);
                  const isRead = readSet.has(n.id);
                  const isFav = favSet.has(n.id);
                  const fecha = new Date(n.fecha).toLocaleDateString("es-AR");

                  return (
                    <div
                      key={n.id}
                      className={
                        "note-item type-" + (n.tipo || "general") + (isRead ? "" : " unread")
                      }
                    >
                      <div className="note-head">
                        <button
                          className={"note-fav-btn" + (isFav ? " is-on" : "")}
                          onClick={() => toggleFav(n.id)}
                          title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                          <img
                            src={isFav ? "/favorito.png" : "/nofavorito.png"}
                            alt={isFav ? "Favorito" : "No favorito"}
                            className="note-fav-icon"
                          />
                        </button>

                        <div className="note-title">{n.titulo}</div>
                        <div className="note-date">{fecha}</div>

                        <div className="note-actions">
                          <button className="note-icon-btn" onClick={() => toggleRead(n.id)} title={isRead ? "Leída" : "No leída"}>
                            <img
                              src={isRead ? "/leido.png" : "/noleido.png"}
                              alt={isRead ? "Leída" : "No leída"}
                              className="note-status-icon"
                            />
                          </button>

                          <button
                            className="note-icon-btn"
                            onClick={() => toggleExpand(n.id)}
                            title={isExpanded ? "Ver menos" : "Ver más"}
                            aria-label={isExpanded ? "Ver menos" : "Ver más"}
                          >
                            <img
                              src={isExpanded ? "/vermenos.png" : "/vermas.png"}
                              alt=""
                              className="note-eye-icon"
                            />
                          </button>

                          <button className="note-btn danger" onClick={() => removeNote(n.id)}>
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {isExpanded && <div className="note-detail">{n.detalle}</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    }

    // ---------- ASISTENCIAS & JUSTIFICACIONES ----------
    if (active === "asistencias") {
      return (
        <div className="asis-wrap">
          <div className="asis-card">
            <div className="asis-header">
              <h2 className="asis-title">Asistencias y Justificaciones</h2>
              <button className="btn" onClick={() => setActive(null)}>Volver</button>
            </div>

            {/* Resumen */}
            <div className="asis-summary">
              <div className="pill p">P: {resumen.P}</div>
              <div className="pill a">A: {resumen.A}</div>
              <div className="pill t">T: {resumen.T}</div>
              <div className="pill j">J: {resumen.J}</div>
              <div className="legend">
                <span><b>P</b> = Presente</span>
                <span><b>A</b> = Ausente</span>
                <span><b>T</b> = Tarde</span>
                <span><b>J</b> = Justificado</span>
              </div>
            </div>

            {/* Tabla asistencias */}
            <div className="asis-table-wrap">
              <table className="asis-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Materia</th><th>Comisión</th><th>Estado</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias
                    .slice()
                    .sort((a, b) => b.fecha.localeCompare(a.fecha))
                    .map((a, idx) => {
                      const m = materiaById[a.materiaId];
                      const estadoTxt = ESTADOS[a.estado] || a.estado;
                      const puedeJustificar =
                        (a.estado === "A" || a.estado === "T") && !yaJustificada(a);
                      return (
                        <tr key={idx}>
                          <td>{new Date(a.fecha).toLocaleDateString("es-AR")}</td>
                          <td>{m?.nombre || a.materiaId}</td>
                          <td>{a.comision}</td>
                          <td>
                            <span className={`badge-state est-${a.estado.toLowerCase()}`}>
                              {estadoTxt}
                            </span>
                          </td>
                          <td>
                            {puedeJustificar ? (
                              <button
                                className="btn btn-justificar"
                                onClick={() =>
                                  onPickTarget(`${a.fecha}|${a.materiaId}|${a.comision}`)
                                }
                              >
                                Justificar
                              </button>
                            ) : (
                              <span className="muted">
                                {a.estado === "A" || a.estado === "T" ? "Ya justificada" : "—"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Formulario justificación */}
            <div className="jus-card">
              <h3 className="jus-title">Cargar certificado / justificación</h3>

              <form className="jus-form" onSubmit={onSubmitJus}>
                {/* Motivo */}
                <div className="row">
                  <label>Motivo</label>
                  <select
                    className="jus-input"
                    value={jusForm.motivo}
                    onChange={(e) =>
                      setJusForm((f) => ({ ...f, motivo: e.target.value, motivoOtro: "" }))
                    }
                  >
                    <option value="">Seleccione un motivo…</option>
                    {MOTIVOS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Motivo “Otro” */}
                {jusForm.motivo === "Otro" && (
                  <div className="row">
                    <label>Detalle (motivo “Otro”)</label>
                    <input
                      className="jus-input"
                      type="text"
                      placeholder="Ej: motivo específico"
                      value={jusForm.motivoOtro}
                      onChange={(e) =>
                        setJusForm((f) => ({ ...f, motivoOtro: e.target.value }))
                      }
                    />
                  </div>
                )}

                {/* Archivo */}
                <div className="row">
                  <label>Adjuntar certificado (PDF / imagen)</label>
                  <input
                    className="jus-input"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={onFile}
                  />
                </div>

                <div className="row right">
                  <button className="btn btn-success" type="submit">
                    Enviar justificación
                  </button>
                </div>
              </form>
            </div>

            {/* Mis justificaciones */}
            <div className="jus-table-wrap">
              <h3 className="jus-title">Mis justificaciones</h3>
              {jusList.length === 0 ? (
                <p className="muted">Aún no cargaste justificaciones.</p>
              ) : (
                <table className="asis-table">
                  <thead>
                    <tr>
                      <th>Fecha</th><th>Materia</th><th>Comisión</th>
                      <th>Motivo</th><th>Estado</th><th>Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jusList
                      .slice()
                      .sort((a, b) => b.fecha.localeCompare(a.fecha))
                      .map((j) => {
                        const m = materiaById[j.materiaId];
                        return (
                          <tr key={j.id}>
                            <td>{new Date(j.fecha).toLocaleDateString("es-AR")}</td>
                            <td>{m?.nombre || j.materiaId}</td>
                            <td>{j.comision}</td>
                            <td>{j.motivo}</td>
                            <td>
                              <span className={`badge-state st-${j.estado}`}>{j.estado}</span>
                            </td>
                            <td>
                              {j.documentoUrl ? (
                                <a href={j.documentoUrl} target="_blank" rel="noreferrer">Ver</a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      );
    }

    // --- CALENDARIO  ---
    if (active === "calendario") {
      const cells = Array.from({length:42}, (_,i)=> {
        const d=new Date(start); d.setDate(start.getDate()+i);
        const iso=d.toISOString().slice(0,10);
        return { d, iso, inMonth: d.getMonth()===m, evs: (eventosPorDia[iso]||[]) };
      });
      const mes = calBase.toLocaleDateString("es-AR",{month:"long",year:"numeric"});

      return (
        <div className="calendar-wrap">
          <div className="calendar-card">
            <div className="cal-header">
              <h2 className="cal-title">Calendario académico</h2>
              <div className="cal-nav">
                <button className="btn" onClick={() => setActive(null)}>Volver</button>
              </div>
            </div>

            <div className="cal-bar">
              <button className="btn" onClick={() => shiftMonth(-1)}>◀</button>
              <div className="cal-month">{mes}</div>
              <button className="btn" onClick={() => shiftMonth(1)}>▶</button>
            </div>

            <div className="cal-weekdays">
              {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(n=>(
                <div key={n} className="cal-weekday">{n}</div>
              ))}
            </div>

            <div className="cal-grid">
              {cells.map(({d,iso,inMonth,evs},i)=>(
                <button key={i}
                  className={"cal-cell"+(inMonth?"":" is-out")+(evs.length?" has-events":"")}
                  onClick={()=>setDiaSel({iso,evs})}
                  title={evs.length?`${evs.length} evento(s)`:""}>
                  <div className="cal-day">{d.getDate()}</div>
                  {!!evs.length && (
                    <div className="cal-dots">
                      {evs.slice(0,3).map((_,k)=><span key={k} className="dot" />)}
                      {evs.length>3 && <span className="more">+{evs.length-3}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="cal-details">
              {!diaSel ? (
                <p className="muted">Seleccioná un día para ver eventos.</p>
              ) : diaSel.evs.length===0 ? (
                <div className="cal-details__head">
                  <h3>{new Date(diaSel.iso+"T00:00:00").toLocaleDateString("es-AR")}</h3>
                  <button className="btn" onClick={()=>setDiaSel(null)}>Cerrar</button>
                </div>
              ) : (
                <>
                  <div className="cal-details__head">
                    <h3>Eventos del {new Date(diaSel.iso+"T00:00:00").toLocaleDateString("es-AR")}</h3>
                    <button className="btn" onClick={()=>setDiaSel(null)}>Cerrar</button>
                  </div>
                  <ul className="cal-list">
                    {diaSel.evs.sort((a,b)=>a.titulo.localeCompare(b.titulo)).map(ev=>(
                      <li key={ev.id} className="cal-item">
                        <div className="cal-item__title">{ev.titulo}</div>
                        <div className="cal-item__meta">Comisión: <b>{ev.comision}</b></div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ---------- CONTACTO ----------
    if (active === "contacto") {
      return (
        <div className="contacto-wrap">
          <div className="contacto-card">
            <div className="contacto-header">
              <h2 className="contacto-title">Contacto</h2>
              <button className="btn" onClick={() => setActive(null)}>Volver</button>
            </div>

            {/* Info institucional */}
            <section className="contacto-box">
              <h3 className="contacto-sub">{contactoInst.nombre || "Instituto Superior Prisma"}</h3>
              <ul className="contacto-list">
                {contactoInst.direccion && <li>📍 Dirección: {contactoInst.direccion}</li>}
                {contactoInst.telefono && <li>📞 Teléfono: {contactoInst.telefono}</li>}
                {contactoInst.email_secretaria && (
                  <li>✉️ Secretaría: <a className="mail-link" href={`mailto:${contactoInst.email_secretaria}`}>{contactoInst.email_secretaria}</a></li>
                )}
                {contactoInst.email_soporte && (
                  <li>🛠️ Soporte: <a className="mail-link" href={`mailto:${contactoInst.email_soporte}`}>{contactoInst.email_soporte}</a></li>
                )}
                {contactoInst.web && (
                  <li>🌐 Sitio web: <a href={contactoInst.web} target="_blank" rel="noreferrer">{contactoInst.web}</a></li>
                )}
                {contactoInst.horarios && <li>🕐 Horarios: {contactoInst.horarios}</li>}
              </ul>
            </section>

            {/* Buscador */}
            <div className="contacto-search">
              <input
                className="notes-input"
                placeholder="Buscar por docente, materia, comisión, horario o email..."
                value={qContacto}
                onChange={(e) => setQContacto(e.target.value)}
              />
            </div>

            {/* Tabla docentes */}
            {/* Tabla docentes */}
<section className="contacto-box">
  <h3 className="contacto-sub">Docentes</h3>
  <div className="tabla-scroll">
    <table className="tabla-contacto">
      <thead>
        <tr>
          <th>Docente</th>
          <th>Email</th>
          <th>Teléfono</th>
        </tr>
      </thead>
      <tbody>
        {docentesFiltrados.length === 0 ? (
          <tr>
            {/* ahora la tabla tiene 3 columnas */}
            <td colSpan="3" style={{ textAlign: "center" }}>
              No se encontraron resultados.
            </td>
          </tr>
        ) : (
          docentesFiltrados.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.nombre} {doc.apellido}</td>
              <td>
                <a className="mail-link" href={`mailto:${doc.email}`}>
                  {doc.email}
                </a>
              </td>
              <td>{doc.telefono || "—"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</section>

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
            <button
              className="sb-gear"
              onClick={() => alert("Próximamente edición de perfil")}
              title="Editar perfil"
            >
              <img src="/perfil.gif" alt="Configuración de perfil" />
            </button>

            <img src="/alumno.jpg" alt="Sabrina Choque" className="sb-avatar" />
            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">Sabrina Choque</p>
          </div>

          <div className="sb-menu">
            {items.map((it) => {
              const locked = active !== null && active !== it.id;
              const showCounter = it.id === "notificaciones" && unreadCount > 0;
              return (
                <button
                  key={it.id}
                  type="button"
                  disabled={locked}
                  onClick={() => !locked && setActive(it.id)}
                  className={
                    "sb-item" +
                    (active === it.id ? " is-active" : "") +
                    (locked ? " is-disabled" : "")
                  }
                >
                  <span className="sb-item__icon" />
                  <span className="sb-item__text">{it.label}</span>
                  {showCounter && <span className="counter">{unreadCount}</span>}
                </button>
              );
            })}
          </div>

          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <span>cerrar sesión</span>
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
