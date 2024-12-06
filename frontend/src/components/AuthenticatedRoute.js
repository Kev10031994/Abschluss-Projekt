import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthenticatedRoute = ({ component: Component }) => {
  const { user } = useAuth(); // Authentifizierungsdaten

  // Wenn der Benutzer eingeloggt ist, rendern wir die Komponente, andernfalls leiten wir weiter zur Login-Seite
  return user ? <Component /> : <Navigate to="/auth" />;
};

export default AuthenticatedRoute;
