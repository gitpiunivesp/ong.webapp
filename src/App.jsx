import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportsPage from "./pages/ReportsPage";
import "./css/App.css";
import SideBar from "./components/SideBar";
import SchedulePage from "./pages/SchedulePage";
import FormPage from "./pages/FormPage";
import SearchPage from "./pages/SearchPage";

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("authenticated") === "true"
  );

  // Check if current route is login or register
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    const storedAuth = localStorage.getItem("authenticated") === "true";
    setIsAuthenticated(storedAuth);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("authenticated", "true");
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    localStorage.setItem("authenticated", "true");
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("authenticated");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div
      className={`app-container ${isAuthPage ? "auth-layout" : "app-layout"}`}
    >
      {isAuthenticated && !isAuthPage && (
        <SideBar handleLogout={handleLogout} />
      )}

      {isAuthPage && (
        <div className="auth-header">
          <img src="/logo.jpeg" alt="Logo" />
        </div>
      )}

      <main className={isAuthenticated && !isAuthPage ? "main-content" : ""}>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Register onRegister={handleRegister} />
              )
            }
          />

          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<SchedulePage />}
              />
            }
          />
          <Route
            path="/cadastro"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<FormPage />}
              />
            }
          />
          <Route
            path="/consulta"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<SearchPage />}
              />
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<ReportsPage />}
              />
            }
          />

          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? "/agendamentos" : "/login"}
                replace
              />
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/agendamentos" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
