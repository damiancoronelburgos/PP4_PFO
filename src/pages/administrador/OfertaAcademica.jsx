import React, { useState, useEffect } from 'react';
import "../../styles/Administrador.css";

// 1. IMPORTACIÓN REAL DE DATOS
// Mantenemos los imports, aunque el JSON solo se usa si localStorage está vacío.
import ALUMNOS_DATA from "../../data/alumnos.json"; 
import MATERIAS_DATA from "../../data/materias.json"; 

// 🚨 CLAVE DE LOCAL STORAGE ÚNICA Y CLARA
const LOCAL_STORAGE_KEY = 'prisma_oferta_academica'; 

// Campos principales de Materias
const initialFormState = {
    nombre: '',
    docenteId: '',
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

    // 2. FUNCIÓN DE CARGA INICIAL (Lee de localStorage)
    useEffect(() => {
        const storedMaterias = localStorage.getItem(LOCAL_STORAGE_KEY);
        let initialData;

        if (storedMaterias) {
            // 🚨 Importante: Al parsear, aseguramos que 'cupo' sea un número si es necesario.
            initialData = JSON.parse(storedMaterias).map(m => ({
                ...m,
                // Garantiza que 'cupo' sea un número, incluso si localStorage lo guardó como string.
                cupo: Number(m.cupo) || 0 
            }));
        } else {
            // Carga inicial desde el JSON si no hay datos guardados
            initialData = MATERIAS_DATA.map(materia => ({
                id: materia.id,
                nombre: materia.nombre,
                docenteId: materia.docenteId,
                comision: materia.comision,
                horario: materia.horario,
                cupo: Number(materia.cupo) || 0, // Asegura que el cupo del JSON sea un número
            }));
        }
        setMaterias(initialData);
    }, []);

    // 3. EFECTO para GUARDAR (Escribe en localStorage cada vez que 'materias' cambia)
    useEffect(() => {
        // Solo guardamos si hay materias para evitar sobrescribir con un array vacío accidentalmente
        if (materias.length > 0) { 
             localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(materias));
        }
    }, [materias]);


    // 4. Manejadores de Estado
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Validación de solo números para cupo y docenteId
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

    // 5. Lógica de CRUD (Actualiza el estado de las Materias)
    const handleSubmitForm = () => {
        if (!formData.nombre || !formData.docenteId) {
            alert("El Nombre y el ID de Docente son obligatorios.");
            return;
        }

        if (accionActual === 'agregar') {
            const nuevoId = 'MAT-' + Date.now();
            const nuevaMateria = { id: nuevoId, ...formData }; 
            setMaterias(prev => [...prev, nuevaMateria]);
        } else if (accionActual === 'modificar') {
            setMaterias(prev =>
                prev.map(m =>
                    m.id === materiaSeleccionada
                        ? { ...m, ...formData }
                        : m
                )
            );
        }

        setModo('lista');
        setFormData(initialFormState);
    };

    const handleEliminar = (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta materia?")) {
            setMaterias(prev => prev.filter(m => m.id !== id));
            setMateriaSeleccionada(null);
        }
    };

    const handleSeleccionarFila = (id) => {
        setMateriaSeleccionada(materiaSeleccionada === id ? null : id);
    };


    // 6. Renderizado del Formulario
    const renderFormulario = () => (
        <div className="formulario-gestion">
            
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
                    <span>{materia.docenteId}</span>
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

            <h2 className="titulo-gestion">Gestión de Oferta Académica (Materias)</h2>
            
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