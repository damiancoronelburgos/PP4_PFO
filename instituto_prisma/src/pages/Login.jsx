import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginMock } from "../middlewares/auth";
import users from "../data/users.json";
import "../styles/login.css";

const ROLE_AVATAR = {
  alumno: "/alumno.jpg",
  docente: "/docente.jpg",
  preceptor: "/preceptor.jpg",
administrador: "/administrativo.jpg", 
};

export default function Login() {
  const navigate = useNavigate();

  // 👇 avatar por defecto (genérico)
  const [avatar, setAvatar] = useState("/icon.png");

  const onUserChange = (e) => {
    const u = e.target.value.trim().toLowerCase();
    const found = users.find((x) => x.username.toLowerCase() === u);
    if (found) {
      setAvatar(ROLE_AVATAR[found.role] || "/icon.png");
    } else {
      setAvatar("/icon.png"); // vuelve al genérico si no coincide
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = e.target.user.value;
    const pass = e.target.pass.value;

    const res = loginMock(user, pass);
    if (!res.ok) return alert(res.error);
    navigate(res.redirectTo);
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

        {/* AVATAR (icon.png por defecto, cambia por rol si reconoce usuario) */}
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
