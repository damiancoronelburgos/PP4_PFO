// src/components/Calendario.jsx
import React from "react";

export default function Calendario({
  calYear,
  setCalYear,
  years,
  calMonth,
  setCalMonth,
  MESES_ES,
  DOW_ES,
  loadingEventos,
  errEventos,
  cells,
  calAnimKey,
  setCalAnimKey,
  eventosPorDia,
  hasComisionesForEvents,
  openAddModal,
  isModalOpen,
  setIsModalOpen,
  modalMode,
  draft,
  setDraft,
  comisionesCalOptions,
  handleAddAnother,
  deleteDraft,
  saveDraft,
  openEditModal,
  onVolver,
}) {
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
                <option key={y} value={y}>{y}</option>
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
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingEventos && <div className="muted mb-8">Cargando eventos...</div>}
        {errEventos && !loadingEventos && <div className="muted mb-8">{errEventos}</div>}

        <div className="calendar__dow">
          {DOW_ES.map((d) => (
            <div key={d} className="calendar__dow-item">{d}</div>
          ))}
        </div>

        <div className="calendar__grid cal-anim" key={calAnimKey}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`b-${idx}`} className="calendar__cell calendar__cell--empty" />;
            }

            const dateISO = `${calYear}-${String(calMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayEvents = eventosPorDia.get(day) || [];

            return (
              <div
                key={`d-${day}`}
                className="calendar__cell calendar__cell--clickable"
                onClick={() => hasComisionesForEvents ? openAddModal(dateISO) : null}
                title={hasComisionesForEvents ? "Click para agregar evento" : "No hay comisiones para agregar eventos"}
              >
                <div className="calendar__day">{day}</div>

                <div className="calendar__events">
                  {dayEvents.map((ev, i) => (
                    <div
                      key={`${ev.id ?? "r"}-${i}`}
                      className="calendar__pill"
                      style={{
                        background: colorFromCommission(ev.comisionCodigo),
                        cursor: ev.comisionCodigo ? "pointer" : "default",
                        opacity: ev.comisionCodigo ? 1 : 0.75,
                      }}

                      // 🚫 Evento institucional = solo lectura
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ev.comisionCodigo) openEditModal(ev);
                      }}

                      title={
                        ev.comisionCodigo
                          ? `${ev.titulo} — ${ev.comisionCodigo}`
                          : `${ev.titulo} — Institucional (solo lectura)`
                      }
                    >
                      <div className="calendar__pill-title">{ev.titulo}</div>
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

        <div className="card__footer--right">
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>

      {/* ──────────────────────────────── */}
      {/* MODAL DE AGREGAR / EDITAR EVENTO */}
      {/* ──────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modalMode === "add" ? "Nuevo evento" : "Editar evento"}</h3>

            <label>Fecha</label>
            <input
              type="date"
              value={draft.fecha}
              onChange={(e) => setDraft({ ...draft, fecha: e.target.value })}
            />

            <label>Título</label>
            <input
              type="text"
              value={draft.titulo}
              onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
            />

            <label>Comisión</label>
            <select
              value={draft.comisionId}
              onChange={(e) => setDraft({ ...draft, comisionId: e.target.value })}
            >
              <option value="">Institucional</option>
              {comisionesCalOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="btn" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>

              {modalMode === "edit" && (
                <button className="btn btn-danger" onClick={deleteDraft}>
                  Eliminar
                </button>
              )}

              <button className="btn btn-primary" onClick={saveDraft}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
