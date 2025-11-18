import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";
import {
    fetchAlumnoAsistencias,
    fetchAlumnoJustificaciones,
    sendAlumnoJustificacion,
} from "../../../lib/alumnos.api";

export default function AlumnoAsistenciasYJustificaciones({ setActive }) {
    const [asistencias, setAsistencias] = useState([]);
    const [justificaciones, setJustificaciones] = useState([]);

    const [selectedAsistencia, setSelectedAsistencia] = useState(null);

    const [motivo, setMotivo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [archivo, setArchivo] = useState(null);

    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [okMsg, setOkMsg] = useState("");

    // ============================
    // CARGA INICIAL
    // ============================
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);

                const a = await fetchAlumnoAsistencias();
                const j = await fetchAlumnoJustificaciones();

                setAsistencias(a);
                setJustificaciones(j);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los datos.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // ============================
    // ENVÍO FORMULARIO
    // ============================
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setOkMsg("");

        if (!selectedAsistencia) {
            setError("Debe seleccionar una asistencia para justificar.");
            return;
        }

        if (!motivo) {
            setError("Debe seleccionar un motivo.");
            return;
        }

        try {
            setEnviando(true);

            const formData = new FormData();
            formData.append("motivo", motivo);
            formData.append("descripcion", descripcion);
            formData.append("comisionId", selectedAsistencia.comision_id);

            if (archivo) formData.append("documento", archivo);

            const res = await sendAlumnoJustificacion(formData);

            if (res.error) {
                setError(res.error);
            } else {
                setOkMsg("Justificación enviada correctamente.");
                const j = await fetchAlumnoJustificaciones();
                setJustificaciones(j);

                // Reset formulario
                setSelectedAsistencia(null);
                setMotivo("");
                setDescripcion("");
                setArchivo(null);
            }
        } catch (err) {
            console.error(err);
            setError("Error al enviar la justificación.");
        } finally {
            setEnviando(false);
        }
    }

    if (loading) {
        return (
            <div className="asis-wrap">
                <div className="asis-card">
                    <h2 className="asis-title">Cargando…</h2>
                </div>
            </div>
        );
    }

    // ============================
    // CONTADORES
    // ============================
    const countP = asistencias.filter((x) => x.estado === "P").length;
    const countA = asistencias.filter((x) => x.estado === "A").length;
    const countT = asistencias.filter((x) => x.estado === "T").length;
    const countJ = asistencias.filter((x) => x.estado === "J").length;

    return (
        <div className="asis-wrap">
            <div className="asis-card">

                {/* HEADER */}
                <div className="asis-header">
                    <h2 className="asis-title">Asistencias y Justificaciones</h2>
                    <button className="btn" onClick={() => setActive(null)}>Volver</button>
                </div>

                {/* CONTADORES */}
                <div className="asis-summary">
                    <span className="badge-total est-p">P: {countP}</span>
                    <span className="badge-total est-a">A: {countA}</span>
                    <span className="badge-total est-t">T: {countT}</span>
                    <span className="badge-total est-j">J: {countJ}</span>

                    <span style={{ marginLeft: 12 }}>
                        P = Presente — A = Ausente — T = Tarde — J = Justificado
                    </span>
                </div>

                {/* TABLA ASISTENCIAS */}
                <div className="asis-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Materia</th>
                                <th>Comisión</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>

                        <tbody>
                            {asistencias.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        No hay asistencias registradas.
                                    </td>
                                </tr>
                            ) : (
                                asistencias.map((a) => {
                                    const fecha = new Date(a.fecha).toLocaleDateString("es-AR");

                                    let badgeClass = "";
                                    if (a.estado === "P") badgeClass = "est-p";
                                    else if (a.estado === "A") badgeClass = "est-a";
                                    else if (a.estado === "T") badgeClass = "est-t";
                                    else if (a.estado === "J") badgeClass = "est-j";

                                    return (
                                        <tr key={a.id}>
                                            <td>{fecha}</td>
                                            <td>{a.materia}</td>
                                            <td>{a.comision}</td>

                                            <td>
                                                <span className={`badge-state ${badgeClass}`}>
                                                    {a.estado === "P" && "Presente"}
                                                    {a.estado === "A" && "Ausente"}
                                                    {a.estado === "T" && "Tarde"}
                                                    {a.estado === "J" && "Justificado"}
                                                </span>
                                            </td>

                                            <td>
                                                {(a.estado === "A" || a.estado === "T") ? (
                                                    <button
                                                        className="btn-justificar"
                                                        onClick={() => setSelectedAsistencia(a)}
                                                    >
                                                        Justificar
                                                    </button>
                                                ) : (
                                                    <span style={{ opacity: 0.3 }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FORMULARIO DE JUSTIFICACIÓN */}
                <h3 className="jus-subtitle">Cargar certificado / justificación</h3>

                {selectedAsistencia ? (
                    <form className="jus-form" onSubmit={handleSubmit}>

                        {/* DATOS DE LA ASISTENCIA */}
                        <p>
                            <strong>Fecha:</strong>{" "}
                            {new Date(selectedAsistencia.fecha).toLocaleDateString("es-AR")}
                            <br />
                            <strong>Materia:</strong> {selectedAsistencia.materia}
                            <br />
                            <strong>Comisión:</strong> {selectedAsistencia.comision}
                        </p>

                        {/* MOTIVO */}
                        <div className="jus-field">
                            <label>Motivo:</label>
                            <select
                                className="jus-input"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                            >
                                <option value="">Seleccione un motivo...</option>
                                <option value="Enfermedad">Enfermedad</option>
                                <option value="Turno médico">Turno médico</option>
                                <option value="Fallecimiento íntimo personal">
                                    Fallecimiento íntimo personal
                                </option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        {/* DESCRIPCIÓN SI MOTIVO = OTRO */}
                        {motivo === "Otro" && (
                            <div className="jus-field">
                                <label>Descripción:</label>
                                <textarea
                                    className="jus-textarea"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Detalle el motivo..."
                                />
                            </div>
                        )}

                        {/* ARCHIVO */}
                        <div className="jus-field">
                            <label>Adjuntar certificado (PDF / imagen):</label>
                            <input
                                type="file"
                                className="jus-input"
                                accept=".pdf,image/*"
                                onChange={(e) => setArchivo(e.target.files[0])}
                            />
                        </div>

                        {/* MENSAJES */}
                        {error && <p style={{ color: "salmon" }}>{error}</p>}
                        {okMsg && <p style={{ color: "lightgreen" }}>{okMsg}</p>}

                        {/* BOTÓN */}
                        <button className="btn" disabled={enviando}>
                            {enviando ? "Enviando..." : "Enviar justificación"}
                        </button>

                    </form>
                ) : (
                    <p style={{ opacity: 0.7 }}>
                        Seleccione una inasistencia para justificar.
                    </p>
                )}

                {/* LISTA DE JUSTIFICACIONES */}
                <h3 className="jus-subtitle">Mis justificaciones</h3>

                <div className="jus-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Comisión</th>
                                <th>Archivo</th>
                            </tr>
                        </thead>

                        <tbody>
                            {justificaciones.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", opacity: .5 }}>
                                        No hay justificaciones cargadas aún.
                                    </td>
                                </tr>
                            ) : (

                                justificaciones.map((j) => {
                                    const fecha = new Date(j.fecha).toLocaleDateString("es-AR");

                                    return (
                                        <tr key={j.id}>
                                            <td>{fecha}</td>
                                            <td>{j.motivo}</td>
                                            <td>
                                                <span
                                                    className={`badge-state ${j.estado === "pendiente"
                                                            ? "est-a"
                                                            : j.estado === "aprobada"
                                                                ? "est-p"
                                                                : "est-j"
                                                        }`}
                                                >
                                                    {j.estado}
                                                </span>
                                            </td>
                                            <td>{j.comision}</td>
                                            <td>
                                                {j.documentoUrl ? (
                                                    <a href={j.documentoUrl} target="_blank">
                                                        Ver archivo
                                                    </a>
                                                ) : (
                                                    <span style={{ opacity: 0.4 }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
