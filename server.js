const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 8080;

const CLIENT_TOKEN = "geheimvoorclient";
const ONESIGNAL_TOKEN = "os_v2_app_brk6..."; // je echte token hier

// ✅ CORS alleen voor jouw frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// ✅ Pushmelding versturen
app.post("/push", async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");

  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${CLIENT_TOKEN}`) {
    console.log("❌ Ongeldige Authorization header ontvangen!");
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
          app_id: "0c55e75a-a7cc-4829-8359-3171d4f456d0",
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

// ✅ Statische bestanden
app.use(express.static(path.join(__dirname)));

// ✅ Fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server draait op poort ${port}`);
});
