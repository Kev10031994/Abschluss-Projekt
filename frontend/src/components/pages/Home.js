import React from "react";
import "../../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartNowClick = () => {
    if (user) {
      // Wenn der Benutzer bereits eingeloggt ist, zum Dashboard weiterleiten
      navigate("/dashboard");
    } else {
      // Wenn der Benutzer nicht eingeloggt ist, zur Registrierung weiterleiten
      navigate("/auth");
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Willkommen bei Player Lounge Server Hosting</h1>
        <p>
          Mit <strong>Player Lounge Server Hosting</strong> kannst du deine
          eigenen Gaming-Server einfach und flexibel hosten. Egal ob Minecraft,
          CS:GO oder andere Spiele – bei uns bist du richtig!
        </p>
        <p>
          Starte jetzt und genieße leistungsstarkes Hosting mit nahtloser
          Integration in unsere Community.
        </p>

        <div className="features-section">
          <h2>Unsere Features</h2>
          <div className="feature-item">
            <h3>Leistungsstarke Server</h3>
            <p>
              Unsere Server bieten dir eine unglaubliche Leistung für jedes
              Spiel. Spiele in hoher Qualität ohne Lag oder Ausfälle!
            </p>
          </div>
          <div className="feature-item">
            <h3>Einfache Verwaltung</h3>
            <p>
              Verwalte deine Server bequem mit einem benutzerfreundlichen
              Dashboard. Starte, stoppe und passe deine Server nach deinen
              Wünschen an.
            </p>
          </div>
          <div className="feature-item">
            <h3>Support 24/7</h3>
            <p>
              Unser Support-Team ist rund um die Uhr für dich da, um bei
              Problemen zu helfen und sicherzustellen, dass deine Server
              reibungslos laufen.
            </p>
          </div>
        </div>
        
        {/* Call to Action für Anmeldung */}
        <div className="cta-section">
          <h2>Starte jetzt deine Server</h2>
          <p>Registriere dich und starte noch heute deinen eigenen Server!</p>
          <button className="cta-button" onClick={handleStartNowClick}>Jetzt starten</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
