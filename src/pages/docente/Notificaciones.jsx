import React, { useState, useEffect, useMemo } from "react";
import "../../styles/docente.css";
import { api } from "../../lib/api";

const MOCK_NOTIS = [
  {
    id: 1,
    titulo: "Entrega de Actas de Cursada",
    mensaje: "Recordá entregar las actas de cursada antes del viernes.",
    fecha: "2025-10-10",
    favorito: false,
    visto: false,
  },
  {
    id: 2,
    titulo: "Nueva Comisión Asignada",
    mensaje: "Se te asignó la comisión 2B de Programación I.",
    fecha: "2025-10-11",
    favorito: true, // ya viene favorita
    visto: true,    // ya viene vista
  },
  {
    id: 3,
    titulo: "Actualización del Sistema",
    mensaje: "El sistema se actualizará el sábado a las 23:00 hs.",
    fecha: "2025-10-12",
    favorito: false,
    visto: false,
  },
];

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState(MOCK_NOTIS);
  const [busqueda, setBusqueda] = useState("");
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [filtroVistos, setFiltroVistos] = useState("todos"); // todos | vistos | noVistos
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar notificaciones reales desde el backend (salvo en modo test)
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;

    const loadNotificaciones = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const data = await api.get("/notificaciones/me");

        const mapped = (Array.isArray(data) ? data : []).map((n) => ({
          id: n.id,
          titulo: n.titulo,
          mensaje: n.detalle || "",
          fecha: n.fecha || n.fecha_local || "",
          favorito: Boolean(n.favorito),
          visto: Boolean(n.leida),
        }));

        if (mapped.length > 0) {
          setNotificaciones(mapped);
        } else {
          setNotificaciones([]);
        }
      } catch (err) {
        console.error("Error cargando notificaciones docente:", err);
        setErrorMsg("Error al cargar las notificaciones.");
      } finally {
        setLoading(false);
      }
    };

    loadNotificaciones();
  }, []);

  const toggleFavorito = async (id) => {
    // Actualizamos UI primero
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, favorito: !n.favorito } : n
      )
    );

    if (import.meta.env.MODE === "test") return;

    try {
      const actual = notificaciones.find((n) => n.id === id);
      const nuevoFav = !(actual?.favorito);
      await api.patch(`/notificaciones/me/${id}`, { favorito: nuevoFav });
    } catch (err) {
      console.error("Error actualizando favorito:", err);
      // Opcional: podrías revertir el cambio en caso de error
    }
  };

  const toggleVisto = async (id) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, visto: !n.visto } : n
      )
    );

    if (import.meta.env.MODE === "test") return;

    try {
      const actual = notificaciones.find((n) => n.id === id);
      const nuevoVisto = !(actual?.visto);
      await api.patch(`/notificaciones/me/${id}`, { leida: nuevoVisto });
    } catch (err) {
      console.error("Error actualizando estado visto:", err);
    }
  };

  const notisFiltradas = useMemo(() => {
    return notificaciones.filter((n) => {
      const q = busqueda.trim().toLowerCase();
      if (q) {
        const text = `${n.titulo} ${n.mensaje} ${n.fecha}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      if (soloFavoritos && !n.favorito) return false;

      if (filtroVistos === "vistos" && !n.visto) return false;
      if (filtroVistos === "noVistos" && n.visto) return false;

      return true;
    });
  }, [notificaciones, busqueda, soloFavoritos, filtroVistos]);

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Notificaciones</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por palabra..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={soloFavoritos}
            onChange={(e) => setSoloFavoritos(e.target.checked)}
          />
          ⭐ Favoritos
        </label>

        <select
          value={filtroVistos}
          onChange={(e) => setFiltroVistos(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="vistos">Vistos</option>
          <option value="noVistos">No vistos</option>
        </select>
      </div>

      {errorMsg && <p className="mensaje-error">{errorMsg}</p>}
      {loading && <p className="mensaje-info">Cargando notificaciones...</p>}

      <div className="lista-notificaciones">
        {notisFiltradas.length === 0 && !loading ? (
          <p className="notificacion-mensaje">
            No hay notificaciones para mostrar.
          </p>
        ) : (
          notisFiltradas.map((n) => (
            <div
              key={n.id}
              className={`notificacion-item ${
                n.visto ? "visto" : "no-visto"
              }`}
            >
              <div className="notificacion-header">
                <h3>{n.titulo}</h3>
                <span
                  className={`estrella ${n.favorito ? "favorito" : ""}`}
                  title={
                    n.favorito
                      ? "Quitar de favoritos"
                      : "Marcar como favorito"
                  }
                  onClick={() => toggleFavorito(n.id)}
                  style={{ cursor: "pointer" }}
                >
                  {n.favorito ? "★" : "☆"}
                </span>
              </div>

              <p className="notificacion-mensaje">{n.mensaje}</p>

              <div className="notificacion-footer">
                <span className="fecha">{n.fecha}</span>
                <button
                  className={`btn-visto ${
                    n.visto ? "btn-visto-activo" : "btn-novisto"
                  }`}
                  onClick={() => toggleVisto(n.id)}
                >
                  {n.visto ? "Marcar como no visto" : "Marcar como visto"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
