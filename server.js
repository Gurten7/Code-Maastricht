const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Alleen nodig als je Node <18 gebruikt

const app = express();
const port = process.env.PORT || 8080;

// === Tokens ===
const CLIENT_TOKEN = "geheimvoorclient"; // Alleen jouw frontend mag hiermee /push aanroepen
const ONESIGNAL_TOKEN = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2dhv5ple2ycelse2g6xnjq7rdvrybny7uhjsvuxlrbcqoe6iw3kyod3hywgehbwt33ugi745uoler6q";


// === CORS: alleen jouw site mag fetch-verzoeken doen ===
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// === Pushmeldingen verwerken ===
app.post('/push', async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");
  console.log("🌐 Request origin:", req.headers.origin);
  console.log("🧾 Volledige headers:", req.headers);
  console.log("🔐 Verwachte token:", `Basic ${CLIENT_TOKEN}`);
  console.log("🔑 Ontvangen Authorization:", req.headers.authorization);

  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${CLIENT_TOKEN}`) {
    console.log("❌ Ongeldige Authorization header ontvangen!");
    return res.status(403).json({ error: "Invalid Authorization header" });
  }

  const { title, message, tag } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_TOKEN}`
      },
      body: JSON.stringify({
        app_id: "0c55e75a-a7cc-4829-8359-3171d4f456d0",
        headings: { nl: title },
        contents: { nl: message },
        filters: [{ field: "tag", key: "team", relation: "=", value: tag }]
      })
    });

    const result = await response.json();
    console.log("📤 OneSignal response:", result);
    res.status(response.status).json(result);
  } catch (error) {
    console.error("❌ Fout bij pushmelding naar OneSignal:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// === Statische bestanden uit huidige map serveren (zoals index.html, JS, CSS) ===
app.use(express.static(path.join(__dirname)));

// === Alle routes die niet bestaan, verwijzen naar index.html (PWA routing) ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ === Server starten ===
app.listen(port, () => {
  console.log(`✅ Server draait op http://localhost:${port}`);
});
