import React, { useState, useEffect, useCallback } from 'react';
import "../../styles/Administrador.css"; 

const API_GESTION_URL = '/api/gestion'; 

const getToken = () => localStorage.getItem("token");

const Comunicaciones = () => {
    // ... (Estados existentes) ...
    const [carreras, setCarreras] = useState([]); 
    const [comisiones, setComisiones] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [mensajeFeedback, setMensajeFeedback] = useState('');
    
    // 💡 ESTADO PARA EMAILS
    const [emailsDestinatarios, setEmailsDestinatarios] = useState('Seleccione filtros para ver destinatarios.'); 
    
    const [filtros, setFiltros] = useState({
        carrera: 'Todas', 
        comision: 'Todas', 
    });
    const [titulo, setTitulo] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Función genérica de fetch con token
    const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
        const token = getToken();
        if (!token) {
            setMensajeFeedback('⚠️ Sesión no válida. Por favor, inicie sesión.');
            throw new Error("Token requerido.");
        }

        const url = `${API_GESTION_URL}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (response.status === 401) {
             setMensajeFeedback('🔴 Error de Autenticación. Sesión expirada.');
             throw new Error("401 Unauthorized.");
        }
        
        return response;
    }, []);


    // ===============================================
    // 1. Carga de Datos Iniciales (Materias y Comisiones) 📚
    // ===============================================
    useEffect(() => {
        const fetchDatosIniciales = async () => {
            setLoading(true);
            try {
                // 1. Cargar Materias
                const materiasResponse = await fetchWithAuth('/materias');
                const materiasData = await materiasResponse.json();
                const nombresMaterias = ['Todas', ...materiasData.map(m => m.nombre)];
                setCarreras(nombresMaterias);

                // 2. Cargar Comisiones
                const comisionesResponse = await fetchWithAuth('/comisiones/letras');
                const comisionesData = await comisionesResponse.json();
                setComisiones(comisionesData); 

            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
                if (error.message !== "Token requerido.") { 
                    setMensajeFeedback(`🔴 Error de carga: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDatosIniciales();
    }, [fetchWithAuth]);

// ---
    
    // ===============================================
    // 2. Carga de Emails Filtrados (Activado por 'filtros') 📧
    // ===============================================
    useEffect(() => {
        // No ejecutar si la carga inicial de filtros aún no terminó
        if (loading) return; 
        
        const fetchEmailsFiltrados = async () => {
            const { carrera, comision } = filtros;
            
            // Eliminamos la lógica de 'return' aquí. Siempre llamamos a la API para tener una fuente de verdad única.
            setEmailsDestinatarios('Cargando lista de correos...');

            try {
                // Se construye la URL de la API para filtrar
                const query = `?carrera=${encodeURIComponent(carrera)}&comision=${encodeURIComponent(comision)}`;
                const response = await fetchWithAuth(`/alumnos/emails${query}`);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Fallo al obtener emails: ${response.status}`);
                }
                
                // 🚨 CAMBIO CLAVE: Asumimos que la respuesta es un ARRAY DE STRINGS (EMAILS)
                const emails = await response.json(); 
                
                // Verificamos si la respuesta es un array y si contiene datos
                if (Array.isArray(emails) && emails.length > 0) {
                    // Unimos los emails con ', ' para mostrarlos
                    setEmailsDestinatarios(emails.join(', '));
                } else if (carrera === 'Todas' && comision === 'Todas') {
                    // Caso especial: Si no hay alumnos, pero los filtros son "Todas", mostramos el mensaje por defecto
                    setEmailsDestinatarios('No se encontraron alumnos matriculados en el sistema.');
                } else {
                    setEmailsDestinatarios('No se encontraron alumnos con esos filtros.');
                }

            } catch (error) {
                console.error("Error al cargar emails filtrados:", error);
                setEmailsDestinatarios(`🔴 Error al cargar emails: ${error.message.substring(0, 50)}...`);
            }
        };
        
        fetchEmailsFiltrados();
    }, [filtros, loading, fetchWithAuth]); 

// ---

    // ... (Manejadores de estado) ...
    const handleFiltroChange = (e) => {
        setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleMensajeChange = (e) => setMensaje(e.target.value);
    const handleTituloChange = (e) => setTitulo(e.target.value);


    // ===============================================
    // 3. Lógica de Envío 
    // ===============================================
    const handleEnviar = async () => {
        if (titulo.trim() === '' || mensaje.trim() === '') {
            setMensajeFeedback('⚠️ El título y el mensaje no pueden estar vacíos.');
            return;
        }
        
        // Verifica si la lista de emails no es vacía o es un mensaje de error/carga
        if (emailsDestinatarios.startsWith('No se encontraron') || emailsDestinatarios.startsWith('Cargando') || emailsDestinatarios.startsWith('🔴')) {
            setMensajeFeedback('⚠️ No se puede enviar el comunicado porque no hay destinatarios válidos o la lista no ha cargado.');
            return;
        }

        setLoading(true);
        setMensajeFeedback('Enviando comunicado...');

        try {
            const response = await fetchWithAuth('/comunicado', {
                method: 'POST',
                body: JSON.stringify({
                    carrera: filtros.carrera,
                    comision: filtros.comision,
                    titulo: titulo,
                    mensaje: mensaje,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Fallo al enviar el comunicado. Status: ${response.status}`);
            }

            // Éxito
            setMensajeFeedback(`✅ ${data.mensaje}`); 
            setFiltros({ carrera: 'Todas', comision: 'Todas' });
            setTitulo('');
            setMensaje('');

        } catch (error) {
            if (error.message !== "401 Unauthorized.") {
                 setMensajeFeedback(`🔴 Error: ${error.message || 'Error desconocido al enviar.'}`);
            }
        } finally {
            setLoading(false);
            setTimeout(() => setMensajeFeedback(''), 5000);
        }
    };
    
// ---

    // ===============================================
    // 4. Renderizado (JSX) 🖥️
    // ===============================================
    if (loading && carreras.length === 0) {
        return <main className="contenido-gestion"><p>Cargando filtros y datos iniciales...</p></main>;
    }
    
    return (
        <main className="contenido-gestion">
            
            <h2 className="titulo-gestion">Emitir Comunicado</h2>
            
            <div className="panel-emision-comunicado">
                <div className="formulario-comunicado">
                    <h3 className="subtitulo-destinatario">
                        Elegir Destinatario/s <span className="leyenda-filtro">(filtrado por materia y comisión)</span>
                    </h3>

                    <div className="filtros-comunicado dos-filtros">
                        {/* LISTA DESPLEGABLE CARRERA (DINÁMICA) */}
                        <div className="campo-simple">
                            <label htmlFor="carrera-filtro" className="label-filtro">Materia Principal:</label>
                            <select 
                                name="carrera"
                                className="input-filtro" 
                                value={filtros.carrera}
                                onChange={handleFiltroChange}
                                disabled={loading}
                            >
                                {carreras.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                        </div>
                        
                        {/* LISTA DESPLEGABLE COMISIÓN (DINÁMICA) */}
                        <div className="campo-simple">
                            <label htmlFor="comision-filtro" className="label-filtro">Comisión:</label>
                            <select 
                                name="comision"
                                className="input-filtro" 
                                value={filtros.comision}
                                onChange={handleFiltroChange}
                                disabled={loading}
                            >
                                {comisiones.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                        </div>
                    </div>
                    
                    {/* 🚨 CAMPO DE EMAILS DE DESTINATARIOS */}
                    <div className="campo-emails">
                        <label className="label-mensaje">Emails destinatarios:</label>
                        <p className="emails-lista" style={{ 
                            fontSize: '0.9em', 
                            color: emailsDestinatarios.startsWith('🔴') ? 'red' : (emailsDestinatarios.startsWith('Cargando') ? '#ccc' : '#e0e0e0'),
                            marginBottom: '10px',
                            wordBreak: 'break-all',
                            maxHeight: '100px',
                            overflowY: 'auto',
                            padding: '8px',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            background: '#333'
                        }}>
                            {emailsDestinatarios}
                        </p>
                    </div>

                    <div className="caja-mensaje">
                        {/* CAMPO TÍTULO */}
                        <div className="campo-simple">
                            <label htmlFor="titulo-comunicado" className="label-mensaje">Título del Comunicado:</label>
                            <input
                                type="text"
                                className="input-filtro"
                                value={titulo}
                                onChange={handleTituloChange}
                                disabled={loading}
                                maxLength={160}
                            />
                        </div>

                        <label htmlFor="mensaje-comunicado" className="label-mensaje">Escribe tu mensaje aquí:</label>
                        <textarea 
                            className="textarea-comunicado"
                            rows="10"
                            value={mensaje}
                            onChange={handleMensajeChange}
                            disabled={loading}
                        ></textarea>
                        
                        {mensajeFeedback && (
                            <p className="mensaje-feedback" style={{ color: mensajeFeedback.startsWith('✅') ? 'green' : (mensajeFeedback.startsWith('🔴') || mensajeFeedback.startsWith('⚠️') ? 'red' : 'inherit'), fontWeight: 'bold' }}>
                                {mensajeFeedback}
                            </p>
                        )}
                        
                        <button 
                            className="boton-enviar" 
                            onClick={handleEnviar}
                            disabled={loading || mensajeFeedback.startsWith('⚠️') || mensajeFeedback.startsWith('🔴') || emailsDestinatarios.startsWith('Cargando')}
                        >
                            {loading ? 'Enviando...' : 'Enviar Comunicado'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Comunicaciones;