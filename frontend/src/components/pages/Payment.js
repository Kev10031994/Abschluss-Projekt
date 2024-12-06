import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { price, description, serverName, slots, storage } = location.state || {};

  const paypalButtonRendered = useRef(false);

  useEffect(() => {
    if (!price) {
      alert("Ungültige Zahlungsdaten. Bitte versuchen Sie es erneut.");
      navigate("/");
      return;
    }

    const addPayPalScript = async () => {
      if (!document.querySelector("#paypal-script")) {
        const script = document.createElement("script");
        script.id = "paypal-script";
        script.src = `https://www.paypal.com/sdk/js?client-id=AYNnPC4dbylqMpe_t3sS3BjhLtQSmWj6i8-IY2hABO_rCX2Ne_NO_FEU1RjA2PxJiEDnhnyMTw69rPBU&currency=EUR`;
        script.onload = () => initializePayPalButton();
        document.body.appendChild(script);
      } else {
        initializePayPalButton();
      }
    };

    const initializePayPalButton = () => {
      if (window.paypal && !paypalButtonRendered.current) {
        paypalButtonRendered.current = true;
        window.paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: description || `Server Konfiguration: ${serverName}`,
                    amount: {
                      value: price.toFixed(2),
                      currency_code: "EUR",
                    },
                  },
                ],
              });
            },
            onApprove: (data, actions) => {
              return actions.order.capture().then((details) => {
                alert(
                  `Zahlung erfolgreich abgeschlossen! Vielen Dank, ${details.payer.name.given_name}.`
                );
                navigate("/dashboard");
              });
            },
            onError: (err) => {
              console.error("PayPal-Zahlungsfehler:", err);
              alert(
                "Es gab ein Problem mit der Zahlung. Bitte versuchen Sie es später erneut."
              );
            },
          })
          .render("#paypal-button-container");
      }
    };

    addPayPalScript();
  }, [price, description, serverName, navigate]);

  return (
    <div className="payment-container">
      <h1>Zahlung</h1>
      {description ? (
        <p>{description}</p>
      ) : (
        <p>
          Konfiguration: {serverName} - Slots: {slots}, Speicherplatz: {storage} GB
        </p>
      )}
      <p>Gesamtpreis: {price ? price.toFixed(2) : "Ungültig"} €</p>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default Payment;
