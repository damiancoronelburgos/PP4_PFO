import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/preceptor.css";
import notisJson from "../data/notificaciones.json";

import alumnosRaw from "../data/alumnos.json";
import materiasRaw from "../data/materias.json";
import califsRaw from "../data/calificaciones.json";
import asistRawBase from "../data/asistencias.json";
import justifRaw from "../data/justificaciones.json";
import docentesRaw from "../data/docentes.json";
import eventosRaw from "../data/eventos_calendario.json";

// Muestra “Clases de hoy” en Inicio (mock visual)
const clasesDeHoy = [
  { id: 1, materia: "Prácticas Profesionalizantes", comision: "P4-2025", horario: "18:00–20:00", aula: "Lab 3" },
  { id: 2, materia: "Análisis de Sistemas", comision: "AS-2", horario: "20:10–22:00", aula: "Aula 12" },
];

export default function Preceptor() {
  const navigate = useNavigate();

  // Sesión
  const displayName = localStorage.getItem("displayName") || "Preceptor/a";
  const email = localStorage.getItem("email") || "preceptor@example.com";
  const roles = useMemo(() => JSON.parse(localStorage.getItem("roles") || '["Preceptor/a"]'), []);
  const [avatar, setAvatar] = useState(localStorage.getItem("preceptorAvatar") || "/preceptor.jpg");
  useEffect(() => localStorage.setItem("preceptorAvatar", avatar), [avatar]);

  // Navegación
  const [active, setActive] = useState(null); // null = Inicio

  // Avatar
  const fileRef = useRef(null);
  const choosePhoto = () => fileRef.current?.click();
  const onPhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(f);
  };

  // Cambio de contraseña (mock)
  const [showPwd, setShowPwd] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const savePassword = (e) => {
    e.preventDefault();
    if (pwd1.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");
    if (pwd1 !== pwd2) return alert("Las contraseñas no coinciden.");
    alert("Contraseña actualizada (mock).");
    setShowPwd(false);
    setPwd1(""); setPwd2("");
  };

  // Índices rápidos
  const alumnosById = useMemo(() => Object.fromEntries(alumnosRaw.map((a) => [a.id, a])), []);
  const docentesById = useMemo(() => Object.fromEntries(docentesRaw.map((d) => [d.id, `${d.nombre} ${d.apellido}`])), []);

  // Comisiones derivadas de materias
  const comisiones = useMemo(() => materiasRaw.map((m) => ({
    id: `${m.id}_${m.comision}`,
    materiaId: m.id,
    comision: m.comision,
    nombreMateria: m.nombre,
    docenteId: m.docenteId,
    horario: m.horario,
    sede: m.sede ?? "Central",
    aula: m.aula ?? "A confirmar",
    estado: m.estado ?? "En curso",
  })), []);
  const comisionesOptions = useMemo(() => comisiones.map((c) => c.id), [comisiones]);

  // Asistencias en memoria
  const [asistDb, setAsistDb] = useState(asistRawBase || []);

  // Justificaciones
  const [justifDb, setJustifDb] = useState(justifRaw || []);
  const [jfFilter, setJfFilter] = useState("pendiente");
  const [jfQuery, setJfQuery] = useState("");

  // Listado de Alumnos (filtros/orden)
  const [alumnosQuery, setAlumnosQuery] = useState("");
  const [groupBy, setGroupBy] = useState("alumno"); // "alumno" | "alumno-comision"
  const [comiFilter, setComiFilter] = useState("todas");
  const [alSort, setAlSort] = useState({ key: "alumno", dir: "asc" });
  const onSort = (key) =>
    setAlSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  // Asistencia: selects y tabla
  const [comisionSel, setComisionSel] = useState(() => comisionesOptions[0] || "");
  const todayISO = new Date().toISOString().slice(0, 10);
  const fmt = (iso) => new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const dateOptions = useMemo(() => {
    if (!comisionSel) return [{ value: todayISO, label: `${fmt(todayISO)} (hoy)` }];
    const [materiaId, com] = comisionSel.split("_");
    const fechas = asistDb.filter((a) => a.materiaId === materiaId && a.comision === com).map((a) => a.fecha);
    const uniq = Array.from(new Set(fechas)).sort((a, b) => b.localeCompare(a)).map((v) => ({ value: v, label: fmt(v) }));
    if (!uniq.find((o) => o.value === todayISO)) uniq.unshift({ value: todayISO, label: `${fmt(todayISO)} (hoy)` });
    return uniq.length ? uniq : [{ value: todayISO, label: `${fmt(todayISO)} (hoy)` }];
  }, [asistDb, comisionSel]);

  const [fechaAsis, setFechaAsis] = useState(todayISO);
  useEffect(() => {
    if (!dateOptions.find((o) => o.value === fechaAsis)) setFechaAsis(dateOptions[0]?.value || todayISO);
  }, [dateOptions, fechaAsis, todayISO]);

  const [asistenciaList, setAsistenciaList] = useState([]);

  // Alumnos por comisión (a partir de calificaciones)
  const alumnosDeComision = useMemo(() => {
    const map = new Map();
    for (const r of califsRaw) {
      const key = `${r.materiaId}_${r.comision}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(r.alumnoId);
    }
    return map;
  }, []);

  useEffect(() => {
    if (!comisionSel || !fechaAsis) return;
    const [materiaId, com] = comisionSel.split("_");
    const ids = Array.from(alumnosDeComision.get(comisionSel) || new Set());
    const prev = asistDb.filter((r) => r.materiaId === materiaId && r.comision === com && r.fecha === fechaAsis);
    const estadoBy = Object.fromEntries(prev.map((r) => [r.alumnoId, r.estado]));
    setAsistenciaList(ids.map((id) => {
      const a = alumnosById[id];
      return { id, apellido: a?.apellido || "-", nombre: a?.nombre || "-", dni: a?.dni || "-", estado: estadoBy[id] || "" };
    }));
  }, [comisionSel, fechaAsis, asistDb, alumnosById, alumnosDeComision]);

  const setEstado = (id, value) => setAsistenciaList((prev) => prev.map((r) => (r.id === id ? { ...r, estado: value } : r)));
  const marcarTodos = (value) => setAsistenciaList((prev) => prev.map((r) => ({ ...r, estado: value })));
  const limpiarAsistencia = () => marcarTodos("");
  const guardarAsistencia = () => {
    if (!comisionSel || !fechaAsis) return;
    const [materiaId, com] = comisionSel.split("_");
    const nuevos = asistenciaList.map((a) => ({ fecha: fechaAsis, materiaId, comision: com, alumnoId: a.id, estado: a.estado || "" }));
    const restantes = asistDb.filter((r) => !(r.fecha === fechaAsis && r.materiaId === materiaId && r.comision === com));
    setAsistDb([...restantes, ...nuevos]);
    alert("Asistencia guardada (mock en memoria).");
  };

  // Justificaciones
  const updateJustifEstado = (id, estado) => setJustifDb((prev) => prev.map((j) => (j.id === id ? { ...j, estado } : j)));
  const verDocumento = (url) => (url ? window.open(url, "_blank") : alert("No hay documento adjunto."));
  const guardarJustificaciones = () => alert("Cambios guardados (mock en memoria).");

  // Calendario
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DOW_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const eventosMes = useMemo(() => (eventosRaw || []).filter((e) => e.fecha.startsWith(`${calYear}-${pad2(calMonth + 1)}`)), [calYear, calMonth]);
  const eventosPorDia = useMemo(() => {
    const m = new Map();
    for (const e of eventosMes) {
      const day = Number(e.fecha.slice(-2));
      if (!m.has(day)) m.set(day, []);
      m.get(day).push(e);
    }
    return m;
  }, [eventosMes]);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const cells = useMemo(() => [...Array.from({ length: firstDow }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)], [firstDow, daysInMonth]);
  const years = useMemo(() => {
    const base = new Set([today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]);
    (eventosRaw || []).forEach((e) => base.add(Number(e.fecha.slice(0, 4))));
    return Array.from(base).sort((a, b) => a - b);
  }, []);

  // Comunicaciones
  const [commsSubject, setCommsSubject] = useState("");
  const [commsComSel, setCommsComSel] = useState("");
  const [commsComs, setCommsComs] = useState([]);
  const [commsOtros, setCommsOtros] = useState("");
  const [commsMsg, setCommsMsg] = useState("");
  const COMMS_MAX = 1000;

  const comisionesFiltradas = useMemo(() => comisionesOptions.filter((id) => !commsComs.includes(id)), [comisionesOptions, commsComs]);
  const addComision = (id) => {
    if (!id) return;
    setCommsComs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCommsComSel("");
  };
  const removeComision = (id) => setCommsComs((prev) => prev.filter((c) => c !== id));
  const recipients = useMemo(() => {
    const mailsFromComs = commsComs.flatMap((key) => {
      const ids = alumnosDeComision.get(key) || new Set();
      return Array.from(ids).map((uid) => alumnosById[uid]?.email).filter(Boolean);
    });
    const mailsOtros = commsOtros.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    return Array.from(new Set([...mailsFromComs, ...mailsOtros]));
  }, [commsComs, commsOtros, alumnosDeComision, alumnosById]);
  const enviarComunicado = () => {
    if (!commsSubject.trim()) return alert("Ingresá un asunto.");
    if (!commsMsg.trim()) return alert("Escribe un mensaje.");
    if (recipients.length === 0) return alert("Elegí al menos un destinatario.");
    alert(`Enviado (mock)
Asunto: ${commsSubject}
Destinatarios: ${recipients.length}
Comisiones: ${commsComs.join(", ")}
Mensaje:
${commsMsg}`);
    setCommsSubject(""); setCommsMsg(""); setCommsOtros(""); setCommsComs([]);
  };

  // Notificaciones (JSON + persistencia local)
  const preceptorId = Number(localStorage.getItem("userId"));
  const toIso = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T09:00:00` : d);
  const notisFromJson = useMemo(() => {
    const hasUserId = !Number.isNaN(preceptorId);
    return (notisJson || [])
      .filter((n) => n.destino === "todos" || (n.destino === "preceptor" && (!n.usuarioId || !hasUserId || n.usuarioId === preceptorId)))
      .map((n) => ({ id: `N-${n.id}`, titulo: n.titulo, texto: n.detalle, fecha: toIso(n.fecha), leida: !!n.leida, fav: !!n.favorito, link: n.link || null, tipo: n.tipo || "info" }))
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  }, [preceptorId]);
  const NOTI_STORAGE_KEY = "pp4_preceptor_notis";
  const [notis, setNotis] = useState(() => {
    const fromLS = localStorage.getItem(NOTI_STORAGE_KEY);
    return fromLS ? JSON.parse(fromLS) : notisFromJson;
  });
  useEffect(() => localStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(notis)), [notis]);
  const unreadCount = useMemo(() => notis.filter((n) => !n.leida).length, [notis]);
  const [notiFilter, setNotiFilter] = useState("todas");
  const [notiQuery, setNotiQuery] = useState("");
  const toggleLeida = (id) => setNotis((prev) => prev.map((n) => (n.id === id ? { ...n, leida: !n.leida } : n)));
  const toggleFav = (id) => setNotis((prev) => prev.map((n) => (n.id === id ? { ...n, fav: !n.fav } : n)));
  const eliminarNoti = (id) => setNotis((prev) => prev.filter((n) => n.id !== id));
  const fmtDateTime = (iso) => new Date(iso).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" });
  const notisVisibles = useMemo(() => {
    const q = notiQuery.trim().toLowerCase();
    return notis
      .filter((n) => (notiFilter === "todas" ? true : notiFilter === "no-leidas" ? !n.leida : n.fav))
      .filter((n) => !q || (n.titulo + " " + (n.texto || "")).toLowerCase().includes(q))
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  }, [notis, notiFilter, notiQuery]);

  // Sidebar
  const items = [
    { id: "inicio", label: "Inicio" },
    { id: "mis-comisiones", label: "Mis Comisiones" },
    { id: "asistencia", label: "Asistencia" },
    { id: "justificaciones", label: "Justificaciones" },
    { id: "calendario", label: "Calendario" },
    { id: "alumnos", label: "Alumnos" },
    { id: "comunicaciones", label: "Comunicaciones" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "perfil", label: "Mi Perfil" },
  ];
  const handleLogout = () => { localStorage.clear(); navigate("/", { replace: true }); };

  // Panels
  const renderInicio = () => {
    const hoy = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const pendientes = (justifRaw || []).filter((j) => j.estado === "pendiente").length;
    return (
      <>
        <div className="content">
          <div className="enroll-header mb-6"><h1 className="enroll-title">Inicio</h1></div>
          <div className="meta">Fecha: {hoy}</div>
        </div>
        <div className="content">
          <div className="grid-main">
            <div className="enroll-card">
              <div className="enroll-header"><h2 className="enroll-title">Clases de hoy</h2></div>
              <div className="grades-table-wrap">
                <table className="grades-table w-full">
                  <thead><tr><th>Materia</th><th>Comisión</th><th>Horario</th><th>Aula</th></tr></thead>
                  <tbody>{clasesDeHoy.map((c) => (<tr key={c.id}><td>{c.materia}</td><td>{c.comision}</td><td>{c.horario}</td><td>{c.aula}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
            <div className="grid-gap">
              <div className="enroll-card">
                <div className="enroll-header"><h3 className="enroll-title">Justificaciones pendientes</h3></div>
                <div className="row-center gap-12">
                  <div className="enroll-col__head minw-60 text-center">{pendientes}</div>
                  <button className="btn btn-primary" onClick={() => setActive("justificaciones")}>Ir a Justificaciones</button>
                </div>
              </div>
              <div className="enroll-card">
                <div className="enroll-header"><h3 className="enroll-title">Próximos eventos</h3></div>
                <div className="muted"><p>No hay eventos próximos.</p></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderMisComisiones = () => (
    <div className="content">
      <div className="enroll-header mb-12"><h1 className="enroll-title">Mis Comisiones</h1></div>
      <div className="enroll-card card--pad-md">
        <div className="grades-table-wrap">
          <table className="grades-table w-full">
            <thead><tr><th>Materia</th><th>Comisión</th><th>Horario</th><th>Sede</th><th>Aula</th><th>Docente</th><th>Estado</th></tr></thead>
            <tbody>
              {comisiones.map((row) => (
                <tr key={row.id}>
                  <td>{row.nombreMateria}</td><td>{row.comision}</td><td>{row.horario}</td>
                  <td>{row.sede}</td><td>{row.aula}</td><td>{docentesById[row.docenteId] || row.docenteId}</td><td>{row.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card__footer--right"><button className="btn" onClick={() => setActive(null)}>Volver</button></div>
      </div>
    </div>
  );

  const renderAsistencia = () => (
    <div className="content">
      <div className="enroll-header mb-6"><h1 className="enroll-title">Asistencia</h1></div>
      <div className="filters-row">
        <span className="label">Comisión:</span>
        <select className="grades-input w-220" value={comisionSel} onChange={(e) => setComisionSel(e.target.value)}>
          {comisionesOptions.map((id) => <option key={id} value={id}>{id}</option>)}
        </select>
        <span className="label ml-18">Fecha:</span>
        <select className="grades-input w-220" value={fechaAsis} onChange={(e) => setFechaAsis(e.target.value)}>
          {dateOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="enroll-card card--pad-lg">
        <div className="grades-table-wrap">
          <table className="grades-table w-full">
            <thead><tr><th>Apellido</th><th>Nombre</th><th>DNI</th><th>Estado</th></tr></thead>
            <tbody>
              {asistenciaList.map((a) => (
                <tr key={a.id}>
                  <td>{a.apellido}</td><td>{a.nombre}</td><td>{a.dni}</td>
                  <td>
                    <select className="grades-input" value={a.estado} onChange={(e) => setEstado(a.id, e.target.value)}>
                      <option value=""></option><option value="P">P</option><option value="A">A</option>
                      <option value="T">T</option><option value="J">J</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card__actions--left">
          <button className="btn btn--success" onClick={guardarAsistencia}>Guardar</button>
          <button className="btn" onClick={() => marcarTodos("P")}>Marcar todos con P</button>
          <button className="btn btn--danger" onClick={limpiarAsistencia}>Limpiar</button>
        </div>
        <div className="card__footer--right"><button className="btn" onClick={() => setActive(null)}>Volver</button></div>
      </div>
    </div>
  );

  const renderJustificaciones = () => {
    const normalize = (s = "") => s.toString().toLowerCase();
    const tokens = normalize(jfQuery).trim().split(" ").filter(Boolean);
    const rows = (justifDb || [])
      .filter((j) => (jfFilter === "todos" ? true : j.estado === jfFilter))
      .filter((j) => {
        if (tokens.length === 0) return true;
        const alum = alumnosById[j.alumnoId] || {};
        const ape = normalize(alum.apellido || "");
        const nom = normalize(alum.nombre || "");
        const nombreA = `${ape}, ${nom}`;
        const nombreB = `${nom} ${ape}`;
        const dni = normalize(alum.dni || "");
        const comi = normalize(`${j.materiaId}_${j.comision}`);
        return tokens.every((t) => nombreA.includes(t) || nombreB.includes(t) || ape.includes(t) || nom.includes(t) || dni.includes(t) || comi.includes(t));
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    return (
      <div className="content">
        <div className="enroll-header mb-12"><h1 className="enroll-title">Justificaciones</h1></div>
        <div className="filters-row">
          <span className="label">Filtro</span>
          <select className="grades-input" value={jfFilter} onChange={(e) => setJfFilter(e.target.value)}>
            <option value="pendiente">Pendientes</option><option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option><option value="todos">Todos</option>
          </select>
          <span className="label ml-24">Buscar:</span>
          <input className="grades-input w-280" placeholder="Nombre, DNI o Comisión" value={jfQuery} onChange={(e) => setJfQuery(e.target.value)} />
        </div>
        <div className="enroll-card card--pad-lg">
          <div className="grades-table-wrap">
            <table className="grades-table w-full">
              <thead><tr><th>Apellido y Nombre</th><th>DNI</th><th>Comisión</th><th>Fecha</th><th>Estado</th><th>Motivo</th><th>Documento</th></tr></thead>
              <tbody>
                {rows.map((j) => {
                  const a = alumnosById[j.alumnoId];
                  const nombre = `${a?.apellido || "-"}, ${a?.nombre || "-"}`;
                  const comi = `${j.materiaId}_${j.comision}`;
                  return (
                    <tr key={j.id}>
                      <td>{nombre}</td><td>{a?.dni || "-"}</td><td>{comi}</td><td>{j.fecha}</td>
                      <td>
                        <select className="grades-input" value={j.estado} onChange={(e) => updateJustifEstado(j.id, e.target.value)}>
                          <option value="pendiente">Pendiente</option><option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option>
                        </select>
                      </td>
                      <td>{j.motivo || "-"}</td>
                      <td><button className="btn" onClick={() => verDocumento(j.documentoUrl)}>Ver</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card__actions--center">
            <button className="btn btn--success" onClick={guardarJustificaciones}>Guardar</button>
            <div className="spacer-12" />
            <button className="btn" onClick={() => setActive(null)}>Volver</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendario = () => {
    const colorFromCommission = (com) => {
      if (!com) return "#555";
      let h = 0; for (let i = 0; i < com.length; i++) h = ((h << 5) - h) + com.charCodeAt(i);
      return `hsl(${Math.abs(h) % 360}, 70%, 42%)`;
    };
    return (
      <div className="content">
        <div className="enroll-card card--pad-sm">
          <div className="header-row">
            <h2 className="enroll-title m-0">Calendario</h2>
            <div className="row-center gap-12 label">
              <span>Ciclo lectivo:</span>
              <select className="grades-input" value={calYear} onChange={(e) => setCalYear(Number(e.target.value))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span>Mes:</span>
              <select className="grades-input" value={calMonth} onChange={(e) => setCalMonth(Number(e.target.value))}>
                {MESES_ES.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="calendar__dow">{DOW_ES.map((d) => (<div key={d} className="calendar__dow-item">{d}</div>))}</div>
          <div className="calendar__grid">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`b-${idx}`} className="calendar__cell calendar__cell--empty" />;
              const dayEvents = eventosPorDia.get(day) || [];
              return (
                <div key={`d-${day}`} className="calendar__cell">
                  <div className="calendar__day">{day}</div>
                  <div className="calendar__events">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="calendar__pill" style={{ background: colorFromCommission(ev.comision) }} title={`${ev.titulo} — ${ev.comision}`}>
                        <div className="calendar__pill-title">{ev.titulo}</div>
                        <div className="calendar__pill-sub">{ev.comision}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card__footer--right"><button className="btn" onClick={() => setActive(null)}>Volver</button></div>
        </div>
      </div>
    );
  };

  const renderAlumnos = () => {
    // Filas por alumno+comisión
    const filasByComision = [];
    for (const [key, setIds] of alumnosDeComision.entries()) {
      const [materiaId, com] = key.split("_");
      const fechasSet = new Set(asistDb.filter((r) => r.materiaId === materiaId && r.comision === com).map((r) => r.fecha));
      const totalClases = fechasSet.size;
      for (const alumnoId of setIds) {
        const alu = alumnosById[alumnoId]; if (!alu) continue;
        const recs = asistDb.filter((r) => r.materiaId === materiaId && r.comision === com && r.alumnoId === alumnoId);
        const presentes = recs.filter((r) => r.estado === "P").length;
        const tardes = recs.filter((r) => r.estado === "T").length;
        const just = justifDb.filter((j) => j.alumnoId === alumnoId && j.materiaId === materiaId && j.comision === com).length;
        const pct = totalClases > 0 ? Math.round((presentes / totalClases) * 100) : 0;
        filasByComision.push({ id: `${alumnoId}-${key}`, alumnoId, alumno: `${alu.apellido}, ${alu.nombre}`, comision: key, pct, tardes, just, email: alu.email || "-" });
      }
    }

    // Resumen por alumno (agregado de comisiones)
    const buildRowsByAlumno = (filterCom) => {
      const acc = new Map();
      for (const [key, setIds] of alumnosDeComision.entries()) {
        const [materiaId, com] = key.split("_");
        if (filterCom !== "todas" && key !== filterCom) continue;
        const fechasSet = new Set(asistDb.filter((r) => r.materiaId === materiaId && r.comision === com).map((r) => r.fecha));
        const clasesCom = fechasSet.size;
        for (const alumnoId of setIds) {
          const alu = alumnosById[alumnoId]; if (!alu) continue;
          if (!acc.has(alumnoId)) acc.set(alumnoId, { nombre: `${alu.apellido}, ${alu.nombre}`, email: alu.email || "-", coms: new Set(), pres: 0, tard: 0, clases: 0, just: 0 });
          const slot = acc.get(alumnoId);
          slot.coms.add(key);
          slot.clases += clasesCom;
          const recs = asistDb.filter((r) => r.materiaId === materiaId && r.comision === com && r.alumnoId === alumnoId);
          slot.pres += recs.filter((r) => r.estado === "P").length;
          slot.tard += recs.filter((r) => r.estado === "T").length;
          slot.just += justifDb.filter((j) => j.alumnoId === alumnoId && j.materiaId === materiaId && j.comision === com).length;
        }
      }
      const rows = [];
      for (const [alumnoId, v] of acc.entries()) {
        const pct = v.clases > 0 ? Math.round((v.pres / v.clases) * 100) : 0;
        rows.push({ id: String(alumnoId), alumnoId, alumno: v.nombre, comision: Array.from(v.coms).sort().join(", "), pct, tardes: v.tard, just: v.just, email: v.email });
      }
      return rows;
    };

    const filasByAlumno = buildRowsByAlumno(comiFilter);

    // Búsqueda + orden
    const q = alumnosQuery.trim().toLowerCase();
    const dataset = groupBy === "alumno" ? filasByAlumno : filasByComision;
    const visiblesUnsorted = dataset.filter((f) => !q || f.alumno.toLowerCase().includes(q) || f.comision.toLowerCase().includes(q) || f.email.toLowerCase().includes(q));
    const compareValues = (a, b, key) => {
      if (["pct", "tardes", "just"].includes(key)) return (Number(a[key]) || 0) - (Number(b[key]) || 0);
      return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "es", { sensitivity: "base" });
    };
    const visibles = [...visiblesUnsorted].sort((a, b) => (alSort.dir === "asc" ? compareValues(a, b, alSort.key) : -compareValues(a, b, alSort.key)));

    const colComLabel = groupBy === "alumno" ? "Comisiones" : "Comisión";
    const arrow = (key) => (alSort.key === key ? (alSort.dir === "asc" ? " ▲" : " ▼") : "");

    return (
      <div className="content">
        <div className="enroll-header header-row">
          <h1 className="enroll-title m-0">Alumnos</h1>
          <div className="row-center gap-10">
            <select className="grades-input" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} title="Agrupar">
              <option value="alumno">Agrupar: Alumno</option>
              <option value="alumno-comision">Agrupar: Alumno + Comisión</option>
            </select>
            <select className="grades-input" value={comiFilter} onChange={(e) => setComiFilter(e.target.value)} title="Filtrar comisión">
              <option value="todas">Todas las comisiones</option>
              {comisionesOptions.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            <input className="grades-input w-260" placeholder="Buscar alumno, comisión o correo" value={alumnosQuery} onChange={(e) => setAlumnosQuery(e.target.value)} />
          </div>
        </div>
        <div className="enroll-card card--pad-md">
          <div className="grades-table-wrap table-scroll">
            <table className="grades-table w-full">
              <thead>
                <tr>
                  <th className="th-clickable" onClick={() => onSort("alumno")} aria-sort={alSort.key === "alumno" ? (alSort.dir === "asc" ? "ascending" : "descending") : "none"}>Alumno{arrow("alumno")}</th>
                  <th className="th-clickable" onClick={() => onSort("comision")} aria-sort={alSort.key === "comision" ? (alSort.dir === "asc" ? "ascending" : "descending") : "none"}>{colComLabel}{arrow("comision")}</th>
                  <th className="th-clickable" onClick={() => onSort("pct")} aria-sort={alSort.key === "pct" ? (alSort.dir === "asc" ? "ascending" : "descending") : "none"}>% Asistencia{arrow("pct")}</th>
                  <th className="th-clickable" onClick={() => onSort("tardes")} aria-sort={alSort.key === "tardes" ? (alSort.dir === "asc" ? "ascending" : "descending") : "none"}>Tardes{arrow("tardes")}</th>
                  <th className="th-clickable" onClick={() => onSort("just")} aria-sort={alSort.key === "just" ? (alSort.dir === "asc" ? "ascending" : "descending") : "none"}>Justificaciones{arrow("just")}</th>
                  <th className="th-clickable" onClick={() => onSort("email")} aria-sort={alSort.key === "email" ? (alSort.dir === "asc" ? "ascending" : "descending") : "none"}>Correo{arrow("email")}</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((row) => (
                  <tr key={row.id}>
                    <td>{row.alumno}</td><td>{row.comision}</td><td>{row.pct}%</td><td>{row.tardes}</td><td>{row.just}</td><td>{row.email}</td>
                  </tr>
                ))}
                {visibles.length === 0 && <tr><td colSpan={6} className="muted text-center">Sin resultados</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card__footer--right"><button className="btn" onClick={() => setActive(null)}>Volver</button></div>
        </div>
      </div>
    );
  };

  const renderComunicaciones = () => (
    <div className="content">
      <div className="enroll-header mb-6"><h1 className="enroll-title">Emitir Comunicado</h1></div>
      <div className="enroll-card card--pad-md">
        <div className="comms-legend">
          <strong>Elegir Destinatario/s</strong>
          <span className="comms-help">(podés filtrar por comisión y agregar correos manualmente)</span>
        </div>
        <div className="form-row">
          <label className="form-label">Comisión:</label>
          <div className="comms-combo">
            <select className="grades-input" value={commsComSel} onChange={(e) => addComision(e.target.value)}>
              <option value="">— seleccionar —</option>
              {comisionesFiltradas.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            <div className="chips">
              {commsComs.map((id) => <span key={id} className="chip" title="Quitar" onClick={() => removeComision(id)}>{id} <b>×</b></span>)}
            </div>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">Otros:</label>
          <input className="grades-input w-full" placeholder="Correos separados por coma, espacio o ;" value={commsOtros} onChange={(e) => setCommsOtros(e.target.value)} />
        </div>
        <div className="form-row">
          <label className="form-label">Asunto:</label>
          <input className="grades-input w-full" placeholder="Asunto del comunicado" value={commsSubject} onChange={(e) => setCommsSubject(e.target.value)} />
        </div>
        <div className="comms-msg">
          <div className="comms-msg__head">
            <div className="comms-msg__title">Escribe tu mensaje aquí:</div>
            <button className="btn btn-primary" onClick={enviarComunicado}>Enviar</button>
          </div>
          <textarea className="comms-textarea" maxLength={COMMS_MAX} value={commsMsg} onChange={(e) => setCommsMsg(e.target.value)} placeholder="Mensaje para los destinatarios..." />
          <div className="comms-meta">{recipients.length} destinatario{recipients.length === 1 ? "" : "s"} · {commsMsg.length}/{COMMS_MAX}</div>
        </div>
        <div className="card__footer--right"><button className="btn" onClick={() => setActive(null)}>Volver</button></div>
      </div>
    </div>
  );

  const renderNotificaciones = () => (
    <div className="notes-wrap">
      <div className="notes-card">
        <div className="notes-header">
          <h1 className="notes-title">Notificaciones ({notis.length})</h1>
          <div className="notes-toolbar">
            <div className="pill-group" role="tablist" aria-label="Filtro">
              <button className={"pill" + (notiFilter === "todas" ? " is-active" : "")} onClick={() => setNotiFilter("todas")}>Todos</button>
              <button className={"pill" + (notiFilter === "favoritas" ? " is-active" : "")} onClick={() => setNotiFilter("favoritas")}>★ Favoritos</button>
              <button className={"pill" + (notiFilter === "no-leidas" ? " is-active" : "")} onClick={() => setNotiFilter("no-leidas")}>No leídas</button>
            </div>
            <div className="badge badge--alert" title="Sin leer"><span className="badge-dot" /> {unreadCount} sin leer</div>
            <button className="note-btn" onClick={() => setActive(null)}>Volver</button>
          </div>
        </div>
        <div className="notes-search">
          <span className="notes-label">Filtrar:</span>
          <input className="notes-input" placeholder="Ej: Matemáticas, inscripción, 01/2025..." value={notiQuery} onChange={(e) => setNotiQuery(e.target.value)} />
        </div>
        <div>
          {notisVisibles.map((n) => (
            <div key={n.id} className={"note-item" + (n.leida ? "" : " unread")}>
              <div className="note-head">
                <button className="note-fav-btn" title={n.fav ? "Quitar de favoritos" : "Marcar como favorito"} onClick={() => toggleFav(n.id)}>{n.fav ? "★" : "☆"}</button>
                <h3 className="note-title">{n.titulo}</h3>
                <div className="note-date">{fmtDateTime(n.fecha)}</div>
                <div className="note-actions">
                  {n.link && <button className="note-btn" onClick={() => window.open(n.link, "_blank")}>Ver</button>}
                  <button className="note-btn" onClick={() => toggleLeida(n.id)}>{n.leida ? "No leída" : "Leída"}</button>
                  <button className="note-btn danger" onClick={() => eliminarNoti(n.id)}>Eliminar</button>
                </div>
              </div>
              {n.texto && <div className="note-detail">{n.texto}</div>}
            </div>
          ))}
          {notisVisibles.length === 0 && <div className="note-item"><div className="note-detail">No hay notificaciones para mostrar.</div></div>}
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div className="content">
      <div className="enroll-header mb-12"><h1 className="enroll-title">Mi Perfil</h1></div>
      <div className="enroll-card card--pad-lg profile-card">
        <div className="profile-grid">
          <div className="profile-col profile-col--avatar">
            <img src={avatar} alt={displayName} className="profile-avatar-lg" />
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhotoChange} hidden />
            <button className="btn btn--success" onClick={choosePhoto}>Cambiar foto de perfil</button>
          </div>
          <div className="profile-col profile-col--info">
            <h2 className="profile-name">{displayName}</h2>
            <div className="profile-email">{email}</div>
            {!showPwd ? (
              <div className="mt-16"><button className="btn btn--danger" onClick={() => setShowPwd(true)}>Cambiar contraseña</button></div>
            ) : (
              <form className="pwd-form" onSubmit={savePassword}>
                <input type="password" className="grades-input" placeholder="Nueva contraseña" value={pwd1} onChange={(e) => setPwd1(e.target.value)} />
                <input type="password" className="grades-input" placeholder="Repetir contraseña" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
                <div className="row gap-12">
                  <button className="btn btn--success" type="submit">Guardar</button>
                  <button className="btn" type="button" onClick={() => { setShowPwd(false); setPwd1(""); setPwd2(""); }}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
          <div className="profile-col profile-col--roles">
            <h3 className="profile-subtitle">Roles:</h3>
            <ul className="profile-roles">{roles.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        </div>
        <div className="card__footer--right"><button className="btn" onClick={() => setActive(null)}>Volver</button></div>
      </div>
    </div>
  );

  const renderPanel = () => {
    switch (active) {
      case null:
      case "inicio": return renderInicio();
      case "mis-comisiones": return renderMisComisiones();
      case "asistencia": return renderAsistencia();
      case "justificaciones": return renderJustificaciones();
      case "calendario": return renderCalendario();
      case "alumnos": return renderAlumnos();
      case "comunicaciones": return renderComunicaciones();
      case "notificaciones": return renderNotificaciones();
      case "perfil": return renderPerfil();
      default: return renderInicio();
    }
  };

  return (
    <div className="preceptor-page">
      <div className="full-bg"><img src="/prisma.png" className="bg-img" alt="Fondo" /></div>

      <aside className="sidebar">
        <div className="sidebar__inner">
          <div className="sb-profile">
            <img src={avatar} alt={displayName} className="sb-avatar" />
            <p className="sb-role">Preceptor/a</p>
            <p className="sb-name">{displayName}</p>
          </div>

          <div className="sb-menu">
            {items.map((it) => {
              const isInicio = it.id === "inicio";
              const isActive = isInicio ? active === null || active === "inicio" : active === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setActive(isInicio ? null : it.id)}
                  className={"sb-item" + (isActive ? " is-active" : "")}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="sb-item__icon" />
                  <span className="sb-item__text">{it.label}</span>
                  {it.id === "notificaciones" && unreadCount > 0 && <span className="sb-badge">{unreadCount}</span>}
                </button>
              );
            })}
          </div>

          <div className="sb-footer">
            <button className="btn btn-secondary" onClick={handleLogout}>Salir ✕</button>
          </div>
        </div>
      </aside>

      <div className="brand brand--click" onClick={() => setActive(null)}>
        <div className="brand__circle"><img src="/Logo.png" alt="Logo Prisma" className="brand__logo" /></div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {renderPanel()}
    </div>
  );
}