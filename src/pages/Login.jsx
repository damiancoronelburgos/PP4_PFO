import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginMock } from "../middlewares/auth";
import users from "../data/users.json";

// datasets por rol (para armar displayName después del login)
import alumnos from "../data/alumnos.json";
import docentes from "../data/docentes.json";
import preceptores from "../data/preceptores.json";
import administradores from "../data/administrador.json"; // si tu archivo se llama distinto, ajustá el import

import "../styles/login.css";

const ROLE_AVATAR = {
  alumno: "/alumno.jpg",
  docente: "/docente.jpg",
  preceptor: "/preceptor.jpg",
  administrador: "/administrativo.jpg",
};

export default function Login() {
  const navigate = useNavigate();

  // avatar por defecto (genérico)
  const [avatar, setAvatar] = useState("/icon.png");

  const onUserChange = (e) => {
    const u = e.target.value.trim().toLowerCase();
    const found = users.find((x) => x.username.toLowerCase() === u);
    if (found) {
      setAvatar(ROLE_AVATAR[found.role] || "/icon.png");
    } else {
      setAvatar("/icon.png");
    }
  };

  // util: según el rol, devolver el registro detallado (para nombre/apellido)
  const findPersonByRole = (role, username) => {
    switch (role) {
      case "alumno":
        return alumnos.find((a) => a.usuario === username);
      case "docente":
        return docentes.find((d) => d.usuario === username);
      case "preceptor":
        return preceptores.find((p) => p.usuario === username);
      case "administrador":
        return administradores.find((adm) => adm.usuario === username);
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = e.target.user.value.trim();
    const pass = e.target.pass.value.trim();

    // 1) validar con tu mock
    const res = loginMock(user, pass);
    if (!res.ok) return alert(res.error);

    // 2) obtener role desde users.json (es tu “maestro” de credenciales)
    const found = users.find((u) => u.username === user);
    const role = found?.role || "alumno";

    // 3) buscar nombre completo en el dataset del rol
    const person = findPersonByRole(role, user);
    const displayName = person
      ? `${person.nombre ?? ""} ${person.apellido ?? ""}`.trim() || user
      : user;

    // 4) persistir sesión mínima
    localStorage.setItem("username", user);
    localStorage.setItem("role", role);
    localStorage.setItem("displayName", displayName);

    // 5) navegar a donde diga tu mock (ej.: "/alumno", "/docente", etc.)
    navigate(res.redirectTo, { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-box textured">
        <div className="login-header">
          <div className="logo-badge">
            <img src="/Logo.png" alt="Logo Prisma" className="logo-img" />
          </div>
          <h2>Instituto Superior Prisma</h2>
        </div>

        {/* AVATAR dinámico por rol (cambia al tipear usuario conocido) */}
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
