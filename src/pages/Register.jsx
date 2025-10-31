import React, { useState } from "react";
import "../css/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";

const Register = ({ onRegister }) => {
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
      const response = await register(data);
      localStorage.setItem("authenticated", "true");
      localStorage.setItem("userData", JSON.stringify(response || {}));
      onRegister();
      navigate("/");
      setIsLoading(false);
    } catch (error) {
      //console.error("Erro ao fazer registro:", error);
      setError("Erro ao criar conta. Verifique os dados e tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="wrapper-content">
        <div className="container">
          <h1 className="heading">Criar sua conta</h1>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form" role="form">
            <div className="input-field">
              <input required autoComplete="off" name="nome" id="nome" />
              <label htmlFor="nome">Nome Completo</label>
            </div>

            <div className="input-field">
              <input required autoComplete="off" name="usuario" id="usuario" />
              <label htmlFor="usuario">Nome de Usuario</label>
            </div>

            <div className="input-field">
              <input
                required
                autoComplete="off"
                name="email"
                id="email"
                type="email"
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-field">
              <input
                required
                type="tel"
                autoComplete="off"
                name="telefone"
                id="telefone"
              />
              <label htmlFor="telefone">Telefone</label>
            </div>

            <div className="input-field">
              <input
                required
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                name="senha"
                id="senha"
              />
              <label htmlFor="senha">Password</label>

              <button
                type="button"
                className="passicon"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div className="btn-container">
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar"}
              </button>

              <div className="acc-text">
                Já tem uma conta?{" "}
                <Link className="link" to="/login">
                  Entrar
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
