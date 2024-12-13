import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/EmailVerification.css";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/verify-email/${token}`);
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setTimeout(() => {
            navigate("/auth"); // Nach der Bestätigung zur Login-Seite
          }, 3000);
        } else {
          setMessage(data.error || "Fehler bei der Bestätigung.");
        }
      } catch (err) {
        setMessage("Es gab einen Fehler beim Bestätigen der E-Mail.");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="email-verification-container">
      <h1>Email Bestätigung</h1>
      <p>{message}</p>
    </div>
  );
};

export default EmailVerification;
