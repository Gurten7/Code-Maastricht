// index.js voor pushserver
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const ONESIGNAL_APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";
const ONESIGNAL_API_KEY = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2b5qo73qy3bu74vrzeuzkiz52oqmq4ne6qzvp4u7a6a5lg64r4qg3gkxrmgp5yac3polbaa6mpo7ota";
const AUTH_TOKEN = "JOUW_SECRET_HIER"; // kies een sterke geheime token

app.post("/send", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(403).json({ error: "Geen toegang" });
  }

  const { message, tags } = req.body;
  if (!message || !Array.isArray(tags)) {
    return res.status(400).json({ error: "Ongeldige invoer" });
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        contents: { en: message },
        filters: tags.map(tag => {
          const [key, value] = tag.split(":");
          return { field: "tag", key, relation: "=", value };
        })
      })
    });

    const data = await response.json();
    res.status(200).json({ success: true, result: data });
  } catch (err) {
    res.status(500).json({ error: "Fout bij verzenden pushmelding", details: err });
  }
});

app.get("/", (req, res) => {
  res.status(403).send("⛔ Alleen POST naar /send toegestaan.");
});

app.listen(port, () => {
  console.log(`Pushserver actief op poort ${port}`);
});
