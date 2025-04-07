const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// ✅ Nieuwe API-sleutels
const CLIENT_TOKEN = "geheimvoorclient";
const ONESIGNAL_TOKEN = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2d4sdrzrqzme5ym65jge6elth4jajxejtbxnce7r6x2f7rhy2dur465ooougdhckggxukovjshim2xa";
const ONESIGNAL_APP_ID = "4sdrzrqzme5ym65jge6elth4j";

// ✅ CORS zonder externe module
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json());

// ✅ Push endpoint
app.post("/push", async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");

  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${CLIENT_TOKEN}`) {
    console.log("❌ Ongeldige Authorization header ontvangen!");
    return res.status(403).json({ error: "Invalid Authorization header" });
  }

  const { title, message, filters } = req.body;
  if (!title || !message || !Array.isArray(filters)) {
    return res.status(400).json({ error: "Verwacht: title, message, filters[]" });
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ONESIGNAL_TOKEN}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { nl: title },
        contents: { nl: message },
        filters: filters
      })
    });

    const result = await response.json();
    console.log("📤 Pushresultaat:", result);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("❌ Fout bij pushmelding:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// ✅ Voeg dit toe om index.html en frontend-bestanden te serveren
app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Pushserver draait op poort ${port}`);
});
