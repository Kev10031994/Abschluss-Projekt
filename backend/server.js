const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/servers', (req, res) => {
  const servers = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Spiel ${i + 1}`,
    description: `Beschreibung für Spiel ${i + 1}`,
    price: Math.floor(Math.random() * 20) + 10,
  }));
  res.json(servers);
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
