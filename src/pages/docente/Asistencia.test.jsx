import { render, screen, fireEvent } from "@testing-library/react";
import Asistencia from "./Asistencia";

describe("Asistencia (vista docente)", () => {
  test("muestra el título y la tabla con alumnos", () => {
    render(<Asistencia />);

    // Título de la vista
    expect(
      screen.getByRole("heading", { name: /asistencia/i })
    ).toBeInTheDocument();

    // Apellidos de los alumnos iniciales
    expect(screen.getByText("Bonifacio")).toBeInTheDocument();
    expect(screen.getByText("Aguirre")).toBeInTheDocument();
  });

  test("marca todos como presentes y luego permite desmarcar", () => {
    render(<Asistencia />);

    // Botón para marcar todos
    const botonMarcarTodos = screen.getByRole("button", {
      name: /marcar todos como presentes/i,
    });

    // Primer click: marcar todos como presentes
    fireEvent.click(botonMarcarTodos);

    // El texto del botón cambia a "Desmarcar todos"
    expect(
      screen.getByRole("button", { name: /desmarcar todos/i })
    ).toBeInTheDocument();

    // Todos los botones "P" deberían tener la clase "activo-P"
    const botonesP = screen.getAllByText("P");
    expect(botonesP.length).toBeGreaterThan(0);

    botonesP.forEach((btn) => {
      expect(btn.className).toContain("activo-P");
    });

    // Segundo click: desmarcar todos
    const botonDesmarcar = screen.getByRole("button", {
      name: /desmarcar todos/i,
    });
    fireEvent.click(botonDesmarcar);

    // Vuelve a aparecer el texto original
    expect(
      screen.getByRole("button", { name: /marcar todos como presentes/i })
    ).toBeInTheDocument();
  });
});
