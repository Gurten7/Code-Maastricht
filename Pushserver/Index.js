const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

// ✅ CORS correct ingesteld
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("/push", cors()); // Preflight requests

app.use(bodyParser.json());

// ✅ OneSignal instellingen (NIEUWE GEGEVENS)
const SIGNAL_API_KEY = "Basic os_v2_app_brk6owvhzrecta2zgfy5j5cw2d4sdrzrqzme5ym65jge6elth4jajxejtbxnce7r6x2f7rhy2dur465ooougdhckggxukovjshim2xa";
const SIGNAL_APP_ID = "4sdrzrqzme5ym65jge6elth4j";

// ✅ Push route
app.post("/push", async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");

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
          "Authorization": SIGNAL_API_KEY
        },
        body: JSON.stringify({
          app_id: SIGNAL_APP_ID,
          headings: { nl: title },
          contents: { nl: message },
          filters: [{ field: "tag", key: "team", relation: "=", value: doelgroep }]
        })
      });

      const result = await response.json();
      console.log(`📤 Resultaat voor tag '${doelgroep}':`, result);
      results.push({ doelgroep, result });
    }

    res.status(200).json({ success: true, result: results });
  } catch (error) {
    console.error("❌ Fout bij pushmelding naar OneSignal:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// ✅ Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Pushserver draait op poort ${port}`);
});
