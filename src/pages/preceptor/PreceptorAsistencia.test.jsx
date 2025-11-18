import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import PreceptorAsistencia from "./PreceptorAsistencia";

const baseProps = (overrides = {}) => ({
  comisionesAsistOptions: [{ value: "1A", label: "1A - Programación I" }],
  comisionSel: "1A",
  setComisionSel: vi.fn(),
  fechaAsis: "2025-11-18",
  setFechaAsis: vi.fn(),
  asistenciaList: [
    {
      id: 1,
      apellido: "Gomez",
      nombre: "Nicolás",
      dni: "11111111",
      estado: "P",
    },
  ],
  loadingAsistencia: false,
  errAsistencia: "",
  setEstado: vi.fn(),
  marcarTodos: vi.fn(),
  limpiarAsistencia: vi.fn(),
  guardarAsistencia: vi.fn(),
  onVolver: vi.fn(),
  ...overrides,
});

describe("PreceptorAsistencia", () => {
  test("muestra el título y una fila de alumno en la tabla", () => {
    const props = baseProps();
    render(<PreceptorAsistencia {...props} />);

    expect(
      screen.getByRole("heading", { name: /asistencia/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Gomez")).toBeInTheDocument();
    expect(screen.getByText("11111111")).toBeInTheDocument();
  });

  test("cambiar el estado de un alumno llama a setEstado con id y nuevo valor", () => {
    const setEstado = vi.fn();
    const props = baseProps({ setEstado });
    render(<PreceptorAsistencia {...props} />);

    // 1er select = comisión, 2do = estado del alumno
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(2);

    const estadoSelect = selects[1];
    fireEvent.change(estadoSelect, { target: { value: "A" } });

    expect(setEstado).toHaveBeenCalledWith(1, "A");
  });
});
