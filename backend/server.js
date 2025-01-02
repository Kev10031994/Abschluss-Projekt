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
  origin: 'http://63.176.70.153', // Erlaube Anfragen nur vom Frontend
  methods: ['GET', 'POST'],
  credentials: false,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// 📌 MySQL-Datenbankverbindung
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'abschluss-projekt-db.crsmyimc66af.eu-central-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Fussel10031994,',
  database: process.env.DB_NAME || 'Player_Lounge',
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
    user: process.env.EMAIL_USER || 'kevin.boehning@tn.techstarter.de',
    pass: process.env.EMAIL_PASS || 'eggx mblp lppw mhug',
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

        const confirmationUrl = `http://63.176.70.153/verify-email/${verificationToken}`;
        const mailOptions = {
          from: process.env.EMAIL_USER || 'kevin.boehning@tn.techstarter.de',
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

// 📌 E-Mail-Bestätigung
app.get('/api/verify-email/:token', (req, res) => {
  const { token } = req.params;

  const verifyUserQuery = 'SELECT * FROM users WHERE verification_token = ?';
  db.query(verifyUserQuery, [token], (err, result) => {
    if (err || result.length === 0) return res.status(400).json({ error: 'Ungültiger Bestätigungstoken.' });

    const user = result[0];
    if (user.email_verified) return res.status(400).json({ message: 'E-Mail bereits bestätigt.' });

    const updateVerificationQuery = 'UPDATE users SET email_verified = ?, verification_token = NULL WHERE id = ?';
    db.query(updateVerificationQuery, [true, user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Fehler bei der Bestätigung.' });
      res.status(200).json({ message: 'E-Mail erfolgreich bestätigt!' });
    });
  });
});

// 📌 Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });

  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(getUserQuery, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Serverfehler.' });
    if (result.length === 0) return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });

    const user = result[0];
    if (!user.email_verified) return res.status(401).json({ error: 'E-Mail nicht bestätigt.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });

    res.status(200).json({ message: 'Login erfolgreich!', user: { name: user.username, email: user.email } });
  });
});

// 📌 Minecraft-Server starten
app.post('/api/payment-success', (req, res) => {
  const { userId, serverName, slots } = req.body;
  const instanceType = slots <= 5 ? "t3.small" : slots <= 15 ? "t3.medium" : "t3.large";

  const terraformCommand = `/usr/bin/terraform apply -auto-approve -var="user_id=${userId}" -var="instance_type=${instanceType}" -var="player_slots=${slots}"`;

  exec(terraformCommand, (error, stdout) => {
    if (error) return res.status(500).json({ error: "Terraform-Ausführung fehlgeschlagen." });
    exec('/usr/bin/terraform output instance_ip', (err, ipOutput) => {
      if (err) return res.status(500).json({ error: "IP konnte nicht abgerufen werden." });
      res.status(200).json({ message: "Server gestartet!", ip: ipOutput.trim() });
    });
  });
});

// 📌 Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://63.176.70.153:${PORT}`);
});
