import React from 'react';
import "../../styles/Administrador.css";

// Mantenemos el nombre de la función como fue solicitado
const GestionAlumnos = () => {
  return (
    // NOTA: Este es el contenido principal que iría al lado de tu sidebar
    <main className="contenido-gestion">
      
      {/* Cabecera del Instituto */}
      <header className="cabecera-instituto">
        {/* Placeholder para el logo */}
        <div className="logo-instituto">{/*  */}</div>
        <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
      </header>

      <h2 className="titulo-gestion">Gestionar Alumnos</h2>
      
      {/* Panel de Formulario y Acciones (El cuadro exterior negro/gris) */}
      <div className="panel-acciones">
        
        {/* Botón Eliminar (Posicionado en la esquina superior derecha) */}
        <button className="boton-eliminar">Eliminar</button>
        
        {/* Controles Principales */}
        <div className="controles-principales">
          <button className="boton-accion agregar">Agregar alumno</button>
          <button className="boton-accion modificar">Modificar</button>
        </div>
        
        {/* Formulario/Vista de Datos (El cuadro interior blanco/claro) */}
        <div className="formulario-gestion">
          
          {/* Etiquetas/Placeholders */}
          <div className="campos-labels">
             <span className="label-col">DNI</span>
             <span className="label-col">Nombre</span>
             <span className="label-col">Apellido</span>
             <span className="label-col">Curso</span>
          </div>

          {/* Campos de Entrada */}
          <div className="campos-grid">
            <input type="text" placeholder="" className="campo-texto" />
            <input type="text" placeholder="" className="campo-texto" />
            <input type="text" placeholder="" className="campo-texto" />
            <input type="text" placeholder="" className="campo-texto" />
          </div>
          
          {/* Botón Volver */}
          <button className="boton-volver">Volver</button>
        </div>
      </div>
    </main>
  );
};

export default GestionAlumnos;