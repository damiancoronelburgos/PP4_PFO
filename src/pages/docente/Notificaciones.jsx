import React, { useState } from "react";
import "../../styles/docente.css";

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([
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
      favorito: true,
      visto: true,
    },
    {
      id: 3,
      titulo: "Actualización del Sistema",
      mensaje: "El sistema se actualizará el sábado a las 23:00 hs.",
      fecha: "2025-10-12",
      favorito: false,
      visto: false,
    },
  ]);

  const [buscar, setBuscar] = useState("");
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [filtroVistos, setFiltroVistos] = useState("todos");

  const toggleFavorito = (id) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, favorito: !n.favorito } : n
      )
    );
  };

  const toggleVisto = (id) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, visto: !n.visto } : n
      )
    );
  };

  const notificacionesFiltradas = notificaciones.filter((n) => {
    const coincideBusqueda =
      n.titulo.toLowerCase().includes(buscar.toLowerCase()) ||
      n.mensaje.toLowerCase().includes(buscar.toLowerCase());
    const coincideFavorito = !soloFavoritos || n.favorito;
    const coincideVisto =
      filtroVistos === "todos"
        ? true
        : filtroVistos === "vistos"
        ? n.visto
        : !n.visto;
    return coincideBusqueda && coincideFavorito && coincideVisto;
  });

  return (
    <div className="docente-vista">
      <h2 className="titulo-seccion">Notificaciones</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por palabra..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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

      <div className="lista-notificaciones">
        {notificacionesFiltradas.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            No se encontraron notificaciones.
          </p>
        ) : (
          notificacionesFiltradas.map((n) => (
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
                  onClick={() => toggleFavorito(n.id)}
                  title={
                    n.favorito
                      ? "Quitar de favoritos"
                      : "Marcar como favorito"
                  }
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
