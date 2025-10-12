import React, { useState} from 'react';
import "../../styles/Administrador.css"; 

// --- SIMULACIÓN DE DATOS ---
// En un proyecto real, estas listas se generarían dinámicamente de tus datos (usando useMemo).
const CARRERAS_DISPONIBLES = ["Todas", "Tecnicatura en Sistemas", "Diseño Gráfico", "Marketing Digital"];
const COMISIONES_DISPONIBLES = ["Todas", "A", "B", "C", "Turno Noche"];

const Comunicados = () => {
    const [filtros, setFiltros] = useState({
        carrera: 'Todas', 
        comision: 'Todas', 
        // 🚨 El campo 'otros' ha sido eliminado del estado
    });
    const [mensaje, setMensaje] = useState('');
    const [mensajeFeedback, setMensajeFeedback] = useState('');

    // Maneja los cambios en los selects de filtro
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    // Maneja el cambio en el área de texto del mensaje
    const handleMensajeChange = (e) => {
        setMensaje(e.target.value);
    };

    // Lógica para enviar el comunicado
    const handleEnviar = () => {
        if (mensaje.trim() === '') {
            setMensajeFeedback('⚠️ El mensaje no puede estar vacío.');
            return;
        }

        console.log('--- Nuevo Comunicado Enviado ---');
        console.log('Destinatarios:');
        console.log(`- Carrera: ${filtros.carrera}`);
        console.log(`- Comisión: ${filtros.comision}`);
        
        // Simulación de éxito
        setMensajeFeedback(`✅ Comunicado enviado a la audiencia filtrada (${filtros.carrera}, ${filtros.comision}).`);
        
        // Resetear el formulario
        setFiltros({ carrera: 'Todas', comision: 'Todas' });
        setMensaje('');

        // Ocultar el feedback después de 4 segundos
        setTimeout(() => setMensajeFeedback(''), 4000);
    };

    return (
        <main className="contenido-gestion">
            
            <header className="cabecera-instituto">
                <div className="logo-instituto"></div>
                <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
            </header>

            <h2 className="titulo-gestion">Emitir Comunicado</h2>
            
            <div className="panel-emision-comunicado">
                
                <div className="formulario-comunicado">
                    
                    <h3 className="subtitulo-destinatario">
                        Elegir Destinatario/s <span className="leyenda-filtro">(filtrado por curso y comisión)</span>
                    </h3>

                    {/* 🚨 Campos de Filtro (SOLO DOS) */}
                    <div className="filtros-comunicado dos-filtros">
                        
                        {/* LISTA DESPLEGABLE CARRERA */}
                        <div className="campo-simple">
                            <label htmlFor="carrera-filtro" className="label-filtro">Carrera:</label>
                            <select 
                                id="carrera-filtro" 
                                name="carrera"
                                className="input-filtro" 
                                value={filtros.carrera}
                                onChange={handleFiltroChange}
                            >
                                {CARRERAS_DISPONIBLES.map(c => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* LISTA DESPLEGABLE COMISIÓN */}
                        <div className="campo-simple">
                            <label htmlFor="comision-filtro" className="label-filtro">Comisión:</label>
                            <select 
                                id="comision-filtro" 
                                name="comision"
                                className="input-filtro" 
                                value={filtros.comision}
                                onChange={handleFiltroChange}
                            >
                                {COMISIONES_DISPONIBLES.map(c => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* 🚨 El tercer input fue eliminado */}
                    </div>

                    {/* Área de Mensaje y Botón */}
                    <div className="caja-mensaje">
                        <label htmlFor="mensaje-comunicado" className="label-mensaje">Escribe tu mensaje aquí:</label>
                        <textarea 
                            id="mensaje-comunicado" 
                            className="textarea-comunicado"
                            rows="10"
                            value={mensaje}
                            onChange={handleMensajeChange}
                        ></textarea>
                        
                        {mensajeFeedback && (
                            <p className="mensaje-feedback" style={{ color: mensajeFeedback.startsWith('✅') ? 'green' : 'red', fontWeight: 'bold' }}>
                                {mensajeFeedback}
                            </p>
                        )}
                        
                        <button className="boton-enviar" onClick={handleEnviar}>
                            Enviar Comunicado
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Comunicados;