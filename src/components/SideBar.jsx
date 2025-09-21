import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/SideBar.css";

const SideBar = ({ handleLogout }) => {
  // Estado para controlar a visibilidade da sidebar em telas pequenas (mobile)
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Função para abrir/fechar a sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Função para garantir que a sidebar feche ao clicar em um item de menu no modo mobile
  const closeSidebar = () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Botão "Hambúrguer" que só aparece em telas menores (controlado via CSS) */}
      <button
        className="hamburger-btn"
        onClick={toggleSidebar}
        aria-expanded={isSidebarOpen} // Acessibilidade: Informa se o menu está expandido ou não
        aria-controls="sidebar-nav"     // Acessibilidade: Informa qual elemento este botão controla
        aria-label={isSidebarOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"} // Acessibilidade: Label dinâmico
      >
        {/* Ícone de hambúrguer feito com spans para estilização */}
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* A classe 'open' será adicionada/removida com base no estado 'isSidebarOpen' */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src="/logo.jpeg" alt="Logo da ONG UPAR" className="sidebar-logo" />
          <h2 id="nav-heading">ONG UPAR</h2>
        </div>

        {/* Acessibilidade: 
          - O ID aqui é usado pelo 'aria-controls' do botão hambúrguer.
          - 'aria-labelledby' dá um nome acessível a esta seção de navegação.
        */}
        <nav className="sidebar-nav" id="sidebar-nav" aria-labelledby="nav-heading">
          <NavLink
            to="/agendamentos"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)} // Acessibilidade: Informa a página atual
            onClick={closeSidebar}
          >
            <span className="nav-icon" aria-hidden="true">🗓️</span>
            <span>Agendamentos</span>
          </NavLink>

          <NavLink
            to="/cadastro"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            onClick={closeSidebar}
          >
            <span className="nav-icon" aria-hidden="true">📝</span>
            <span>Cadastro</span>
          </NavLink>

          <NavLink
            to="/consulta"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            onClick={closeSidebar}
          >
            <span className="nav-icon" aria-hidden="true">🔍</span>
            <span>Consulta</span>
          </NavLink>

          <NavLink
            to="/relatorios"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            onClick={closeSidebar}
          >
            <span className="nav-icon" aria-hidden="true">📊</span>
            <span>Relatórios</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon" aria-hidden="true">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
