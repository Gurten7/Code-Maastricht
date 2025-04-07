const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

// ✅ CORS correct ingesteld voor je frontend
app.use(cors({
  origin: "*", // Of specifieker: "https://puzzeltochtmaastricht.fly.dev"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("/push", cors()); // Preflight requests

app.use(bodyParser.json());

// ✅ OneSignal instellingen
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";
const SIGNAL_API_KEY = "Basic hv5ple2ycelse2g6xnjq7rdvr..."; // Vervang met je volledige serverkey

// ✅ Push endpoint
app.post("/push", async (req, res) => {
  console.log("📩 Nieuw pushverzoek ontvangen");
  
  const { title, message, tags } = req.body;

  // 📋 Validatie
  if (!title || !message || !Array.isArray(tags) || tags.length === 0) {
    console.log("⚠️ Ongeldig verzoek:", req.body);
    return res.status(400).json({ error: "Verwacht velden: title, message, tags[]" });
  }

  // 🔁 Zet tags[] om naar OneSignal filters (OR-relatie)
  const filters = [];
  tags.forEach((tag, index) => {
    if (index > 0) filters.push({ operator: "OR" });
    filters.push({
      field: "tag",
      key: "team",
      relation: "=",
      value: tag
    });
  });

  // 📤 Verzend pushmelding naar OneSignal
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": SIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id: APP_ID,
        headings: { en: title, nl: title },
        contents: { en: message, nl: message },
        filters: filters
      })
    });

    const data = await response.json();
    console.log("📬 Reactie van OneSignal:", data);

    if (!response.ok) {
      return res.status(response.status).json({ error: data.errors || data });
    }

    res.status(200).json({ success: true, result: data });
  } catch (err) {
    console.error("❌ Fout bij verzenden:", err);
    res.status(500).json({ error: "Pushmelding mislukt" });
  }
});

// ✅ Start de server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Pushserver draait op http://localhost:${port}`);
});
