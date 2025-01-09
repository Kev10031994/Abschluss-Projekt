import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { price, description, serverName, slots, storage } = location.state || {};

  const paypalButtonRendered = useRef(false);

  useEffect(() => {
    if (!price || !serverName || !slots) {
      toast.error("❌ Ungültige Konfigurationsdaten. Bitte versuchen Sie es erneut.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
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
              return actions.order.capture().then(async (details) => {
                // Zahlung erfolgreich Toast
                toast.success(`💳 Zahlung erfolgreich! Vielen Dank, ${details.payer.name.given_name}.`, {
                  position: toast.POSITION.TOP_RIGHT,
                  autoClose: 3000,
                });

                try {
                  const response = await fetch("http://63.176.70.153:5000/api/payment-success", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: 11,
                      serverName: serverName || "Minecraft-Server",
                      slots: slots || 10,
                      storage: storage || 50,
                    }),
                  });

                  const result = await response.json();
                  if (response.ok) {
                    // Server gestartet Toast
                    toast.success(`🎮 Minecraft-Server erfolgreich gestartet! IP: ${result.ip}`, {
                      position: toast.POSITION.TOP_RIGHT,
                      autoClose: 3000,
                    });
                    navigate("/dashboard");
                  } else {
                    // Fehler Toast
                    toast.error(`❌ Fehler: ${result.error}`, {
                      position: toast.POSITION.TOP_RIGHT,
                      autoClose: 3000,
                    });
                  }
                } catch (err) {
                  console.error("Fehler beim Starten des Servers:", err);
                  toast.error("❌ Ein Fehler ist aufgetreten. Bitte versuche es später erneut.", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                  });
                }
              });
            },
            onError: (err) => {
              console.error("PayPal-Zahlungsfehler:", err);
              toast.error("❌ Es gab ein Problem mit der Zahlung. Bitte versuchen Sie es später erneut.", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
              });
            },
          })
          .render("#paypal-button-container");
      }
    };

    addPayPalScript();
  }, [price, description, serverName, slots, storage, navigate]);

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
      <ToastContainer />
    </div>
  );
};

export default Payment;
