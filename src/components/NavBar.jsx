import { Link, useLocation } from "react-router-dom";
import "../css/NavBar.css";

export const NavBar = ({ handleLogout, isLogin }) => {
  const location = useLocation();

  return isLogin ? (
    <nav className="simple-navbar">
      <div className="navbar-brand">
        <img src="/logo.jpeg" alt="logo" />
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname == "/" ? "active" : ""}>
          Home
        </Link>
        <Link
          to="/reports"
          className={location.pathname == "/reports" ? "active" : ""}
        >
          Relatórios
        </Link>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Sair
      </button>
    </nav>
  ) : (
    <nav className="simple-navbar">
      <div className="navbar-brand">
        <span>ONG UPAR</span>
        <img src="/logo.jpeg" alt="logo" />
      </div>
    </nav>
  );
};
