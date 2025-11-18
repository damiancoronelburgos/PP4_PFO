import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import PreceptorPerfil from "./PreceptorPerfil";

const baseProps = (overrides = {}) => ({
  avatar: "https://example.com/avatar.png",
  displayName: "Juan Pérez",
  email: "preceptor@example.com",
  roles: ["Preceptor", "Tutor"],
  fileRef: { current: null },
  onPhotoChange: vi.fn(),
  choosePhoto: vi.fn(),
  showPwd: false,
  setShowPwd: vi.fn(),
  currentPwd: "",
  setCurrentPwd: vi.fn(),
  pwd1: "",
  setPwd1: vi.fn(),
  pwd2: "",
  setPwd2: vi.fn(),
  pwdLoading: false,
  savePassword: vi.fn(),
  onVolver: vi.fn(),
  ...overrides,
});

describe("PreceptorPerfil", () => {
  test("muestra datos básicos y lista de roles", () => {
    const props = baseProps();
    render(<PreceptorPerfil {...props} />);

    expect(
      screen.getByRole("heading", { name: "Juan Pérez" })
    ).toBeInTheDocument();

    expect(screen.getByText("preceptor@example.com")).toBeInTheDocument();
    expect(screen.getByText("Preceptor")).toBeInTheDocument();
    expect(screen.getByText("Tutor")).toBeInTheDocument();
  });

  test("al hacer clic en 'Cambiar contraseña' llama a setShowPwd(true)", () => {
    const setShowPwd = vi.fn();
    const props = baseProps({ setShowPwd });

    render(<PreceptorPerfil {...props} />);

    const cambiarBtn = screen.getByRole("button", {
      name: /cambiar contraseña/i,
    });

    fireEvent.click(cambiarBtn);

    expect(setShowPwd).toHaveBeenCalledWith(true);
  });

  test("cuando showPwd es true muestra el formulario y permite guardar", () => {
    const savePassword = vi.fn();

    const props = baseProps({
      showPwd: true,
      savePassword,
      currentPwd: "",
      pwd1: "",
      pwd2: "",
    });

    render(<PreceptorPerfil {...props} />);

    expect(
      screen.getByPlaceholderText("Contraseña actual")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Nueva contraseña")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Repetir nueva contraseña")
    ).toBeInTheDocument();

    const guardarBtn = screen.getByRole("button", { name: /guardar/i });
    fireEvent.click(guardarBtn);

    expect(savePassword).toHaveBeenCalled();
  });
});
