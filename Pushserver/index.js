const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

// ✅ CORS zonder externe module
app.use((req, res, next) => {
  // Dit stelt de juiste CORS headers in zodat je frontend toegang heeft tot de server
  res.setHeader("Access-Control-Allow-Origin", "*"); // Sta alle origins toe, vervang "*" door je specifieke frontend URL om restrictief te zijn
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

// ✅ OneSignal instellingen (geef je eigen API Key en App ID hier)
const SIGNAL_API_KEY = "Basic os_v2_app_brk6owvhzrecta2zgfy5j5cw2d4sdrzrqzme5ym65jge6elth4jajxejtbxnce7r6x2f7rhy2dur465ooougdhckggxukovjshim2xa";
const SIGNAL_APP_ID = "4sdrzrqzme5ym65jge6elth4j";

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

    // Als alles goed gaat, stuur een succesbericht terug
    res.status(200).json({ success: true, result: results });
  } catch (error) {
    // Als er een fout optreedt, geef deze terug
    console.error("❌ Fout bij pushmelding naar OneSignal:", error);
    res.status(500).json({ error: "Pushmelding mislukt." });
  }
});

// ✅ Start de server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Server draait op poort ${port}`);
});
