const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS-Konfiguration
const corsOptions = {
  origin: 'http://localhost:3000', // Erlaube Anfragen nur vom Frontend
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parser
app.use(bodyParser.json());

// MySQL-Datenbankverbindung
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Oschi.451', // Ersetze mit deinem MySQL-Root-Passwort
  database: 'player_lounge', // Der Name deiner Datenbank
});

// Verbindung zur Datenbank herstellen
db.connect((err) => {
  if (err) {
    console.error('Datenbankverbindung fehlgeschlagen:', err);
    process.exit(1);
  }
  console.log('Mit der MySQL-Datenbank verbunden.');
});

// API-Endpunkt für Registrierung
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  // Überprüfen, ob der Benutzer bereits existiert
  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, result) => {
    if (err) {
      console.error('Fehler beim Überprüfen des Benutzers:', err);
      return res.status(500).json({ error: 'Serverfehler. Bitte später erneut versuchen.' });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: 'E-Mail wird bereits verwendet.' });
    }

    // Benutzer in die Datenbank einfügen
    const insertUserQuery = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [name, email, password], (err, result) => {
      if (err) {
        console.error('Fehler beim Hinzufügen des Benutzers:', err);
        return res.status(500).json({ error: 'Serverfehler. Bitte später erneut versuchen.' });
      }

      res.status(201).json({ message: 'Benutzer erfolgreich registriert!' });
    });
  });
});

// API-Endpunkt für Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  const getUserQuery = 'SELECT * FROM users WHERE email = ? AND password_hash = ?';
  db.query(getUserQuery, [email, password], (err, result) => {
    if (err) {
      console.error('Fehler beim Abrufen des Benutzers:', err);
      return res.status(500).json({ error: 'Serverfehler. Bitte später erneut versuchen.' });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'Ungültige E-Mail oder Passwort.' });
    }

    res.status(200).json({ message: 'Login erfolgreich!' });
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
