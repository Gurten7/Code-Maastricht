const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

const SIGNAL_API_KEY = "Bearer os_v2_app_..."; // jouw geldige OneSignal API key
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";

app.post("/push", async (req, res) => {
  const { title, message, filters } = req.body;

  if (!title || !message || !Array.isArray(filters)) {
    return res.status(400).json({ error: "Verwacht velden: title, message, filters[]" });
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": SIGNAL_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_id: APP_ID,
        headings: { nl: title },
        contents: { nl: message },
        filters: filters
      })
    });

    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result });
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Fout:", err);
    res.status(500).json({ error: "Pushmelding mislukt" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Pushserver draait op http://0.0.0.0:${port}`);
});

