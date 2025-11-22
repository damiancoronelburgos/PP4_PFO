import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../../lib/api";

export default function AlumnoNotificaciones({
  setActive,
  notificaciones,
  setNotificaciones,
}) {
  const [noteFilter, setNoteFilter] = useState("");
  const [notesMode, setNotesMode] = useState("all");

  // ------------------------
  // LocalStorage PERSONAL
  // ------------------------
  const STORAGE_KEY_DISMISSED = `notes_dismissed_alumno`;
  const STORAGE_KEY_READ = `notes_read_alumno`;
  const STORAGE_KEY_FAV = `notes_fav_alumno`;

  const [dismissed, setDismissed] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem(STORAGE_KEY_DISMISSED) || "[]")
      );
    } catch {
      return new Set();
    }
  });

  const [readSet, setReadSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_READ) || "[]"));
    } catch {
      return new Set();
    }
  });

  const [favSet, setFavSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || "[]"));
    } catch {
      return new Set();
    }
  });

  // ------------------------
  // RECARGAR DESDE BACKEND (una sola vez)
  // ------------------------
  useEffect(() => {
    apiGet("/api/alumnos/me/notificaciones")
      .then((data) => {
        setNotificaciones(data || []);
      })
      .catch((err) => {
        console.error("Error cargando notificaciones:", err);
      });
  }, []);

  // ------------------------
  // FILTRO PRINCIPAL
  // ------------------------
  const notesAll = useMemo(() => {
    const q = noteFilter.trim().toLowerCase();

    let arr = notificaciones.filter((n) => {
      if (dismissed.has(n.id)) return false;

      if (q) {
        const text =
          `${n.titulo || ""} ${n.detalle || ""} ${n.fecha || ""}`;
        if (!text.toLowerCase().includes(q)) return false;
      }

      return true;
    });

    if (notesMode === "fav") arr = arr.filter((n) => favSet.has(n.id));
    else if (notesMode === "unread") arr = arr.filter((n) => !readSet.has(n.id));

    arr.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return arr;
  }, [noteFilter, notesMode, dismissed, notificaciones, favSet, readSet]);

  const unreadCount = useMemo(
    () => notesAll.filter((n) => !readSet.has(n.id)).length,
    [notesAll, readSet]
  );

  // ------------------------
  // MARCAR COMO LEÍDA
  // ------------------------
  const markAsRead = (id) => {
    if (readSet.has(id)) return;

    const next = new Set(readSet);
    next.add(id);
    setReadSet(next);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...next]));

    // ⭐ Actualiza sidebar
    setNotificaciones([...notificaciones]);
  };

  const toggleRead = (id) => {
    const next = new Set(readSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setReadSet(next);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...next]));

    // ⭐ Actualiza sidebar
    setNotificaciones([...notificaciones]);
  };

  // ------------------------
  // FAVORITOS
  // ------------------------
  const toggleFav = (id) => {
    const next = new Set(favSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setFavSet(next);
    localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify([...next]));

    // ⭐
    setNotificaciones([...notificaciones]);
  };

  // ------------------------
  // ELIMINAR (visual)
  // ------------------------
  const removeNote = (id) => {
    const ok = window.confirm("¿Eliminar esta notificación?");
    if (!ok) return;

    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem(
      STORAGE_KEY_DISMISSED,
      JSON.stringify([...next])
    );

    //  Forzar actualización
    setNotificaciones([...notificaciones]);
  };

  // ------------------------
  // EXPANDIR
  // ------------------------
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (id) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setExpanded(next);
    markAsRead(id);
  };

  return (
    <div className="notes-wrap">
      <div className="notes-card">
        <div className="notes-header">
          <h2 className="notes-title">
            Notificaciones
            {unreadCount > 0 ? ` (${unreadCount})` : ""}
          </h2>

          <div className="notes-toolbar">
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
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="notes-search">
          <label>Filtrar:&nbsp;</label>
          <input
            className="notes-input"
            type="text"
            value={noteFilter}
            onChange={(e) => setNoteFilter(e.target.value)}
            placeholder="Ej: Matemáticas, inscripción, 01/2025…"
          />
        </div>

        {/* LISTA */}
        <div>
          {notesAll.length === 0 ? (
            <p>No hay notificaciones para mostrar.</p>
          ) : (
            notesAll.map((n) => {
              const isExpanded = expanded.has(n.id);
              const isRead = readSet.has(n.id);
              const isFav = favSet.has(n.id);

              const fecha = new Date(n.fecha).toLocaleDateString("es-AR");

              return (
                <div
                  key={n.id}
                  className={
                    "note-item type-" +
                    (n.tipo || "general") +
                    (isRead ? "" : " unread")
                  }
                >
                  <div className="note-head">
                    <button
                      className={"note-fav-btn" + (isFav ? " is-on" : "")}
                      onClick={() => toggleFav(n.id)}
                    >
                      <img
                        src={isFav ? "/favorito.png" : "/nofavorito.png"}
                        className="note-fav-icon"
                        alt=""
                      />
                    </button>

                    <div className="note-title">{n.titulo}</div>
                    <div className="note-date">{fecha}</div>

                    <div className="note-actions">
                      <button
                        className="note-icon-btn"
                        onClick={() => toggleRead(n.id)}
                      >
                        <img
                          src={isRead ? "/leido.png" : "/noleido.png"}
                          className="note-status-icon"
                        />
                      </button>

                      <button
                        className="note-icon-btn"
                        onClick={() => toggleExpand(n.id)}
                      >
                        <img
                          src={isExpanded ? "/vermenos.png" : "/vermas.png"}
                          className="note-eye-icon"
                        />
                      </button>

                      <button
                        className="note-btn danger"
                        onClick={() => removeNote(n.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="note-detail">{n.detalle}</div>
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
