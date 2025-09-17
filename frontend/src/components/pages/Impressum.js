// src/components/pages/Impressum.js
import React from "react";
import "../../styles/Impressum.css";

const Impressum = () => {
  return (
    <div className="page-container">
      <h1>Impressum</h1>
      <div className="content-container">
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>Player Lounge GmbH</p>
        <p>Adresse: Hammerstraße 19, 58791 Werdohl</p>
        <p>Vertreten durch: Kevin Böhning</p>
        <h2>Kontakt</h2>
        <p>Telefon: +4917631655899</p>
        <p>E-Mail: service@player-lounge.de</p>
        <h2>Umsatzsteuer-ID</h2>
        <p>USt-IdNr.: DE123456789</p>
        <h2>Haftungsausschluss</h2>
        <p>
          Der Inhalt dieser Website wurde mit größtmöglicher Sorgfalt erstellt. 
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
        <p>Weitere rechtliche Hinweise...</p>
      </div>
    </div>
  );
};

export default Impressum;
