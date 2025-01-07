// 📌 Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 📌 CORS-Konfiguration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://63.176.70.153',
  methods: ['GET', 'POST'],
  credentials: false,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// 📌 MySQL-Datenbankverbindung
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', err);
    process.exit(1);
  }
  console.log('✅ Mit der MySQL-Datenbank verbunden.');
});

// 📌 E-Mail-Versand konfigurieren
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📌 Registrierung mit E-Mail-Bestätigung
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkUserQuery, [email, name], (err, result) => {
      if (err) return res.status(500).json({ error: 'Serverfehler.' });
      if (result.length > 0) return res.status(400).json({ error: 'Benutzername oder E-Mail wird bereits verwendet.' });

      const insertUserQuery = 'INSERT INTO users (username, email, password, verification_token, email_verified) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [name, email, hashedPassword, verificationToken, false], (err) => {
        if (err) return res.status(500).json({ error: 'Fehler beim Speichern des Benutzers.' });

        const confirmationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'E-Mail Bestätigung',
          text: `Klicke auf diesen Link, um deine E-Mail-Adresse zu bestätigen: ${confirmationUrl}`,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) return res.status(500).json({ error: 'Fehler beim Senden der Bestätigungs-E-Mail.' });
          res.status(201).json({ message: 'Registrierung erfolgreich. Bitte bestätige deine E-Mail.' });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// 📌 Minecraft-Server starten
app.post('/api/payment-success', (req, res) => {
  const { userId, serverName, slots } = req.body;

  if (!userId || !serverName || !slots) {
    return res.status(400).json({ error: 'Ungültige Daten.' });
  }

  const instanceType = slots <= 15 ? "t3.small" : "t3.large";
  const terraformCommand = `/usr/bin/terraform apply -auto-approve -var="user_id=${userId}" -var="instance_type=${instanceType}" -var="player_slots=${slots}"`;

  exec(terraformCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Terraform Fehler:', stderr);
      return res.status(500).json({ error: 'Terraform-Ausführung fehlgeschlagen.', details: stderr });
    }

    exec('/usr/bin/terraform output instance_ip', (err, ipOutput) => {
      if (err || !ipOutput) {
        console.error('❌ Fehler beim Abrufen der IP:', err || 'Leere IP-Ausgabe');
        return res.status(500).json({ error: 'IP konnte nicht abgerufen werden.' });
      }

      const serverIP = ipOutput.trim();
      const insertQuery = `
        INSERT INTO servers (user_id, instance_id, slots, status, created_at)
        VALUES (?, ?, ?, 'running', NOW())`;

      db.query(insertQuery, [userId, serverIP, slots], (dbErr) => {
        if (dbErr) {
          console.error('❌ Datenbank Fehler:', dbErr);
          return res.status(500).json({ error: 'Datenbankfehler.' });
        }

        res.status(200).json({ message: 'Server gestartet!', ip: serverIP });
      });
    });
  });
});

// 📌 Serverliste abrufen
app.get('/api/servers', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Benutzer-ID erforderlich.' });
  }

  const getServersQuery = 'SELECT * FROM servers WHERE user_id = ?';

  db.query(getServersQuery, [userId], (err, results) => {
    if (err) {
      console.error('❌ Fehler beim Abrufen der Server:', err);
      return res.status(500).json({ error: 'Fehler beim Abrufen der Server.' });
    }

    res.status(200).json(results);
  });
});

// 📌 Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://63.176.70.153:${PORT}`);
});
