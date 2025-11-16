import React, { useState, useEffect } from "react";
import "../../styles/Administrador.css";
import { apiGet, apiPost, apiPut, apiDelete } from "../../lib/api";

const initialFormState = {
  nombre: "",
  docenteId: "",
  comision: "",
  horario: "",
  cupo: 0,
};

const OfertaAcademica = () => {
  const [modo, setModo] = useState("lista");
  const [materias, setMaterias] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [accionActual, setAccionActual] = useState("agregar");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterias = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await apiGet("/ofertaAcademica");

      const formatted = data.map((m) => ({
        ...m,
        docenteId:
          m.docenteId !== null && m.docenteId !== undefined
            ? Number(m.docenteId)
            : "",
        cupo: Number(m.cupo) || 0,
      }));

      setMaterias(formatted);
    } catch (err) {
      console.error("Error al cargar materias:", err);
      setError(
        "No se pudieron cargar las materias. Verifique la conexión con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if ((name === "cupo" || name === "docenteId") && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "cupo" || name === "docenteId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAbrirFormulario = (accion, materia = null) => {
    setAccionActual(accion);
    setModo("formulario");

    if (accion === "modificar" && materia) {
      setFormData({
        nombre: materia.nombre || "",
        docenteId:
          materia.docenteId !== null && materia.docenteId !== undefined
            ? materia.docenteId
            : "",
        comision: materia.comision || "",
        horario: materia.horario || "",
        cupo: materia.cupo || 0,
      });
      setMateriaSeleccionada(materia.id);
    } else {
      setFormData(initialFormState);
      setMateriaSeleccionada(null);
    }
  };

  const handleModificarSeleccionada = () => {
    const selected = materias.find((m) => m.id === materiaSeleccionada);
    if (selected) {
      handleAbrirFormulario("modificar", selected);
    } else {
      alert("Por favor, selecciona una materia para modificar.");
    }
  };

  const handleSubmitForm = async () => {
    if (!formData.nombre.trim()) {
      alert("El Nombre de la materia es obligatorio.");
      return;
    }

    const dataToSend = {
      nombre: formData.nombre,
      docenteId: formData.docenteId === "" ? null : formData.docenteId,
      comision: formData.comision,
      horario: formData.horario,
      cupo: formData.cupo || 0,
    };

    try {
      if (accionActual === "agregar") {
        await apiPost("/ofertaAcademica", dataToSend);
      } else {
        await apiPut(`/ofertaAcademica/${materiaSeleccionada}`, dataToSend);
      }

      await fetchMaterias();
      setModo("lista");
      setFormData(initialFormState);
      setMateriaSeleccionada(null);
    } catch (err) {
      console.error(`Error al ${accionActual} la materia:`, err);
      alert(`Ocurrió un error: ${err.message}`);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta materia?")) {
      return;
    }

    try {
      await apiDelete(`/ofertaAcademica/${id}`);
      await fetchMaterias();
      setMateriaSeleccionada(null);
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert(`Ocurrió un error al intentar eliminar: ${err.message}`);
    }
  };

  const handleSeleccionarFila = (id) => {
    setMateriaSeleccionada(materiaSeleccionada === id ? null : id);
  };

  if (cargando) {
    return (
      <main className="contenido-gestion">
        <h2 className="titulo-gestion">Cargando datos del servidor...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="contenido-gestion">
        <h2 className="titulo-gestion" style={{ color: "red" }}>
          Error de Conexión: {error}
        </h2>
      </main>
    );
  }

  const renderFormulario = () => (
    <div className="formulario-gestion">
      <div
        className="campos-labels"
        style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        <span className="label-col">Nombre</span>
        <span className="label-col">Docente ID</span>
        <span className="label-col">Comisión</span>
        <span className="label-col">Horario</span>
        <span className="label-col">Cupo</span>
      </div>

      <div
        className="campos-grid"
        style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          className="campo-texto"
          value={formData.nombre}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="docenteId"
          placeholder="Docente ID"
          className="campo-texto"
          value={formData.docenteId}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="comision"
          placeholder="Comisión"
          className="campo-texto"
          value={formData.comision}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="horario"
          placeholder="Horario"
          className="campo-texto"
          value={formData.horario}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="cupo"
          placeholder="Cupo"
          className="campo-texto"
          value={formData.cupo}
          onChange={handleInputChange}
        />
      </div>

      <button className="boton-volver" onClick={handleSubmitForm}>
        {accionActual === "agregar"
          ? "Confirmar Agregar"
          : "Guardar Modificación"}
      </button>
      <button
        className="boton-eliminar"
        style={{ right: "auto", left: "30px", top: "auto", bottom: "30px" }}
        onClick={() => setModo("lista")}
      >
        Cancelar
      </button>
    </div>
  );

  const renderLista = () => (
    <div className="formulario-gestion">
      <div
        className="campos-labels"
        style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        <span className="label-col">Nombre</span>
        <span className="label-col">Docente ID</span>
        <span className="label-col">Comisión</span>
        <span className="label-col">Horario</span>
        <span className="label-col">Cupo</span>
      </div>

      {materias.map((materia) => (
        <div
          key={materia.id}
          className={`campos-grid fila-materia ${
            materia.id === materiaSeleccionada ? "seleccionado" : ""
          }`}
          onClick={() => handleSeleccionarFila(materia.id)}
          style={{
            marginBottom: "10px",
            padding: "10px",
            background:
              materia.id === materiaSeleccionada
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
            color: "white",
            cursor: "pointer",
            gridTemplateColumns: "repeat(5, 1fr)",
          }}
        >
          <span>{materia.nombre}</span>
          <span>{materia.docenteId || "—"}</span>
          <span>{materia.comision}</span>
          <span>{materia.horario}</span>
          <span>{materia.cupo}</span>
        </div>
      ))}
    </div>
  );

  return (
    <main className="contenido-gestion">
      <header className="cabecera-instituto">
        <div className="logo-instituto"></div>
        <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
      </header>

      <h2 className="titulo-gestion">Gestión de Oferta Académica (MySQL)</h2>

      <div className="panel-acciones">
        {modo === "lista" && (
          <button
            className="boton-eliminar"
            onClick={() =>
              materiaSeleccionada && handleEliminar(materiaSeleccionada)
            }
            disabled={!materiaSeleccionada}
          >
            Eliminar
          </button>
        )}

        {modo === "lista" && (
          <div className="controles-principales">
            <button
              className="boton-accion agregar"
              onClick={() => handleAbrirFormulario("agregar")}
            >
              Agregar Materia
            </button>
            <button
              className="boton-accion modificar"
              onClick={handleModificarSeleccionada}
              disabled={!materiaSeleccionada}
            >
              Modificar
            </button>
          </div>
        )}

        {modo === "lista" ? renderLista() : renderFormulario()}
      </div>
    </main>
  );
};

export default OfertaAcademica;