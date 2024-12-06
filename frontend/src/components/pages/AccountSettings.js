import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AccountSettings.css";

const AccountSettings = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(true); // Bearbeitungsmodus
  const [message, setMessage] = useState("");

  // Beim Laden der Komponente gespeicherte Daten abrufen
  useEffect(() => {
    const storedData = localStorage.getItem("accountSettings");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setEmail(parsedData.email || "");
      setAddress(parsedData.address || "");
      setCity(parsedData.city || "");
      setPostalCode(parsedData.postalCode || "");
      setCountry(parsedData.country || "");
      setPhone(parsedData.phone || "");
    }
  }, []);

  // Speichern der Änderungen
  const handleSave = () => {
    if (!email || !address || !city || !postalCode || !country || !phone) {
      setMessage("Bitte fülle alle Felder aus.");
      return;
    }

    const newSettings = { email, address, city, postalCode, country, phone };
    localStorage.setItem("accountSettings", JSON.stringify(newSettings)); // Speichern in localStorage
    setMessage("Einstellungen erfolgreich gespeichert!");
    setIsEditing(false); // Bearbeitungsmodus deaktivieren
  };

  // Bearbeiten aktivieren
  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
  };

  return (
    <div className="account-settings-container">
      <h1>Kontoeinstellungen</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="form-group">
          <label>E-Mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail eingeben"
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Adresse:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Adresse eingeben"
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Stadt:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Stadt eingeben"
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Postleitzahl:</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="PLZ eingeben"
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Land:</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Land eingeben"
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Telefonnummer:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefonnummer eingeben"
            disabled={!isEditing}
          />
        </div>

        {isEditing ? (
          <button type="submit" className="save-button">
            Speichern
          </button>
        ) : (
          <button type="button" className="edit-button" onClick={handleEdit}>
            Bearbeiten
          </button>
        )}
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AccountSettings;
