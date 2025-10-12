import React from 'react';
// Importamos el archivo CSS compartido
import "../../styles/Administrador.css"; 

const Notificaciones = () => {
  return (
    // Reutilizamos la clase principal del contenido
    <main className="contenido-gestion">
      
      {/* Cabecera del Instituto (Compartida) */}
      <header className="cabecera-instituto">
        <div className="logo-instituto">{/*  */}</div>
        <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
      </header>

      {/* Título específico para esta sección */}
      <h2 className="titulo-gestion">Emitir Comunicado</h2>
      
      {/* Panel de Emisión de Comunicado (Contenedor principal con fondo oscuro) */}
      {/* Reutilizaremos la clase .panel-emision-constancia si es apropiado, o creamos una nueva */}
      <div className="panel-emision-comunicado">
        
        {/* Formulario de Entrada (Contenedor claro en el interior) */}
        <div className="formulario-comunicado">
            
            <h3 className="subtitulo-destinatario">
                Elegir Destinatario/s <span className="leyenda-filtro">(filtrado por comision, carrera, etc.)</span>
            </h3>

            {/* Campos de Filtro (Replicamos la estructura de 3 campos en una columna) */}
            <div className="filtros-comunicado">
                <div className="campo-simple">
                    <label htmlFor="carrera-filtro" className="label-filtro">Carrera:</label>
                    <input type="text" id="carrera-filtro" className="input-filtro" />
                </div>
                <div className="campo-simple">
                    <label htmlFor="comision-filtro" className="label-filtro">Comision:</label>
                    <input type="text" id="comision-filtro" className="input-filtro" />
                </div>
                <div className="campo-simple">
                    <label htmlFor="otros-filtro" className="label-filtro">Otros:</label>
                    <input type="text" id="otros-filtro" className="input-filtro" />
                </div>
            </div>

            {/* Área de Mensaje y Botón */}
            <div className="caja-mensaje">
                <label htmlFor="mensaje-comunicado" className="label-mensaje">Escribe tu mensaje aquí:</label>
                <textarea 
                    id="mensaje-comunicado" 
                    className="textarea-comunicado"
                    rows="10"
                ></textarea>
                <button className="boton-enviar">Enviar</button>
            </div>
        </div>
      </div>
    </main>
  );
};

export default Notificaciones;