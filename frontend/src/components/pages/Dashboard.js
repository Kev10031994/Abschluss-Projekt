import React, { useEffect, useState } from "react";
import { Typography, Grid, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

const Dashboard = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📌 Server-Daten abrufen
  const fetchServers = async () => {
    try {
      const response = await fetch("http://63.176.70.153:5000/api/servers?userId=2");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Server.");
      }

      const data = await response.json();
      console.log("Server-Daten:", data); // Debug-Log
      setServers(data);
    } catch (error) {
      console.error("❌ Fehler beim Laden der Server:", error);
      toast.error("❌ Fehler beim Laden der Server.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleAddServer = () => {
    navigate("/serverliste");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "20px",
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          style={{ color: "#00ffcc", fontWeight: "bold" }}
        >
          Gamecloud Dashboard
        </Typography>
        <Typography
          style={{
            marginBottom: "20px",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Guthaben: <span style={{ color: "#00ffcc" }}>0,00 €</span>
        </Typography>
        <Button
          variant="contained"
          style={{
            marginBottom: "20px",
            width: "100%",
            backgroundColor: "#00ffcc",
            color: "#101014",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/dashboard/guthaben")}
        >
          Guthaben aufladen
        </Button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Typography
          variant="h4"
          style={{ color: "#00ffcc", fontWeight: "bold", marginBottom: "20px" }}
        >
          Gamecloud Dashboard
        </Typography>

        {/* Ladezustand anzeigen */}
        {loading ? (
          <Typography style={{ textAlign: "center", marginTop: "100px" }}>
            Server werden geladen...
          </Typography>
        ) : servers.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "10px",
              color: "white",
            }}
          >
            <Typography
              variant="h6"
              style={{
                marginBottom: "20px",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              Es sind derzeit keine Gameclouds aktiv.
            </Typography>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#00ffcc",
                color: "#101014",
                fontWeight: "bold",
              }}
              onClick={handleAddServer}
            >
              Server hinzufügen
            </Button>
          </div>
        ) : (
          <Grid container spacing={2}>
            {servers.map((server) => (
              <Grid item xs={12} md={6} key={server.id}>
                <Paper
                  style={{
                    padding: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ fontWeight: "bold", color: "#00ffcc" }}
                  >
                    {server.instance_id || "Unbekannter Server"}
                  </Typography>
                  <Typography>Status: {server.status || "Unbekannt"}</Typography>
                  <Typography>Slots: {server.slots || 0}</Typography>
                  <Typography>
                    Erstellt am: {new Date(server.created_at).toLocaleString()}
                  </Typography>
                  <div style={{ marginTop: "10px" }}>
                    <Button
                      variant="contained"
                      style={{
                        marginRight: "10px",
                        backgroundColor: "#00ffcc",
                        color: "#101014",
                        fontWeight: "bold",
                      }}
                    >
                      Laufzeit verlängern
                    </Button>
                    <Button
                      variant="outlined"
                      style={{
                        borderColor: "#00ffcc",
                        color: "#00ffcc",
                        fontWeight: "bold",
                      }}
                      onClick={() =>
                        navigate(`/dashboard/server/${server.id}`)
                      }
                    >
                      Server bearbeiten
                    </Button>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
