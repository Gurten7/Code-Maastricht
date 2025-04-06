const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 8080;

const CLIENT_TOKEN = "geheimvoorclient";
const ONESIGNAL_TOKEN = "5wpbbdzw5ugb4w2mghacxol4e"; // uit je OneSignal dashboard

// CORS voor jouw frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.post('/push', async (req, res) => {
  const auth = req.get("Authorization") || "";
  if (auth !== `Basic ${CLIENT_TOKEN}`) {
    console.log("❌ Foute authorization ontvangen:", auth);
    return res.status(403).send("Forbidden");
  }

  const { title, message, tag } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_TOKEN}`
      },
      body: JSON.stringify({
        app_id: "0c55e75a-a7cc-4829-8359-3171d4f456d0",
        headings: { nl: title },
        contents: { nl: message },
        filters: [{ field: "tag", key: "team", relation: "=", value: tag }]
      })
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    console.error("❌ Fout bij pushmelding:", error);
    res.status(500).json({ error:
