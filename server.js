const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Voor POST naar OneSignal

const app = express();
const port = process.env.PORT || 8080;

const AUTH_TOKEN = "5wpbbdzw5ugb4w2mghacxol4e"; // 🔐 Zelfde als in client

// ✅ CORS instellen voor frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ JSON parsing
app.use(express.json());

// ✅ Push endpoint met eenvoudige autorisatie
app.post('/push', async (req, res) => {
  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${AUTH_TOKEN}`) {
    return res.status(403).send("Forbidden");
  }

  const { title, message, tag } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_TOKEN}`
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

// ✅ Statische bestanden serveren vanuit dezelfde map
app.use(express.static(__dirname));

// ✅ Alle onbekende routes terugsturen naar index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Server starten
app.listen(port, () => {
  console.log(`✅ Server draait op http://localhost:${port}`);
});
