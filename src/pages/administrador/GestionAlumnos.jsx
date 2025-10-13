import React, { useState, useEffect } from 'react';
import "../../styles/Administrador.css";

// 1. IMPORTACIÓN REAL DE DATOS
import ALUMNOS_DATA from "../../data/alumnos.json"; 
import MATERIAS_DATA from "../../data/materias.json"; 

// Nombre clave para guardar/cargar en el localStorage
const LOCAL_STORAGE_KEY = 'prisma_alumnos';

// Extraer solo los nombres de los cursos disponibles
const CURSOS_DISPONIBLES = MATERIAS_DATA.map(materia => materia.nombre);

// ESTADO INICIAL DEL FORMULARIO
const initialFormState = {
    dni: '',
    nombre: '',
    apellido: '',
    curso: CURSOS_DISPONIBLES[0] 
};

const GestionAlumnos = () => {
    // Estados principales
    const [modo, setModo] = useState('lista'); 
    const [alumnos, setAlumnos] = useState([]); 
    const [formData, setFormData] = useState(initialFormState); 
    const [accionActual, setAccionActual] = useState('agregar'); 
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    // 2. FUNCIÓN DE CARGA INICIAL (Carga desde localStorage o JSON base) 🛠️
    useEffect(() => {
        let initialData = ALUMNOS_DATA; 
        const storedAlumnos = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedAlumnos) {
            const storedArray = JSON.parse(storedAlumnos);
            
            if (storedArray && storedArray.length > 0) {
                initialData = storedArray;
            }
        }
        
        setAlumnos(initialData);
        setIsLoading(false); 
    }, []);

    // 3. EFECTO para GUARDAR los datos (Persistencia simulada) 💾
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(alumnos));
        }
    }, [alumnos, isLoading]);


    // 4. Manejadores y Lógica de CRUD
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
            setFormData({
                dni: alumno.dni || '',
                nombre: alumno.nombre || '',
                apellido: alumno.apellido || '',
                curso: alumno.curso || CURSOS_DISPONIBLES[0],
            });
            setAlumnoSeleccionado(alumno.id);
        } else {
            setFormData(initialFormState);
            setAlumnoSeleccionado(null);
        }
    };

    const handleSubmitForm = () => {
        if (!formData.dni || !formData.nombre || !formData.apellido) {
            alert("DNI, Nombre y Apellido son obligatorios.");
            return;
        }

        if (accionActual === 'agregar') {
            const nuevoAlumno = { 
                id: Date.now(), 
                dni: formData.dni,
                nombre: formData.nombre,
                apellido: formData.apellido,
                curso: formData.curso,
                
                // Datos faltantes completados con valores predeterminados
                edad: 'N/A',
                "fecha de nacimiento": 'N/A',
                telefono: 'N/A',
                email: `${formData.nombre.toLowerCase()}.${formData.apellido.toLowerCase()}@prisma.com`,
                usuario: `alumno_${formData.dni}`, 
                contraseña: '1111',
                rol: 'alumno',
            }; 
            setAlumnos(prev => [...prev, nuevoAlumno]); 
        } else if (accionActual === 'modificar') {
            const alumnoOriginal = alumnos.find(a => a.id === alumnoSeleccionado);
            
            setAlumnos(prev =>
                prev.map(a =>
                    a.id === alumnoSeleccionado
                        ? { ...alumnoOriginal, ...formData } 
                        : a
                )
            );
        }

        setModo('lista');
        setFormData(initialFormState);
    };

    const handleEliminar = (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
            setAlumnos(prev => prev.filter(a => a.id !== id));
            setAlumnoSeleccionado(null);
        }
    };

    const handleSeleccionarFila = (id) => {
        setAlumnoSeleccionado(alumnoSeleccionado === id ? null : id);
    };


    // 5. Renderizado del Formulario
    const renderFormulario = () => (
        <div className="formulario-gestion">
            
            <div className="campos-labels">
                 <span className="label-col">DNI</span>
                 <span className="label-col">Nombre</span>
                 <span className="label-col">Apellido</span>
                 <span className="label-col">Curso</span>
            </div>

            <div className="campos-grid">
                {/* DNI se puede bloquear si está en modo modificar, pero lo dejo editable por simplicidad */}
                <input type="text" name="dni" placeholder="DNI" className="campo-texto" value={formData.dni} onChange={handleInputChange} />
                <input type="text" name="nombre" placeholder="Nombre" className="campo-texto" value={formData.nombre} onChange={handleInputChange} />
                <input type="text" name="apellido" placeholder="Apellido" className="campo-texto" value={formData.apellido} onChange={handleInputChange} />
                
                <select name="curso" className="campo-texto" value={formData.curso} onChange={handleInputChange}>
                    {CURSOS_DISPONIBLES.map(curso => (
                        <option key={curso} value={curso}>{curso}</option>
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
            
            <div className="campos-labels">
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
                            cursor: 'pointer' 
                        }}
                    >
                        <span>{alumno.dni}</span>
                        <span>{alumno.nombre}</span>
                        <span>{alumno.apellido}</span>
                        <span>{alumno.curso}</span>
                    </div>
                ))
            ) : (
                <p style={{ color: 'white', textAlign: 'center', padding: '20px' }}>No hay alumnos registrados.</p>
            )}
            
            {/* 🚨 ELIMINADO: El botón "Modificar Seleccionado" ha sido removido de aquí. */}
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
                    <p style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Cargando datos...</p>
                ) : (
                    <>
                        {modo === 'lista' && (
                            <div className="controles-principales">
                                
                                <button 
                                    className="boton-accion agregar" 
                                    onClick={() => handleAbrirFormulario('agregar')}>
                                    Agregar alumno
                                </button>
                                
                                {/* 🚨 FUNCIONALIDAD AGREGADA: El botón Modificar llama directamente a la lógica de modificar seleccionado */}
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
                                
                                {/* Botón Eliminar, posicionado absolutamente a la derecha con el estilo inline (que simula el CSS del último ajuste) */}
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