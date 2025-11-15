import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/preceptor.css";

// ===== API SQL (preceptor) =====
import {
  fetchPreceptorMe,
  fetchPreceptorComisiones,
  fetchPreceptorAlumnosMetrics,
  fetchPreceptorAsistenciaFechas,
  fetchPreceptorAsistenciaLista,
  savePreceptorAsistencia,
  fetchPreceptorNotificaciones,
  updatePreceptorNotificacion,
  deletePreceptorNotificacion,
  sendPreceptorComunicado,
  uploadPreceptorAvatar,
  changePreceptorPassword,
  fetchPreceptorEventosCalendario,
  createPreceptorEventoCalendario,
  deletePreceptorEventoCalendario,
  fetchPreceptorJustificaciones,
  savePreceptorJustificacionesEstado,
} from "../lib/preceptor.api";

// ===== Constantes / Utils =====
const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const fmtFechaHora = (iso) =>
  new Date(iso).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const ymd = (d) => d.toISOString().slice(0, 10);
const pad2 = (n) => String(n).padStart(2, "0");

const capitalizeWords = (str) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

function parseDiaSemanaFromHorario(horario) {
  if (!horario) return null;

  const [diaRaw] = String(horario).trim().split(/\s+/);
  if (!diaRaw) return null;

  const diaNorm = diaRaw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const map = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 0,
  };

  if (!(diaNorm in map)) return null;
  return map[diaNorm];
}

export default function Preceptor() {
  const navigate = useNavigate();

  // ===== Sesión / Perfil =====
  const [displayName, setDisplayName] = useState(() =>
    capitalizeWords(localStorage.getItem("displayName") || "Preceptor/a")
  );
  const [email, setEmail] = useState(
    localStorage.getItem("email") || "preceptor@example.com"
  );
  const [roles, setRoles] = useState(() =>
    JSON.parse(localStorage.getItem("roles") || '["Preceptor/a"]')
  );
  const [avatar, setAvatar] = useState(
    localStorage.getItem("preceptorAvatar") || "/preceptor.jpg"
  );
  const [active, setActive] = useState(null);

  const fileRef = useRef(null);
  const choosePhoto = () => fileRef.current?.click();

  useEffect(() => {
    if (avatar) {
      localStorage.setItem("preceptorAvatar", avatar);
    }
  }, [avatar]);

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadPreceptorAvatar(file);
      if (!result.ok) {
        alert(result.error || "No se pudo actualizar la foto de perfil.");
        return;
      }

      const data = result.data || {};
      const url = data.avatarUrl || data.avatar_url;

      if (url) {
        setAvatar(url);
        localStorage.setItem("preceptorAvatar", url);
      }
    } catch (err) {
      console.error("onPhotoChange error", err);
      alert("Ocurrió un error al subir la imagen.");
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await fetchPreceptorMe();
        if (!me) return;

        const fullNameRaw =
          `${me.apellido ?? ""} ${me.nombre ?? ""}`.trim() || displayName;
        const fullName = capitalizeWords(fullNameRaw);

        setDisplayName(fullName);
        localStorage.setItem("displayName", fullName);

        if (me.email) {
          setEmail(me.email);
          localStorage.setItem("email", me.email);
        }

        if (Array.isArray(me.roles) && me.roles.length > 0) {
          setRoles(me.roles);
          localStorage.setItem("roles", JSON.stringify(me.roles));
        }

        const avatarUrl = me.avatarUrl || me.avatar_url;
        if (avatarUrl) {
          setAvatar(avatarUrl);
          localStorage.setItem("preceptorAvatar", avatarUrl);
        }
      } catch (err) {
        console.error("loadProfile error", err);
      }
    };

    loadProfile();
  }, []);

  // ===== Cambio de contraseña =====
  const [showPwd, setShowPwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const savePassword = async (e) => {
    e.preventDefault();

    if (!currentPwd.trim()) {
      alert("Ingresá tu contraseña actual.");
      return;
    }

    if (pwd1.length < 8) {
      alert("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (pwd1 !== pwd2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setPwdLoading(true);
    const result = await changePreceptorPassword({
      currentPassword: currentPwd,
      newPassword: pwd1,
      confirmPassword: pwd2,
    });
    setPwdLoading(false);

    if (!result.ok) {
      alert(result.error || "No se pudo cambiar la contraseña.");
      return;
    }

    alert("Contraseña actualizada correctamente.");
    setShowPwd(false);
    setCurrentPwd("");
    setPwd1("");
    setPwd2("");
  };

  // ===== Comisiones / Métricas alumnos =====
  const [comisionesDb, setComisionesDb] = useState([]);
  const [loadingComs, setLoadingComs] = useState(true);
  const [errComs, setErrComs] = useState(null);

  const [alumnosMetrics, setAlumnosMetrics] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errAlumnos, setErrAlumnos] = useState(null);

  const clasesDeHoy = useMemo(() => {
    const todayDow = new Date().getDay(); // 0=Dom, 1=Lun, etc.
    return (comisionesDb || [])
      .filter((c) => {
        const dow = parseDiaSemanaFromHorario(c.horario);
        return dow === todayDow;
      })
      .map((c) => ({
        id: c.id,
        materia: capitalizeWords(c.materia?.nombre ?? "-"),
        comision: c.comision ?? "-",
        horario: c.horario ?? "-",
        aula: capitalizeWords(c.aula ?? "A confirmar"),
      }));
  }, [comisionesDb]);

  const comisionesDbOptions = useMemo(() => {
    const s = new Set();
    comisionesDb.forEach((c) => {
      if (c.comision) s.add(c.comision);
    });
    alumnosMetrics.forEach((r) => {
      if (r.comisionCodigo) s.add(r.comisionCodigo);
    });
    return Array.from(s).sort((a, b) => String(a).localeCompare(String(b)));
  }, [comisionesDb, alumnosMetrics]);

  const comisionesCommsOptions = useMemo(
    () =>
      (comisionesDb || []).map((c) => ({
        value: String(c.id),
        label: `${c.comision ?? "-"} — ${capitalizeWords(
          c.materia?.nombre ?? "-"
        )}`,
      })),
    [comisionesDb]
  );

  const comisionesCalOptions = useMemo(
    () =>
      (comisionesDb || []).map((c) => ({
        value: Number(c.id),
        label: `${c.comision ?? "-"} — ${capitalizeWords(
          c.materia?.nombre ?? "-"
        )}`,
      })),
    [comisionesDb]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoadingComs(true);
        setErrComs(null);
        const data = await fetchPreceptorComisiones();
        setComisionesDb(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrComs(e.message || String(e));
        setComisionesDb([]);
      } finally {
        setLoadingComs(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingAlumnos(true);
        setErrAlumnos(null);
        const data = await fetchPreceptorAlumnosMetrics();
        setAlumnosMetrics(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrAlumnos(e.message || String(e));
        setAlumnosMetrics([]);
      } finally {
        setLoadingAlumnos(false);
      }
    })();
  }, []);

  // ===== Asistencias =====
  const todayISO = useMemo(() => ymd(new Date()), []);

  const [comisionSel, setComisionSel] = useState("");
  const [fechaAsis, setFechaAsis] = useState(todayISO);
  const [fechaOptions, setFechaOptions] = useState([
    { value: todayISO, label: `${fmtFecha(todayISO)} (hoy)` },
  ]);

  const [asistenciaList, setAsistenciaList] = useState([]);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
  const [errAsistencia, setErrAsistencia] = useState(null);

  const comisionesAsistOptions = useMemo(
    () =>
      (comisionesDb || []).map((c) => ({
        value: c.id,
        label: `${c.comision ?? "-"} — ${c.materia?.nombre ?? "-"}${
          c.horario ? " — " + c.horario : ""
        }`,
      })),
    [comisionesDb]
  );

  useEffect(() => {
    if (!comisionSel && comisionesAsistOptions.length > 0) {
      setComisionSel(String(comisionesAsistOptions[0].value));
    }
  }, [comisionSel, comisionesAsistOptions]);

  useEffect(() => {
    const loadFechas = async () => {
      if (!comisionSel) return;
      try {
        const data = await fetchPreceptorAsistenciaFechas(comisionSel);
        let opts = Array.isArray(data)
          ? data.map((f) => ({ value: f, label: fmtFecha(f) }))
          : [];

        if (!opts.find((o) => o.value === todayISO)) {
          opts.unshift({
            value: todayISO,
            label: `${fmtFecha(todayISO)} (hoy)`,
          });
        }
        if (opts.length === 0) {
          opts = [
            {
              value: todayISO,
              label: `${fmtFecha(todayISO)} (hoy)`,
            },
          ];
        }

        setFechaOptions(opts);
      } catch (err) {
        console.error("fetchPreceptorAsistenciaFechas error", err);
        setFechaOptions([
          {
            value: todayISO,
            label: `${fmtFecha(todayISO)} (hoy)`,
          },
        ]);
      }
    };
    loadFechas();
  }, [comisionSel, todayISO]);

  useEffect(() => {
    const loadLista = async () => {
      if (!comisionSel || !fechaAsis) return;
      try {
        setLoadingAsistencia(true);
        setErrAsistencia(null);
        const data = await fetchPreceptorAsistenciaLista(comisionSel, fechaAsis);
        const filas = (data || []).map((r) => ({
          id: r.alumnoId,
          alumnoId: r.alumnoId,
          apellido: capitalizeWords(r.apellido || "-"),
          nombre: capitalizeWords(r.nombre || "-"),
          dni: r.dni || "-",
          estado: r.estado || "",
        }));
        setAsistenciaList(filas);
      } catch (err) {
        console.error("fetchPreceptorAsistenciaLista error", err);
        setErrAsistencia("No se pudo cargar la asistencia.");
        setAsistenciaList([]);
      } finally {
        setLoadingAsistencia(false);
      }
    };
    loadLista();
  }, [comisionSel, fechaAsis]);

  const setEstado = (id, v) =>
    setAsistenciaList((p) => p.map((r) => (r.id === id ? { ...r, estado: v } : r)));

  const marcarTodos = (v) =>
    setAsistenciaList((p) => p.map((r) => ({ ...r, estado: v })));

  const limpiarAsistencia = () => marcarTodos("");

  const guardarAsistencia = async () => {
    if (!comisionSel || !fechaAsis) return;
    const payload = {
      comisionId: Number(comisionSel),
      fecha: fechaAsis,
      items: asistenciaList.map((a) => ({
        alumnoId: a.alumnoId,
        estado: a.estado || "",
      })),
    };

    const result = await savePreceptorAsistencia(payload);

    if (result?.ok) {
      alert("Asistencia guardada.");
      if (!fechaOptions.find((o) => o.value === fechaAsis)) {
        setFechaOptions((prev) => [
          ...prev,
          { value: fechaAsis, label: fmtFecha(fechaAsis) },
        ]);
      }
    } else {
      alert(result?.error || "No se pudo guardar la asistencia.");
    }
  };

  // ===== Justificaciones =====
  const [justifDb, setJustifDb] = useState([]);
  const [loadingJustif, setLoadingJustif] = useState(true);
  const [errJustif, setErrJustif] = useState(null);
  const [jfFilter, setJfFilter] = useState("pendiente");
  const [jfQuery, setJfQuery] = useState("");
  const [jfDraft, setJfDraft] = useState({});

  useEffect(() => {
    const loadJustif = async () => {
      try {
        setLoadingJustif(true);
        setErrJustif(null);
        const data = await fetchPreceptorJustificaciones();
        setJustifDb(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchPreceptorJustificaciones error", err);
        setErrJustif("No se pudieron cargar las justificaciones.");
        setJustifDb([]);
      } finally {
        setLoadingJustif(false);
      }
    };
    loadJustif();
  }, []);

  const updateJustifEstado = (id, estado) =>
    setJfDraft((prev) => ({ ...prev, [id]: estado }));

  const guardarJustificaciones = async () => {
    const updates = (justifDb || [])
      .filter((j) => jfDraft[j.id] !== undefined && jfDraft[j.id] !== j.estado)
      .map((j) => ({ id: j.id, estado: jfDraft[j.id] }));

    if (updates.length === 0) {
      alert("No hay cambios para guardar.");
      return;
    }

    const result = await savePreceptorJustificacionesEstado(updates);
    if (!result?.ok) {
      alert(result?.error || "No se pudieron guardar los cambios.");
      return;
    }

    setJustifDb((prev) =>
      prev.map((j) =>
        jfDraft[j.id] !== undefined ? { ...j, estado: jfDraft[j.id] } : j
      )
    );
    setJfDraft({});
    alert("Cambios guardados.");
  };

  const verDocumento = (url) =>
    url ? window.open(url, "_blank", "noopener") : alert("No hay documento adjunto.");

  const pendingJustCount = useMemo(() => {
    const overlay = (justifDb || []).map((j) => ({
      ...j,
      estado: jfDraft[j.id] !== undefined ? jfDraft[j.id] : j.estado,
    }));
    return overlay.filter((j) => j.estado === "pendiente").length;
  }, [justifDb, jfDraft]);

  // ===== Calendario =====
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calAnimKey, setCalAnimKey] = useState(0);

  const MESES_ES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const DOW_ES = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const [eventosCal, setEventosCal] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [errEventos, setErrEventos] = useState(null);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        setLoadingEventos(true);
        setErrEventos(null);
        const data = await fetchPreceptorEventosCalendario();
        setEventosCal(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("fetchPreceptorEventosCalendario error", e);
        setErrEventos("No se pudieron cargar los eventos.");
        setEventosCal([]);
      } finally {
        setLoadingEventos(false);
      }
    };
    loadEventos();
  }, []);

  const eventosMes = useMemo(
    () =>
      (eventosCal || []).filter(
        (e) =>
          e.fecha &&
          e.fecha.startsWith(`${calYear}-${pad2(calMonth + 1)}`)
      ),
    [eventosCal, calYear, calMonth]
  );

  const eventosPorDia = useMemo(() => {
    const m = new Map();
    for (const e of eventosMes) {
      const dia = Number(e.fecha.slice(-2));
      if (!m.has(dia)) m.set(dia, []);
      m.get(dia).push(e);
    }
    return m;
  }, [eventosMes]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const cells = useMemo(
    () => [
      ...Array.from({ length: firstDow }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ],
    [firstDow, daysInMonth]
  );

  const years = useMemo(() => {
    const base = new Set([
      today.getFullYear() - 1,
      today.getFullYear(),
      today.getFullYear() + 1,
    ]);
    (eventosCal || []).forEach((e) => {
      if (e.fecha && /^\d{4}-\d{2}-\d{2}$/.test(e.fecha)) {
        base.add(Number(e.fecha.slice(0, 4)));
      }
    });
    return Array.from(base).sort((a, b) => a - b);
  }, [today, eventosCal]);

  const proximosEventos = useMemo(() => {
    const start = todayISO;
    const endDate = new Date(todayISO);
    endDate.setDate(endDate.getDate() + 21);
    const end = ymd(endDate);

    return (eventosCal || [])
      .filter((e) => e.fecha && e.fecha >= start && e.fecha <= end)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 6);
  }, [todayISO, eventosCal]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const emptyDraft = useMemo(
    () => ({
      id: null,
      fecha: todayISO,
      comisionId: comisionesCalOptions[0]?.value ?? "",
      titulo: "",
      esInstitucional: false,
    }),
    [todayISO, comisionesCalOptions]
  );
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    if (!isModalOpen) setDraft(emptyDraft);
  }, [isModalOpen, emptyDraft]);

  const hasComisionesForEvents = comisionesCalOptions.length > 0;

  const openAddModal = (isoDate) => {
    const firstComision = comisionesCalOptions[0]?.value ?? "";
    setModalMode("add");
    setDraft({
      id: null,
      fecha: isoDate || todayISO,
      comisionId: firstComision,
      titulo: "",
      esInstitucional: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ev) => {
    const esInstitucional =
      ev.esInstitucional === true || ev.comisionId == null;

    setModalMode(esInstitucional ? "view" : "edit");
    setDraft({
      id: ev.id,
      fecha: ev.fecha,
      comisionId: ev.comisionId ?? "",
      titulo: ev.titulo ?? "",
      esInstitucional,
    });
    setIsModalOpen(true);
  };

  const handleAddAnother = () => {
    const fecha = draft.fecha || todayISO;
    const firstComision = comisionesCalOptions[0]?.value ?? "";
    const comisionId =
      draft.comisionId &&
      comisionesCalOptions.some((opt) => opt.value === draft.comisionId)
        ? draft.comisionId
        : firstComision;

    setModalMode("add");
    setDraft({
      id: null,
      fecha,
      comisionId,
      titulo: "",
      esInstitucional: false,
    });
  };

  const saveDraft = async () => {
    if (!draft.titulo.trim()) {
      alert("Ingresá un título.");
      return;
    }
    if (!draft.fecha) {
      alert("Elegí una fecha.");
      return;
    }
    if (!draft.comisionId) {
      alert("Elegí una comisión.");
      return;
    }

    const payload = {
      fecha: draft.fecha,
      titulo: draft.titulo.trim(),
      comisionId: Number(draft.comisionId),
    };

    try {
      const result = await createPreceptorEventoCalendario(payload);
      if (!result?.ok) {
        alert(result?.error || "No se pudo crear el evento.");
        return;
      }

      const nuevo = result.data;
      if (nuevo) {
        setEventosCal((prev) => [...prev, nuevo]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("saveDraft error", err);
      alert("Ocurrió un error al crear el evento.");
    }
  };

  const deleteDraft = async () => {
    if (!draft.id) return;

    const okConfirm = window.confirm(
      "¿Seguro que querés eliminar este evento?"
    );
    if (!okConfirm) return;

    const id = draft.id;
    const prev = eventosCal;

    setEventosCal((p) => p.filter((ev) => ev.id !== id));

    const ok = await deletePreceptorEventoCalendario(id);
    if (!ok) {
      alert("No se pudo eliminar el evento en el servidor.");
      setEventosCal(prev);
      return;
    }

    setIsModalOpen(false);
  };

  // ===== Comunicaciones =====
  const [commsSubject, setCommsSubject] = useState("");
  const [commsComSel, setCommsComSel] = useState("");
  const [commsComs, setCommsComs] = useState([]);
  const [commsOtros, setCommsOtros] = useState("");
  const [commsMsg, setCommsMsg] = useState("");
  const [sendingComms, setSendingComms] = useState(false);
  const COMMS_MAX = 1000;

  const comisionesFiltradas = useMemo(
    () => comisionesCommsOptions.filter((opt) => !commsComs.includes(opt.value)),
    [comisionesCommsOptions, commsComs]
  );

  const addComision = (id) => {
    if (!id) return;
    setCommsComs((p) => (p.includes(id) ? p : [...p, id]));
    setCommsComSel("");
  };

  const removeComision = (id) =>
    setCommsComs((p) => p.filter((c) => c !== id));

  const recipients = useMemo(() => {
    const mailsOtros = commsOtros
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(mailsOtros));
  }, [commsOtros]);

  const labelComision = (id) =>
    comisionesCommsOptions.find((opt) => opt.value === id)?.label || id;

  const enviarComunicado = async () => {
    const asunto = commsSubject.trim();
    const mensaje = commsMsg.trim();

    if (!asunto) {
      alert("Ingresá un asunto.");
      return;
    }
    if (!mensaje) {
      alert("Escribe un mensaje.");
      return;
    }
    if (commsComs.length === 0 && recipients.length === 0) {
      alert("Elegí al menos una comisión o un correo.");
      return;
    }

    const payload = {
      asunto,
      mensaje,
      comisionIds: commsComs
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n) && n > 0),
      otrosEmails: recipients,
    };

    setSendingComms(true);
    const result = await sendPreceptorComunicado(payload);
    setSendingComms(false);

    if (!result.ok) {
      alert(result.error || "No se pudo enviar el comunicado.");
      return;
    }

    const data = result.data || {};
    let msgAlert = `Comunicado enviado.\nNotificaciones creadas: ${
      data.totalNotificaciones ?? data.totalDestinatarios ?? 0
    }.`;

    if (data.emailsSinUsuario && data.emailsSinUsuario.length > 0) {
      msgAlert += `\n\nSe omitieron ${
        data.emailsSinUsuario.length
      } correo(s) sin usuario asociado:\n- ${data.emailsSinUsuario.join(
        "\n- "
      )}`;
    }

    alert(msgAlert);

    setCommsSubject("");
    setCommsMsg("");
    setCommsOtros("");
    setCommsComs([]);
  };

  // ===== Notificaciones =====
  const toIso = (d) =>
    /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T09:00:00` : d;

  const [notis, setNotis] = useState([]);
  const [notiFilter, setNotiFilter] = useState("todas");
  const [notiQuery, setNotiQuery] = useState("");

  useEffect(() => {
    const loadNotis = async () => {
      try {
        const raw = await fetchPreceptorNotificaciones();
        const mapped = (raw || []).map((n) => ({
          id: n.id,
          titulo: n.titulo,
          texto: n.detalle || "",
          fecha: toIso(n.fecha),
          leida: !!n.leida,
          fav: !!n.favorito,
          link: n.link || null,
          tipo: n.tipo || "info",
        }));
        setNotis(
          mapped.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""))
        );
      } catch (e) {
        console.error("fetchPreceptorNotificaciones error", e);
        setNotis([]);
      }
    };
    loadNotis();
  }, []);

  const unreadCount = useMemo(
    () => notis.filter((n) => !n.leida).length,
    [notis]
  );

  const toggleLeida = async (id) => {
    let newLeida = false;
    setNotis((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        newLeida = !n.leida;
        return { ...n, leida: newLeida };
      })
    );
    try {
      await updatePreceptorNotificacion(id, { leida: newLeida });
    } catch (err) {
      console.error("toggleLeida error", err);
    }
  };

  const toggleFav = async (id) => {
    let newFav = false;
    setNotis((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        newFav = !n.fav;
        return { ...n, fav: newFav };
      })
    );
    try {
      await updatePreceptorNotificacion(id, { favorito: newFav });
    } catch (err) {
      console.error("toggleFav error", err);
    }
  };

  const eliminarNoti = async (id) => {
    const notif = notis.find((n) => n.id === id);
    if (!notif) return;

    const okConfirm = window.confirm(
      "¿Seguro que querés eliminar esta notificación? Esta acción no se puede deshacer."
    );
    if (!okConfirm) return;

    const prev = notis;
    setNotis((p) => p.filter((n) => n.id !== id));

    try {
      const ok = await deletePreceptorNotificacion(id);
      if (!ok) {
        alert("No se pudo eliminar la notificación en el servidor.");
        setNotis(prev);
      }
    } catch (err) {
      console.error("eliminarNoti error", err);
      alert("Ocurrió un error al eliminar la notificación.");
      setNotis(prev);
    }
  };

  const notisVisibles = useMemo(() => {
    const q = notiQuery.trim().toLowerCase();
    return notis
      .filter((n) =>
        notiFilter === "todas"
          ? true
          : notiFilter === "no-leidas"
          ? !n.leida
          : n.fav
      )
      .filter(
        (n) =>
          !q ||
          (n.titulo + " " + (n.texto || "")).toLowerCase().includes(q)
      )
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  }, [notis, notiFilter, notiQuery]);

  // ===== Sidebar =====
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

  const handleLogout = () => {
    const confirmar = window.confirm("¿Seguro que querés cerrar la sesión?");

    if (!confirmar) return;

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");

    navigate("/", { replace: true });
  };

  // ===== Render: Inicio =====
  const renderInicio = () => {
    const hoy = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const pendientes = pendingJustCount;

    return (
      <>
        <div className="content">
          <div className="enroll-header mb-6">
            <h1 className="enroll-title">Inicio</h1>
          </div>
          <div className="meta">Fecha: {hoy}</div>
        </div>

        <div className="content">
          <div className="grid-main">
            <div className="enroll-card">
              <div className="enroll-header">
                <h2 className="enroll-title">Clases de hoy</h2>
              </div>

              {loadingComs ? (
                <div className="muted">Cargando comisiones...</div>
              ) : errComs ? (
                <div className="muted">
                  No se pudieron cargar las comisiones.
                </div>
              ) : clasesDeHoy.length === 0 ? (
                <div className="muted">
                  No tenés comisiones asignadas para hoy.
                </div>
              ) : (
                <div className="grades-table-wrap">
                  <table className="grades-table w-full">
                    <thead>
                      <tr>
                        <th>Materia</th>
                        <th>Comisión</th>
                        <th>Horario</th>
                        <th>Aula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clasesDeHoy.map((c) => (
                        <tr key={c.id}>
                          <td>{c.materia}</td>
                          <td>{c.comision}</td>
                          <td>{c.horario}</td>
                          <td>{c.aula}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid-gap">
              <div className="enroll-card">
                <div className="enroll-header">
                  <h3 className="enroll-title">Justificaciones pendientes</h3>
                </div>
                <div className="row-center gap-12">
                  <div className="enroll-col__head minw-60 text-center">
                    {pendientes}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActive("justificaciones")}
                  >
                    Ir a Justificaciones
                  </button>
                </div>
              </div>

              <div className="enroll-card">
                <div className="enroll-header">
                  <h3 className="enroll-title">Próximos eventos</h3>
                </div>

                {proximosEventos.length === 0 ? (
                  <div className="muted">
                    <p>No hay eventos en las próximas 3 semanas.</p>
                  </div>
                ) : (
                  <div className="grades-table-wrap">
                    <table className="grades-table w-full">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Título</th>
                          <th>Comisión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proximosEventos.map((ev) => (
                          <tr key={`${ev.id ?? ev.fecha}-${ev.titulo}`}>
                            <td>{fmtFecha(ev.fecha)}</td>
                            <td>{ev.titulo}</td>
                            <td>
                              {ev.comisionCodigo ??
                                (ev.esInstitucional ? "Institucional" : "-")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ===== Render: Mis Comisiones =====
  const renderMisComisiones = () => {
    const rows =
      comisionesDb && comisionesDb.length > 0
        ? comisionesDb.map((c) => ({
            materia: capitalizeWords(c.materia?.nombre ?? "-"),
            comision: c.comision ?? "-",
            horario: c.horario ?? "-",
            sede: capitalizeWords(c.sede ?? "Central"),
            aula: capitalizeWords(c.aula ?? "A confirmar"),
            docente: capitalizeWords(c.docente ?? "-"),
            estado: c.estado ?? "Inscripción",
          }))
        : [];

    return (
      <div className="content">
        <div className="enroll-header mb-12">
          <h1 className="enroll-title">Mis Comisiones</h1>
        </div>
        <div className="enroll-card card--pad-md">
          {loadingComs && (
            <div className="muted">Cargando comisiones...</div>
          )}
          {errComs && !loadingComs && (
            <div className="muted">No se pudieron cargar las comisiones.</div>
          )}

          <div className="grades-table-wrap">
            <table className="grades-table w-full">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Comisión</th>
                  <th>Horario</th>
                  <th>Sede</th>
                  <th>Aula</th>
                  <th>Docente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.materia}</td>
                    <td>{row.comision}</td>
                    <td>{row.horario}</td>
                    <td>{row.sede}</td>
                    <td>{row.aula}</td>
                    <td>{row.docente}</td>
                    <td>{row.estado}</td>
                  </tr>
                ))}
                {rows.length === 0 && !loadingComs && !errComs && (
                  <tr>
                    <td colSpan={7} className="muted text-center">
                      Sin comisiones asignadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="card__footer--right">
            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== Render: Asistencia =====
  const renderAsistencia = () => {
    const hasComisiones = comisionesAsistOptions.length > 0;

    return (
      <div className="content">
        <div className="enroll-header mb-6">
          <h1 className="enroll-title">Asistencia</h1>
        </div>

        <div className="filters-row">
          <span className="label">Comisión:</span>
          <select
            className="grades-input w-220"
            value={comisionSel}
            onChange={(e) => setComisionSel(e.target.value)}
            disabled={!hasComisiones}
          >
            {!hasComisiones && <option value="">Sin comisiones</option>}
            {comisionesAsistOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className="label ml-18">Fecha:</span>
          <input
            type="date"
            className="grades-input w-220"
            value={fechaAsis}
            onChange={(e) => setFechaAsis(e.target.value)}
            disabled={!hasComisiones}
          />
        </div>

        <div className="enroll-card card--pad-lg">
          {loadingAsistencia && (
            <div className="muted mb-8">Cargando asistencia...</div>
          )}
          {errAsistencia && !loadingAsistencia && (
            <div className="muted mb-8">{errAsistencia}</div>
          )}

          <div className="grades-table-wrap">
            <table className="grades-table w-full">
              <thead>
                <tr>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {asistenciaList.map((a) => (
                  <tr key={a.id}>
                    <td>{a.apellido}</td>
                    <td>{a.nombre}</td>
                    <td>{a.dni}</td>
                    <td>
                      <select
                        className="grades-input"
                        value={a.estado}
                        onChange={(e) => setEstado(a.id, e.target.value)}
                      >
                        <option value=""></option>
                        <option value="P">P</option>
                        <option value="A">A</option>
                        <option value="T">T</option>
                        <option value="J">J</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {asistenciaList.length === 0 && !loadingAsistencia && (
                  <tr>
                    <td colSpan={4} className="muted text-center">
                      No hay alumnos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card__actions--left">
            <button
              className="btn btn--success"
              onClick={guardarAsistencia}
              disabled={!hasComisiones}
            >
              Guardar
            </button>
            <button
              className="btn"
              onClick={() => marcarTodos("P")}
              disabled={!hasComisiones}
            >
              Marcar todos con P
            </button>
            <button
              className="btn btn--danger"
              onClick={limpiarAsistencia}
              disabled={!hasComisiones}
            >
              Limpiar
            </button>
          </div>

          <div className="card__footer--right">
            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== Render: Justificaciones =====
  const renderJustificaciones = () => {
    const norm = (s = "") => s.toString().toLowerCase();
    const tokens = norm(jfQuery).trim().split(" ").filter(Boolean);

    const rows = (justifDb || [])
      .filter((j) => (jfFilter === "todos" ? true : j.estado === jfFilter))
      .filter((j) => {
        if (tokens.length === 0) return true;
        const ape = norm(j.apellido || "");
        const nom = norm(j.nombre || "");
        const nombreA = `${ape}, ${nom}`;
        const nombreB = `${nom} ${ape}`;
        const dni = norm(j.dni || "");
        const comi = norm(j.comisionCodigo || "");
        const materia = norm(j.materiaNombre || "");
        return tokens.every(
          (t) =>
            nombreA.includes(t) ||
            nombreB.includes(t) ||
            ape.includes(t) ||
            nom.includes(t) ||
            dni.includes(t) ||
            comi.includes(t) ||
            materia.includes(t)
        );
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    return (
      <div className="content">
        <div className="enroll-header mb-12">
          <h1 className="enroll-title">Justificaciones</h1>
        </div>

        <div className="filters-row">
          <span className="label">Filtro</span>
          <select
            className="grades-input"
            value={jfFilter}
            onChange={(e) => setJfFilter(e.target.value)}
          >
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
            <option value="todos">Todos</option>
          </select>

          <span className="label ml-24">Buscar:</span>
          <input
            className="grades-input w-280"
            placeholder="Nombre, DNI o Comisión"
            value={jfQuery}
            onChange={(e) => setJfQuery(e.target.value)}
          />
        </div>

        <div className="enroll-card card--pad-lg">
          {loadingJustif && (
            <div className="muted mb-8">Cargando justificaciones...</div>
          )}
          {errJustif && !loadingJustif && (
            <div className="muted mb-8">{errJustif}</div>
          )}

          <div className="grades-table-wrap">
            <table className="grades-table w-full">
              <thead>
                <tr>
                  <th>Apellido y Nombre</th>
                  <th>DNI</th>
                  <th>Comisión</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                  <th>Documento</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => {
                  const ape = capitalizeWords(j.apellido || "-");
                  const nom = capitalizeWords(j.nombre || "-");
                  const nombre = `${ape}, ${nom}`;
                  const comi = j.comisionCodigo || "-";

                  return (
                    <tr key={j.id}>
                      <td>{nombre}</td>
                      <td>{j.dni || "-"}</td>
                      <td>{comi}</td>
                      <td>{j.fecha}</td>
                      <td>
                        <select
                          className="grades-input"
                          value={
                            jfDraft[j.id] !== undefined
                              ? jfDraft[j.id]
                              : j.estado
                          }
                          onChange={(e) =>
                            updateJustifEstado(j.id, e.target.value)
                          }
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="aprobada">Aprobada</option>
                          <option value="rechazada">Rechazada</option>
                        </select>
                      </td>
                      <td>{j.motivo || "-"}</td>
                      <td>
                        <button
                          className="btn"
                          onClick={() => verDocumento(j.documentoUrl)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && !loadingJustif && !errJustif && (
                  <tr>
                    <td colSpan={7} className="muted text-center">
                      No hay justificaciones para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card__actions--center">
            <button
              className="btn btn--success"
              onClick={guardarJustificaciones}
            >
              Guardar
            </button>
            <div className="spacer-12" />
            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== Render: Calendario =====
  const renderCalendario = () => {
    const colorFromCommission = (com) => {
      if (!com) return "#555";
      let h = 0;
      for (let i = 0; i < com.length; i++) {
        h = (h << 5) - h + com.charCodeAt(i);
      }
      return `hsl(${Math.abs(h) % 360}, 70%, 42%)`;
    };

    return (
      <div className="content">
        <div className="enroll-card card--pad-sm">
          <div className="header-row">
            <h2 className="enroll-title m-0">Calendario</h2>
            <div className="row-center gap-12 label">
              <span>Ciclo lectivo:</span>
              <select
                className="grades-input"
                value={calYear}
                onChange={(e) => {
                  setCalYear(Number(e.target.value));
                  setCalAnimKey((k) => k + 1);
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span>Mes:</span>
              <select
                className="grades-input"
                value={calMonth}
                onChange={(e) => {
                  setCalMonth(Number(e.target.value));
                  setCalAnimKey((k) => k + 1);
                }}
              >
                {MESES_ES.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingEventos && (
            <div className="muted mb-8">Cargando eventos...</div>
          )}
          {errEventos && !loadingEventos && (
            <div className="muted mb-8">{errEventos}</div>
          )}

          <div className="calendar__dow">
            {DOW_ES.map((d) => (
              <div key={d} className="calendar__dow-item">
                {d}
              </div>
            ))}
          </div>

          <div className="calendar__grid cal-anim" key={calAnimKey}>
            {cells.map((day, idx) => {
              if (day === null)
                return (
                  <div
                    key={`b-${idx}`}
                    className="calendar__cell calendar__cell--empty"
                  />
                );
              const dateISO = `${calYear}-${pad2(calMonth + 1)}-${pad2(day)}`;
              const dayEvents = eventosPorDia.get(day) || [];
              return (
                <div
                  key={`d-${day}`}
                  className="calendar__cell calendar__cell--clickable"
                  onClick={() =>
                    hasComisionesForEvents ? openAddModal(dateISO) : null
                  }
                  title={
                    hasComisionesForEvents
                      ? "Click para agregar evento"
                      : "No hay comisiones para agregar eventos"
                  }
                >
                  <div className="calendar__day">{day}</div>
                  <div className="calendar__events">
                    {dayEvents.map((ev, i) => (
                      <div
                        key={`${ev.id ?? "r"}-${i}`}
                        className="calendar__pill calendar__pill--clickable"
                        style={{
                          background: colorFromCommission(ev.comisionCodigo),
                        }}
                        title={`${ev.titulo} — ${
                          ev.comisionCodigo || "Institucional"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(ev);
                        }}
                      >
                        <div className="calendar__pill-title">
                          {ev.titulo}
                        </div>
                        <div className="calendar__pill-sub">
                          {ev.comisionCodigo || "Institucional"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {isModalOpen && (
            <div
              className="modal-backdrop"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">
                  {modalMode === "add"
                    ? "Agregar evento"
                    : modalMode === "edit"
                    ? "Detalle de evento de comisión"
                    : "Detalle de evento institucional"}
                </h3>

                <div className="form-row">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="grades-input"
                    value={draft.fecha}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        fecha: e.target.value,
                      })
                    }
                    disabled={modalMode !== "add"}
                  />
                </div>

                <div className="form-row">
                  <label className="form-label">Comisión</label>
                  <select
                    className="grades-input"
                    value={draft.comisionId ? String(draft.comisionId) : ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        comisionId: e.target.value
                          ? Number(e.target.value)
                          : "",
                      })
                    }
                    disabled={modalMode !== "add"}
                  >
                    <option value="">— seleccionar —</option>
                    {comisionesCalOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label className="form-label">Título</label>
                  <input
                    className="grades-input w-280"
                    placeholder="Título del evento"
                    value={draft.titulo}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        titulo: e.target.value,
                      })
                    }
                    disabled={modalMode !== "add"}
                  />
                </div>

                <div className="modal-actions">
                  <button className="btn" onClick={() => setIsModalOpen(false)}>
                    Cerrar
                  </button>

                  {modalMode !== "add" && !draft.esInstitucional && (
                    <button
                      className="btn"
                      type="button"
                      onClick={handleAddAnother}
                    >
                      Agregar otro evento en este día
                    </button>
                  )}

                  {modalMode === "edit" && !draft.esInstitucional && (
                    <button className="btn btn--danger" onClick={deleteDraft}>
                      Eliminar
                    </button>
                  )}
                  {modalMode === "add" && (
                    <button className="btn btn--success" onClick={saveDraft}>
                      Agregar
                    </button>
                  )}
                </div>

                {modalMode === "view" && (
                  <p className="muted mt-16">
                    Evento institucional (no editable).
                  </p>
                )}
                {modalMode === "edit" && (
                  <p className="muted mt-16">
                    Evento de comisión (solo se puede eliminar, no editar).
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="card__footer--right">
            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== Render: Alumnos =====
  const [alumnosQuery, setAlumnosQuery] = useState("");
  const [groupBy, setGroupBy] = useState("alumno");
  const [comiFilter, setComiFilter] = useState("todas");
  const [alSort, setAlSort] = useState({
    key: "alumno",
    dir: "asc",
  });

  const onSort = (key) =>
    setAlSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));

  const renderAlumnos = () => {
    if (loadingAlumnos) {
      return (
        <div className="content">
          <div className="enroll-header mb-12">
            <h1 className="enroll-title">Alumnos</h1>
          </div>
          <div className="enroll-card card--pad-md">
            <div className="muted">Cargando métricas de alumnos...</div>
          </div>
        </div>
      );
    }

    if (errAlumnos) {
      return (
        <div className="content">
          <div className="enroll-header mb-12">
            <h1 className="enroll-title">Alumnos</h1>
          </div>
          <div className="enroll-card card--pad-md">
            <div className="muted">
              No se pudieron cargar las métricas de alumnos.
            </div>
          </div>
        </div>
      );
    }

    const baseRowsByComision = alumnosMetrics.map((r) => {
      const presentes = Number(r.presentes) || 0;
      const totalClases = Number(r.totalClases) || 0;
      const tardes = Number(r.tardes) || 0;
      const justificaciones = Number(r.justificaciones) || 0;

      const pct =
        totalClases > 0 ? Math.round((presentes / totalClases) * 100) : 0;

      return {
        id: `${r.alumnoId}-${r.comisionId}`,
        alumnoId: r.alumnoId,
        alumno: capitalizeWords(r.alumno),
        comision: r.comisionCodigo || "-",
        pct,
        tardes,
        just: justificaciones,
        email: r.email || "-",
        presentes,
        totalClases,
      };
    });

    const q = alumnosQuery.trim().toLowerCase();

    const filteredByComision =
      comiFilter === "todas"
        ? baseRowsByComision
        : baseRowsByComision.filter((r) => r.comision === comiFilter);

    const buildRowsByAlumno = () => {
      const acc = new Map();
      for (const row of filteredByComision) {
        const key = row.alumnoId;
        if (!acc.has(key)) {
          acc.set(key, {
            id: String(row.alumnoId),
            alumnoId: row.alumnoId,
            alumno: row.alumno,
            comisiones: new Set(),
            presentes: 0,
            totalClases: 0,
            tardes: 0,
            just: 0,
            email: row.email,
          });
        }
        const slot = acc.get(key);
        slot.comisiones.add(row.comision);
        slot.presentes += row.presentes;
        slot.totalClases += row.totalClases;
        slot.tardes += row.tardes;
        slot.just += row.just;
      }

      const rows = [];
      for (const slot of acc.values()) {
        const pct =
          slot.totalClases > 0
            ? Math.round((slot.presentes / slot.totalClases) * 100)
            : 0;
        rows.push({
          id: slot.id,
          alumnoId: slot.alumnoId,
          alumno: slot.alumno,
          comision: Array.from(slot.comisiones).sort().join(", "),
          pct,
          tardes: slot.tardes,
          just: slot.just,
          email: slot.email,
        });
      }
      return rows;
    };

    const dataset =
      groupBy === "alumno"
        ? buildRowsByAlumno()
        : filteredByComision.map((r) => ({
            id: r.id,
            alumnoId: r.alumnoId,
            alumno: r.alumno,
            comision: r.comision,
            pct: r.pct,
            tardes: r.tardes,
            just: r.just,
            email: r.email,
          }));

    const visiblesUnsorted = dataset.filter(
      (f) =>
        !q ||
        f.alumno.toLowerCase().includes(q) ||
        f.comision.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
    );

    const compareValues = (a, b, key) => {
      if (["pct", "tardes", "just"].includes(key)) {
        return (Number(a[key]) || 0) - (Number(b[key]) || 0);
      }
      return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "es", {
        sensitivity: "base",
      });
    };

    const visibles = [...visiblesUnsorted].sort((a, b) => {
      const r = compareValues(a, b, alSort.key);
      return alSort.dir === "asc" ? r : -r;
    });

    const colComLabel = groupBy === "alumno" ? "Comisiones" : "Comisión";
    const arrow = (key) =>
      alSort.key === key ? (alSort.dir === "asc" ? " ▲" : " ▼") : "";

    return (
      <div className="content">
        <div className="enroll-header header-row">
          <h1 className="enroll-title m-0">Alumnos</h1>

          <div className="row-center gap-10">
            <select
              className="grades-input"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              title="Agrupar"
            >
              <option value="alumno">Agrupar: Alumno</option>
              <option value="alumno-comision">Agrupar: Alumno + Comisión</option>
            </select>

            <select
              className="grades-input"
              value={comiFilter}
              onChange={(e) => setComiFilter(e.target.value)}
              title="Filtrar comisión"
            >
              <option value="todas">Todas las comisiones</option>
              {comisionesDbOptions.map((cod) => (
                <option key={cod} value={cod}>
                  {cod}
                </option>
              ))}
            </select>

            <input
              className="grades-input w-260"
              placeholder="Buscar alumno, comisión o correo"
              value={alumnosQuery}
              onChange={(e) => setAlumnosQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="enroll-card card--pad-md">
          <div className="grades-table-wrap table-scroll">
            <table className="grades-table w-full">
              <thead>
                <tr>
                  <th
                    className="th-clickable"
                    onClick={() => onSort("alumno")}
                    aria-sort={
                      alSort.key === "alumno"
                        ? alSort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Alumno{arrow("alumno")}
                  </th>
                  <th
                    className="th-clickable"
                    onClick={() => onSort("comision")}
                    aria-sort={
                      alSort.key === "comision"
                        ? alSort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {colComLabel}
                    {arrow("comision")}
                  </th>
                  <th
                    className="th-clickable"
                    onClick={() => onSort("pct")}
                    aria-sort={
                      alSort.key === "pct"
                        ? alSort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    % Asistencia{arrow("pct")}
                  </th>
                  <th
                    className="th-clickable"
                    onClick={() => onSort("tardes")}
                    aria-sort={
                      alSort.key === "tardes"
                        ? alSort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Tardes{arrow("tardes")}
                  </th>
                  <th
                    className="th-clickable"
                    onClick={() => onSort("just")}
                    aria-sort={
                      alSort.key === "just"
                        ? alSort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Justificaciones{arrow("just")}
                  </th>
                  <th
                    className="th-clickable"
                    onClick={() => onSort("email")}
                    aria-sort={
                      alSort.key === "email"
                        ? alSort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Correo{arrow("email")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((row) => (
                  <tr key={row.id}>
                    <td>{row.alumno}</td>
                    <td>{row.comision}</td>
                    <td>{row.pct}%</td>
                    <td>{row.tardes}</td>
                    <td>{row.just}</td>
                    <td>{row.email}</td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted text-center">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card__footer--right">
            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== Render: Comunicaciones =====
  const renderComunicaciones = () => (
    <div className="content">
      <div className="enroll-header mb-6">
        <h1 className="enroll-title">Emitir Comunicado</h1>
      </div>

      <div className="enroll-card card--pad-md">
        <div className="comms-legend">
          <strong>Elegir Destinatario/s</strong>
          <span className="comms-help">
            (podés filtrar por comisión y agregar correos manualmente)
          </span>
        </div>

        <div className="form-row">
          <label className="form-label">Comisión:</label>
          <div className="comms-combo">
            <select
              className="grades-input"
              value={commsComSel}
              onChange={(e) => addComision(e.target.value)}
            >
              <option value="">— seleccionar —</option>
              {comisionesFiltradas.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="chips">
              {commsComs.map((id) => (
                <span
                  key={id}
                  className="chip"
                  title="Quitar"
                  onClick={() => removeComision(id)}
                >
                  {labelComision(id)} <b>×</b>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Otros:</label>
          <input
            className="grades-input w-full"
            placeholder="Correos separados por coma, espacio o ;"
            value={commsOtros}
            onChange={(e) => setCommsOtros(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Asunto:</label>
          <input
            className="grades-input w-full"
            placeholder="Asunto del comunicado"
            value={commsSubject}
            onChange={(e) => setCommsSubject(e.target.value)}
          />
        </div>

        <div className="comms-msg">
          <div className="comms-msg__head">
            <div className="comms-msg__title">Escribe tu mensaje aquí:</div>
            <button
              className="btn btn-primary"
              onClick={enviarComunicado}
              disabled={sendingComms}
            >
              {sendingComms ? "Enviando..." : "Enviar"}
            </button>
          </div>
          <textarea
            className="comms-textarea"
            maxLength={COMMS_MAX}
            value={commsMsg}
            onChange={(e) => setCommsMsg(e.target.value)}
            placeholder="Mensaje para los destinatarios..."
          />
          <div className="comms-meta">
            {commsComs.length} comisión
            {commsComs.length === 1 ? "" : "es"} seleccionada{" · "}
            {recipients.length} correo
            {recipients.length === 1 ? "" : "s"} manual{" · "}
            {commsMsg.length}/{COMMS_MAX}
          </div>
        </div>

        <div className="card__footer--right">
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );

  // ===== Render: Notificaciones =====
  const renderNotificaciones = () => (
    <div className="notes-wrap">
      <div className="notes-card">
        <div className="notes-header">
          <h1 className="notes-title">Notificaciones</h1>
          <div className="notes-toolbar">
            <div className="pill-group" role="tablist" aria-label="Filtro">
              <button
                className={
                  "pill" + (notiFilter === "todas" ? " is-active" : "")
                }
                onClick={() => setNotiFilter("todas")}
              >
                Todos
              </button>
              <button
                className={
                  "pill" + (notiFilter === "favoritas" ? " is-active" : "")
                }
                onClick={() => setNotiFilter("favoritas")}
              >
                ★ Favoritos
              </button>
              <button
                className={
                  "pill" + (notiFilter === "no-leidas" ? " is-active" : "")
                }
                onClick={() => setNotiFilter("no-leidas")}
              >
                No leídas
              </button>
            </div>
            <div className="badge badge--alert" title="Sin leer">
              <span className="badge-dot" /> {unreadCount} sin leer
            </div>
            <button className="note-btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>

        <div className="notes-search">
          <span className="notes-label">Filtrar:</span>
          <input
            className="notes-input"
            placeholder="Ej: Matemáticas, inscripción, 01/2025..."
            value={notiQuery}
            onChange={(e) => setNotiQuery(e.target.value)}
          />
        </div>

        <div>
          {notisVisibles.map((n) => (
            <div
              key={n.id}
              className={"note-item" + (n.leida ? "" : " unread")}
            >
              <div className="note-head">
                <button
                  className="note-fav-btn"
                  title={
                    n.fav ? "Quitar de favoritos" : "Marcar como favorito"
                  }
                  onClick={() => toggleFav(n.id)}
                >
                  {n.fav ? "★" : "☆"}
                </button>
                <h3 className="note-title">{n.titulo}</h3>
                <div className="note-date">{fmtFechaHora(n.fecha)}</div>
                <div className="note-actions">
                  {n.link && (
                    <button
                      className="note-btn"
                      onClick={() => window.open(n.link, "_blank")}
                    >
                      Ver
                    </button>
                  )}
                  <button
                    className="note-btn"
                    title={
                      n.leida ? "Marcar como no leída" : "Marcar como leída"
                    }
                    onClick={() => toggleLeida(n.id)}
                  >
                    {n.leida ? "Marcar no leída" : "Marcar leída"}
                  </button>
                  <button
                    className="note-btn danger"
                    onClick={() => eliminarNoti(n.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {n.texto && <div className="note-detail">{n.texto}</div>}
            </div>
          ))}

          {notisVisibles.length === 0 && (
            <div className="note-item">
              <div className="note-detail">
                No hay notificaciones para mostrar.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ===== Render: Perfil =====
  const renderPerfil = () => (
    <div className="content">
      <div className="enroll-header mb-12">
        <h1 className="enroll-title">Mi Perfil</h1>
      </div>
      <div className="enroll-card card--pad-lg profile-card">
        <div className="profile-grid">
          <div className="profile-col profile-col--avatar">
            <img src={avatar} alt={displayName} className="profile-avatar-lg" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              hidden
            />
            <button className="btn btn--success" onClick={choosePhoto}>
              Cambiar foto de perfil
            </button>
          </div>

          <div className="profile-col profile-col--info">
            <h2 className="profile-name">{displayName}</h2>
            <div className="profile-email">{email}</div>
            {!showPwd ? (
              <div className="mt-16">
                <button
                  className="btn btn--danger"
                  onClick={() => setShowPwd(true)}
                >
                  Cambiar contraseña
                </button>
              </div>
            ) : (
              <form className="pwd-form" onSubmit={savePassword}>
                <input
                  type="password"
                  className="grades-input"
                  placeholder="Contraseña actual"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
                <input
                  type="password"
                  className="grades-input"
                  placeholder="Nueva contraseña"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                />
                <input
                  type="password"
                  className="grades-input"
                  placeholder="Repetir nueva contraseña"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />
                <div className="row gap-12">
                  <button
                    className="btn btn--success"
                    type="submit"
                    disabled={pwdLoading}
                  >
                    {pwdLoading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setShowPwd(false);
                      setCurrentPwd("");
                      setPwd1("");
                      setPwd2("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="profile-col profile-col--roles">
            <h3 className="profile-subtitle">Roles:</h3>
            <ul className="profile-roles">
              {roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card__footer--right">
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );

  // ===== Switch de paneles =====
  const renderPanel = () => {
    switch (active) {
      case null:
      case "inicio":
        return renderInicio();
      case "mis-comisiones":
        return renderMisComisiones();
      case "asistencia":
        return renderAsistencia();
      case "justificaciones":
        return renderJustificaciones();
      case "calendario":
        return renderCalendario();
      case "alumnos":
        return renderAlumnos();
      case "comunicaciones":
        return renderComunicaciones();
      case "notificaciones":
        return renderNotificaciones();
      case "perfil":
        return renderPerfil();
      default:
        return renderInicio();
    }
  };

  // ===== UI =====
  return (
    <div className="preceptor-page">
      <div className="full-bg">
        <img src="/prisma.png" className="bg-img" alt="Fondo" />
      </div>

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
              const isActive = isInicio
                ? active === null || active === "inicio"
                : active === it.id;
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
                  {it.id === "notificaciones" && unreadCount > 0 && (
                    <span className="sb-badge">{unreadCount}</span>
                  )}
                  {it.id === "justificaciones" && pendingJustCount > 0 && (
                    <span className="sb-badge">{pendingJustCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="sb-footer">
            <button className="btn btn-secondary" onClick={handleLogout}>
              Salir ✕
            </button>
          </div>
        </div>
      </aside>

      <div className="brand brand--click" onClick={() => setActive(null)}>
        <div className="brand__circle">
          <img src="/Logo.png" alt="Logo Prisma" className="brand__logo" />
        </div>
        <h1 className="brand__title">Instituto Superior Prisma</h1>
      </div>

      {renderPanel()}
    </div>
  );
}