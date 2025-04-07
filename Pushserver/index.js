const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

// Laad omgevingsvariabelen uit een .env bestand (indien beschikbaar)
dotenv.config();

const app = express();

// ✅ CORS zonder externe module (beperk toegang tot specifieke frontend URL's)
app.use((req, res, next) => {
  const allowedOrigins = ['https://puzzeltochtmaastricht.fly.dev']; // Voeg je frontend URL hier toe

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // Sta alleen de toegestane origins toe
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Als het een OPTIONS request is (preflight), stuur dan een 200 response
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next(); // Ga verder met de request handling
});

// Gebruik body-parser voor JSON data
app.use(bodyParser.json());

// ✅ OneSignal instellingen (gebruik omgevingsvariabelen voor beveiliging)
const SIGNAL_API_KEY = process.env.SIGNAL_API_KEY;
const SIGNAL_APP_ID = process.env.SIGNAL_APP_ID;

if (!SIGNAL_API_KEY || !SIGNAL_APP_ID) {
  console.error("❌ OneSignal API key of App ID is niet gedefinieerd in de omgevingsvariabelen.");
  process.exit(1); // Stop de server als de API key of App ID ontbreekt
}

// ✅ Push route om pushmeldingen te versturen
app.post("/push", async (req, res) => {
  console.log("✅ PUSH-melding ontvangen");

  const { title, message, doelgroepen } = req.body;
  
  // Verifiëren dat alle benodigde gegevens aanwezig zijn
  if (!title || !message || !Array.isArray(doelgroepen)) {
    return res.status(400).json({ error: "Verwacht: title, message, doelgroepen[]" });
  }

  try {
    const results = [];
    
    // Verstuur voor elke doelgroep een pushmelding
    for (const doelgroep of doelgroepen) {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${SIGNAL_API_KEY}`
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

      if (!response.ok) {
        console.error(`❌ Fout bij push naar ${doelgroep}:`, result);
        results.push({ doelgroep, error: result });
      } else {
        results.push({ doelgroep, result });
      }
    }

    // Als alles goed gaat, stuur een succesbericht terug
    res.status(200).json({ success: true, result: results });
  } catch (error) {
    // Als er een fout optreedt, geef deze terug
    console.error("❌ Fout bij pushmelding naar OneSignal:", error);
    res.status(500).json({ error: "Pushmelding mislukt. Fout bij OneSignal." });
  }
});

// ✅ Start de server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Server draait op poort ${port}`);
});
