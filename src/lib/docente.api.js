export async function fetchDocenteComisiones() {
  return await api.get("/docentes/me/comisiones");
}
