export default function AdminSidebar({ setVista, vistaActual }) {
  const opciones = [
    { key: "alumnos", label: "Gestionar Alumnos" },
    { key: "oferta", label: "Configurar Oferta Académica" },
    { key: "constancias", label: "Emitir Constancias" },
    { key: "notificaciones", label: "Notificaciones" },
  ];

  return (
    <div className="admin-sidebar">
      <h2>Administración</h2>
      <ul>
        {opciones.map((opcion) => (
          <li
            key={opcion.key}
            onClick={() => setVista(opcion.key)}
            className={vistaActual === opcion.key ? "active" : ""}
          >
            {opcion.label}
          </li>
        ))}
      </ul>
    </div>
  );
}


