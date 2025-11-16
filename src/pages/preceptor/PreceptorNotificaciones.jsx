import React from "react";

export default function PreceptorNotificaciones({
  notisVisibles,
  notiFilter,
  setNotiFilter,
  unreadCount,
  notiQuery,
  setNotiQuery,
  toggleFav,
  fmtFechaHora,
  toggleLeida,
  eliminarNoti,
  onVolver,
}) {
  return (
    <div className="notes-wrap">
      <div className="notes-card">
        <div className="notes-header">
          <h1 className="notes-title">Notificaciones</h1>
          <div className="notes-toolbar">
            <div className="pill-group" role="tablist" aria-label="Filtro">
              <button
                className={
                  "pill" + (notiFilter === "todas" ? " is-active" : "")
                }
                onClick={() => setNotiFilter("todas")}
              >
                Todos
              </button>
              <button
                className={
                  "pill" + (notiFilter === "favoritas" ? " is-active" : "")
                }
                onClick={() => setNotiFilter("favoritas")}
              >
                ★ Favoritos
              </button>
              <button
                className={
                  "pill" + (notiFilter === "no-leidas" ? " is-active" : "")
                }
                onClick={() => setNotiFilter("no-leidas")}
              >
                No leídas
              </button>
            </div>
            <div className="badge badge--alert" title="Sin leer">
              <span className="badge-dot" /> {unreadCount} sin leer
            </div>
            <button className="note-btn" onClick={onVolver}>
              Volver
            </button>
          </div>
        </div>

        <div className="notes-search">
          <span className="notes-label">Filtrar:</span>
          <input
            className="notes-input"
            placeholder="Ej: Matemáticas, inscripción, 01/2025..."
            value={notiQuery}
            onChange={(e) => setNotiQuery(e.target.value)}
          />
        </div>

        <div>
          {notisVisibles.map((n) => (
            <div
              key={n.id}
              className={"note-item" + (n.leida ? "" : " unread")}
            >
              <div className="note-head">
                <button
                  className="note-fav-btn"
                  title={
                    n.fav ? "Quitar de favoritos" : "Marcar como favorito"
                  }
                  onClick={() => toggleFav(n.id)}
                >
                  {n.fav ? "★" : "☆"}
                </button>
                <h3 className="note-title">{n.titulo}</h3>
                <div className="note-date">{fmtFechaHora(n.fecha)}</div>
                <div className="note-actions">
                  {n.link && (
                    <button
                      className="note-btn"
                      onClick={() => window.open(n.link, "_blank")}
                    >
                      Ver
                    </button>
                  )}
                  <button
                    className="note-btn"
                    title={
                      n.leida ? "Marcar como no leída" : "Marcar como leída"
                    }
                    onClick={() => toggleLeida(n.id)}
                  >
                    {n.leida ? "Marcar no leída" : "Marcar leída"}
                  </button>
                  <button
                    className="note-btn danger"
                    onClick={() => eliminarNoti(n.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {n.texto && <div className="note-detail">{n.texto}</div>}
            </div>
          ))}

          {notisVisibles.length === 0 && (
            <div className="note-item">
              <div className="note-detail">
                No hay notificaciones para mostrar.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}