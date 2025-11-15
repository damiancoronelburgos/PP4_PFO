import React, { useState, useEffect } from 'react'; // Eliminamos useCallback
import "../../styles/Administrador.css";

// ESTADO INICIAL DEL FORMULARIO
const initialFormState = {
    dni: '',
    nombre: '',
    apellido: '',
    materia_id: 0, 
    telefono: '',
    email: ''
};

const GestionAlumnos = () => {
    
    // Estados principales
    const [modo, setModo] = useState('lista'); 
    const [alumnos, setAlumnos] = useState([]); 
    const [formData, setFormData] = useState(initialFormState); 
    const [accionActual, setAccionActual] = useState('agregar'); 
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    const [materiasDisponibles, setMateriasDisponibles] = useState([]); 

    // Función para obtener el token
    const getToken = () => localStorage.getItem("token");

    // ===============================================
    // 1. CARGA DE MATERIAS 📚
    // ===============================================
    useEffect(() => {
        const fetchMaterias = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const res = await fetch("/api/gestion/materias", { 
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setMateriasDisponibles(data);
                    // Inicializa el formulario con el primer ID si hay materias
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, materia_id: data[0].id }));
                    }
                } else {
                    console.error("Error al cargar materias:", await res.json());
                }
            } catch (err) {
                console.error("Error de red al cargar materias:", err);
            }
        };
        fetchMaterias();
    }, []); // Se ejecuta solo una vez al montar

    // ===============================================
    // 2. FUNCIÓN DE CARGA DE ALUMNOS (READ) 📖
    // Se extrae la lógica a una función simple que puede llamarse en CRUD
    // ===============================================
    const fetchAlumnos = async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/gestion/alumnos", { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error al cargar alumnos:", errorData.error || res.statusText);
                return;
            }
            
            const data = await res.json();
            setAlumnos(data);
            
        } catch (err) {
            console.error("Error de red al cargar alumnos:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 3. EFECTO para CARGA INICIAL de alumnos
    useEffect(() => {
        fetchAlumnos();
    }, []); // Se ejecuta solo una vez al montar

    // ===============================================
    // 4. MANEJADORES Y LÓGICA CRUD
    // ===============================================
    
    // El resto de los manejadores se mantiene igual, ya que no son handlers de dependencia
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'dni' && value && !/^\d*$/.test(value)) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAbrirFormulario = (accion, alumno = null) => {
        setAccionActual(accion);
        setModo('formulario');

        if (accion === 'modificar' && alumno) {
            // Buscamos el ID de la materia a partir del nombre_materia (del JOIN)
            const materia = materiasDisponibles.find(m => m.nombre === alumno.nombre_materia);
            
            setFormData({
                dni: alumno.dni || '',
                nombre: alumno.nombre || '',
                apellido: alumno.apellido || '',
                telefono: alumno.telefono || '',
                email: alumno.email || '',
                materia_id: materia ? materia.id : materiasDisponibles[0]?.id || 0,
            });
            setAlumnoSeleccionado(alumno.id);
        } else {
            setFormData(initialFormState);
            if (materiasDisponibles.length > 0) {
                 setFormData(prev => ({ ...prev, materia_id: materiasDisponibles[0].id }));
            }
            setAlumnoSeleccionado(null);
        }
    };
    
    // SUBMIT ASÍNCRONO
    const handleSubmitForm = async () => {
        if (!formData.dni || !formData.nombre || !formData.apellido || !formData.materia_id) {
            alert("DNI, Nombre, Apellido y Curso son obligatorios.");
            return;
        }

        const token = getToken();
        if (!token) return alert("Sesión no válida.");

        const dataToSend = {
            dni: formData.dni,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono, 
            email: formData.email,
            materia_id: parseInt(formData.materia_id), 
        };

        let method = 'POST';
        let url = "/api/gestion/alumnos";

        if (accionActual === 'modificar') {
            method = 'PUT';
            url = `/api/gestion/alumnos/${alumnoSeleccionado}`;
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!res.ok) {
                 const error = await res.json();
                 alert(`Error al guardar: ${error.error || 'Error de servidor'}`);
                 return;
            }

            await fetchAlumnos(); // Recargar la lista
            setModo('lista');
            setFormData(initialFormState);
            setAlumnoSeleccionado(null);

        } catch (err) {
            console.error("Error de red en el CRUD:", err);
            alert("Error de conexión al servidor.");
        }
    };

    // ELIMINAR ASÍNCRONO
    const handleEliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
            return;
        }

        const token = getToken();
        if (!token) return alert("Sesión no válida.");

        try {
            const res = await fetch(`/api/gestion/alumnos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                 const error = await res.json();
                 alert(`Error al eliminar: ${error.error || 'Error de servidor'}`);
                 return;
            }

            await fetchAlumnos(); // Recargar la lista
            setAlumnoSeleccionado(null);
            
        } catch (err) {
            console.error("Error de red al eliminar:", err);
            alert("Error de conexión al servidor.");
        }
    };

    const handleSeleccionarFila = (id) => {
        setAlumnoSeleccionado(alumnoSeleccionado === id ? null : id);
    };


    // ===============================================
    // 5. Renderizado del Formulario
    // ===============================================
    const renderFormulario = () => (
        <div className="formulario-gestion">
            
            <div className="campos-labels">
                   <span className="label-col">DNI</span>
                   <span className="label-col">Nombre</span>
                   <span className="label-col">Apellido</span>
                   <span className="label-col">Teléfono</span>
                   <span className="label-col">Email</span>
                   <span className="label-col">Curso</span>
            </div>

            <div className="campos-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                <input type="text" name="dni" placeholder="DNI" className="campo-texto" value={formData.dni} onChange={handleInputChange} />
                <input type="text" name="nombre" placeholder="Nombre" className="campo-texto" value={formData.nombre} onChange={handleInputChange} />
                <input type="text" name="apellido" placeholder="Apellido" className="campo-texto" value={formData.apellido} onChange={handleInputChange} />
                <input type="text" name="telefono" placeholder="Teléfono" className="campo-texto" value={formData.telefono} onChange={handleInputChange} />
                <input type="email" name="email" placeholder="Email" className="campo-texto" value={formData.email} onChange={handleInputChange} />
                
                <select name="materia_id" className="campo-texto" value={formData.materia_id} onChange={handleInputChange}>
                    {materiasDisponibles.map(materia => (
                        <option key={materia.id} value={materia.id}>{materia.nombre}</option>
                    ))}
                </select>
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

    // 6. Renderizado de la Lista
    const renderLista = () => (
        <div className="formulario-gestion">
            
            <div className="campos-labels" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <span className="label-col">DNI</span>
                <span className="label-col">Nombre</span>
                <span className="label-col">Apellido</span>
                <span className="label-col">Curso</span>
            </div>
            
            {alumnos.length > 0 ? (
                alumnos.map(alumno => (
                    <div 
                        key={alumno.id} 
                        className={`campos-grid fila-alumno ${alumno.id === alumnoSeleccionado ? 'seleccionado' : ''}`}
                        onClick={() => handleSeleccionarFila(alumno.id)} 
                        style={{ 
                            marginBottom: '10px', 
                            padding: '10px', 
                            background: alumno.id === alumnoSeleccionado ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                            color: 'white',
                            cursor: 'pointer',
                            gridTemplateColumns: 'repeat(4, 1fr)' 
                        }}
                    >
                        <span>{alumno.dni}</span>
                        <span>{alumno.nombre}</span>
                        <span>{alumno.apellido}</span>
                        <span>{alumno.nombre_materia || 'Sin Asignar'}</span> 
                    </div>
                ))
            ) : (
                <p style={{ color: 'white', textAlign: 'center', padding: '20px' }}>No hay alumnos registrados.</p>
            )}
        </div>
    );


    // 7. Renderizado principal
    return (
        <main className="contenido-gestion">
            
            <header className="cabecera-instituto">
                <div className="logo-instituto"></div>
                <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
            </header>

            <h2 className="titulo-gestion">Gestionar Alumnos</h2>
            
            <div className="panel-acciones" style={{ position: 'relative' }}>
                
                {isLoading ? (
                    <p style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Cargando datos de la base de datos...</p>
                ) : (
                    <>
                        {modo === 'lista' && (
                            <div className="controles-principales">
                                
                                <button 
                                    className="boton-accion agregar" 
                                    onClick={() => handleAbrirFormulario('agregar')}
                                    disabled={materiasDisponibles.length === 0} 
                                >
                                    Agregar alumno
                                </button>
                                
                                <button 
                                    className="boton-accion modificar" 
                                    onClick={() => {
                                        const selected = alumnos.find(a => a.id === alumnoSeleccionado);
                                        if (selected) {
                                            handleAbrirFormulario('modificar', selected);
                                        } else {
                                            alert("Por favor, selecciona un alumno para modificar.");
                                        }
                                    }}
                                    disabled={!alumnoSeleccionado}>
                                    Modificar
                                </button>
                                
                                <button 
                                    className="boton-accion eliminar"
                                    onClick={() => alumnoSeleccionado && handleEliminar(alumnoSeleccionado)}
                                    disabled={!alumnoSeleccionado}
                                    style={{ position: 'absolute', top: '20px', right: '20px' }} 
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                        
                        {modo === 'lista' ? renderLista() : renderFormulario()}
                    </>
                )}
            </div>
        </main>
    );
};

export default GestionAlumnos;