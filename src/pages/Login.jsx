// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getRedirectForRole } from "../middlewares/auth";
import "../styles/login.css";

const ROLE_AVATAR = {
  alumno: "/alumno.jpg",
  docente: "/docente.jpg",
  preceptor: "/preceptor.jpg",
  administrador: "/administrativo.jpg",
};
const GENERIC_AVATAR = "/icon.png";

const canonicalRole = (r = "") => {
  const v = String(r).toLowerCase();
  if (v === "administracion" || v === "administrativo") return "administrador";
  return v;
};

export default function Login() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(GENERIC_AVATAR);

  const onUserChange = (e) => {
    // Sin lectura de users.json: solo avatar genérico antes de loguear
    setAvatar(GENERIC_AVATAR);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = e.target.user.value.trim();
    const pass = e.target.pass.value.trim();

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { username: user, password: pass },
      });

      const token = data?.token;
      const role  = canonicalRole(data?.user?.role ?? data?.role);

      if (!token || !role) {
        alert("No se recibió token/rol desde el servidor.");
        return;
      }

      const displayName =
        [data.user?.nombre, data.user?.apellido].filter(Boolean).join(" ") || (data.user?.username || user);

      localStorage.setItem("token", token);
      localStorage.setItem("username", data.user?.username || user);
      localStorage.setItem("role", role);
      localStorage.setItem("displayName", displayName);

      // 🚨 AGREGAR ESTA LÍNEA ES CLAVE
      if (data.user?.id) { 
        localStorage.setItem("alumno_id_pk", String(data.user.id));
      }

      setAvatar(ROLE_AVATAR[role] || GENERIC_AVATAR);
      navigate(getRedirectForRole(role), { replace: true });
    } catch (err) {
      alert(err.message || "Error de autenticación");
    }
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