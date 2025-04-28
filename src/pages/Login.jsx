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
      setError("Credenciais inválidas");
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="wrapper-content">
        <div className="container">
          <span className="heading">Entre na sua conta </span>

          {error && <div className="error-message">{error}</div>}

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
                id="password"
              />
              <label htmlFor="senha">Password</label>
              <div className="passicon" onClick={togglePasswordVisibility}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </div>
            </div>

            <div className="btn-container">
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
              <div className="acc-text">
                {/* Não tem uma conta ?{" "} */}
                <Link className="link" to="/register">
                  {/* Criar uma conta */}
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
