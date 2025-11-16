import React, { useState, useEffect } from "react";
import "../../styles/Administrador.css";
import { apiGet, apiPost } from "../../lib/api";

const Comunicaciones = () => {
  const [carreras, setCarreras] = useState([]);
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeFeedback, setMensajeFeedback] = useState("");

  const [emailsDestinatarios, setEmailsDestinatarios] = useState(
    "Seleccione filtros para ver destinatarios."
  );

  const [filtros, setFiltros] = useState({
    carrera: "Todas",
    comision: "Todas",
  });

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  // =======================
  // 1) Carga inicial filtros
  // =======================
  useEffect(() => {
    const fetchDatosIniciales = async () => {
      setLoading(true);
      try {
        const materiasData = await apiGet("/gestion/materias");
        const nombresMaterias = ["Todas", ...materiasData.map((m) => m.nombre)];
        setCarreras(nombresMaterias);

        const comisionesData = await apiGet("/gestion/comisiones/letras");
        setComisiones(comisionesData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setMensajeFeedback(`🔴 Error de carga: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosIniciales();
  }, []);

  // =======================
  // 2) Carga de emails según filtros
  // =======================
  useEffect(() => {
    if (loading) return;

    const fetchEmailsFiltrados = async () => {
      const { carrera, comision } = filtros;

      setEmailsDestinatarios("Cargando lista de correos...");

      try {
        const query = `?carrera=${encodeURIComponent(
          carrera
        )}&comision=${encodeURIComponent(comision)}`;

        const emails = await apiGet(`/gestion/alumnos/emails${query}`);

        if (Array.isArray(emails) && emails.length > 0) {
          setEmailsDestinatarios(emails.join(", "));
        } else if (carrera === "Todas" && comision === "Todas") {
          setEmailsDestinatarios(
            "No se encontraron alumnos matriculados en el sistema."
          );
        } else {
          setEmailsDestinatarios(
            "No se encontraron alumnos con esos filtros."
          );
        }
      } catch (error) {
        console.error("Error al cargar emails filtrados:", error);
        setEmailsDestinatarios(
          `🔴 Error al cargar emails: ${error.message.substring(0, 50)}...`
        );
      }
    };

    fetchEmailsFiltrados();
  }, [filtros, loading]);

  // =======================
  // Handlers
  // =======================
  const handleFiltroChange = (e) => {
    setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMensajeChange = (e) => setMensaje(e.target.value);
  const handleTituloChange = (e) => setTitulo(e.target.value);

  // =======================
  // 3) Enviar comunicado
  // =======================
  const handleEnviar = async () => {
    if (titulo.trim() === "" || mensaje.trim() === "") {
      setMensajeFeedback("⚠️ El título y el mensaje no pueden estar vacíos.");
      return;
    }

    if (
      emailsDestinatarios.startsWith("No se encontraron") ||
      emailsDestinatarios.startsWith("Cargando") ||
      emailsDestinatarios.startsWith("🔴")
    ) {
      setMensajeFeedback(
        "⚠️ No se puede enviar el comunicado porque no hay destinatarios válidos o la lista no ha cargado."
      );
      return;
    }

    setLoading(true);
    setMensajeFeedback("Enviando comunicado...");

    try {
      const data = await apiPost("/gestion/comunicado", {
        carrera: filtros.carrera,
        comision: filtros.comision,
        titulo,
        mensaje,
      });

      setMensajeFeedback(`✅ ${data.mensaje}`);
      setFiltros({ carrera: "Todas", comision: "Todas" });
      setTitulo("");
      setMensaje("");
    } catch (error) {
      console.error("Error al enviar comunicado:", error);

      if (error.message.includes("401")) {
        setMensajeFeedback("🔴 Error de autenticación. Sesión expirada.");
      } else {
        setMensajeFeedback(
          `🔴 Error: ${error.message || "Error desconocido al enviar."}`
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMensajeFeedback(""), 5000);
    }
  };

  // =======================
  // 4) Render
  // =======================
  if (loading && carreras.length === 0) {
    return (
      <main className="contenido-gestion">
        <p>Cargando filtros y datos iniciales...</p>
      </main>
    );
  }

  return (
    <main className="contenido-gestion">
      <h2 className="titulo-gestion">Emitir Comunicado</h2>

      <div className="panel-emision-comunicado">
        <div className="formulario-comunicado">
          <h3 className="subtitulo-destinatario">
            Elegir Destinatario/s{" "}
            <span className="leyenda-filtro">
              (filtrado por materia y comisión)
            </span>
          </h3>

          <div className="filtros-comunicado dos-filtros">
            <div className="campo-simple">
              <label
                htmlFor="carrera-filtro"
                className="label-filtro"
              >
                Materia Principal:
              </label>
              <select
                name="carrera"
                className="input-filtro"
                value={filtros.carrera}
                onChange={handleFiltroChange}
                disabled={loading}
              >
                {carreras.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-simple">
              <label
                htmlFor="comision-filtro"
                className="label-filtro"
              >
                Comisión:
              </label>
              <select
                name="comision"
                className="input-filtro"
                value={filtros.comision}
                onChange={handleFiltroChange}
                disabled={loading}
              >
                {comisiones.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="campo-emails">
            <label className="label-mensaje">Emails destinatarios:</label>
            <p
              className="emails-lista"
              style={{
                fontSize: "0.9em",
                color: emailsDestinatarios.startsWith("🔴")
                  ? "red"
                  : emailsDestinatarios.startsWith("Cargando")
                  ? "#ccc"
                  : "#e0e0e0",
                marginBottom: "10px",
                wordBreak: "break-all",
                maxHeight: "100px",
                overflowY: "auto",
                padding: "8px",
                border: "1px solid #555",
                borderRadius: "4px",
                background: "#333",
              }}
            >
              {emailsDestinatarios}
            </p>
          </div>

          <div className="caja-mensaje">
            <div className="campo-simple">
              <label
                htmlFor="titulo-comunicado"
                className="label-mensaje"
              >
                Título del Comunicado:
              </label>
              <input
                type="text"
                className="input-filtro"
                value={titulo}
                onChange={handleTituloChange}
                disabled={loading}
                maxLength={160}
              />
            </div>

            <label
              htmlFor="mensaje-comunicado"
              className="label-mensaje"
            >
              Escribe tu mensaje aquí:
            </label>
            <textarea
              className="textarea-comunicado"
              rows="10"
              value={mensaje}
              onChange={handleMensajeChange}
              disabled={loading}
            ></textarea>

            {mensajeFeedback && (
              <p
                className="mensaje-feedback"
                style={{
                  color: mensajeFeedback.startsWith("✅")
                    ? "green"
                    : mensajeFeedback.startsWith("🔴") ||
                      mensajeFeedback.startsWith("⚠️")
                    ? "red"
                    : "inherit",
                  fontWeight: "bold",
                }}
              >
                {mensajeFeedback}
              </p>
            )}

            <button
              className="boton-enviar"
              onClick={handleEnviar}
              disabled={
                loading ||
                mensajeFeedback.startsWith("⚠️") ||
                mensajeFeedback.startsWith("🔴") ||
                emailsDestinatarios.startsWith("Cargando")
              }
            >
              {loading ? "Enviando..." : "Enviar Comunicado"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Comunicaciones;