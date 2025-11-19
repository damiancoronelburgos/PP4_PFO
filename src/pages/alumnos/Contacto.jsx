// src/pages/alumnos/Contacto.jsx

import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../../lib/api"; // Tu función para fetch con token
// ❌ Eliminamos la importación de ContactoPanel, ya que su contenido se integra aquí.

const API_DOCENTES = "/api/contacto/docentes";
const API_INSTITUCIONAL = "/api/contacto/institucional";

export default function Contacto({ setActive }) {
    // ===============================
    // ESTADO
    // ===============================
    const [contactoInst, setContactoInst] = useState({});
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qContacto, setQContacto] = useState("");

    // ===============================
    // LLAMADA A LAS APIS (useEffect)
    // ===============================
    useEffect(() => {
        const fetchContactoData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // 1. Obtener datos institucionales
                const instData = await apiFetch(API_INSTITUCIONAL);
                setContactoInst(instData);

                // 2. Obtener lista de docentes con sus datos de contacto
                const docentesData = await apiFetch(API_DOCENTES);
                setDocentes(docentesData);

            } catch (err) {
                console.error("Error al obtener datos de contacto:", err);
                setError(err.message || "Error al cargar la información de contacto.");
            } finally {
                setLoading(false);
            }
        };

        fetchContactoData();
    }, []);

    // ===============================
    // LÓGICA DE FILTRADO (useMemo)
    // ===============================
    const docentesFiltrados = useMemo(() => {
        const q = qContacto.trim().toLowerCase();
        if (!q || docentes.length === 0) return docentes;
        
        return docentes.filter(doc => 
            (doc.nombre?.toLowerCase() || "").includes(q) || 
            (doc.apellido?.toLowerCase() || "").includes(q) ||
            (doc.email?.toLowerCase() || "").includes(q) ||
            (doc.telefono?.toLowerCase() || "").includes(q)
            // Aquí puedes añadir más campos de filtrado si traes, por ejemplo, materias asociadas
        );
    }, [docentes, qContacto]);


    if (loading) {
        return <p className="loading-message">⏳ Cargando información de contacto...</p>;
    }

    if (error) {
        return <p className="error-message">❌ Error al cargar contactos: **{error}**</p>;
    }

    // 🚨 AHORA RENDERIZA DIRECTAMENTE EL CONTENIDO DE LA VISTA
    return (
        <div className="contacto-wrap">
            <div className="contacto-card">

                {/* HEADER */}
                <div className="contacto-header">
                    <h2 className="contacto-title">Contacto</h2>
                   
                </div>

                {/* INFO INSTITUCIONAL */}
                <section className="contacto-box">
                    <h3 className="contacto-sub">{contactoInst.nombre || "Institución"}</h3>

                    <ul className="contacto-list">
                        <li>📍 Dirección: {contactoInst.direccion || "—"}</li>
                        <li>📞 Teléfono: {contactoInst.telefono || "—"}</li>

                        <li>
                            ✉️ Secretaría:{" "}
                            {contactoInst.email_secretaria ? (
                                <a
                                    className="mail-link"
                                    href={`mailto:${contactoInst.email_secretaria}`}
                                >
                                    {contactoInst.email_secretaria}
                                </a>
                            ) : (
                                "—"
                            )}
                        </li>
                    </ul>
                </section>

                {/* BUSCADOR */}
                <div className="contacto-search">
                    <input
                        className="notes-input"
                        placeholder="Buscar por docente, materia, email, etc..."
                        value={qContacto}
                        onChange={(e) => setQContacto(e.target.value)}
                    />
                </div>

                {/* TABLA DOCENTES */}
                <section className="contacto-box">
                    <h3 className="contacto-sub">Docentes</h3>

                    <div className="tabla-scroll">
                        <table className="tabla-contacto">
                            <thead>
                                <tr>
                                    <th>Docente</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                </tr>
                            </thead>

                            <tbody>
                                {docentesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center" }}>
                                            No se encontraron resultados.
                                        </td>
                                    </tr>
                                ) : (
                                    docentesFiltrados.map((doc, i) => (
                                        <tr key={doc.id || i}>
                                            <td>{doc.nombre} {doc.apellido}</td>

                                            <td>
                                                {doc.email ? (
                                                    <a className="mail-link" href={`mailto:${doc.email}`}>
                                                        {doc.email}
                                                    </a>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            <td>{doc.telefono || "—"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}