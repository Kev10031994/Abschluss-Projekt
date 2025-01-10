import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditServer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [server, setServer] = useState({ name: "", slots: 0, storage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServerDetails = async () => {
      try {
        const response = await fetch(`/api/servers/${id}`);
        if (!response.ok) throw new Error("Serverdetails konnten nicht geladen werden.");
        const data = await response.json();
        setServer(data);
      } catch (err) {
        toast.error("❌ Fehler beim Laden der Serverdetails.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(server),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Fehler beim Speichern der Änderungen.");
      }

      toast.success("✅ Server erfolgreich aktualisiert.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      console.error(err);
    }
  };

  if (loading) {
    return <p>Lädt...</p>;
  }

  return (
    <div>
      <h1>Server bearbeiten</h1>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={server.name}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Slots:
        <input
          type="number"
          name="slots"
          value={server.slots}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Speicherplatz (GB):
        <input
          type="number"
          name="storage"
          value={server.storage}
          onChange={handleInputChange}
        />
      </label>
      <button onClick={handleSave}>Speichern</button>
      <ToastContainer />
    </div>
  );
};

export default EditServer;
