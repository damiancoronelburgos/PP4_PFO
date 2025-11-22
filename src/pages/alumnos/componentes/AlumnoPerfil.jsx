import React, { useEffect, useRef, useState } from "react";
import {
  fetchAlumnoMe,
  uploadAlumnoAvatar,
  changeAlumnoPassword,
} from "../../../lib/alumnos.api";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export default function AlumnoPerfil({ setActive, alumno, setAlumno }) {
  const [avatarSrc, setAvatarSrc] = useState(
    alumno?.avatarUrl ||
      localStorage.getItem("alumnoAvatar") ||
      "/alumno.jpg"
  );

  const fileRef = useRef(null);

  const [showPwd, setShowPwd] = useState(false);
  const [pwdActual, setPwdActual] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  if (!alumno) return <p>Cargando…</p>;

  const displayName = `${cap(alumno.nombre)} ${cap(alumno.apellido)}`;
  const email = alumno.email || "—";
  const roles = alumno.rol ? [alumno.rol] : ["alumno"];

  // ===================== AVATAR =====================
  const choosePhoto = () => fileRef.current?.click();

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview local
    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(reader.result);
    reader.readAsDataURL(file);

    // subir al backend
    const updated = await uploadAlumnoAvatar(file);

    if (updated?.ok && updated.data?.avatarUrl) {
      const newUrl = updated.data.avatarUrl;

      // 1) actualizar estado global
      setAlumno((prev) => ({
        ...prev,
        avatarUrl: newUrl,
      }));

      // 2) actualizar estado local
      setAvatarSrc(newUrl);

      // 3) guardar en localStorage
      localStorage.setItem("alumnoAvatar", newUrl);
    }
  };

  // ===================== PASSWORD =====================
  const savePassword = async (e) => {
    e.preventDefault();

    if (!pwd1 || !pwd2) return alert("Completá todos los campos.");
    if (pwd1 !== pwd2) return alert("Las contraseñas no coinciden.");

    const res = await changeAlumnoPassword(pwd1);

    if (res.ok) alert("Contraseña actualizada correctamente.");
    else alert("No se pudo actualizar la contraseña.");

    setShowPwd(false);
    setPwd1("");
    setPwd2("");
    setPwdActual("");
  };

  return (
    <div className="profile-wrap">
      <div className="profile-card enroll-card">

        <div className="enroll-header">
          <h2 className="enroll-title">Mi Perfil</h2>
        </div>

        <div className="profile-grid">

          {/* AVATAR */}
          <div className="profile-col profile-col--avatar">
            <img
              src={avatarSrc}
              alt={displayName}
              className="profile-avatar-lg"
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              hidden
            />

            <button className="btn btn--success" onClick={choosePhoto}>
              Cambiar foto de perfil
            </button>
          </div>

          {/* INFO */}
          <div className="profile-col profile-col--info">
            <h3 className="profile-name">{displayName}</h3>
            <div className="profile-email">{email}</div>

            {!showPwd ? (
              <div className="mt-16">
                <button
                  className="btn btn--danger"
                  onClick={() => setShowPwd(true)}
                >
                  Cambiar contraseña
                </button>
              </div>
            ) : (
              <form className="pwd-form" onSubmit={savePassword}>
                <input
                  type="password"
                  className="grades-input"
                  placeholder="Contraseña actual"
                  value={pwdActual}
                  onChange={(e) => setPwdActual(e.target.value)}
                />

                <input
                  type="password"
                  className="grades-input"
                  placeholder="Nueva contraseña"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                />

                <input
                  type="password"
                  className="grades-input"
                  placeholder="Repetir contraseña"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />

                <div className="row gap-12">
                  <button className="btn btn--success" type="submit">
                    Guardar
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setShowPwd(false);
                      setPwdActual("");
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

          {/* ROLES */}
          <div className="profile-col profile-col--roles">
            <h4 className="profile-subtitle">Roles</h4>
            <ul className="profile-roles">
              {roles.map((r, i) => (
                <li key={i}>{cap(r)}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
