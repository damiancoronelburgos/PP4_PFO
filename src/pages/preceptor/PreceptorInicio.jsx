import React from "react";

export default function PreceptorInicio({
  loadingComs,
  errComs,
  clasesDeHoy,
  pendingJustCount,
  proximosEventos,
  fmtFecha,
  onIrJustificaciones,
}) {
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
                  onClick={onIrJustificaciones}
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
}