import React, { useState } from "react";
import "../../styles/OfertaAcademica.css"; // CSS dedicado para esta vista

export default function OfertaAcademica() {
  // Ejemplo de estado: lista de materias u ofertas académicas
  const [materias, setMaterias] = useState([
    { id: 1, nombre: "Matemática I" },
    { id: 2, nombre: "Lengua y Literatura" },
    { id: 3, nombre: "Historia" },
  ]);

  const [nuevaMateria, setNuevaMateria] = useState("");

  const agregarMateria = () => {
    if (nuevaMateria.trim() === "") return;
    const nueva = {
      id: materias.length + 1,
      nombre: nuevaMateria,
    };
    setMaterias([...materias, nueva]);
    setNuevaMateria("");
  };

  return (
    <div className="oferta-container">
      <h2>Configurar Oferta Académica</h2>

      <div className="agregar-materia">
        <input
          type="text"
          placeholder="Nueva materia"
          value={nuevaMateria}
          onChange={(e) => setNuevaMateria(e.target.value)}
        />
        <button onClick={agregarMateria}>Agregar</button>
      </div>

      <ul className="materias-list">
        {materias.map((m) => (
          <li key={m.id}>{m.nombre}</li>
        ))}
      </ul>
    </div>
  );
}

