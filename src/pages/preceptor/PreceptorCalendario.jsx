import React from "react";

export default function PreceptorCalendario({
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
            if (day === null) {
              return (
                <div
                  key={`b-${idx}`}
                  className="calendar__cell calendar__cell--empty"
                />
              );
            }
            const dateISO = `${calYear}-${String(calMonth + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
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
                <button
                  className="btn"
                  onClick={() => setIsModalOpen(false)}
                >
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
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}