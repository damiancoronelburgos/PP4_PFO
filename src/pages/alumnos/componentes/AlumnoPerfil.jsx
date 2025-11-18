import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";   // ✔ Ruta corregida según tu estructura
import { apiFetch } from "../../../lib/api";

export default function AlumnoPerfil({ setActive }) {
  const [alumno, setAlumno] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [passForm, setPassForm] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ============================
  // 1) Cargar datos reales
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const datos = await apiFetch("/api/alumnos/me/datos");

        setAlumno(datos);

        if (datos.avatarUrl) {
          setAvatarUrl(datos.avatarUrl);
        } else {
          setAvatarUrl("/alumno.jpg"); // fallback por defecto
        }
      } catch (err) {
        console.error("Error cargando datos del alumno", err);
      }
    }
    load();
  }, []);

  if (!alumno) {
    return (
      <div className="panel-wrap">
        <h2>Cargando perfil...</h2>
      </div>
    );
  }

  // ============================
  // 2) Subir avatar real
  // ============================
  async function onAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setMsg("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await apiFetch("/api/alumnos/me/avatar", {
        method: "POST",
        body: formData,
        isForm: true,
      });

      if (res?.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
      }

      setMsg("Avatar actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setMsg("Error al actualizar la foto.");
    }
  }

  // ============================
  // 3) Cambiar contraseña real
  // ============================
  async function onChangePassword() {
    setMsg("");

    if (!passForm.oldPass || !passForm.newPass || !passForm.confirmPass) {
      setMsg("Completa todos los campos.");
      return;
    }

    if (passForm.newPass !== passForm.confirmPass) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/alumnos/me/password", {
        method: "POST",
        body: {
          oldPassword: passForm.oldPass,
          newPassword: passForm.newPass,
        },
      });

      if (res?.ok) {
        setMsg("Contraseña actualizada correctamente.");
        setPassForm({ oldPass: "", newPass: "", confirmPass: "" });
      }
    } catch (err) {
      console.error(err);
      setMsg("Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-wrap">
      <div className="profile-grid">

        {/* ============================
            FOTO DEL ALUMNO
        ============================ */}
        <div className="profile-left">
          <h2 className="profile-title">Mi Perfil</h2>

          <div className="profile-avatar-box">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="profile-avatar"
            />

            <label className="btn small" style={{ marginTop: "12px" }}>
              Cambiar foto
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onAvatarChange}
              />
            </label>
          </div>
        </div>

        {/* ============================
             DATOS PERSONALES
        ============================ */}
        <div className="profile-center">
          <h3 className="section-title">Datos personales</h3>

          <div className="profile-data">
            <p><strong>Nombre:</strong> {alumno.nombre}</p>
            <p><strong>Apellido:</strong> {alumno.apellido}</p>
            <p><strong>DNI:</strong> {alumno.dni}</p>
            <p><strong>Email:</strong> {alumno.email}</p>
            <p><strong>Teléfono:</strong> {alumno.telefono || "No registrado"}</p>
          </div>

          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        {/* ============================
            CAMBIAR CONTRASEÑA
        ============================ */}
        <div className="profile-right">
          <h3 className="section-title">Cambiar contraseña</h3>

          <input
            type="password"
            placeholder="Contraseña actual"
            value={passForm.oldPass}
            onChange={(e) =>
              setPassForm({ ...passForm, oldPass: e.target.value })
            }
            className="input"
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={passForm.newPass}
            onChange={(e) =>
              setPassForm({ ...passForm, newPass: e.target.value })
            }
            className="input"
          />

          <input
            type="password"
            placeholder="Confirmar nueva"
            value={passForm.confirmPass}
            onChange={(e) =>
              setPassForm({ ...passForm, confirmPass: e.target.value })
            }
            className="input"
          />

          <button
            className="btn"
            disabled={loading}
            onClick={onChangePassword}
          >
            {loading ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </div>
      </div>

      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}
