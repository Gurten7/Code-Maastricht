const express = require("express");
const path = require("path");
const fetch = require("node-fetch"); // Alleen nodig bij Node <18
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;

// === Tokens ===
const CLIENT_TOKEN = "geheimvoorclient"; // Alleen frontend mag hiermee pushverzoeken doen
const ONESIGNAL_TOKEN = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2dhv5ple2ycelse2g6xnjq7rdvrybny7uhjsvuxlrbcqoe6iw3kyod3hywgehbwt33ugi745uoler6q";

// ✅ CORS correct ingesteld voor je frontend
app.use(cors({
  origin: "*", // Of specifieker: "https://puzzeltochtmaastricht.fly.dev"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("/push", cors()); // Preflight requests

// === Alleen jouw frontend mag CORS-verzoeken doen ===
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(bodyParser.json());

// === JSON-body parsing ===
app.use(express.json());

// ✅ OneSignal instellingen
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";
const SIGNAL_API_KEY = "Basic hv5ple2ycelse2g6xnjq7rdvr..."; // Vervang met je volledige serverkey

// ✅ Pushmeldingen versturen
// ✅ Push endpoint
app.post("/push", async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");

  // Autorisatie controleren
  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${CLIENT_TOKEN}`) {
    console.log("❌ Ongeldige Authorization header:", auth);
    return res.status(403).json({ error: "Invalid Authorization header" });
  }

  console.log("📩 Nieuw pushverzoek ontvangen");
  
  const { title, message, tags } = req.body;

  if (!title || !message || !Array.isArray(tags)) {
    console.log("❌ Ongeldig verzoekformaat:", { title, message, tags });
    return res.status(400).json({ error: "Ongeldig verzoekformaat" });
  }

  // Tags omzetten naar filters voor OneSignal
  const filters = tags.flatMap((tag, index) => {
    const filter = { field: "tag", key: "team", relation: "=", value: tag };
    return index === 0 ? [filter] : [{ operator: "OR" }, filter];
  });

  console.log("📦 Verzenden naar filters:", filters);

  // 📤 Verzend pushmelding naar OneSignal
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ONESIGNAL_TOKEN}`
      },
      body: JSON.stringify({
        app_id: APP_ID,
        headings: { nl: title, en: title },
        contents: { nl: message, en: message },
        filters: filters
      })
    });

    const result = await response.json();
    console.log("📤 OneSignal antwoord:", result);

    if (!response.ok) {
      return res.status(response.status).json({ error: result.errors || result });
    }

    res.status(200).json({ success: true, result });

  } catch (error) {
    console.error("❌ Fout bij verzenden:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// === Statische bestanden serveren ===
app.use(express.static(path.join(__dirname)));

// === PWA routing fallback ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// === Server starten ===
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server draait op http://0.0.0.0:${port}`);
});
