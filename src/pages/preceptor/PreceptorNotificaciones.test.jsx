import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import PreceptorNotificaciones from "./PreceptorNotificaciones";

const sampleNotis = [
  {
    id: 1,
    titulo: "Recordatorio de asistencia",
    fecha: "2025-10-10T08:00:00Z",
    fav: false,
    leida: false,
    texto: "Texto de prueba",
  },
];

const fmtFechaHora = (iso) => iso; // en el test no importa el formato real

describe("PreceptorNotificaciones", () => {
  test("muestra título, badge de no leídas y una notificación", () => {
    render(
      <PreceptorNotificaciones
        notisVisibles={sampleNotis}
        notiFilter="todas"
        setNotiFilter={vi.fn()}
        unreadCount={1}
        notiQuery=""
        setNotiQuery={vi.fn()}
        toggleFav={vi.fn()}
        fmtFechaHora={fmtFechaHora}
        toggleLeida={vi.fn()}
        eliminarNoti={vi.fn()}
        onVolver={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: /notificaciones/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Recordatorio de asistencia")
    ).toBeInTheDocument();

    expect(screen.getByText(/1 sin leer/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/ej: matemáticas, inscripción/i)
    ).toBeInTheDocument();
  });

  test("permite cambiar el filtro y marcar una notificación como favorita", () => {
    const setNotiFilter = vi.fn();
    const toggleFav = vi.fn();

    render(
      <PreceptorNotificaciones
        notisVisibles={sampleNotis}
        notiFilter="todas"
        setNotiFilter={setNotiFilter}
        unreadCount={1}
        notiQuery=""
        setNotiQuery={vi.fn()}
        toggleFav={toggleFav}
        fmtFechaHora={fmtFechaHora}
        toggleLeida={vi.fn()}
        eliminarNoti={vi.fn()}
        onVolver={vi.fn()}
      />
    );

    const favFilterBtn = screen.getByRole("button", { name: /favoritos/i });
    fireEvent.click(favFilterBtn);
    expect(setNotiFilter).toHaveBeenCalledWith("favoritas");

    const starBtn = screen.getByRole("button", { name: "☆" });
    fireEvent.click(starBtn);
    expect(toggleFav).toHaveBeenCalledWith(1);
  });
});
