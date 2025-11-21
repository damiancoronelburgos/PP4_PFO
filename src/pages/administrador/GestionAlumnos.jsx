import React, { useState, useEffect } from "react";
import "../../styles/Administrador.css";
import { apiGet, apiPost, apiPut, apiDelete } from "../../lib/api";

// Estado inicial del formulario
const initialFormState = {
  dni: "",
  nombre: "",
  apellido: "",
  materia_id: 0, // Se mantiene para el select y para la acción "modificar"
  telefono: "",
  email: "",
};

const GestionAlumnos = () => {
  const [modo, setModo] = useState("lista");
  const [alumnos, setAlumnos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [accionActual, setAccionActual] = useState("agregar");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);

  // Carga de materias
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const data = await apiGet("/gestion/materias");
        setMateriasDisponibles(data);
      } catch (err) {
        console.error("Error al cargar materias:", err);
      }
    };
    fetchMaterias();
  }, []);

  // Carga de alumnos (read)
  const fetchAlumnos = async () => {
    try {
      const data = await apiGet("/gestion/alumnos");
      setAlumnos(data);
    } catch (err) {
      console.error("Error al cargar alumnos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial de alumnos
  useEffect(() => {
    fetchAlumnos();
  }, []);

  // Manejo de inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "dni" && value && !/^\d*$/.test(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAbrirFormulario = (accion, alumno = null) => {
    setAccionActual(accion);
    setModo("formulario");

    if (accion === "modificar" && alumno) {
      const materia = materiasDisponibles.find(
        (m) => m.nombre === alumno.nombre_materia
      );

      setFormData({
        dni: alumno.dni || "",
        nombre: alumno.nombre || "",
        apellido: alumno.apellido || "",
        telefono: alumno.telefono || "",
        email: alumno.email || "",
        materia_id: materia ? materia.id : 0, 
      });
      setAlumnoSeleccionado(alumno.id);
    } else {
      setFormData(initialFormState);
      setAlumnoSeleccionado(null);
    }
  };

  // Guardar (crear / modificar)
  const handleSubmitForm = async () => {
    // CAMBIO CLAVE: Solo DNI, Nombre y Apellido son obligatorios
    if (!formData.dni || !formData.nombre || !formData.apellido) {
      alert("DNI, Nombre y Apellido son obligatorios.");
      return;
    }

    // Datos base para enviar
    let dataToSend = {
      dni: formData.dni,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      email: formData.email,
    };

    try {
      if (accionActual === "agregar") {
        // En POST, el backend ahora ignora materia_id y solo crea el alumno.
        await apiPost("/gestion/alumnos", dataToSend);
        
        // Mensaje de éxito actualizado
        alert("✅ Alumno agregado exitosamente. Pendiente de asignación de curso.");

      } else {
        // En PUT, sí se envía materia_id para actualizar la inscripción si es necesario
        dataToSend.materia_id = parseInt(formData.materia_id);
        
        await apiPut(`/gestion/alumnos/${alumnoSeleccionado}`, dataToSend);
        alert("✅ Alumno modificado exitosamente.");
      }

      await fetchAlumnos();
      setModo("lista");
      setFormData(initialFormState);
      setAlumnoSeleccionado(null);
    } catch (err) {
      console.error("Error en CRUD alumnos:", err);
      // Mensaje genérico de error
      alert(`🔴 Error al guardar: ${err.message || "Error de servidor"}.`);
    }
  };

  // Eliminar alumno (sin cambios)
  const handleEliminar = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este alumno y todos sus registros?"
      )
    ) {
      return;
    }

    try {
      await apiDelete(`/gestion/alumnos/${id}`);
      await fetchAlumnos();
      setAlumnoSeleccionado(null);
    } catch (err) {
      console.error("Error al eliminar alumno:", err);
      alert(`Error al eliminar: ${err.message || "Error de servidor"}`);
    }
  };

  const handleSeleccionarFila = (id) => {
    setAlumnoSeleccionado(alumnoSeleccionado === id ? null : id);
  };

  // --- FORMULARIO CORREGIDO VISUALMENTE ---
  const renderFormulario = () => (
    <div className="formulario-gestion" style={{ padding: "20px" }}>
      <h3 style={{ color: "white", marginBottom: "15px", textAlign: "center" }}>
        {accionActual === "agregar" ? "Agregar Nuevo Alumno" : "Modificar Alumno"}
      </h3>
      
      {/* Grid de 3 columnas para que se vea bien */}
      <div
        className="campos-grid"
        style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "15px",
            marginBottom: "20px"
        }}
      >
        <div className="campo-grupo">
            <label style={{color:"#ccc", fontSize:"0.9em"}}>DNI *</label>
            <input
            type="text"
            name="dni"
            placeholder="Ej: 12345678"
            className="campo-texto"
            style={{width: "100%"}}
            value={formData.dni}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="campo-grupo">
            <label style={{color:"#ccc", fontSize:"0.9em"}}>Nombre *</label>
            <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            className="campo-texto"
            style={{width: "100%"}}
            value={formData.nombre}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="campo-grupo">
            <label style={{color:"#ccc", fontSize:"0.9em"}}>Apellido *</label>
            <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            className="campo-texto"
            style={{width: "100%"}}
            value={formData.apellido}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="campo-grupo">
            <label style={{color:"#ccc", fontSize:"0.9em"}}>Teléfono</label>
            <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            className="campo-texto"
            style={{width: "100%"}}
            value={formData.telefono}
            onChange={handleInputChange}
            />
        </div>

        <div className="campo-grupo">
            <label style={{color:"#ccc", fontSize:"0.9em"}}>Email</label>
            <input
            type="email"
            name="email"
            placeholder="Email"
            className="campo-texto"
            style={{width: "100%"}}
            value={formData.email}
            onChange={handleInputChange}
            />
        </div>

        <div className="campo-grupo">
            {/* El curso ahora solo es relevante al MODIFICAR al alumno, ya que la creación es separada. */}
            <label style={{color:"#ccc", fontSize:"0.9em"}}>
                Curso (Solo aplica a Modificar)
            </label>
            <select
            name="materia_id"
            className="campo-texto"
            style={{width: "100%"}}
            // Si es agregar, el valor 0 significa "sin curso seleccionado"
            value={formData.materia_id.toString()}
            onChange={handleInputChange}
            >
            <option value="0">Sin curso asignado</option>
            {materiasDisponibles.map((materia) => (
                <option key={materia.id} value={materia.id}>
                {materia.nombre}
                </option>
            ))}
            </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button className="boton-volver" onClick={handleSubmitForm} style={{ position: "static" }}>
            {accionActual === "agregar" ? "Confirmar Agregar Alumno" : "Guardar Modificación"}
        </button>
        <button
            className="boton-eliminar"
            style={{ position: "static", backgroundColor: "#666" }}
            onClick={() => setModo("lista")}
        >
            Cancelar
        </button>
      </div>
    </div>
  );

  const renderLista = () => (
    <div className="formulario-gestion">
      <div
        className="campos-labels"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <span className="label-col">DNI</span>
        <span className="label-col">Nombre</span>
        <span className="label-col">Apellido</span>
        <span className="label-col">Curso</span>
      </div>

      {alumnos.length > 0 ? (
        alumnos.map((alumno) => (
          <div
            key={alumno.id}
            className={`campos-grid fila-alumno ${
              alumno.id === alumnoSeleccionado ? "seleccionado" : ""
            }`}
            onClick={() => handleSeleccionarFila(alumno.id)}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background:
                alumno.id === alumnoSeleccionado
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              color: "white",
              cursor: "pointer",
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            <span>{alumno.dni}</span>
            <span>{alumno.nombre}</span>
            <span>{alumno.apellido}</span>
            <span>{alumno.nombre_materia || "Sin Asignar"}</span>
          </div>
        ))
      ) : (
        <p style={{ color: "white", textAlign: "center", padding: "20px" }}>
          No hay alumnos registrados.
        </p>
      )}
    </div>
  );

  return (
    <main className="contenido-gestion">
      <header className="cabecera-instituto">
        <div className="logo-instituto"></div>
        <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
      </header>

      <h2 className="titulo-gestion">Gestionar Alumnos</h2>

      <div className="panel-acciones" style={{ position: "relative" }}>
        {isLoading ? (
          <p style={{ color: "white", textAlign: "center", padding: "50px" }}>
            Cargando datos...
          </p>
        ) : (
          <>
            {modo === "lista" && (
              <div className="controles-principales">
                <button
                  className="boton-accion agregar"
                  onClick={() => handleAbrirFormulario("agregar")}
                >
                  Agregar alumno
                </button>

                <button
                  className="boton-accion modificar"
                  onClick={() => {
                    const selected = alumnos.find((a) => a.id === alumnoSeleccionado);
                    if (selected) handleAbrirFormulario("modificar", selected);
                    else alert("Por favor, selecciona un alumno para modificar.");
                  }}
                  disabled={!alumnoSeleccionado}
                >
                  Modificar
                </button>

                <button
                  className="boton-accion eliminar"
                  onClick={() =>
                    alumnoSeleccionado && handleEliminar(alumnoSeleccionado)
                  }
                  disabled={!alumnoSeleccionado}
                  style={{ position: "absolute", top: "20px", right: "20px" }}
                >
                  Eliminar
                </button>
              </div>
            )}

            {modo === "lista" ? renderLista() : renderFormulario()}
          </>
        )}
      </div>
    </main>
  );
};

export default GestionAlumnos;