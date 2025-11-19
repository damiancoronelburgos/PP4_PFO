import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/preceptor.css";

// API SQL (preceptor)
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

// Componentes UI
import PreceptorSidebar from "../components/PreceptorSidebar";
import PreceptorInicio from "./preceptor/PreceptorInicio";
import PreceptorMisComisiones from "./preceptor/PreceptorMisComisiones";
import PreceptorAsistencia from "./preceptor/PreceptorAsistencia";
import PreceptorJustificaciones from "./preceptor/PreceptorJustificaciones";
import PreceptorCalendario from "./preceptor/PreceptorCalendario";
import PreceptorAlumnos from "./preceptor/PreceptorAlumnos";
import PreceptorComunicaciones from "./preceptor/PreceptorComunicaciones";
import PreceptorNotificaciones from "./preceptor/PreceptorNotificaciones";
import PreceptorPerfil from "./preceptor/PreceptorPerfil";

// Constantes / utils
const fmtFecha = (iso) => {
  if (!iso) return "";
  const s = String(iso).slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

const fmtFechaHora = (iso) =>
  new Date(iso).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const ymd = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
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

  // Sesión / Perfil
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

  // Cambio de contraseña
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

  // Comisiones / Métricas alumnos
  const [comisionesDb, setComisionesDb] = useState([]);
  const [loadingComs, setLoadingComs] = useState(true);
  const [errComs, setErrComs] = useState(null);

  const [alumnosMetrics, setAlumnosMetrics] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errAlumnos, setErrAlumnos] = useState(null);

  const clasesDeHoy = useMemo(() => {
    const todayDow = new Date().getDay();
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

  // Asistencias
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

  // Justificaciones
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

  // Calendario
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
    const map = new Map();

    for (const ev of eventosCal || []) {
      if (!ev.fecha) continue;
      const [yStr, mStr, dStr] = ev.fecha.split("-");
      const y = Number(yStr);
      const m = Number(mStr) - 1;
      const d = Number(dStr);

      if (y === calYear && m === calMonth) {
        if (!map.has(d)) map.set(d, []);
        map.get(d).push(ev);
      }
    }

    return map;
  }, [eventosCal, calYear, calMonth]);

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

  // Comunicaciones
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

  // Notificaciones
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
          id: Number(n.id),
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
    const idNum = Number(id);
    const current = notis.find((n) => n.id === idNum);
    if (!current) return;

    const newLeida = !current.leida;

    setNotis((prev) =>
      prev.map((n) =>
        n.id === idNum ? { ...n, leida: newLeida } : n
      )
    );

    try {
      await updatePreceptorNotificacion(idNum, { leida: newLeida });
    } catch (err) {
      console.error("toggleLeida error", err);
      setNotis((prev) =>
        prev.map((n) =>
          n.id === idNum ? { ...n, leida: current.leida } : n
        )
      );
    }
  };

  const toggleFav = async (id) => {
    const idNum = Number(id);
    const current = notis.find((n) => n.id === idNum);
    if (!current) return;

    const newFav = !current.fav;

    setNotis((prev) =>
      prev.map((n) =>
        n.id === idNum ? { ...n, fav: newFav } : n
      )
    );

    try {
      await updatePreceptorNotificacion(idNum, { favorito: newFav });
    } catch (err) {
      console.error("toggleFav error", err);
      setNotis((prev) =>
        prev.map((n) =>
          n.id === idNum ? { ...n, fav: current.fav } : n
        )
      );
    }
  };

  const eliminarNoti = async (id) => {
    const idNum = Number(id);
    const notif = notis.find((n) => n.id === idNum);
    if (!notif) return;

    const okConfirm = window.confirm(
      "¿Seguro que querés eliminar esta notificación? Esta acción no se puede deshacer."
    );
    if (!okConfirm) return;

    const prev = notis;
    setNotis((p) => p.filter((n) => n.id !== idNum));

    try {
      const ok = await deletePreceptorNotificacion(idNum);
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

  const handleLogout = () => {
    const confirmar = window.confirm("¿Seguro que querés cerrar la sesión?");
    if (!confirmar) return;

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");

    navigate("/", { replace: true });
  };

  // Estado específico de Alumnos que se usa en el panel
  const [alumnosQuery, setAlumnosQuery] = useState("");
  const [groupBy, setGroupBy] = useState("alumno");
  const [comiFilter, setComiFilter] = useState("todas");
  const [alSort, setAlSort] = useState({
    key: "alumno",
    dir: "asc",
  });

  // Switch de paneles
  const renderPanel = () => {
    switch (active) {
      case null:
      case "inicio":
        return (
          <PreceptorInicio
            loadingComs={loadingComs}
            errComs={errComs}
            clasesDeHoy={clasesDeHoy}
            pendingJustCount={pendingJustCount}
            proximosEventos={proximosEventos}
            fmtFecha={fmtFecha}
            onIrJustificaciones={() => setActive("justificaciones")}
          />
        );
      case "mis-comisiones":
        return (
          <PreceptorMisComisiones
            comisionesDb={comisionesDb}
            loadingComs={loadingComs}
            errComs={errComs}
            capitalizeWords={capitalizeWords}
            onVolver={() => setActive(null)}
          />
        );
      case "asistencia":
        return (
          <PreceptorAsistencia
            comisionesAsistOptions={comisionesAsistOptions}
            comisionSel={comisionSel}
            setComisionSel={setComisionSel}
            fechaAsis={fechaAsis}
            setFechaAsis={setFechaAsis}
            asistenciaList={asistenciaList}
            loadingAsistencia={loadingAsistencia}
            errAsistencia={errAsistencia}
            setEstado={setEstado}
            marcarTodos={marcarTodos}
            limpiarAsistencia={limpiarAsistencia}
            guardarAsistencia={guardarAsistencia}
            onVolver={() => setActive(null)}
          />
        );
      case "justificaciones":
        return (
          <PreceptorJustificaciones
            justifDb={justifDb}
            loadingJustif={loadingJustif}
            errJustif={errJustif}
            jfFilter={jfFilter}
            setJfFilter={setJfFilter}
            jfQuery={jfQuery}
            setJfQuery={setJfQuery}
            jfDraft={jfDraft}
            updateJustifEstado={updateJustifEstado}
            guardarJustificaciones={guardarJustificaciones}
            verDocumento={verDocumento}
            capitalizeWords={capitalizeWords}
            onVolver={() => setActive(null)}
          />
        );
      case "calendario":
        return (
          <PreceptorCalendario
            calYear={calYear}
            setCalYear={setCalYear}
            years={years}
            calMonth={calMonth}
            setCalMonth={setCalMonth}
            MESES_ES={MESES_ES}
            DOW_ES={DOW_ES}
            loadingEventos={loadingEventos}
            errEventos={errEventos}
            cells={cells}
            calAnimKey={calAnimKey}
            setCalAnimKey={setCalAnimKey}
            eventosPorDia={eventosPorDia}
            hasComisionesForEvents={hasComisionesForEvents}
            openAddModal={openAddModal}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            modalMode={modalMode}
            draft={draft}
            setDraft={setDraft}
            comisionesCalOptions={comisionesCalOptions}
            handleAddAnother={handleAddAnother}
            deleteDraft={deleteDraft}
            saveDraft={saveDraft}
            openEditModal={openEditModal}
            onVolver={() => setActive(null)}
          />
        );
      case "alumnos":
        return (
          <PreceptorAlumnos
            loadingAlumnos={loadingAlumnos}
            errAlumnos={errAlumnos}
            alumnosMetrics={alumnosMetrics}
            comisionesDbOptions={comisionesDbOptions}
            alumnosQuery={alumnosQuery}
            setAlumnosQuery={setAlumnosQuery}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            comiFilter={comiFilter}
            setComiFilter={setComiFilter}
            alSort={alSort}
            setAlSort={setAlSort}
            capitalizeWords={capitalizeWords}
            onVolver={() => setActive(null)}
          />
        );
      case "comunicaciones":
        return (
          <PreceptorComunicaciones
            comisionesFiltradas={comisionesFiltradas}
            commsComSel={commsComSel}
            addComision={addComision}
            commsComs={commsComs}
            removeComision={removeComision}
            labelComision={labelComision}
            commsOtros={commsOtros}
            setCommsOtros={setCommsOtros}
            commsSubject={commsSubject}
            setCommsSubject={setCommsSubject}
            commsMsg={commsMsg}
            setCommsMsg={setCommsMsg}
            COMMS_MAX={COMMS_MAX}
            sendingComms={sendingComms}
            enviarComunicado={enviarComunicado}
            recipients={recipients}
            onVolver={() => setActive(null)}
          />
        );
      case "notificaciones":
        return (
          <PreceptorNotificaciones
            notisVisibles={notisVisibles}
            notiFilter={notiFilter}
            setNotiFilter={setNotiFilter}
            unreadCount={unreadCount}
            notiQuery={notiQuery}
            setNotiQuery={setNotiQuery}
            toggleFav={toggleFav}
            fmtFechaHora={fmtFechaHora}
            toggleLeida={toggleLeida}
            eliminarNoti={eliminarNoti}
            onVolver={() => setActive(null)}
          />
        );
      case "perfil":
        return (
          <PreceptorPerfil
            avatar={avatar}
            displayName={displayName}
            email={email}
            roles={roles}
            fileRef={fileRef}
            onPhotoChange={onPhotoChange}
            choosePhoto={choosePhoto}
            showPwd={showPwd}
            setShowPwd={setShowPwd}
            currentPwd={currentPwd}
            setCurrentPwd={setCurrentPwd}
            pwd1={pwd1}
            setPwd1={setPwd1}
            pwd2={pwd2}
            setPwd2={setPwd2}
            pwdLoading={pwdLoading}
            savePassword={savePassword}
            onVolver={() => setActive(null)}
          />
        );
      default:
        return (
          <PreceptorInicio
            loadingComs={loadingComs}
            errComs={errComs}
            clasesDeHoy={clasesDeHoy}
            pendingJustCount={pendingJustCount}
            proximosEventos={proximosEventos}
            fmtFecha={fmtFecha}
            onIrJustificaciones={() => setActive("justificaciones")}
          />
        );
    }
  };

  return (
    <div className="preceptor-page">
      <div className="full-bg">
        <img src="/prisma.png" className="bg-img" alt="Fondo" />
      </div>

      <PreceptorSidebar
        avatar={avatar}
        displayName={displayName}
        items={items}
        active={active}
        unreadCount={unreadCount}
        pendingJustCount={pendingJustCount}
        onChangeSection={(sectionId) => setActive(sectionId)}
        onLogout={handleLogout}
      />

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