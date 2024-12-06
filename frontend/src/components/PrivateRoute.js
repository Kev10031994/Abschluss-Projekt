import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // useAuth verwenden

const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // Holen des Benutzers aus dem AuthContext

  if (!user) {
    // Wenn der Benutzer nicht eingeloggt ist, Weiterleitung zur Login-Seite
    return <Navigate to="/auth" />;
  }

  return children; // Wenn der Benutzer eingeloggt ist, das Kind (z. B. die Payment-Seite) zurückgeben
};

export default PrivateRoute;
