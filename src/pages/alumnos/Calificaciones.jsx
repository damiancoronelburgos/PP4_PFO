// src/pages/alumnos/Calificaciones.jsx (Sin cambios necesarios)
import React, { useState, useEffect, useMemo } from "react";

// Función auxiliar para obtener el token
const getToken = () => localStorage.getItem('token'); 

// CORRECCIÓN CLAVE: Se añade la barra diagonal final (/)
const API_URL = '/api/calificaciones/'; 

export default function Calificaciones({ setActive }) {
    // ===============================
    // ESTADO LOCAL DE CALIFICACIONES
    // ===============================
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gradeFilter, setGradeFilter] = useState("");

    // ===============================
    // LLAMADA A LA API (useEffect)
    // ===============================
    useEffect(() => {
        const token = getToken();
        if (!token) {
            setError("Token no encontrado. Inicie sesión.");
            setLoading(false);
            return;
        }

        const fetchGrades = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Usando la API_URL con barra final
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Envío del JWT
                    },
                });

                if (!response.ok) {
                    // Manejo de error para 400s o 500s
                    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                    throw new Error(errorData.error || `Error al cargar calificaciones. Código: ${response.status}`);
                }

                const data = await response.json();
                setGradesData(data);
            } catch (err) {
                console.error("Error al obtener calificaciones:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    // ===============================
    // LÓGICA DE FILTRADO (useMemo)
    // ===============================
    const gradesFiltered = useMemo(() => {
        const q = gradeFilter.trim().toLowerCase();
        if (!q || gradesData.length === 0) return gradesData;
        
        return gradesData.filter(g => 
            (g.materiaNombre?.toLowerCase() || "").includes(q) || 
            (g.comisionNombre?.toLowerCase() || "").includes(q)
        );
    }, [gradesData, gradeFilter]);


    if (loading) {
        return <p className="loading-message">⏳ Cargando calificaciones...</p>;
    }

    if (error) {
        return <p className="error-message">❌ Error al cargar las calificaciones: **{error}**</p>;
    }


    return (
        <div className="grades-wrap">
            <div className="enroll-card grades-card">
                
                {/* HEADER */}
                <div className="enroll-header">
                    <h2 className="enroll-title">Calificaciones</h2>
                   
                </div>

                {/* FILTRO */}
                <div className="grades-filter">
                    <label className="grades-filter__label">
                        Filtrar por materia o comisión:&nbsp;
                    </label>
                    <input
                        className="grades-input"
                        type="text"
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        placeholder="Ej: Matemáticas"
                    />
                </div>

                {/* TABLA */}
                <div className="grades-table-wrap">
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>Comisión</th>
                                <th>Parcial I</th>
                                <th>Parcial II</th>
                                <th>Parcial III</th>
                                <th>Estado</th>
                                <th>Observaciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {gradesFiltered.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.materiaNombre}</td>
                                    <td>{r.comisionNombre}</td> 

                                    {/* Muestra guión si la nota es null/undefined */}
                                    <td className="num">{r.parciales?.p1 ?? "—"}</td>
                                    <td className="num">{r.parciales?.p2 ?? "—"}</td>
                                    <td className="num">{r.parciales?.p3 ?? "—"}</td>

                                    <td>{r.estado}</td>
                                    <td>{r.observacion || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {gradesFiltered.length === 0 && !loading && (
                    <p className="hint">
                        {gradesData.length > 0 
                            ? "No hay resultados para el filtro actual." 
                            : "Aún no tienes calificaciones registradas."
                        }
                    </p>
                )}
            </div>
        </div>
    );
}