import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/LoginRegisterPage.css";
import { toast } from 'react-toastify'; // Für Toast-Benachrichtigungen

const LoginRegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Fehlermeldung zurücksetzen

    if (isRegistering) {
      // Registrierung
      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage("Benutzername, E-Mail und Passwort sind erforderlich!");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwörter stimmen nicht überein!");
        return;
      }

      try {
        const response = await fetch("http://18.153.106.156:5000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Registrierung erfolgreich! Bitte überprüfe deine E-Mails.');
          setIsRegistering(false); // Zurück zum Login-Modus
        } else {
          setErrorMessage(data.error || "Registrierung fehlgeschlagen.");
          toast.error('Registrierung fehlgeschlagen.');
        }
      } catch (err) {
        setErrorMessage("Serverfehler. Bitte versuche es später erneut.");
        toast.error('Serverfehler. Bitte versuche es später erneut.');
      }
    } else {
      // Login
      if (!email.trim() || !password.trim()) {
        setErrorMessage("E-Mail und Passwort sind erforderlich!");
        return;
      }

      try {
        const success = await login(email, password);
        if (!success) {
          setErrorMessage("Benutzername oder Passwort ist falsch!");
          toast.error("Benutzername oder Passwort ist falsch!");
        } else {
          const redirectPath = location.state?.from || "/dashboard"; // Weiterleitung nach Login
          toast.success("Login erfolgreich!");
          navigate(redirectPath);
        }
      } catch (err) {
console.log(err)
        setErrorMessage("Serverfehler. Bitte versuche es später erneut.");
        toast.error("Serverfehler. Bitte versuche es später erneut.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? "Registrieren" : "Login"}</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        {isRegistering && (
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegistering && (
          <input
            type="password"
            placeholder="Passwort bestätigen"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <button type="submit">{isRegistering ? "Registrieren" : "Login"}</button>
      </form>
      <button
        className="switch"
        onClick={() => {
          setErrorMessage(""); // Fehlermeldung zurücksetzen
          setIsRegistering(!isRegistering);
        }}
      >
        {isRegistering ? "Zurück zum Login" : "Noch kein Konto? Jetzt registrieren"}
      </button>
    </div>
  );
};

export default LoginRegisterPage;
