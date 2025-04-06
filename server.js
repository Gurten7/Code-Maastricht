const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Handmatig CORS-headers instellen
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Body parser om JSON-gegevens te verwerken
app.use(express.json());

// Push endpoint
app.post('/push', async (req, res) => {
  const { title, message, tag } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic 5wpbbdzw5ugb4w2mghacxol4e"
      },
      body: JSON.stringify({
        app_id: "0c55e75a-a7cc-4829-8359-3171d4f456d0",
        headings: { nl: title },
        contents: { nl: message },
        filters: [{ field: "tag", key: "team", relation: "=", value: tag }]
      })
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    console.error("❌ Fout bij pushmelding:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// Statische bestanden serveren
app.use(express.static(__dirname));

// Alles wat niet direct een bestand is, terug naar index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start de server
app.listen(port, () => {
  console.log(`✅ Server draait op http://localhost:${port}`);
});
