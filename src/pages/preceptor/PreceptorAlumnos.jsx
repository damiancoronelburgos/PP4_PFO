import React from "react";

export default function PreceptorAlumnos({
  loadingAlumnos,
  errAlumnos,
  alumnosMetrics,
  comisionesDbOptions,
  alumnosQuery,
  setAlumnosQuery,
  groupBy,
  setGroupBy,
  comiFilter,
  setComiFilter,
  alSort,
  setAlSort,
  capitalizeWords,
  onVolver,
}) {
  if (loadingAlumnos) {
    return (
      <div className="content">
        <div className="enroll-header mb-12">
          <h1 className="enroll-title">Alumnos</h1>
        </div>
        <div className="enroll-card card--pad-md">
          <div className="muted">Cargando métricas de alumnos...</div>
        </div>
      </div>
    );
  }

  if (errAlumnos) {
    return (
      <div className="content">
        <div className="enroll-header mb-12">
          <h1 className="enroll-title">Alumnos</h1>
        </div>
        <div className="enroll-card card--pad-md">
          <div className="muted">
            No se pudieron cargar las métricas de alumnos.
          </div>
        </div>
      </div>
    );
  }

  const onSort = (key) =>
    setAlSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));

  const baseRowsByComision = alumnosMetrics.map((r) => {
    const presentes = Number(r.presentes) || 0;
    const totalClases = Number(r.totalClases) || 0;
    const tardes = Number(r.tardes) || 0;
    const justificaciones = Number(r.justificaciones) || 0;

    const pct =
      totalClases > 0 ? Math.round((presentes / totalClases) * 100) : 0;

    return {
      id: `${r.alumnoId}-${r.comisionId}`,
      alumnoId: r.alumnoId,
      alumno: capitalizeWords(r.alumno),
      comision: r.comisionCodigo || "-",
      pct,
      tardes,
      just: justificaciones,
      email: r.email || "-",
      presentes,
      totalClases,
    };
  });

  const q = alumnosQuery.trim().toLowerCase();

  const filteredByComision =
    comiFilter === "todas"
      ? baseRowsByComision
      : baseRowsByComision.filter((r) => r.comision === comiFilter);

  const buildRowsByAlumno = () => {
    const acc = new Map();
    for (const row of filteredByComision) {
      const key = row.alumnoId;
      if (!acc.has(key)) {
        acc.set(key, {
          id: String(row.alumnoId),
          alumnoId: row.alumnoId,
          alumno: row.alumno,
          comisiones: new Set(),
          presentes: 0,
          totalClases: 0,
          tardes: 0,
          just: 0,
          email: row.email,
        });
      }
      const slot = acc.get(key);
      slot.comisiones.add(row.comision);
      slot.presentes += row.presentes;
      slot.totalClases += row.totalClases;
      slot.tardes += row.tardes;
      slot.just += row.just;
    }

    const rows = [];
    for (const slot of acc.values()) {
      const pct =
        slot.totalClases > 0
          ? Math.round((slot.presentes / slot.totalClases) * 100)
          : 0;
      rows.push({
        id: slot.id,
        alumnoId: slot.alumnoId,
        alumno: slot.alumno,
        comision: Array.from(slot.comisiones).sort().join(", "),
        pct,
        tardes: slot.tardes,
        just: slot.just,
        email: slot.email,
      });
    }
    return rows;
  };

  const dataset =
    groupBy === "alumno"
      ? buildRowsByAlumno()
      : filteredByComision.map((r) => ({
          id: r.id,
          alumnoId: r.alumnoId,
          alumno: r.alumno,
          comision: r.comision,
          pct: r.pct,
          tardes: r.tardes,
          just: r.just,
          email: r.email,
        }));

  const visiblesUnsorted = dataset.filter(
    (f) =>
      !q ||
      f.alumno.toLowerCase().includes(q) ||
      f.comision.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q)
  );

  const compareValues = (a, b, key) => {
    if (["pct", "tardes", "just"].includes(key)) {
      return (Number(a[key]) || 0) - (Number(b[key]) || 0);
    }
    return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "es", {
      sensitivity: "base",
    });
  };

  const visibles = [...visiblesUnsorted].sort((a, b) => {
    const r = compareValues(a, b, alSort.key);
    return alSort.dir === "asc" ? r : -r;
  });

  const colComLabel = groupBy === "alumno" ? "Comisiones" : "Comisión";
  const arrow = (key) =>
    alSort.key === key ? (alSort.dir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="content">
      <div className="enroll-header header-row">
        <h1 className="enroll-title m-0">Alumnos</h1>

        <div className="row-center gap-10">
          <select
            className="grades-input"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            title="Agrupar"
          >
            <option value="alumno">Agrupar: Alumno</option>
            <option value="alumno-comision">Agrupar: Alumno + Comisión</option>
          </select>

          <select
            className="grades-input"
            value={comiFilter}
            onChange={(e) => setComiFilter(e.target.value)}
            title="Filtrar comisión"
          >
            <option value="todas">Todas las comisiones</option>
            {comisionesDbOptions.map((cod) => (
              <option key={cod} value={cod}>
                {cod}
              </option>
            ))}
          </select>

          <input
            className="grades-input w-260"
            placeholder="Buscar alumno, comisión o correo"
            value={alumnosQuery}
            onChange={(e) => setAlumnosQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="enroll-card card--pad-md">
        <div className="grades-table-wrap table-scroll">
          <table className="grades-table w-full">
            <thead>
              <tr>
                <th
                  className="th-clickable"
                  onClick={() => onSort("alumno")}
                  aria-sort={
                    alSort.key === "alumno"
                      ? alSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  Alumno{arrow("alumno")}
                </th>
                <th
                  className="th-clickable"
                  onClick={() => onSort("comision")}
                  aria-sort={
                    alSort.key === "comision"
                      ? alSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {colComLabel}
                  {arrow("comision")}
                </th>
                <th
                  className="th-clickable"
                  onClick={() => onSort("pct")}
                  aria-sort={
                    alSort.key === "pct"
                      ? alSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  % Asistencia{arrow("pct")}
                </th>
                <th
                  className="th-clickable"
                  onClick={() => onSort("tardes")}
                  aria-sort={
                    alSort.key === "tardes"
                      ? alSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  Tardes{arrow("tardes")}
                </th>
                <th
                  className="th-clickable"
                  onClick={() => onSort("just")}
                  aria-sort={
                    alSort.key === "just"
                      ? alSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  Justificaciones{arrow("just")}
                </th>
                <th
                  className="th-clickable"
                  onClick={() => onSort("email")}
                  aria-sort={
                    alSort.key === "email"
                      ? alSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  Correo{arrow("email")}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((row) => (
                <tr key={row.id}>
                  <td>{row.alumno}</td>
                  <td>{row.comision}</td>
                  <td>{row.pct}%</td>
                  <td>{row.tardes}</td>
                  <td>{row.just}</td>
                  <td>{row.email}</td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted text-center">
                    Sin resultados
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