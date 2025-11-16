// src/pages/alumnos/Perfil.jsx
import React, { useState, useEffect, useRef } from "react";
import "../../styles/alumnos.css";
import { apiGet } from "../../lib/api";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export default function Perfil() {
  const [alumno, setAlumno] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/alumno.jpg");
  const [showPwd, setShowPwd] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  const fileRef = useRef(null);

  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const data = await apiGet("/alumnos/me/datos");
        setAlumno(data);

        const avatar = data.avatar_url || data.avatar;
        if (avatar) setAvatarSrc(avatar);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };

    loadPerfil();
  }, []);

  const choosePhoto = () => fileRef.current?.click();

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (!pwd1 || !pwd2) return alert("Completá ambos campos.");
    if (pwd1 !== pwd2) return alert("Las contraseñas no coinciden.");
    alert("Contraseña actualizada (demo front).");
    setShowPwd(false);
    setPwd1("");
    setPwd2("");
  };

  if (!alumno) {
    return (
      <div className="panel-content">
        <h2>Mi Perfil</h2>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="panel-content perfil-panel">
      <h2>Mi Perfil</h2>
      <p className="panel-subtitle">Datos personales del alumno</p>

      <div className="perfil-grid">
        <div className="perfil-col">
          <h3>Datos del alumno</h3>
          <p>
            <strong>Nombre:</strong> {cap(alumno.nombre)}{" "}
            {cap(alumno.apellido)}
          </p>
          <p>
            <strong>DNI:</strong> {alumno.dni || "—"}
          </p>
          <p>
            <strong>Teléfono:</strong> {alumno.telefono || "—"}
          </p>
          <p>
            <strong>Email:</strong> {alumno.email || "—"}
          </p>
        </div>

        <div className="perfil-col">
          <h3>Foto de perfil</h3>
          <img src={avatarSrc} alt="Avatar" className="perfil-avatar" />
          <div className="perfil-avatar-actions">
            <button
              type="button"
              onClick={choosePhoto}
              className="btn-secondary"
            >
              Cambiar foto
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onPhotoChange}
            />
          </div>
          <p className="hint">
            (* Por ahora solo cambia en pantalla, demo front)
          </p>
        </div>

        <div className="perfil-col">
          <h3>Seguridad</h3>
          {!showPwd && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPwd(true)}
            >
              Cambiar contraseña
            </button>
          )}
          {showPwd && (
            <form onSubmit={savePassword} className="perfil-pwd-form">
              <label>
                Nueva contraseña
                <input
                  type="password"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                />
              </label>
              <label>
                Repetir contraseña
                <input
                  type="password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />
              </label>

              <div className="perfil-pwd-actions">
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowPwd(false);
                    setPwd1("");
                    setPwd2("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}