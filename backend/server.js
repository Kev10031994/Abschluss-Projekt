const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS-Konfiguration
const corsOptions = {
  origin: 'http://18.153.106.156', // Erlaube Anfragen nur vom Frontend
  methods: ['GET', 'POST'],
  credentials: false,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// MySQL-Datenbankverbindung
const db = mysql.createConnection({
  host: 'abschluss-projekt-db.crsmyimc66af.eu-central-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Fussel10031994,',
  database: 'Player_Lounge',
});

// Verbindung zur Datenbank herstellen
db.connect((err) => {
  if (err) {
    console.error('Datenbankverbindung fehlgeschlagen:', err);
    process.exit(1);
  }
  console.log('Mit der MySQL-Datenbank verbunden.');
});

// Erstelle einen Transporter für den E-Mail-Versand
const transporter = nodemailer.createTransport({
  service: 'gmail', // Hier den gewünschten E-Mail-Dienst angeben
  auth: {
    user: 'kevin.boehning@tn.techstarter.de', // Deine Gmail-Adresse oder SMTP-Daten
    pass: 'eggx mblp lppw mhug',
  },
});

// Registrierung mit E-Mail-Bestätigung
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  try {
    // Generiere ein Bestätigungstoken
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Hash das Passwort
    const hashedPassword = await bcrypt.hash(password, 10);

    // Überprüfe, ob der Benutzername oder die E-Mail bereits existieren
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkUserQuery, [email, name], (err, result) => {
      if (err) {
        console.error("Fehler beim Überprüfen des Benutzers:", err);
        return res.status(500).json({ error: 'Serverfehler. Bitte später erneut versuchen. Hab dich lieb :D' });
      }
      if (result.length > 0) {
        return res.status(400).json({ error: 'Benutzername oder E-Mail wird bereits verwendet.' });
      }

      // Benutzer in der Datenbank speichern mit dem Bestätigungstoken und dem Verifizierungsstatus
      const insertUserQuery = 'INSERT INTO users (username, email, password, verification_token, email_verified) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [ name, email, hashedPassword, verificationToken, false], (err) => {
        if (err) {
          console.error("Fehler beim Speichern des Benutzers:", err);
          return res.status(500).json({ error: 'Fehler beim Speichern des Benutzers.' });
        }

        // Sende die Bestätigungs-E-Mail
        const confirmationUrl = `http://18.153.106.156:3000/verify-email/${verificationToken}`;
        const mailOptions = {
          from: 'deine-email@gmail.com',
          to: email,
          subject: 'E-Mail Bestätigung',
          text: `Klicke auf diesen Link, um deine E-Mail-Adresse zu bestätigen: ${confirmationUrl}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Fehler beim Senden der Bestätigungs-E-Mail:", err);
            return res.status(500).json({ error: 'Fehler beim Senden der Bestätigungs-E-Mail.' });
          }
          res.status(201).json({ message: 'Registrierung erfolgreich. Bitte überprüfe deine E-Mails, um deine Adresse zu bestätigen.' });
        });
      });
    });
  } catch (err) {
    console.error("Fehler beim Registrieren des Benutzers:", err);
    res.status(500).json({ error: 'Serverfehler. Bitte später erneut versuchen. Der Server will dich nicht :)' });
  }
});

// Bestätigungs-Route
app.get('/api/verify-email/:token', (req, res) => {
  const { token } = req.params;

  const verifyUserQuery = 'SELECT * FROM users WHERE verification_token = ?';
  db.query(verifyUserQuery, [token], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ error: 'Ungültiger Bestätigungstoken.' });
    }

    const user = result[0];
    if (user.email_verified) {
      return res.status(400).json({ message: 'Diese E-Mail-Adresse wurde bereits bestätigt.' });
    }

    // Bestätigung durchführen und Token löschen
    const updateVerificationQuery = 'UPDATE users SET email_verified = ?, verification_token = NULL WHERE id = ?';
    db.query(updateVerificationQuery, [true, user.id], (err) => {
      if (err) {
        console.error("Fehler bei der Bestätigung der E-Mail:", err);
        return res.status(500).json({ error: 'Fehler bei der Bestätigung der E-Mail.' });
      }
      res.status(200).json({ message: 'E-Mail erfolgreich bestätigt!' });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(getUserQuery, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Serverfehler. Bitte später erneut versuchen. Ich hasse dich.' });
    }
    if (result.length === 0) {
      return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });
    }

    const user = result[0];
    if (!user.email_verified) {
      return res.status(401).json({ error: 'Bitte bestätige deine E-Mail-Adresse, bevor du dich einloggen kannst.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });
    }

    res.status(200).json({ message: 'Login erfolgreich!', user: { name: user.name, email: user.email } });
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
