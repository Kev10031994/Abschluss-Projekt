import React, { useState } from "react";
import "../../styles/GuthabenAufladen.css";
import { useNavigate } from "react-router-dom";

const GuthabenAufladen = () => {
  const [amount, setAmount] = useState(10); // Standardwert 10 €
  const navigate = useNavigate();

  const handlePayment = () => {
    navigate("/payment", { state: { price: amount } });
  };

  return (
    <div className="guthaben-aufladen-container">
      <h1>Guthaben aufladen</h1>
      <p>Wähle den Betrag: {amount} €</p>
      <input
        type="range"
        min="1" // Mindestbetrag 1 €
        max="100" // Maximale Grenze 100 €
        step="1" // Schritte in 1 €
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
      />
      <div className="buttons">
        <button onClick={handlePayment}>Weiter zur Zahlung</button>
        <button onClick={() => navigate("/dashboard")}>Abbrechen</button>
      </div>
    </div>
  );
};

export default GuthabenAufladen;
