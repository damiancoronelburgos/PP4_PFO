import roles from "../data/roles.json";
import users from "../data/users.json";

const ROLE_TO_PATH = {
  [roles.ALUMNO]: "/alumno",
  [roles.DOCENTE]: "/docente",
  [roles.ADMINISTRADOR]: "/administrador",
  [roles.PRECEPTOR]: "/preceptor"
};

export function loginMock(username, password) {
  const u = (username || "").trim().toLowerCase();
  const p = password || "";
  const found = users.find(
    (x) => x.username.toLowerCase() === u && x.password === p
  );
  if (!found) return { ok: false, error: "Credenciales inválidas" };
  return { ok: true, role: found.role, redirectTo: ROLE_TO_PATH[found.role] };
}
