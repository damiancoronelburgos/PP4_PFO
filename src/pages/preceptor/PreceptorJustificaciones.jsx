import React from "react";

export default function PreceptorJustificaciones({
  justifDb,
  loadingJustif,
  errJustif,
  jfFilter,
  setJfFilter,
  jfQuery,
  setJfQuery,
  jfDraft,
  updateJustifEstado,
  guardarJustificaciones,
  verDocumento,
  capitalizeWords,
  onVolver,
}) {
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
          <button className="btn btn--success" onClick={guardarJustificaciones}>
            Guardar
          </button>
          <div className="spacer-12" />
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}