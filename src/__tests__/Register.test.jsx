import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Register from "../pages/Register";

vi.mock("../services/auth", () => ({
  register: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { register } from "../services/auth";

describe("Register component", () => {
  const mockOnRegister = vi.fn();

  const setup = () =>
    render(
      <BrowserRouter>
        <Register onRegister={mockOnRegister} />
      </BrowserRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza todos os campos do formulário e o botão", () => {
    setup();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome de Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Registrar/i })
    ).toBeInTheDocument();
  });

  it("Ativa a vizualicao do campo de senha", () => {
    setup();
    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleButton = screen.getByRole("button", { name: /Mostrar senha/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("chama o registro e navega em caso de sucesso", async () => {
    register.mockResolvedValueOnce({ id: 1, nome: "Andre" });

    setup();
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: "Andre" },
    });
    fireEvent.change(screen.getByLabelText(/Nome de Usuario/i), {
      target: { value: "andre" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "a@a.com" },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalled();
      expect(mockOnRegister).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("mostra mensagem de erro ao falhar o registro", async () => {
    register.mockRejectedValueOnce(new Error("Erro"));
    setup();

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: "Andre" },
    });
    fireEvent.change(screen.getByLabelText(/Nome de Usuario/i), {
      target: { value: "andre" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "g@g.com" },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    const alert = await screen.findByRole("alert", {}, { timeout: 3000 });
    expect(alert).toHaveTextContent(/Erro ao criar conta/i);
  });
});
