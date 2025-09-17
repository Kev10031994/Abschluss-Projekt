// server.js
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

// 📌 .env erzwingen (damit keine Hardcoded-Fallbacks passieren)
const required = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL', 'CORS_ORIGIN'
];
for (const k of required) {
  if (!process.env[k]) throw new Error(`❌ Missing environment variable: ${k}`);
}

const app = express();
const PORT = Number(process.env.PORT || 5000);

// 📌 CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT'],
  credentials: false,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// 📌 MySQL-Verbindung
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

// 📌 Nodemailer (Gmail App-Passwort)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App-Passwort (ohne Leerzeichen)
  },
});
const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_USER;

// ---------- ROUTES ----------

// 📌 Registrierung mit E-Mail-Bestätigung (mit detailliertem Logging)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('➡️  /api/register payload:', { name, email: email && email.slice(0, 3) + '***' });

  if (!name || !email || !password) {
    console.warn('⚠️  Register: fehlende Felder');
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkUserQuery = 'SELECT id FROM users WHERE email = ? OR username = ?';
    db.query(checkUserQuery, [email, name], (selErr, selResult) => {
      if (selErr) {
        console.error('❌ SELECT Fehler (users check):', selErr);
        return res.status(500).json({ error: 'Serverfehler.' });
      }
      if (selResult.length > 0) {
        console.warn('⚠️  Register: Email/Username existiert bereits');
        return res.status(400).json({ error: 'Benutzername oder E-Mail wird bereits verwendet.' });
      }

      const insertUserQuery =
        'INSERT INTO users (username, email, password, verification_token, email_verified) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [name, email, hashedPassword, verificationToken, false], (insErr) => {
        if (insErr) {
          console.error('❌ INSERT Fehler (users):', insErr);
          return res.status(500).json({ error: 'Fehler beim Speichern des Benutzers.' });
        }

        const confirmationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const mailOptions = {
          from: MAIL_FROM,
          to: email,
          subject: 'E-Mail Bestätigung',
          text: `Klicke auf diesen Link, um deine E-Mail-Adresse zu bestätigen: ${confirmationUrl}`,
        };

        transporter.sendMail(mailOptions, (mailErr, info) => {
          if (mailErr) {
            console.error('❌ Mail Fehler:', mailErr);
            console.log('ℹ️  User wurde trotzdem gespeichert, Token:', verificationToken.slice(0, 8) + '…');
            // User ist gespeichert – gib freundliche Rückmeldung
            return res.status(201).json({
              message:
                'Registrierung erfolgreich, aber die Bestätigungs-Mail konnte nicht gesendet werden. Bitte später erneut versuchen.',
            });
          }
          console.log('📧 Mail gesendet:', info && info.response);
          res.status(201).json({ message: 'Registrierung erfolgreich. Bitte bestätige deine E-Mail.' });
        });
      });
    });
  } catch (e) {
    console.error('❌ Register Handler Fehler:', e);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// 📌 E-Mail-Bestätigung
app.get('/api/verify-email/:token', (req, res) => {
  const { token } = req.params;
  console.log('➡️  /api/verify-email', token && token.slice(0, 8) + '…');

  const verifyUserQuery = 'SELECT id, email_verified FROM users WHERE verification_token = ?';
  db.query(verifyUserQuery, [token], (selErr, result) => {
    if (selErr) {
      console.error('❌ SELECT Fehler (verify):', selErr);
      return res.status(400).json({ error: 'Ungültiger Bestätigungstoken.' });
    }
    if (result.length === 0) return res.status(400).json({ error: 'Ungültiger Bestätigungstoken.' });

    const user = result[0];
    if (user.email_verified) return res.status(400).json({ message: 'E-Mail bereits bestätigt.' });

    const updateVerificationQuery =
      'UPDATE users SET email_verified = ?, verification_token = NULL WHERE id = ?';
    db.query(updateVerificationQuery, [true, user.id], (updErr) => {
      if (updErr) {
        console.error('❌ UPDATE Fehler (verify):', updErr);
        return res.status(500).json({ error: 'Fehler bei der Bestätigung.' });
      }
      res.status(200).json({ message: 'E-Mail erfolgreich bestätigt!' });
    });
  });
});

// 📌 Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('➡️  /api/login', { email: email && email.slice(0, 3) + '***' });

  if (!email || !password) return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });

  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(getUserQuery, [email], async (selErr, result) => {
    if (selErr) {
      console.error('❌ SELECT Fehler (login):', selErr);
      return res.status(500).json({ error: 'Serverfehler.' });
    }
    if (result.length === 0) return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });

    const user = result[0];
    if (!user.email_verified) return res.status(401).json({ error: 'E-Mail nicht bestätigt.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });

    res.status(200).json({ message: 'Login erfolgreich!', user: { name: user.username, email: user.email } });
  });
});

// 📌 Beispiel: Payment-success (Terraform) – unverändert außer Logs
app.post('/api/payment-success', (req, res) => {
  const { userId, serverName, slots } = req.body;
  console.log('➡️  /api/payment-success', { userId, serverName, slots });

  if (!userId || !serverName || !slots) {
    return res.status(400).json({ error: 'Ungültige Daten.' });
  }

  const instanceType = slots <= 15 ? 't3.small' : 't3.large';
  const terraformCommand =
    `/usr/bin/terraform apply -auto-approve -var="user_id=${userId}" ` +
    `-var="instance_type=${instanceType}" -var="player_slots=${slots}"`;

  exec(terraformCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Terraform Fehler:', stderr);
      return res.status(500).json({ error: 'Terraform-Ausführung fehlgeschlagen.', details: stderr });
    }

    exec('/usr/bin/terraform output instance_ip', (ipErr, ipOutput) => {
      if (ipErr) {
        console.error('❌ Fehler beim Abrufen der IP:', ipErr);
        return res.status(500).json({ error: 'IP konnte nicht abgerufen werden.' });
      }

      const serverIP = String(ipOutput).trim();
      console.log('🌐 Terraform IP:', serverIP);

      const insertQuery = `
        INSERT INTO servers (user_id, instance_id, slots, status, created_at)
        VALUES (?, ?, ?, 'running', NOW())
      `;
      db.query(insertQuery, [userId, serverIP, slots], (dbErr) => {
        if (dbErr) {
          console.error('❌ Datenbank Fehler (servers insert):', dbErr);
          return res.status(500).json({ error: 'Datenbankfehler.' });
        }
        res.status(200).json({ message: 'Server gestartet!', ip: serverIP });
      });
    });
  });
});

// 📌 Serverdetails abrufen
app.get('/api/servers/:id', (req, res) => {
  const { id } = req.params;
  const getServerQuery = 'SELECT * FROM servers WHERE id = ?';
  db.query(getServerQuery, [id], (err, result) => {
    if (err || result.length === 0) {
      console.error('❌ Fehler beim Abrufen der Serverdetails:', err);
      return res.status(404).json({ error: 'Server nicht gefunden.' });
    }
    res.status(200).json(result[0]);
  });
});

// 📌 Serverliste (running)
app.get('/api/servers', (req, res) => {
  const getServersQuery = 'SELECT * FROM servers WHERE status = "running"';
  db.query(getServersQuery, (err, result) => {
    if (err) {
      console.error('❌ Fehler beim Abrufen der Serverdaten:', err);
      return res.status(500).json({ error: 'Fehler beim Abrufen der Serverdaten.' });
    }
    res.status(200).json(result);
  });
});

// 📌 Server aktualisieren
app.put('/api/servers/:id', (req, res) => {
  const { id } = req.params;
  const { name, slots, storage } = req.body;

  if (!name || !slots || !storage) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  const updateServerQuery = `
    UPDATE servers 
    SET name = ?, slots = ?, storage = ? 
    WHERE id = ?
  `;
  db.query(updateServerQuery, [name, Number(slots), Number(storage), id], (err) => {
    if (err) {
      console.error('❌ Fehler beim Aktualisieren des Servers:', err);
      return res.status(500).json({ error: 'Fehler beim Aktualisieren.' });
    }
    res.status(200).json({ message: 'Server erfolgreich aktualisiert.' });
  });
});

// 📌 Start
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
