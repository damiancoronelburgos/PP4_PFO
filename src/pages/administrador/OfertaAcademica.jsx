import React, { useState, useEffect } from 'react';
import "../../styles/Administrador.css";

// 🚨 La ruta base ahora apunta a la API que usa Prisma/MySQL
const API_BASE_URL = '/api/ofertaAcademica'; 

// Campos principales de Materias
const initialFormState = {
    nombre: '',
    docenteId: '', // Debe coincidir con el campo de la DB (Docente ID)
    comision: '',
    horario: '',
    cupo: 0, 
};

const OfertaAcademica = () => {
    // Estados principales
    const [modo, setModo] = useState('lista');
    const [materias, setMaterias] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [accionActual, setAccionActual] = useState('agregar');
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true); // Nuevo estado para feedback al usuario
    const [error, setError] = useState(null); // Nuevo estado para manejo de errores

    // ---------------------------------------------------
    // 2. FUNCIÓN DE CARGA INICIAL (Lee de la API)
    // ---------------------------------------------------
    const fetchMaterias = async () => {
        setCargando(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error al obtener datos: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Mapeamos los campos para asegurarnos de que 'cupo' y 'docenteId' sean números
            const formattedData = data.map(m => ({
                ...m,
                docenteId: Number(m.docente_id) || '', // Usamos docente_id si es el nombre en DB
                cupo: Number(m.cupo) || 0 
            }));
            
            setMaterias(formattedData);

        } catch (err) {
            console.error("Error al cargar materias:", err);
            setError("No se pudieron cargar las materias. Verifique la conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    // 3. EFECTO para CARGAR al inicio
    useEffect(() => {
        fetchMaterias();
    }, []); // Se ejecuta solo una vez al montar

    // 🚨 El useEffect que guardaba en localStorage se ELIMINA 🚨

    // ---------------------------------------------------
    // 4. Manejadores de Estado (No cambian)
    // ---------------------------------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if ((name === 'cupo' || name === 'docenteId') && value && !/^\d*$/.test(value)) {
            return;
        }

        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'cupo' || name === 'docenteId' ? parseInt(value) || 0 : value
        }));
    };

    const handleAbrirFormulario = (accion, materia = null) => {
        setAccionActual(accion);
        setModo('formulario');

        if (accion === 'modificar' && materia) {
            setFormData({
                nombre: materia.nombre,
                docenteId: materia.docenteId,
                comision: materia.comision,
                horario: materia.horario,
                cupo: materia.cupo,
            });
            setMateriaSeleccionada(materia.id);
        } else {
            setFormData(initialFormState);
            setMateriaSeleccionada(null);
        }
    };

    const handleModificarSeleccionada = () => {
        const selected = materias.find(m => m.id === materiaSeleccionada);
        if (selected) {
            handleAbrirFormulario('modificar', selected);
        } else {
            alert("Por favor, selecciona una materia para modificar.");
        }
    };

    // ---------------------------------------------------
    // 5. Lógica de CRUD (Usa la API)
    // ---------------------------------------------------
    const handleSubmitForm = async () => {
        if (!formData.nombre || !formData.docenteId) {
            alert("El Nombre y el ID de Docente son obligatorios.");
            return;
        }

        let url = API_BASE_URL;
        let method = 'POST';
        
        // El formato de datos enviado debe coincidir con los campos de la DB
        const dataToSend = {
            nombre: formData.nombre,
            docente_id: formData.docenteId, // Usar el nombre de la columna en la DB si es snake_case
            comision: formData.comision,
            horario: formData.horario,
            cupo: formData.cupo,
        };

        if (accionActual === 'modificar') {
            url = `${API_BASE_URL}/${materiaSeleccionada}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error en la operación: ${response.status}`);
            }

            // Después de POST/PUT exitoso, recargar los datos desde el backend
            await fetchMaterias(); 
            
            setModo('lista');
            setFormData(initialFormState);
        } catch (err) {
            console.error(`Error al ${accionActual} la materia:`, err);
            alert(`Ocurrió un error: ${err.message}`);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta materia?")) {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Error al eliminar: ${response.status}`);
                }

                // Recargar los datos desde el backend
                await fetchMaterias(); 
                setMateriaSeleccionada(null);

            } catch (err) {
                console.error("Error al eliminar:", err);
                alert(`Ocurrió un error al intentar eliminar: ${err.message}`);
            }
        }
    };

    const handleSeleccionarFila = (id) => {
        setMateriaSeleccionada(materiaSeleccionada === id ? null : id);
    };


    // ---------------------------------------------------
    // 6. Renderizado Condicional y Formulario (Ligeramente modificados)
    // ---------------------------------------------------
    
    if (cargando) {
        return <main className="contenido-gestion"><h2 className="titulo-gestion">Cargando datos del servidor...</h2></main>;
    }

    if (error) {
         return <main className="contenido-gestion"><h2 className="titulo-gestion" style={{ color: 'red' }}>Error de Conexión: {error}</h2></main>;
    }

    const renderFormulario = () => (
        <div className="formulario-gestion">
            {/* ... (El formulario es el mismo) ... */}
            <div className="campos-labels" style={{gridTemplateColumns: 'repeat(5, 1fr)'}}>
                 <span className="label-col">Nombre</span>
                 <span className="label-col">Docente ID</span>
                 <span className="label-col">Comisión</span>
                 <span className="label-col">Horario</span>
                 <span className="label-col">Cupo</span>
            </div>

            <div className="campos-grid" style={{gridTemplateColumns: 'repeat(5, 1fr)'}}>
                <input type="text" name="nombre" placeholder="Nombre" className="campo-texto" value={formData.nombre} onChange={handleInputChange} />
                <input type="text" name="docenteId" placeholder="Docente ID" className="campo-texto" value={formData.docenteId} onChange={handleInputChange} />
                <input type="text" name="comision" placeholder="Comisión" className="campo-texto" value={formData.comision} onChange={handleInputChange} />
                <input type="text" name="horario" placeholder="Horario" className="campo-texto" value={formData.horario} onChange={handleInputChange} />
                <input type="text" name="cupo" placeholder="Cupo" className="campo-texto" value={formData.cupo} onChange={handleInputChange} />
            </div>
            
            <button className="boton-volver" onClick={handleSubmitForm}>
                {accionActual === 'agregar' ? 'Confirmar Agregar' : 'Guardar Modificación'}
            </button>
            <button 
                className="boton-eliminar"
                style={{ right: 'auto', left: '30px', top: 'auto', bottom: '30px' }}
                onClick={() => setModo('lista')}>
                Cancelar
            </button>
        </div>
    );

    // 7. Renderizado de la Lista
    const renderLista = () => (
        <div className="formulario-gestion">
            
            <div className="campos-labels" style={{gridTemplateColumns: 'repeat(5, 1fr)'}}>
                <span className="label-col">Nombre</span>
                <span className="label-col">Docente ID</span>
                <span className="label-col">Comisión</span>
                <span className="label-col">Horario</span>
                <span className="label-col">Cupo</span>
            </div>
            
            {materias.map(materia => (
                <div 
                    key={materia.id} 
                    className={`campos-grid fila-materia ${materia.id === materiaSeleccionada ? 'seleccionado' : ''}`}
                    onClick={() => handleSeleccionarFila(materia.id)} 
                    style={{ 
                        marginBottom: '10px', 
                        padding: '10px', 
                        background: materia.id === materiaSeleccionada ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                        color: 'white',
                        cursor: 'pointer',
                        gridTemplateColumns: 'repeat(5, 1fr)'
                    }}
                >
                    <span>{materia.nombre}</span>
                    <span>{materia.docenteId}</span> {/* Se corrigió de 'docenteId' a 'docente_id' en la lógica de fetch, pero aquí se usa el campo del estado */}
                    <span>{materia.comision}</span>
                    <span>{materia.horario}</span>
                    <span>{materia.cupo}</span>
                </div>
            ))}
        </div>
    );


    // 8. Renderizado principal
    return (
        <main className="contenido-gestion">
            
            <header className="cabecera-instituto">
                <div className="logo-instituto"></div>
                <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
            </header>

            <h2 className="titulo-gestion">Gestión de Oferta Académica (Migrado a MySQL)</h2>
            
            <div className="panel-acciones">
                
                {modo === 'lista' && (
                    <button 
                        className="boton-eliminar"
                        onClick={() => materiaSeleccionada && handleEliminar(materiaSeleccionada)}
                        disabled={!materiaSeleccionada}>
                        Eliminar
                    </button>
                )}
                
                {modo === 'lista' && (
                    <div className="controles-principales">
                        <button 
                            className="boton-accion agregar" 
                            onClick={() => handleAbrirFormulario('agregar')}>
                            Agregar Materia
                        </button>
                        <button 
                            className="boton-accion modificar" 
                            onClick={handleModificarSeleccionada}
                            disabled={!materiaSeleccionada}>
                            Modificar
                        </button>
                    </div>
                )}
                
                {modo === 'lista' ? renderLista() : renderFormulario()}
            </div>
        </main>
    );
};

export default OfertaAcademica;