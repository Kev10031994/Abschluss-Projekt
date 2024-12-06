import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/NavBar.css";

const Navbar = () => {
  const { user, logout } = useAuth(); // Authentifizierungsdaten
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth"); // Weiterleitung zur Login-Seite nach Logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-link">Home</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/serverliste" className="navbar-link">Server Liste</Link>
        </li>
        <li>
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        </li>
        {/* Hinzugefügt: Impressum und FAQ Links */}
        <li>
          <Link to="/impressum" className="navbar-link">Impressum</Link>
        </li>
        <li>
          <Link to="/faq" className="navbar-link">FAQ</Link>
        </li>
      </ul>
      <div className="navbar-user">
        {user ? (
          <div className="navbar-dropdown">
            <span className="navbar-username">Willkommen, {user.username}</span>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-link">Profil</Link>
              <Link to="/account-settings" className="dropdown-link">Kontoeinstellungen</Link>
              <button className="navbar-logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        ) : (
          <Link to="/auth" className="navbar-login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
