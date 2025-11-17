// src/pages/alumnos/AlumnoNotificaciones.jsx
import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";
import { apiFetch } from "../../../lib/api";

export default function AlumnoNotificaciones({ setActive }) {
  const [notis, setNotis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [mode, setMode] = useState("all"); // all | fav | unread
  const [error, setError] = useState("");

  // ============================
  // Cargar notificaciones
  // ============================
  async function loadNotificaciones() {
    try {
      setLoading(true);
      const data = await apiFetch("/api/alumnos/me/notificaciones");
      setNotis(data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotificaciones();
  }, []);

  // ============================
  // Filtros
  // ============================
  const notisFiltradas = notis
    .filter((n) => {
      if (mode === "fav" && !n.favorito) return false;
      if (mode === "unread" && n.leida) return false;
      if (filter.trim()) {
        const q = filter.toLowerCase();
        return (
          n.titulo.toLowerCase().includes(q) ||
          n.detalle.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const unreadCount = notis.filter((n) => !n.leida).length;

  if (loading) {
    return (
      <div className="notes-wrap">
        <h2 className="notes-title">Cargando notificaciones...</h2>
      </div>
    );
  }

  return (
    <div className="notes-wrap">
      <div className="notes-card">

        {/* HEADER */}
        <div className="notes-header">
          <h2 className="notes-title">
            Notificaciones
            {unreadCount > 0 ? ` (${unreadCount})` : ""}
          </h2>

          <div className="notes-toolbar">

            {/* Filtros */}
            <div className="pill-group">
              <button
                className={"pill" + (mode === "all" ? " is-active" : "")}
                onClick={() => setMode("all")}
              >
                Todos
              </button>

              <button
                className={"pill" + (mode === "fav" ? " is-active" : "")}
                onClick={() => setMode("fav")}
              >
                ⭐ Favoritos
              </button>

              <button
                className={"pill" + (mode === "unread" ? " is-active" : "")}
                onClick={() => setMode("unread")}
              >
                No leídas
              </button>
            </div>

            {/* Badge de no leídas */}
            {unreadCount > 0 && (
              <span className="badge">
                <span className="badge-dot" /> {unreadCount} sin leer
              </span>
            )}

            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>

        {/* INPUT BUSCAR */}
        <div className="notes-search">
          <label>Filtrar:</label>
          <input
            className="notes-input"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Ej: inscripción, matemática, comunicado…"
          />
        </div>

        {/* LISTA */}
        <div>
          {notisFiltradas.length === 0 ? (
            <p>No hay notificaciones para mostrar.</p>
          ) : (
            notisFiltradas.map((n) => (
              <div
                key={n.id}
                className={"note-item" + (!n.leida ? " unread" : "")}
              >
                <div className="note-head">

                  {/* FAVORITO */}
                  <button className="note-fav-btn">
                    <img
                      src={n.favorito ? "/favorito.png" : "/nofavorito.png"}
                      className="note-fav-icon"
                    />
                  </button>

                  {/* TITULO */}
                  <div className="note-title">{n.titulo}</div>

                  {/* FECHA */}
                  <div className="note-date">
                    {new Date(n.fecha).toLocaleDateString("es-AR")}
                  </div>

                  {/* ACCIONES */}
                  <div className="note-actions">
                    <button className="note-icon-btn">
                      <img
                        src={n.leida ? "/leido.png" : "/noleido.png"}
                        className="note-status-icon"
                      />
                    </button>

                    <button className="note-icon-btn">
                      <img
                        src="/vermas.png"
                        className="note-eye-icon"
                      />
                    </button>

                    <button className="note-btn danger">
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* DETALLE */}
                <div className="note-detail">{n.detalle}</div>

              </div>
            ))
          )}
        </div>

        {error && <p style={{ color: "salmon" }}>{error}</p>}
      </div>
    </div>
  );
}
