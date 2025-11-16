// src/pages/alumnos/Notificaciones.jsx
import React from 'react';

export default function NotificacionesPanel({
  setActive,
  notesAll = [],
  unreadCount = 0,
  notesMode,
  setNotesMode,
  noteFilter,
  setNoteFilter,
  readSet = new Set(),
  favSet = new Set(),
  toggleRead,
  toggleFav,
  removeNote,
  expanded = new Set(),
  toggleExpand
}) {
  return (
    <div className="notes-wrap">
      <div className="notes-card">

        {/* Header */}
        <div className="notes-header">
          <h2 className="notes-title">
            Notificaciones{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </h2>

          <div className="notes-toolbar">

            {/* Selector de modo */}
            <div className="pill-group">
              <button
                className={"pill" + (notesMode === "all" ? " is-active" : "")}
                onClick={() => setNotesMode("all")}
              >
                Todos
              </button>

              <button
                className={"pill" + (notesMode === "fav" ? " is-active" : "")}
                onClick={() => setNotesMode("fav")}
              >
                ⭐ Favoritos
              </button>

              <button
                className={"pill" + (notesMode === "unread" ? " is-active" : "")}
                onClick={() => setNotesMode("unread")}
              >
                No leídas
              </button>
            </div>

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

        {/* Buscador */}
        <div className="notes-search">
          <label style={{ alignSelf: "center" }}>Filtrar:&nbsp;</label>
          <input
            className="notes-input"
            type="text"
            value={noteFilter}
            onChange={(e) => setNoteFilter(e.target.value)}
            placeholder="Ej: Matemáticas, inscripción, 01/2025…"
          />
        </div>

        {/* Listado */}
        <div>
          {notesAll.length === 0 ? (
            <p>No hay notificaciones para mostrar.</p>
          ) : (
            notesAll.map((n) => {
              const isExpanded = expanded.has(n.id);
              const isRead = readSet.has(n.id);
              const isFav = favSet.has(n.id);

              const fecha = n.fecha
                ? new Date(n.fecha).toLocaleDateString("es-AR")
                : "—";

              return (
                <div
                  key={n.id}
                  className={
                    "note-item type-" +
                    (n.tipo || "general") +
                    (isRead ? "" : " unread")
                  }
                >
                  {/* Encabezado */}
                  <div className="note-head">

                    {/* Favorito */}
                    <button
                      className={"note-fav-btn" + (isFav ? " is-on" : "")}
                      onClick={() => toggleFav(n.id)}
                      title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <img
                        src={isFav ? "/favorito.png" : "/nofavorito.png"}
                        alt={isFav ? "Favorito" : "No favorito"}
                        className="note-fav-icon"
                      />
                    </button>

                    {/* Título y fecha */}
                    <div className="note-title">{n.titulo || "Sin título"}</div>
                    <div className="note-date">{fecha}</div>

                    {/* Acciones */}
                    <div className="note-actions">
                      {/* Marcar leída */}
                      <button
                        className="note-icon-btn"
                        onClick={() => toggleRead(n.id)}
                        title={isRead ? "Leída" : "No leída"}
                      >
                        <img
                          src={isRead ? "/leido.png" : "/noleido.png"}
                          alt={isRead ? "Leída" : "No leída"}
                          className="note-status-icon"
                        />
                      </button>

                      {/* Expandir */}
                      <button
                        className="note-icon-btn"
                        onClick={() => toggleExpand(n.id)}
                        title={isExpanded ? "Ver menos" : "Ver más"}
                        aria-label={isExpanded ? "Ver menos" : "Ver más"}
                      >
                        <img
                          src={isExpanded ? "/vermenos.png" : "/vermas.png"}
                          alt=""
                          className="note-eye-icon"
                        />
                      </button>

                      {/* Eliminar */}
                      <button
                        className="note-btn danger"
                        onClick={() => removeNote(n.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="note-detail">
                      {n.detalle || "Sin detalle."}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
