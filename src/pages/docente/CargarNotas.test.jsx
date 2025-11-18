import { render, screen, fireEvent } from "@testing-library/react";
import CargarNotas from "./CargarNotas";

describe("CargarNotas (vista docente)", () => {
  test("muestra el título y los alumnos iniciales", () => {
    render(<CargarNotas />);

    // Título principal de la vista
    expect(
      screen.getByRole("heading", { name: /cargar notas/i })
    ).toBeInTheDocument();

    // Verificamos que al menos un alumno inicial esté en la tabla
    expect(screen.getByText("GOMEZ, Nicolás")).toBeInTheDocument();

    // Si querés también chequear el curso, usamos getAllByText:
    const cursos = screen.getAllByText("Java Estándar 17");
    expect(cursos.length).toBeGreaterThan(0);
  });

  test("filtra alumnos al buscar por nombre/curso", () => {
    render(<CargarNotas />);

    // Campo de búsqueda
    const input = screen.getByPlaceholderText("DNI, Nombre o Curso");
    fireEvent.change(input, { target: { value: "Gimena" } });

    // Botón Buscar
    const botonBuscar = screen.getByRole("button", { name: /buscar/i });
    fireEvent.click(botonBuscar);

    // Debería aparecer Gimena y NO Nicolás
    expect(screen.getByText(/Gimena/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nicolás/i)).not.toBeInTheDocument();
  });
});
