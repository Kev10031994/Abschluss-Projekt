const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'Benutzer erfolgreich registriert!' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler bei der Registrierung' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    res.status(200).json({ message: 'Login erfolgreich!' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

module.exports = router;
