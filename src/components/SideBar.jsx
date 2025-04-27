import React from "react";
import { NavLink } from "react-router-dom";
import "../css/SideBar.css";

const SideBar = ({ handleLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.jpeg" alt="Logo" className="sidebar-logo" />
        <h2>ONG UPAR</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/agendamentos"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>Agendamentos</span>
        </NavLink>

        <NavLink
          to="/cadastro"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>Cadastro</span>
        </NavLink>

        <NavLink
          to="/consulta"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>Consulta</span>
        </NavLink>

        <NavLink
          to="/relatorios"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>Relatórios</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
