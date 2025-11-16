import React from "react";

export default function PreceptorAsistencia({
  comisionesAsistOptions,
  comisionSel,
  setComisionSel,
  fechaAsis,
  setFechaAsis,
  asistenciaList,
  loadingAsistencia,
  errAsistencia,
  setEstado,
  marcarTodos,
  limpiarAsistencia,
  guardarAsistencia,
  onVolver,
}) {
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
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}