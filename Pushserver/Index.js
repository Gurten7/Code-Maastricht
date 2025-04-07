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

// ✅ NIEUWE V2 API KEY — gebruik 'Bearer' i.p.v. 'Basic'
const SIGNAL_API_KEY = "Bearer os_v2_app_brk6owvhzrecta2zgfy5j5cw2dhv5ple2ycelse2g6xnjq7rdvrybny7uhjsvuxlrbcqoe6iw3kyod3hywgehbwt33ugi745uoler6q";
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";

app.post("/push", async (req, res) => {
  const { title, message, filters } = req.body;

  // Check op aanwezigheid van filters (vereist door OneSignal)
  if (!title || !message || !Array.isArray(filters)) {
    return res.status(400).json({ error: "Ongeldig verzoekformaat: title, message en filters vereist." });
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": SIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id: APP_ID,
        headings: { nl: title },
        contents: { nl: message },
        filters: filters
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ OneSignal fout:", result);
      return res.status(response.status).json({ error: result.errors || result });
    }

    console.log("✅ OneSignal respons:", result);
    res.status(200).json({ success: true, result });

  } catch (err) {
    console.error("❌ Fout bij verzenden:", err);
    res.status(500).json({ error: "Pushmelding mislukt" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Pushserver draait op poort ${port}`);
});
