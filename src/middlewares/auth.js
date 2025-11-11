// src/middlewares/auth.js
export const ROLE_TO_PATH = {
  alumno: "/alumno",
  docente: "/docente",
  preceptor: "/preceptor",
  administrador: "/administrador",
};

export const getRedirectForRole = (role) => ROLE_TO_PATH[role] || "/";

export const isAuthenticated = () => !!localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("displayName");
};