import React from "react";
import "../../styles/FAQ.css";

const FAQ = () => {
  return (
    <div className="faq-container">
      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <div className="faq-item">
        <h3>Was ist Player Lounge Server Hosting?</h3>
        <p>
          Player Lounge Server Hosting bietet leistungsstarke und flexible
          Hosting-Lösungen für Spiele wie Minecraft, CS:GO und viele andere.
          Wir ermöglichen es dir, deinen eigenen Gaming-Server einfach zu hosten.
        </p>
      </div>
      <div className="faq-item">
        <h3>Wie kann ich meinen Server starten?</h3>
        <p>
          Nach der Anmeldung kannst du einen neuen Server direkt über das
          Dashboard starten. Wähle einfach den gewünschten Servertyp und
          klicke auf „Server starten“.
        </p>
      </div>
      <div className="faq-item">
        <h3>Kann ich mehrere Server gleichzeitig betreiben?</h3>
        <p>
          Ja, du kannst so viele Server betreiben, wie du möchtest, je nach
          dem Plan, den du wählst.
        </p>
      </div>
      <div className="faq-item">
        <h3>Wie funktioniert das Aufladen von Guthaben?</h3>
        <p>
          Du kannst Guthaben über verschiedene Zahlungsmethoden aufladen, wie
          PayPal, Kreditkarte oder Banküberweisung. Das aufgeladene Guthaben
          wird dann sofort auf dein Konto gutgeschrieben.
        </p>
      </div>
      <div className="faq-item">
        <h3>Gibt es einen Support?</h3>
        <p>
          Ja, wir bieten 24/7 Support über unser Ticketsystem und Live-Chat.
          Unser Team hilft dir bei allen Fragen und Problemen.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
