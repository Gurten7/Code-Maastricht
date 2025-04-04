const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve alle bestanden zoals index.html, scripts, CSS en afbeeldingen
app.use(express.static(__dirname));

// Alles wat niet direct een bestaand bestand is, gaat naar index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start de server
app.listen(port, () => {
  console.log(`✅ Server draait op http://localhost:${port}`);
});
