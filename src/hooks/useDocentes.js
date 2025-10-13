import { useEffect, useState } from "react";

export default function useDocentes() {
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    fetch("/data/docentes.json")
      .then((res) => res.json())
      .then((data) => setDocentes(data))
      .catch((err) => console.error("Error al cargar docente.json:", err));
  }, []);

  return docentes;
}
