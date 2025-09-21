import React, { useState } from "react";
import "../css/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await login(data);
      localStorage.setItem("authenticated", "true");
      localStorage.setItem("userData", JSON.stringify(response || {}));
      onLogin();
      navigate("/");
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Credenciais inválidas. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="wrapper-content">
        <div className="container">
          <h1 className="heading">Entre na sua conta</h1> {/* Melhor usar h1 para o título principal da página */}

          {/* CORREÇÃO 3: Adicionado role="alert" para que o erro seja anunciado por leitores de tela */}
          {error && <div className="error-message" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="input-field">
              <input required autoComplete="off" name="email" id="email" />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-field">
              <input
                required
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                name="password"
                id="password" // O id deve ser único e corresponder ao htmlFor
              />
              {/* CORREÇÃO 1: O htmlFor agora corresponde ao id="password" */}
              <label htmlFor="password">Password</label>

              {/* CORREÇÃO 2: Trocamos a <div> por um <button> para torná-lo acessível via teclado e para leitores de tela. */}
              <button
                type="button" // type="button" impede que ele envie o formulário
                className="passicon"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} // Descreve a ação para leitores de tela
                aria-pressed={showPassword} // Informa se o botão está "ativado" ou não
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div className="btn-container">
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
              <div className="acc-text">
                Não tem uma conta?{" "}
                {/* CORREÇÃO 4: Adicionado o texto "Criar uma conta" que estava comentado */}
                <Link className="link" to="/register">
                  Criar uma conta
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;