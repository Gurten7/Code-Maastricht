const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 8080;

// ✅ Nieuwe API-sleutels
const CLIENT_TOKEN = "geheimvoorclient";
const ONESIGNAL_TOKEN = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2d4sdrzrqzme5ym65jge6elth4jajxejtbxnce7r6x2f7rhy2dur465ooougdhckggxukovjshim2xa";
const ONESIGNAL_APP_ID = "4sdrzrqzme5ym65jge6elth4j";

// ✅ CORS juist instellen
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("/push", cors()); // Preflight

app.use(bodyParser.json());

// ✅ Push endpoint
app.post("/push", async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");

  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${CLIENT_TOKEN}`) {
    console.log("❌ Ongeldige Authorization header!");
    return res.status(403).json({ error: "Invalid Authorization header" });
  }

  const { title, message, doelgroepen } = req.body;
  if (!title || !message || !Array.isArray(doelgroepen)) {
    return res.status(400).json({ error: "Verwacht: title, message, doelgroepen[]" });
  }

  try {
    const results = [];

    for (const doelgroep of doelgroepen) {
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
          filters: [
            { field: "tag", key: "team", relation: "=", value: doelgroep }
          ]
        })
      });

      const result = await response.json();
      console.log(`📤 Resultaat voor tag '${doelgroep}':`, result);
      results.push({ doelgroep, result });
    }

    res.status(200).json({ success: true, result: results });
  } catch (error) {
    console.error("❌ Fout bij pushmelding:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// ✅ Server starten
app.listen(port, () => {
  console.log(`✅ Pushserver draait op poort ${port}`);
});
