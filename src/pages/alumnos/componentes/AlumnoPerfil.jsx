import React, { useEffect, useRef, useState } from "react";
import {
  fetchAlumnoMe,
  uploadAlumnoAvatar,
  changeAlumnoPassword,
} from "../../../lib/alumnos.api";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export default function AlumnoPerfil({ setActive }) {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);

  const [avatarSrc, setAvatarSrc] = useState("/alumno.jpg");
  const fileRef = useRef(null);

  const [showPwd, setShowPwd] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  useEffect(() => {
    fetchAlumnoMe()
      .then((data) => {
        if (data) {
          setAlumno(data);
          setAvatarSrc(data.avatarUrl || "/alumno.jpg");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="profile-wrap">Cargando…</p>;
  if (!alumno) return <p>Error cargando datos</p>;

  const displayName = `${cap(alumno.nombre)} ${cap(alumno.apellido)}`;
  const email = alumno.email || "—";
  const roles = alumno.rol ? [alumno.rol] : ["alumno"];

  // ----- AVATAR -----
  const choosePhoto = () => fileRef.current?.click();

  const onPhotoChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(reader.result);
    reader.readAsDataURL(f);

    const updated = await uploadAlumnoAvatar(f);
    if (updated?.data?.avatarUrl) {
      setAlumno(updated.data);
      setAvatarSrc(updated.data.avatarUrl);
    }
  };

  // ----- PASSWORD -----
  const savePassword = async (e) => {
    e.preventDefault();
    if (!pwd1 || !pwd2) return alert("Completá ambos campos.");
    if (pwd1 !== pwd2) return alert("Las contraseñas no coinciden.");

    const res = await changeAlumnoPassword(pwd1);
    if (res.ok) alert("Contraseña actualizada");
    else alert("Error al actualizar contraseña");

    setShowPwd(false);
    setPwd1("");
    setPwd2("");
  };

  return (
    <div className="profile-wrap">
      <div className="profile-card enroll-card">
        <div className="enroll-header">
          <h2 className="enroll-title">Mi Perfil</h2>
          
        </div>

        <div className="profile-grid">
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

          <div className="profile-col profile-col--roles">
            <h4 className="profile-subtitle">Roles</h4>
            <ul className="profile-roles">
              {roles.map((r) => (
                <li key={r}>{cap(r)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
