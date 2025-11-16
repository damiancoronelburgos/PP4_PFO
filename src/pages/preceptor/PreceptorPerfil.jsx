import React from "react";

export default function PreceptorPerfil({
  avatar,
  displayName,
  email,
  roles,
  fileRef,
  onPhotoChange,
  choosePhoto,
  showPwd,
  setShowPwd,
  currentPwd,
  setCurrentPwd,
  pwd1,
  setPwd1,
  pwd2,
  setPwd2,
  pwdLoading,
  savePassword,
  onVolver,
}) {
  return (
    <div className="content">
      <div className="enroll-header mb-12">
        <h1 className="enroll-title">Mi Perfil</h1>
      </div>
      <div className="enroll-card card--pad-lg profile-card">
        <div className="profile-grid">
          <div className="profile-col profile-col--avatar">
            <img src={avatar} alt={displayName} className="profile-avatar-lg" />
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
            <h2 className="profile-name">{displayName}</h2>
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
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
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
                  placeholder="Repetir nueva contraseña"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />
                <div className="row gap-12">
                  <button
                    className="btn btn--success"
                    type="submit"
                    disabled={pwdLoading}
                  >
                    {pwdLoading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setShowPwd(false);
                      setCurrentPwd("");
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
            <h3 className="profile-subtitle">Roles:</h3>
            <ul className="profile-roles">
              {roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card__footer--right">
          <button className="btn" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}