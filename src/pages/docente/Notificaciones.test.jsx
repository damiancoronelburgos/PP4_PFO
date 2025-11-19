import { render, screen, fireEvent } from "@testing-library/react";
import Notificaciones from "./Notificaciones";

describe("Notificaciones (vista docente)", () => {
  test("muestra el título y las notificaciones iniciales", () => {
    render(<Notificaciones />);

    // Título
    expect(
      screen.getByRole("heading", { name: /notificaciones/i })
    ).toBeInTheDocument();

    // Buscador
    expect(
      screen.getByPlaceholderText("Buscar por palabra...")
    ).toBeInTheDocument();

    // Notificaciones de ejemplo
    expect(
      screen.getByText("Entrega de Actas de Cursada")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nueva Comisión Asignada")
    ).toBeInTheDocument();
  });

  test("permite marcar una notificación como favorita y filtrar solo favoritas", () => {
    render(<Notificaciones />);

    // Estrellitas que NO son favoritas al inicio (span con title="Marcar como favorito")
    const estrellasNoFav = screen.getAllByTitle(/marcar como favorito/i);
    expect(estrellasNoFav.length).toBeGreaterThan(0);

    // Click en la primera estrellita (Entrega de Actas de Cursada)
    fireEvent.click(estrellasNoFav[0]);

    // Después del click debería tener la clase 'favorito'
    expect(estrellasNoFav[0].className).toContain("favorito");

    // Activar filtro "⭐ Favoritos"
    const favoritosCheckbox = screen.getByLabelText(/favoritos/i);
    fireEvent.click(favoritosCheckbox);

    // Quedan visibles sólo las favoritas:
    // - "Entrega de Actas de Cursada" (la marcamos recién)
    // - "Nueva Comisión Asignada" (ya venía como favorita)
    expect(
      screen.getByText("Entrega de Actas de Cursada")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nueva Comisión Asignada")
    ).toBeInTheDocument();

    // "Actualización del Sistema" NO debería verse en favoritos
    expect(
      screen.queryByText("Actualización del Sistema")
    ).not.toBeInTheDocument();
  });
});
