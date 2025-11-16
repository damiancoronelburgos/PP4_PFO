import React from "react";

export default function PreceptorMisComisiones({
  comisionesDb,
  loadingComs,
  errComs,
  capitalizeWords,
  onVolver,
}) {
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
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}