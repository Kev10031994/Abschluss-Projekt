import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Login-Funktion
  const login = async (email, password) => {
    try {
      const response = await fetch("http://63.176.70.153:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const loggedInUser = { username: data.user.name, email: data.user.email }; // Assuming 'name' and 'email' are returned
        setUser(loggedInUser); // Update user state
        localStorage.setItem("user", JSON.stringify(loggedInUser)); // Store in localStorage
        return true;
      } else {
        console.error(data.error);
        return false;
      }
    } catch (error) {
      console.error("Login fehlgeschlagen:", error);
      return false;
    }
  };

  // Logout-Funktion
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // AuthContext useEffect: Lädt den Benutzer aus dem LocalStorage beim Start
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
