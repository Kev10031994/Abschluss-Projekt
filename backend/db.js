const mysql = require('mysql2');

// Verbindung erstellen
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'DEIN_PASSWORT',
  database: 'player_lounge'
});

module.exports = pool.promise();
