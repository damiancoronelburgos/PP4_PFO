import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Acta from "./Acta";

describe("Acta (vista docente)", () => {
  test("muestra título, buscador y alumnos", () => {
    render(<Acta />);

    // Título principal
    expect(
      screen.getByRole("heading", { name: /acta de cursada/i })
    ).toBeInTheDocument();

    // Buscador por apellido
    expect(
      screen.getByPlaceholderText("Buscar por apellido")
    ).toBeInTheDocument();

    // Alumno inicial
    expect(screen.getByText("GOMEZ, Nicolás")).toBeInTheDocument();
  });

  test("al hacer clic en Guardar muestra la alerta de confirmación", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Acta />);

    const guardarBtn = screen.getByRole("button", { name: /guardar/i });
    fireEvent.click(guardarBtn);

    expect(alertSpy).toHaveBeenCalledWith("Acta guardada!");

    alertSpy.mockRestore();
  });
});
