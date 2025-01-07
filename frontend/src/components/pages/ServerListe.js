import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ServerListe.css";

// Importiere die Bilder aus dem src/assets/images-Verzeichnis
import minecraftImage from "../../assets/images/minecraft.png";
import csgoImage from "../../assets/images/csgo.png";
import arkImage from "../../assets/images/ark.png";

const serverList = [
  { id: 1, name: "Minecraft", image: minecraftImage, price: "Ab 8.00" },
  { id: 2, name: "CS:GO", image: csgoImage, price: "Ab 8.00" },
  { id: 3, name: "ARK", image: arkImage, price: "Ab 8.00" },
];

const ServerListe = () => {
  const navigate = useNavigate();

  const handleConfigure = (id, name) => {
    navigate(`/configure/${id}`, { state: { serverName: name } });
  };

  return (
    <div className="serverlist-container">
      <h1>Wähle deinen Server</h1>
      <div className="server-grid">
        {serverList.map((server) => (
          <div
            className="server-card"
            key={server.id}
            onClick={() => handleConfigure(server.id, server.name)}
          >
            <img src={server.image} alt={server.name} />
            <h2>{server.name}</h2>
            <p>{server.price} €/Monat</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerListe;
