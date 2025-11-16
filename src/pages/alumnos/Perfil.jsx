import React, { useState, useEffect, useRef } from "react";
import "../../styles/alumnos.css";
import {
  fetchAlumnoMe,
  uploadAlumnoAvatar,
  changeAlumnoPassword,
} from "../../lib/alumnos.api";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export default function Perfil() {
  const [alumno, setAlumno] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(
    localStorage.getItem("alumnoAvatar") || "/alumno.jpg"
  );
  const [showPwd, setShowPwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const data = await fetchAlumnoMe();
        if (!data) return;

        setAlumno(data);

        const avatar = data.avatarUrl || data.avatar_url || data.avatar;
        if (avatar) {
          setAvatarSrc(avatar);
          localStorage.setItem("alumnoAvatar", avatar);
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };

    loadPerfil();
  }, []);

  useEffect(() => {
    if (avatarSrc) {
      localStorage.setItem("alumnoAvatar", avatarSrc);
    }
  }, [avatarSrc]);

  const choosePhoto = () => fileRef.current?.click();

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadAlumnoAvatar(file);
      if (!result.ok) {
        alert(result.error || "No se pudo actualizar la foto de perfil.");
        return;
      }

      const data = result.data || {};
      const url = data.avatarUrl || data.avatar_url;
      if (url) {
        setAvatarSrc(url);
        localStorage.setItem("alumnoAvatar", url);
      }
    } catch (err) {
      console.error("onPhotoChange error", err);
      alert("Ocurrió un error al subir la imagen.");
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    if (!currentPwd.trim()) {
      alert("Ingresá tu contraseña actual.");
      return;
    }

    if (pwd1.length < 8) {
      alert("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (pwd1 !== pwd2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setPwdLoading(true);
    const result = await changeAlumnoPassword({
      currentPassword: currentPwd,
      newPassword: pwd1,
      confirmPassword: pwd2,
    });
    setPwdLoading(false);

    if (!result.ok) {
      alert(result.error || "No se pudo cambiar la contraseña.");
      return;
    }

    alert("Contraseña actualizada correctamente.");
    setShowPwd(false);
    setCurrentPwd("");
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
            La foto se guarda en tu cuenta y se usará en futuros ingresos.
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
                Contraseña actual
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
              </label>
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
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={pwdLoading}
                >
                  {pwdLoading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowPwd(false);
                    setCurrentPwd("");
                    setPwd1("");
                    setPwd2("");
                  }}
                  disabled={pwdLoading}
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