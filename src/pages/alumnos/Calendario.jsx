// src/pages/alumnos/Calendario.jsx
import React from 'react';

export default function CalendarioPanel({
  setActive, calBase, shiftMonth,
  diaSel, setDiaSel, start, m, eventosPorDia
}) {

  const cells = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const iso = d.toISOString().slice(0, 10);
      const isToday = d.getTime() === today.getTime();

      return {
        d,
        iso,
        inMonth: d.getMonth() === m,
        evs: eventosPorDia[iso] || [],
        isToday,
      };
    });
  }, [start, m, eventosPorDia]);

  const mes = calBase.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-wrap">
      <div className="calendar-card">

        {/* Header */}
        <div className="cal-header">
          <h2 className="cal-title">Calendario académico</h2>
          <div className="cal-nav">
           
          </div>
        </div>

        {/* Nav mensual */}
        <div className="cal-bar">
          <button className="btn" onClick={() => shiftMonth(-1)}>◀</button>
          <div className="cal-month">{mes}</div>
          <button className="btn" onClick={() => shiftMonth(1)}>▶</button>
        </div>

        {/* Nombres de días */}
        <div className="cal-weekdays">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((n) => (
            <div key={n} className="cal-weekday">{n}</div>
          ))}
        </div>

        {/* Grid días */}
        <div className="cal-grid">
          {cells.map(({ d, iso, inMonth, evs, isToday }, i) => (
            <button
              key={i}
              className={
                "cal-cell" +
                (inMonth ? "" : " is-out") +
                (evs.length ? " has-events" : "") +
                (isToday ? " is-today" : "") +
                (diaSel?.iso === iso ? " is-selected" : "")
              }
              onClick={() => setDiaSel({ iso, evs })}
              title={evs.length ? `${evs.length} evento(s)` : ""}
            >
              <div className="cal-day">{d.getDate()}</div>

              {!!evs.length && (
                <div className="cal-dots">
                  {evs.slice(0, 3).map((_, k) => (
                    <span key={k} className="dot" />
                  ))}
                  {evs.length > 3 && (
                    <span className="more">+{evs.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Detalles del día */}
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
                <p className="muted">No hay eventos para este día.</p>
              ) : (
                <ul className="cal-list">
                  {diaSel.evs
                    .sort((a, b) => a.titulo.localeCompare(b.titulo))
                    .map((ev) => (
                      <li key={ev.id} className="cal-item">
                        <div className="cal-item__title">{ev.titulo}</div>
                        <div className="cal-item__meta">
                          Comisión: <b>{ev.comision}</b>
                        </div>
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
