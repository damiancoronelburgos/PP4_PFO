import React from 'react';
// Importamos el archivo CSS compartido
import "../../styles/Administrador.css"; 

const Constancias = () => {
  return (
    // Reutilizamos la clase principal del contenido
    <main className="contenido-gestion">
      
      {/* Cabecera del Instituto (Compartida) */}
      <header className="cabecera-instituto">
        <div className="logo-instituto">{/*  */}</div>
        <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
      </header>

      {/* Título específico para esta sección */}
      <h2 className="titulo-gestion">Emitir Constancias</h2>
      
      {/* Panel de Emisión de Constancia (Contenedor principal con fondo oscuro) */}
      <div className="panel-emision-constancia">
        
        {/* Formulario de Entrada (Contenedor claro en el interior) */}
        <div className="formulario-emision">
            
            {/* Campo DNI (ocupa todo el ancho de las dos columnas) */}
            <div className="campo-completo">
                <label htmlFor="dni-alumno" className="label-form">DNI (alumno):</label>
                <input type="text" id="dni-alumno" className="input-form" />
            </div>

            {/* Fila 1: Nombre y Apellido */}
            <div className="campos-fila">
                <div>
                    <label htmlFor="nombre-alumno" className="label-form">Nombre:</label>
                    <input type="text" id="nombre-alumno" className="input-form medio" />
                </div>
                <div>
                    <label htmlFor="apellido-alumno" className="label-form">Apellido:</label>
                    <input type="text" id="apellido-alumno" className="input-form medio" />
                </div>
            </div>

            {/* Fila 2: Carrera y Comisión */}
            <div className="campos-fila">
                <div>
                    <label htmlFor="carrera-alumno" className="label-form">Carrera:</label>
                    <input type="text" id="carrera-alumno" className="input-form medio" />
                </div>
                <div>
                    <label htmlFor="comision-alumno" className="label-form">Comision:</label>
                    <input type="text" id="comision-alumno" className="input-form medio" />
                </div>
            </div>
            
            {/* Campo Tipo (ocupa todo el ancho) */}
            <div className="campo-completo tipo-field">
                <label htmlFor="tipo-constancia" className="label-form">Tipo:</label>
                <input 
                    type="text" 
                    id="tipo-constancia" 
                    placeholder="(materia aprobada, título en trámite, etc.)" 
                    className="input-form" 
                />
            </div>

            {/* Bloque de Resumen y Botón */}
            <div className="bloque-resumen">
                <div className="datos-resumen">
                    <p><strong>Alumno:</strong> Damian Coronel Burgos</p>
                    <p><strong>Curso:</strong> Base de datos I</p>
                    <p><strong>Comisión:</strong> A</p>
                    <p><strong>Constancia:</strong> título en trámite</p>
                </div>
                <button className="boton-emitir">Emitir comprobante</button>
            </div>
        </div>
      </div>
    </main>
  );
};

export default Constancias;