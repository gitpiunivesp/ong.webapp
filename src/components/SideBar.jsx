import React from "react";
import { NavLink } from "react-router-dom";
import "../css/SideBar.css";

const SideBar = ({ handleLogout }) => {
  return (
    // É uma boa prática usar a tag <aside> para uma barra lateral
    <aside className="sidebar">
      <div className="sidebar-header">
        {/* CORREÇÃO 1: Texto alternativo mais descritivo para o logo */}
        <img src="/logo.jpeg" alt="Logo da ONG UPAR" className="sidebar-logo" />
        {/* Adicionado um ID para ser usado pelo aria-labelledby */}
        <h2 id="nav-heading">ONG UPAR</h2>
      </div>

      {/* CORREÇÃO 2: Adicionado aria-labelledby para dar um nome acessível à região de navegação */}
      <nav className="sidebar-nav" aria-labelledby="nav-heading">
        <NavLink
          to="/agendamentos"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <span>Agendamentos</span>
        </NavLink>

        <NavLink
          to="/cadastro"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <span>Cadastro</span>
        </NavLink>

        <NavLink
          to="/consulta"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <span>Consulta</span>
        </NavLink>

        <NavLink
          to="/relatorios"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <span>Relatórios</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
