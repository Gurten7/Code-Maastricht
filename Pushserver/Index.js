const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

// ✅ CORS correct ingesteld
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.options("/push", cors()); // Preflight requests

app.use(bodyParser.json());

const SIGNAL_API_KEY = "Basic 5wpbbdzw5ugb4w2mghacxol4e";
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";

app.post("/push", async (req, res) => {
  const { title, message, tag } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": SIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id: APP_ID,
        headings: { en: title },
        contents: { en: message },
        filters: [{ field: "tag", key: "team", relation: "=", value: tag }]
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("❌ Fout bij verzenden:", err);
    res.status(500).json({ error: "Pushmelding mislukt" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Pushserver draait op poort ${port}`);
});
