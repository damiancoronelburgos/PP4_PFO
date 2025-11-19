import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function AlumnoCalendario({ setActive }) {
  const [eventos, setEventos] = useState([]);
  const [calBase, setCalBase] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [diaSel, setDiaSel] = useState(null);

  // ============================
  // CARGAR EVENTOS DESDE LA API
  // ============================
  useEffect(() => {
    async function cargar() {
      try {
        const data = await apiFetch("/api/alumnos/calendario");
        setEventos(data || []);
      } catch (err) {
        console.error("Error cargando calendario:", err);
      }
    }
    cargar();
  }, []);

  // ============================
  // MAPA DE EVENTOS POR FECHA ISO
  // ============================
  const eventosPorDia = useMemo(() => {
    const map = {};
    eventos.forEach((e) => {
      const iso = e.fecha.slice(0, 10); // yyyy-mm-dd
      (map[iso] ??= []).push(e);
    });
    return map;
  }, [eventos]);

  // ============================
  // CALCULO PARA LA GRILLA
  // ============================
  const y = calBase.getFullYear();
  const m = calBase.getMonth();
  const first = new Date(y, m, 1);

  const off = (first.getDay() + 6) % 7;
  const start = new Date(y, m, 1 - off);

  const cells = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const iso = d.toISOString().slice(0, 10);

      return {
        d,
        iso,
        inMonth: d.getMonth() === m,
        evs: eventosPorDia[iso] || []
      };
    });
  }, [start, m, eventosPorDia]);

  // ============================
  // CAMBIO DE MES
  // ============================
  const shiftMonth = (d) => {
    const n = new Date(calBase);
    n.setMonth(n.getMonth() + d);
    setCalBase(n);
    setDiaSel(null);
  };

  const mes = calBase.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-wrap">
      <div className="calendar-card">

        {/* ---------------- HEADER ---------------- */}
        <div className="cal-header">
          <h2 className="cal-title">Calendario académico</h2>
        </div>

        {/* ---------------- NAV ---------------- */}
        <div className="cal-bar">
          <button className="btn" onClick={() => shiftMonth(-1)}>◀</button>
          <div className="cal-month">{mes}</div>
          <button className="btn" onClick={() => shiftMonth(1)}>▶</button>
        </div>

        {/* ---------------- WEEKDAYS ---------------- */}
        <div className="cal-weekdays">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((n) => (
            <div key={n} className="cal-weekday">{n}</div>
          ))}
        </div>

        {/* ---------------- GRID ---------------- */}
        <div className="cal-grid">
          {cells.map(({ d, iso, inMonth, evs }, i) => (
            <button
              key={i}
              className={
                "cal-cell" +
                (inMonth ? "" : " is-out") +
                (evs.length ? " has-events" : "")
              }
              onClick={() => setDiaSel({ iso, evs })}
            >
              <div className="cal-day">{d.getDate()}</div>

              {!!evs.length && (
                <div className="cal-dots">
                  {evs.slice(0, 3).map((_, k) => (
                    <span key={k} className="dot"></span>
                  ))}
                  {evs.length > 3 && (
                    <span className="more">+{evs.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ---------------- DETAILS ---------------- */}
        <div className="cal-details">
          {!diaSel ? (
            <p className="muted">Seleccioná un día para ver eventos.</p>
          ) : (
            <>
              <div className="cal-details__head">
                <h3>
                  {new Date(diaSel.iso + "T00:00:00").toLocaleDateString("es-AR")}
                </h3>

                <button className="btn" onClick={() => setDiaSel(null)}>
                  Cerrar
                </button>
              </div>

              {diaSel.evs.length === 0 ? (
                <p className="muted">No hay eventos este día.</p>
              ) : (
                <ul className="cal-list">
                  {diaSel.evs.map((ev) => (
                    <li key={ev.id} className="cal-item">
                      <div className="cal-item__title">{ev.titulo}</div>

                      {ev.comision && (
                        <div className="cal-item__meta">
                          Comisión: <b>{ev.comision}</b>
                        </div>
                      )}

                      {ev.descripcion && (
                        <div className="cal-item__desc">{ev.descripcion}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

