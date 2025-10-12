import React from "react";
import { FaHome, FaUser, FaCog } from "react-icons/fa";
import "../styles/Sidebar.css";

export default function Sidebar({ activeItem, setActiveItem }) {
  const menuItems = [
    { icon: <FaHome />, text: "Inicio", key: "inicio" },
    { icon: <FaUser />, text: "Perfil", key: "perfil" },
    { icon: <FaCog />, text: "Configuración", key: "config" },
  ];

  return (
    <aside className="sidebar">
      <h2>Instituto Prisma</h2>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={activeItem === item.key ? "active" : ""}
              onClick={() => setActiveItem(item.key)}
            >
              {item.icon}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

