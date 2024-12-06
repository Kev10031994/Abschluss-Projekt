import React from "react";
import { Typography, Grid, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const servers = []; // Noch keine aktiven Gameclouds

  const handleAddServer = () => {
    navigate("/serverliste"); // Weiterleitung zur Serverliste
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Transparenter Hintergrund
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Transparente Sidebar
          color: "white",
          padding: "20px",
          borderRight: "1px solid rgba(255, 255, 255, 0.2)", // Trennung zur Hauptseite
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

        {servers.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparenter Bereich
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparente Karten
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)", // Dezente Rahmen
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ fontWeight: "bold", color: "#00ffcc" }}
                  >
                    {server.name}
                  </Typography>
                  <Typography>Status: {server.status}</Typography>
                  <Typography>Slots: {server.slots}</Typography>
                  <Typography>Preis: {server.price} pro Periode</Typography>
                  <Typography>
                    Verbleibende Zeit: {server.timeRemaining}
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
                      Edit Server
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
