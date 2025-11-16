import React from "react";

export default function PreceptorSidebar({
  avatar,
  displayName,
  items,
  active,
  unreadCount,
  pendingJustCount,
  onChangeSection,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
        <div className="sb-profile">
          <img src={avatar} alt={displayName} className="sb-avatar" />
          <p className="sb-role">Preceptor/a</p>
          <p className="sb-name">{displayName}</p>
        </div>

        <div className="sb-menu">
          {items.map((it) => {
            const isInicio = it.id === "inicio";
            const isActive = isInicio
              ? active === null || active === "inicio"
              : active === it.id;

            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onChangeSection(isInicio ? null : it.id)}
                className={"sb-item" + (isActive ? " is-active" : "")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="sb-item__icon" />
                <span className="sb-item__text">{it.label}</span>

                {it.id === "notificaciones" && unreadCount > 0 && (
                  <span className="sb-badge">{unreadCount}</span>
                )}
                {it.id === "justificaciones" && pendingJustCount > 0 && (
                  <span className="sb-badge">{pendingJustCount}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="sb-footer">
          <button className="btn btn-secondary" onClick={onLogout}>
            Salir ✕
          </button>
        </div>
      </div>
    </aside>
  );
}