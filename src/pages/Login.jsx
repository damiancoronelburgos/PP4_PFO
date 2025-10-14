// ────────────────────────────── IMPORTS ──────────────────────────────
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginMock } from "../middlewares/auth";
import users from "../data/users.json";
import alumnos from "../data/alumnos.json";
import docentes from "../data/docentes.json";
import preceptores from "../data/preceptores.json";
import administradores from "../data/administrador.json";
import "../styles/login.css";

// ────────────────────────────── CONSTANTES ───────────────────────────
const ROLE_AVATAR = {
  alumno: "/alumno.jpg",
  docente: "/docente.jpg",
  preceptor: "/preceptor.jpg",
  administrador: "/administrativo.jpg",
};
const GENERIC_AVATAR = "/icon.png";

// ────────────────────────────── HELPERS ──────────────────────────────
const canonicalRole = (r = "") => {
  const v = r.toLowerCase();
  if (v === "administracion" || v === "administrativo") return "administrador";
  return v;
};

const toTitleCase = (s = "") =>
  s
    .toLocaleLowerCase("es-AR")
    .replace(/\b\p{L}/gu, (c) => c.toLocaleUpperCase("es-AR"));

const findPersonByRole = (role, username) => {
  switch (canonicalRole(role)) {
    case "alumno":
      return alumnos.find((a) => a.usuario === username) || null;
    case "docente":
      return docentes.find((d) => d.usuario === username) || null;
    case "preceptor":
      return preceptores.find((p) => p.usuario === username) || null;
    case "administrador":
      return administradores.find((adm) => adm.usuario === username) || null;
    default:
      return null;
  }
};

// ────────────────────────────── COMPONENTE ───────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(GENERIC_AVATAR);

  // ───────── Handlers
  const onUserChange = (e) => {
    const typed = e.target.value.trim().toLowerCase();
    const found = users.find((x) => x.username.toLowerCase() === typed);
    const roleKey = canonicalRole(found?.role);
    setAvatar(ROLE_AVATAR[roleKey] || GENERIC_AVATAR);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = e.target.user.value.trim();
    const pass = e.target.pass.value.trim();

    const res = loginMock(user, pass);
    if (!res.ok) return alert(res.error);

    const role = canonicalRole(users.find((u) => u.username === user)?.role || "alumno");

    const person = findPersonByRole(role, user);
    const displayName = person
      ? [person.nombre, person.apellido].filter(Boolean).map(toTitleCase).join(" ")
      : toTitleCase(user);

    localStorage.setItem("username", user);
    localStorage.setItem("role", role);
    localStorage.setItem("displayName", displayName);

    navigate(res.redirectTo, { replace: true });
  };

  // ───────── Render
  return (
    <div className="login-container">
      <div className="login-box textured">
        <div className="login-header">
          <div className="logo-badge">
            <img src="/Logo.png" alt="Logo Prisma" className="logo-img" />
          </div>
          <h2>Instituto Superior Prisma</h2>
        </div>

        {/* Avatar dinámico por rol */}
        <img src={avatar} alt="Usuario" className="profile-pic" />

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="user">Usuario:</label>
          <input id="user" name="user" type="text" onChange={onUserChange} required />

          <label htmlFor="pass">Contraseña:</label>
          <input id="pass" name="pass" type="password" required />

          <button type="submit" className="btn-primary">Ingresar</button>
        </form>
      </div>
    </div>
  );
}