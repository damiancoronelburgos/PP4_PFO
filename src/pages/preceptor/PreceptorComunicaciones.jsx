import React from "react";

export default function PreceptorComunicaciones({
  comisionesFiltradas,
  commsComSel,
  addComision,
  commsComs,
  removeComision,
  labelComision,
  commsOtros,
  setCommsOtros,
  commsSubject,
  setCommsSubject,
  commsMsg,
  setCommsMsg,
  COMMS_MAX,
  sendingComms,
  enviarComunicado,
  recipients,
  onVolver,
}) {
  return (
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
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}