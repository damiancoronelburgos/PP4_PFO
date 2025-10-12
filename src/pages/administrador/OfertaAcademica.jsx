import React from 'react';
// Importamos el archivo CSS compartido
import "../../styles/Administrador.css"; 

const OfertaAcademica = () => {
  return (
    // Reutilizamos la clase principal del contenido
    <main className="contenido-gestion">
      
      {/* Cabecera del Instituto (Compartida) */}
      <header className="cabecera-instituto">
        <div className="logo-instituto">{/*  */}</div>
        <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
      </header>

      {/* Título específico para esta sección */}
      <h2 className="titulo-gestion">Gestionar Oferta academica</h2>
      
      {/* Panel de Formulario y Acciones (El cuadro exterior oscuro) */}
      {/* Reutilizamos la clase panel-acciones que tiene el fondo semi-transparente */}
      <div className="panel-acciones">
        
        {/* Botón Eliminar (Posicionado en la esquina superior derecha, reutilizado) */}
        <button className="boton-eliminar">Eliminar</button>
        
        {/* Controles Principales */}
        <div className="controles-principales">
          <button className="boton-accion agregar">Agregar</button>
          <button className="boton-accion modificar">Modificar</button>
        </div>
        
        {/* Formulario/Vista de Datos (El cuadro interior blanco/claro) */}
        <div className="formulario-gestion">
          
          {/* Etiquetas/Placeholders para la Oferta Académica */}
          {/* Usamos las clases de grid y label para replicar el layout tabular */}
          <div className="campos-labels campos-oferta">
             <span className="label-col">id_carrera</span>
             <span className="label-col">Nombre_carrera</span>
             <span className="label-col">Comienza</span>
             <span className="label-col">Finaliza</span>
             <span className="label-col">Horario</span>
          </div>

          {/* Campos de Entrada adaptados */}
          {/* Usamos un grid de 5 columnas para esta vista */}
          <div className="campos-grid campos-oferta">
            <input type="text" placeholder="" className="campo-texto" />
            <input type="text" placeholder="" className="campo-texto" />
            <input type="time" placeholder="" className="campo-texto" />
            <input type="time" placeholder="" className="campo-texto" />
            <input type="text" placeholder="" className="campo-texto" />
          </div>
          
          {/* Botón Volver (Reutilizado) */}
          <button className="boton-volver">Volver</button>
        </div>
      </div>
    </main>
  );
};

export default OfertaAcademica;